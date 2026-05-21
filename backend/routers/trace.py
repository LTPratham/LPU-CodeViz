import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.groq_client import chat_completion, extract_json_block
from services.line_aligner import align_line_number

router = APIRouter()
logger = logging.getLogger(__name__)


class TraceRequest(BaseModel):
    lang: str
    code: str


TRACE_SYSTEM = """You are a precise code execution simulator for an educational visualizer.
You simulate code step-by-step, producing JSON that drives animated visualizations.
Always return ONLY valid JSON — no markdown, no prose outside JSON."""

TRACE_USER_TEMPLATE = """Language: {lang}
Code (numbered lines):
{code}

Task: Simulate this code execution step by step. Identify the primary data structure used.

Return a JSON object with exactly this shape:
{{
  "dataStructure": "<one of: array | stack | queue | linkedlist | binarytree | recursion | variables | sqltable | sorting>",
  "steps": [
    {{
      "stepNum": <integer starting at 1>,
      "line": <line number where this action happens — use the exact line number prefix from the code above>,
      "code": "<the exact code line currently being executed, trimmed, excluding the line number prefix>",
      "action": "<one of: compare | swap | push | pop | enqueue | dequeue | insert | traverse | assign | call | return | highlight | filter | select | create_table | sort>",
      "state": <full current state of the data structure — see format below>,
      "description": "<short plain-English description of what just happened, e.g. 'Comparing arr[0]=64 with arr[1]=34'>",
      "variables": {{ "<varName>": <value>, ... }}
    }}
  ]
}}

STATE FORMATS by dataStructure:

If "array" or "sorting":
  {{ "type": "array", "elements": [{{"value": <number>, "index": <int>, "status": "default|active|comparing|sorted|pivot|swapping"}}] }}

If "stack":
  {{ "type": "stack", "elements": [{{"value": <any>, "status": "active|default|returning"}}], "top": <int> }}

If "queue":
  {{ "type": "queue", "elements": [{{"value": <any>, "status": "default|active|enqueuing|dequeuing"}}], "front": <int>, "rear": <int> }}

If "linkedlist":
  {{ "type": "linkedlist", "nodes": [{{"id": "n1", "value": <any>, "next": "n2_or_null", "status": "active|default|inserting|deleting"}}] }}

If "binarytree":
  {{ "type": "binarytree", "nodes": [{{"id": "1", "value": <any>, "left": "2_or_null", "right": "3_or_null", "status": "visiting|visited|default|inserting"}}] }}

If "recursion":
  {{ "type": "recursion", "frames": [{{"id": "f1", "funcName": "<name>", "args": {{"n": 5}}, "returnValue": <optional>, "status": "active|returning|completed"}}], "depth": <int> }}

If "variables":
  {{ "type": "variables", "variables": [{{"name": "<var>", "value": <any>, "type": "<int|str|bool|float>", "status": "active|default|updated"}}], "output": ["<printed lines>"] }}

If "sqltable":
  {{ "type": "sqltable", "tableName": "<name>", "columns": ["col1","col2"], "rows": [{{"values": [<v1>,<v2>], "status": "default|inserted|selected|filtered|joining"}}] }}

Rules:
- Generate 8-20 steps (more for sorting — include each compare and swap)
- Each step must show the COMPLETE current state (not just the change)
- For sorting: mark compared elements as "comparing", swapped as "swapping", sorted section as "sorted"
- For recursion: push a new frame for each call, pop on return
- If the code contains severe syntax errors, is meaningless, or lacks basic structure (e.g. plain text instead of HTML tags), return exactly: {{"error": true, "message": "Syntax error description"}}
- Return ONLY the JSON object. Start with {{ and end with }}"""


@router.post("/trace")
async def trace(req: TraceRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    # Prepend line numbers to the code to help the LLM identify correct lines
    numbered_lines = [f"{i+1}: {line}" for i, line in enumerate(req.code.splitlines())]
    numbered_code = "\n".join(numbered_lines)

    user_prompt = TRACE_USER_TEMPLATE.format(lang=req.lang, code=numbered_code)

    last_error = None
    for attempt in range(2):  # Retry once on JSON parse failure
        try:
            raw = await chat_completion(TRACE_SYSTEM, user_prompt, max_tokens=4096)
            json_str = extract_json_block(raw)
            result = json.loads(json_str)

            if isinstance(result, dict) and result.get("error"):
                raise HTTPException(status_code=400, detail=result.get("message", "Invalid code or syntax error."))

            # Validate
            if "steps" not in result or not isinstance(result.get("steps"), list):
                raise ValueError("Missing 'steps' array")
            if "dataStructure" not in result:
                result["dataStructure"] = "variables"

            # Align/verify line numbers programmatically to guarantee 100% correctness
            for step in result.get("steps", []):
                code_trimmed = step.get("code", "").strip()
                predicted_line = step.get("line", -1)
                step["line"] = align_line_number(req.code, predicted_line, code_trimmed)

            return result

        except (json.JSONDecodeError, ValueError) as e:
            last_error = e
            logger.warning(f"Attempt {attempt+1} JSON error in /trace: {e}")
            continue
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in /trace: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    raise HTTPException(
        status_code=500,
        detail=f"AI returned invalid trace JSON after 2 attempts: {last_error}"
    )

