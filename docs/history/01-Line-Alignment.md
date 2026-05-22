# Milestone 1: Code Execution Line Alignment & Monaco Highlights

**Dates:** May 21–22, 2026

## 1. Problem Statement
In LPU CodeViz, students step through code using a visualizer. However, the line numbers in the Monaco Editor, execution traces, and sidebar explanations frequently suffered from counting offsets due to:
* Blank lines in the source code.
* Single-line vs. multi-line comments.
* Bracket formatting differences.
This led to misaligned UI states—highlighting comment lines or showing explanations for the wrong statements.

---

## 2. Proposed & Implemented Design

### Backend Alignment Utility (`line_aligner.py`)
We created a line aligner in the backend that maps LLM-predicted line numbers to exact code locations programmatically.

* **File Location**: [line_aligner.py](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/backend/services/line_aligner.py)
* **Algorithm Details**:
  1. Accepts the raw user code, the LLM-guessed line number, and the targeted code snippet statement.
  2. Cleans up lines (strips whitespace and comments).
  3. Searches for exact matches of the targeted code snippet.
  4. If multiple identical lines are found (e.g. multiple `printf` statements), it computes the distance from the guessed line and resolves to the candidate closest to the LLM's guess.
  5. Returns the 1-indexed target line number.

### Endpoint Integrations
We integrated this utility into the core backend router files:
* **[explain.py](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/backend/routers/explain.py)**: Aligns explanation line indices before returning responses to the UI.
* **[trace.py](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/backend/routers/trace.py)**: Injects the raw code statement with each trace step and maps it to the aligned line number.
* **[ask.py](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/backend/routers/ask.py)**: Synchronized to use numbered code.

### Frontend Highlights & Startup Helper
* **Styles**: Added Monaco highlight decorator styles (e.g., `.trace-line-highlight`, `.trace-glyph-margin`) to [globals.css](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/app/globals.css) for execution backgrounds.
* **Startup Script**: Created [start.ps1](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/start.ps1) to run both the FastAPI backend and Next.js frontend concurrently under the correct directories.

---

## 3. NoneType Bug Fix
During testing, we discovered that if the LLM returned `null` for the `"code"` key inside trace steps, calling `.strip()` on the retrieved value failed with:
`AttributeError: 'NoneType' object has no attribute 'strip'`

* **Fix**: Modified the backend routers to fallback to an empty string: `(item.get("code") or "").strip()`.
* **Deployment**: Merged and pushed straight to `main` to trigger active Vercel/Railway production rebuilds.

---

## 4. Verification Results
We wrote unit tests in [test_alignment.py](file:///C:/Users/PREDATOR/.gemini/antigravity/brain/fd81486a-0edd-4fcd-9beb-14f50223f39a/scratch/test_alignment.py) confirming that:
1. Python scripts with leading/trailing comments align properly.
2. C programs with nested braces match correctly.
3. Duplicate statements resolve to their correct runtime occurrence based on closest distance.
All unit tests passed.
