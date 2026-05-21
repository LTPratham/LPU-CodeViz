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

Task: Return a JSON array. Each item explains one meaningful line (skip blank lines and closing braces alone).
Each item must have exactly these fields:
{{
  "line": <the exact line number from the code prefix above as integer>,
  "code": "<the exact code on that line, trimmed, excluding the line number prefix>",
  "explain": "<1-2 sentence plain English explanation for a beginner>",
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

    # Prepend line numbers to the code to help the LLM identify correct lines
    numbered_lines = [f"{i+1}: {line}" for i, line in enumerate(req.code.splitlines())]
    numbered_code = "\n".join(numbered_lines)

    user_prompt = EXPLAIN_USER_TEMPLATE.format(lang=req.lang, code=numbered_code)

    try:
        raw = await chat_completion(EXPLAIN_SYSTEM, user_prompt, max_tokens=3000)
        json_str = extract_json_block(raw)
        result = json.loads(json_str)
        if isinstance(result, dict) and result.get("error"):
            raise HTTPException(status_code=400, detail=result.get("message", "Invalid code or syntax error."))
        if not isinstance(result, list):
            raise ValueError("Expected JSON array")
        
        # Align/verify line numbers programmatically to guarantee 100% correctness
        for item in result:
            code_trimmed = item.get("code", "").strip()
            predicted_line = item.get("line", -1)
            item["line"] = align_line_number(req.code, predicted_line, code_trimmed)
                        
        return result
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error in /explain: {e}\nRaw: {raw[:500]}")
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /explain: {e}")
        raise HTTPException(status_code=500, detail=str(e))

