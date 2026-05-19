import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.groq_client import chat_completion, extract_json_block

router = APIRouter()
logger = logging.getLogger(__name__)


class ExplainRequest(BaseModel):
    lang: str
    code: str


EXPLAIN_SYSTEM = """You are a coding tutor for LPU (Lovely Professional University) undergraduate students.
Explain code in simple, friendly English. No jargon. Students are beginners.
Always return ONLY valid JSON — no prose, no markdown outside the JSON, no explanation."""

EXPLAIN_USER_TEMPLATE = """Language: {lang}
Code:
{code}

Task: Return a JSON array. Each item explains one meaningful line (skip blank lines and closing braces alone).
Each item must have exactly these fields:
{{
  "line": <line number as integer>,
  "code": "<the exact code on that line, trimmed>",
  "explain": "<1-2 sentence plain English explanation for an LPU beginner>",
  "concept": "<one CS concept tag, e.g. Loop, Recursion, Stack Push, Comparison, Assignment, Function Call, Return, Declaration, SQL Insert, etc.>",
  "category": "<one of: core | structure | io | logic | db>"
}}

If the code contains severe syntax errors, is meaningless, or lacks basic structure (e.g. plain text instead of HTML tags), return exactly: {{"error": true, "message": "Syntax error description"}} instead of an array.

Return ONLY the JSON array (or error object). Start with [ or {{ and end with ] or }}."""


@router.post("/explain")
async def explain(req: ExplainRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    if not req.lang:
        raise HTTPException(status_code=400, detail="Language is required")

    user_prompt = EXPLAIN_USER_TEMPLATE.format(lang=req.lang, code=req.code)

    try:
        raw = await chat_completion(EXPLAIN_SYSTEM, user_prompt, max_tokens=3000)
        json_str = extract_json_block(raw)
        result = json.loads(json_str)
        if isinstance(result, dict) and result.get("error"):
            raise HTTPException(status_code=400, detail=result.get("message", "Invalid code or syntax error."))
        if not isinstance(result, list):
            raise ValueError("Expected JSON array")
        return result
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error in /explain: {e}\nRaw: {raw[:500]}")
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /explain: {e}")
        raise HTTPException(status_code=500, detail=str(e))
