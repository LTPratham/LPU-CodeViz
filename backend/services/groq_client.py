import os
import random
from groq import AsyncGroq, RateLimitError
from dotenv import load_dotenv

load_dotenv()

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"

_clients: list[AsyncGroq] = []


def get_groq_clients() -> list[AsyncGroq]:
    global _clients
    if not _clients:
        api_keys_str = os.getenv("GROQ_API_KEY", "")
        if not api_keys_str:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Create a backend/.env file with GROQ_API_KEY=your_key_here"
            )
        keys = [k.strip() for k in api_keys_str.split(",") if k.strip()]
        _clients = [AsyncGroq(api_key=key) for key in keys]
        if not _clients:
            raise RuntimeError("No valid Groq API keys found in GROQ_API_KEY")
    return _clients


async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 4096,
    model: str = None
) -> str:
    """Single-turn chat completion with key rotation and fallback models."""
    clients = get_groq_clients()
    indices = list(range(len(clients)))
    random.shuffle(indices)

    target_model = model if model else PRIMARY_MODEL

    last_error = None
    for idx in indices:
        client = clients[idx]
        try:
            response = await client.chat.completions.create(
                model=target_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ],
                max_tokens=max_tokens,
                temperature=0.3,
            )
            return response.choices[0].message.content or ""
        except RateLimitError as e:
            fallback = FALLBACK_MODEL if target_model != FALLBACK_MODEL else PRIMARY_MODEL
            print(f"Rate limit reached for model {target_model} using key index {idx}. Trying fallback model {fallback}...")
            try:
                response = await client.chat.completions.create(
                    model=fallback,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_prompt},
                    ],
                    max_tokens=max_tokens,
                    temperature=0.3,
                )
                return response.choices[0].message.content or ""
            except Exception as fe:
                print(f"Fallback model failed for key index {idx}: {fe}. Trying next key...")
                last_error = fe
                continue
        except Exception as e:
            print(f"API key index {idx} failed: {e}. Trying next key...")
            last_error = e
            continue

    if last_error:
        raise last_error
    raise RuntimeError("All configured Groq API keys failed to process the request.")



def extract_json_block(text: str) -> str:
    """Extract JSON from a response that may have ```json ... ``` fencing."""
    import re
    # Try fenced block first
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    # Otherwise return as-is, stripped
    return text.strip()

