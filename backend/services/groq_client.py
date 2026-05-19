import os
from groq import AsyncGroq, RateLimitError
from dotenv import load_dotenv

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"

_client: AsyncGroq | None = None


def get_groq_client() -> AsyncGroq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Create a backend/.env file with GROQ_API_KEY=your_key_here"
            )
        _client = AsyncGroq(api_key=api_key)
    return _client


async def chat_completion(system_prompt: str, user_prompt: str, max_tokens: int = 4096) -> str:
    """Single-turn chat completion. Returns the response text."""
    client = get_groq_client()
    try:
        response = await client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content or ""
    except RateLimitError:
        print(f"Rate limit reached for {PRIMARY_MODEL}. Trying fallback model {FALLBACK_MODEL}...")
        response = await client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content or ""


def extract_json_block(text: str) -> str:
    """Extract JSON from a response that may have ```json ... ``` fencing."""
    import re
    # Try fenced block first
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    # Otherwise return as-is, stripped
    return text.strip()

