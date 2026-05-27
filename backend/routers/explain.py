import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.groq_client import chat_completion, extract_json_block
from services.line_aligner import align_line_number

router = APIRouter()
logger = logging.getLogger(__name__)


class ExplainRequest(BaseModel):
    lang: str
    code: str


EXPLAIN_SYSTEM = """You are a coding tutor for computer science undergraduate students.
Explain code in simple, friendly English. No jargon. Students are beginners.
Always return ONLY valid JSON — no prose, no markdown outside the JSON, no explanation."""

EXPLAIN_USER_TEMPLATE = """Language: {lang}
Code (numbered lines):
{code}

Task: Return a JSON object with a single key "explanations" containing an array of objects. Each object explains one meaningful line (skip blank lines and closing braces alone).
Each object in the "explanations" array must have exactly these fields:
{{
  "line": <the exact line number from the code prefix above as integer>,
  "code": "<the exact code on that line, trimmed, excluding the line number prefix>",
  "explain": "<1-2 sentence plain English explanation for a beginner>",
  "concept": "<one CS concept tag, e.g. Loop, Recursion, Stack Push, Comparison, Assignment, Function Call, Return, Declaration, SQL Insert, etc.>",
  "category": "<one of: core | structure | io | logic | db>",
  "why": "<detailed breakdown of syntax, symbols, variables, and operations on this line for an absolute beginner with no prior coding knowledge (e.g., explaining keys, values, dictionary/list symbols like braces/brackets/commas, parameters, return values, etc. in plain, step-by-step detail)>"
}}

If the code contains severe syntax errors, is meaningless, or lacks basic structure, return exactly:
{{
  "error": true,
  "message": "Syntax error description"
}}

Return ONLY the JSON object. Start with {{ and end with }}."""


@router.post("/explain")
async def explain(req: ExplainRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    if not req.lang:
        raise HTTPException(status_code=400, detail="Language is required")

    # Prepend line numbers to the code to help the LLM identify correct lines
    numbered_lines = [f"{i+1}: {line}" for i, line in enumerate(req.code.splitlines())]
    numbered_code = "\n".join(numbered_lines)

    user_prompt = EXPLAIN_USER_TEMPLATE.format(lang=req.lang, code=numbered_code)

    last_raw = ""
    last_error = None
    models_to_try = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]
    for attempt, model_name in enumerate(models_to_try):
        try:
            raw = await chat_completion(
                EXPLAIN_SYSTEM,
                user_prompt,
                max_tokens=3000,
                model=model_name,
                response_format={"type": "json_object"}
            )
            last_raw = raw
            json_str = extract_json_block(raw)
            parsed = json.loads(json_str)

            if isinstance(parsed, dict) and parsed.get("error"):
                raise HTTPException(status_code=400, detail=parsed.get("message", "Invalid code or syntax error."))

            explanations = parsed.get("explanations")
            if not isinstance(explanations, list):
                raise ValueError("Expected 'explanations' array in JSON object")

            # Validate each item in the explanations array
            for item in explanations:
                if not isinstance(item, dict):
                    raise ValueError("Explanation item is not a dictionary")
                for key in ["line", "code", "explain", "concept", "category", "why"]:
                    if key not in item:
                        raise ValueError(f"Explanation item missing required key '{key}'")

            # Align/verify line numbers programmatically to guarantee 100% correctness
            for item in explanations:
                code_trimmed = (item.get("code") or "").strip()
                predicted_line = item.get("line", -1)
                item["line"] = align_line_number(req.code, predicted_line, code_trimmed)
                        
            return explanations
        except json.JSONDecodeError as e:
            last_error = e
            logger.warning(f"Attempt {attempt+1} ({model_name}) JSON error in /explain: {e}")
            continue
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in /explain (attempt {attempt+1}, {model_name}): {e}")
            last_error = e
            continue

    raise HTTPException(
        status_code=500,
        detail=f"AI returned invalid explanation JSON after 2 attempts: {last_error}"
    )

