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
Always return ONLY valid JSON — no markdown, no prose outside JSON.
CRITICAL: The simulation must be detailed and show every single state change, comparison, and swap step-by-step. For standard school/lab exercises (like sorting an array of 5 elements or recursion up to depth 5), simulate EVERY single step without skipping. Limit the total simulation to at most 15 steps to fit output token budgets."""

TRACE_USER_TEMPLATE = """Language: {lang}
Code (numbered lines):
{code}

Task: Simulate this code execution step by step in at most 15 steps. Identify the primary data structure used.
CRITICAL: Show every single comparison, variable assignment, swap, recursion frame push/pop, and state update. Do NOT skip steps or iterations unless the execution exceeds 15 steps.

Return a JSON object with exactly this shape:
{{
  "dataStructure": "<one of: array | stack | queue | linkedlist | binarytree | recursion | variables | sqltable | sorting | graph>",
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

STATE FORMATS by dataStructure (Note: ALL formats can have an optional "output": ["line 1", "line 2"] containing printed stdout up to that step):

If "array" or "sorting":
  {{ "type": "array", "elements": [{{"value": <number>, "index": <int>, "status": "default|active|comparing|sorted|pivot|swapping"}}], "output": <optional list of stdout strings> }}

If "stack":
  {{ "type": "stack", "elements": [{{"value": <any>, "status": "active|default|returning"}}], "top": <int>, "output": <optional list of stdout strings> }}

If "queue":
  {{ "type": "queue", "elements": [{{"value": <any>, "status": "default|active|enqueuing|dequeuing"}}], "front": <int>, "rear": <int>, "output": <optional list of stdout strings> }}

If "linkedlist":
  {{ "type": "linkedlist", "nodes": [{{"id": "n1", "value": <any>, "next": "n2_or_null", "status": "active|default|inserting|deleting"}}], "output": <optional list of stdout strings> }}

If "binarytree":
  {{ "type": "binarytree", "nodes": [{{"id": "1", "value": <any>, "left": "2_or_null", "right": "3_or_null", "status": "visiting|visited|default|inserting"}}], "output": <optional list of stdout strings> }}

If "recursion":
  {{ "type": "recursion", "frames": [{{"id": "f1", "funcName": "<name>", "args": {{"n": 5}}, "returnValue": <optional>, "status": "active|returning|completed"}}], "depth": <int>, "output": <optional list of stdout strings> }}

If "variables":
  {{ "type": "variables", "variables": [{{"name": "<var>", "value": <any>, "type": "<int|str|bool|float>", "status": "active|default|updated"}}], "output": ["<printed lines>"] }}

If "sqltable":
  {{ "type": "sqltable", "tableName": "<name>", "columns": ["col1","col2"], "rows": [{{"values": [<v1>,<v2>], "status": "default|inserted|selected|filtered|joining"}}], "output": <optional list of stdout strings> }}

If "graph":
  {{ "type": "graph", "nodes": [{{"id": "A", "value": "A", "status": "default|visiting|visited|highlighted|shortest_path"}}], "edges": [{{"from": "A", "to": "B", "weight": <optional number>, "directed": <optional bool>, "status": "default|highlighted|shortest_path"}}], "directed": <optional bool>, "output": <optional list of stdout strings> }}

Rules:
- The total number of steps in the "steps" array must not exceed 15.
- For typical examples (e.g., sorting 4-6 items or recursion with depth 3-5), simulate EVERY single step. Do not skip comparisons, swaps, or iterations.
- If the simulation naturally requires more than 15 steps, detailedly simulate the first 10 steps, skip the middle redundant iterations, and show the final 5 steps leading to the final output state.
- Each step must show the COMPLETE current state (not just the change).
- For sorting: mark compared elements as "comparing", swapped as "swapping", sorted section as "sorted".
- For recursion call stack sync:
  * Maintain the full call stack in the "frames" array. The first call (e.g., print_name(5)) is index 0.
  * When a recursive function is called, push a new frame to the end of the "frames" array.
  * Active/previous frames MUST remain on the stack at their respective positions and cannot be omitted or dropped as the depth increases.
  * When a frame returns, mark its status as "returning", show the return value, then in the next step pop it from the stack.
  * The number of elements in the "frames" array must exactly equal the call "depth" at every step.
- If the code contains severe syntax errors, is meaningless, or lacks basic structure, return exactly: {{"error": true, "message": "Syntax error description"}}
- Return ONLY the JSON object. Start with {{ and end with }}"""


@router.post("/trace")
async def trace(req: TraceRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    # Prepend line numbers to the code to help the LLM identify correct lines
    numbered_lines = [f"{i+1}: {line}" for i, line in enumerate(req.code.splitlines())]
    numbered_code = "\n".join(numbered_lines)

    user_prompt = TRACE_USER_TEMPLATE.format(lang=req.lang, code=numbered_code)

    last_raw = ""
    last_error = None
    # Attempt 1: use the fast 8b model first with JSON mode (extremely low latency, guaranteed JSON structure)
    # Attempt 2: retry with the smart 70b model as fallback if validation or parsing fails
    models_to_try = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]
    for attempt, model_name in enumerate(models_to_try):
        try:
            raw = await chat_completion(
                TRACE_SYSTEM, 
                user_prompt, 
                max_tokens=4096, 
                model=model_name,
                response_format={"type": "json_object"}
            )
            last_raw = raw
            json_str = extract_json_block(raw)
            result = json.loads(json_str)

            if isinstance(result, dict) and result.get("error"):
                raise HTTPException(status_code=400, detail=result.get("message", "Invalid code or syntax error."))

            # Validate and normalize
            if "steps" not in result or not isinstance(result.get("steps"), list):
                raise ValueError("Missing 'steps' array")
            if "dataStructure" not in result:
                result["dataStructure"] = "variables"

            for step in result.get("steps", []):
                if not isinstance(step, dict):
                    raise ValueError("Step is not a dictionary")
                
                # Check essential keys
                for key in ["stepNum", "line", "action", "state", "description"]:
                    if key not in step:
                        raise ValueError(f"Step missing required key '{key}'")
                
                if not isinstance(step.get("state"), dict):
                    raise ValueError("Step 'state' must be a dictionary")
                
                # Cast line and stepNum to integers to guarantee type safety
                try:
                    step["line"] = int(step.get("line", -1))
                except (ValueError, TypeError):
                    step["line"] = -1
                try:
                    step["stepNum"] = int(step.get("stepNum", 1))
                except (ValueError, TypeError):
                    step["stepNum"] = 1

                # Reconstruct or default 'variables' if missing or not a dict
                if "variables" not in step or not isinstance(step.get("variables"), dict):
                    reconstructed = {}
                    state_obj = step.get("state")
                    if isinstance(state_obj, dict) and isinstance(state_obj.get("variables"), list):
                        for var_item in state_obj.get("variables"):
                            if isinstance(var_item, dict) and "name" in var_item:
                                reconstructed[var_item["name"]] = var_item.get("value")
                    step["variables"] = reconstructed

            # Align/verify line numbers programmatically to guarantee 100% correctness
            for step in result.get("steps", []):
                code_trimmed = (step.get("code") or "").strip()
                predicted_line = step.get("line", -1)
                step["line"] = align_line_number(req.code, predicted_line, code_trimmed)

            return result

        except (json.JSONDecodeError, ValueError) as e:
            last_error = e
            logger.warning(f"Attempt {attempt+1} ({model_name}) JSON error in /trace: {e}")
            continue
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in /trace (attempt {attempt+1}, {model_name}): {e}")
            last_error = e
            continue

    raise HTTPException(
        status_code=500,
        detail=f"AI returned invalid trace JSON after 2 attempts. Error: {last_error}. Raw output was: {last_raw}"
    )

