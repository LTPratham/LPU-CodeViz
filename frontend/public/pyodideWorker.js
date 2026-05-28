/**
 * Pyodide Web Worker for offline execution and tracing.
 * Runs in a background thread to prevent freezing the main UI during user code runs.
 */

// Import Pyodide loader from JSDelivr CDN
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodideReadyPromise = null;

async function loadPyodideAndPackages() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
  }
  return pyodideReadyPromise;
}

// Warm up Pyodide as soon as the worker starts
loadPyodideAndPackages().catch(err => console.error("Worker failed to warm up Pyodide", err));

self.onmessage = async function (e) {
  const { code } = e.data;
  if (!code) {
    self.postMessage({ success: false, error: "Empty code execution requested." });
    return;
  }

  try {
    const pyodide = await loadPyodideAndPackages();

    // Pass the user code as a global variable
    pyodide.globals.set("user_code", code);

    // Run trace script
    await pyodide.runPythonAsync(`
import sys
import json
import traceback

class CodeCanvasTracer:
    def __init__(self):
        self.steps = []
        self.step_num = 1
        self.stdout = []
        
    def write(self, text):
        self.stdout.append(text)
        
    def flush(self):
        pass

    def trace_callback(self, frame, event, arg):
        if event == 'line':
            line_no = frame.f_lineno
            code_line = ""
            try:
                code_line = user_code_lines[line_no - 1]
            except:
                pass
                
            # Exclude tracer internals and imports from output
            variables = {}
            for k, v in {**frame.f_globals, **frame.f_locals}.items():
                if not k.startswith('__') and k not in ('sys', 'json', 'traceback', 'CodeCanvasTracer', 'user_code', 'user_code_lines', 'tracer', 'canvas_tracer_output', 'original_stdout'):
                    t = type(v).__name__
                    if t in ('int', 'float', 'str', 'bool'):
                        variables[k] = v
                    elif t == 'list':
                        variables[k] = list(v)
                    elif t == 'dict':
                        variables[k] = dict(v)
                    else:
                        variables[k] = str(v)
            
            # Map action type based on line content to highlight key events
            action = "assign"
            code_lower = code_line.lower()
            if "push" in code_lower:
                action = "push"
            elif "pop" in code_lower:
                action = "pop"
            elif "enqueue" in code_lower:
                action = "enqueue"
            elif "dequeue" in code_lower:
                action = "dequeue"
            elif "return" in code_lower:
                action = "return"
            elif "swap" in code_lower or "arr[i]" in code_lower or "arr[j]" in code_lower:
                action = "swap"
            elif "compare" in code_lower or "if " in code_lower:
                action = "compare"

            # Create state representation compatible with CodeCanvas Visualizers
            state_vars = []
            for name, val in variables.items():
                val_type = type(val).__name__
                state_vars.append({
                    "name": name,
                    "value": val,
                    "type": val_type,
                    "status": "active" if self.step_num > 1 and self.steps[-1]["variables"].get(name) != val else "default"
                })

            # Check if there is an array-like variable to visualize as an Array/Sorting
            ds_type = "variables"
            elements = []
            for name, val in variables.items():
                if isinstance(val, list) and all(isinstance(x, (int, float)) for x in val):
                    # We found a numeric array! We can visualize it as a sorting/array visualizer
                    ds_type = "sorting" if ("sort" in name.lower() or "arr" in name.lower()) else "array"
                    elements = [{"value": x, "index": idx, "status": "default"} for idx, x in enumerate(val)]
                    # Mark indices in swap/compare if we can deduce them
                    if action == "swap" and len(elements) > 1:
                        # Highlight swapping elements if possible
                        pass
                    break

            state_obj = {
                "type": ds_type,
                "output": "".join(self.stdout).splitlines()
            }
            if ds_type in ("array", "sorting"):
                state_obj["elements"] = elements
            else:
                state_obj["variables"] = state_vars

            self.steps.append({
                "stepNum": self.step_num,
                "line": line_no,
                "code": code_line.strip(),
                "action": action,
                "state": state_obj,
                "description": f"Executed: {code_line.strip()}",
                "variables": variables
            })
            self.step_num += 1
        return self.trace_callback

# Run user code with custom stdout capturing and tracing
tracer = CodeCanvasTracer()
user_code_lines = user_code.splitlines()
original_stdout = sys.stdout
sys.stdout = tracer

sys.settrace(tracer.trace_callback)
try:
    exec(user_code, {})
except Exception as e:
    tb = traceback.extract_tb(sys.exc_info()[2])
    err_line = tb[-1].lineno if tb else 0
    tracer.steps.append({
        "stepNum": tracer.step_num,
        "line": err_line,
        "code": f"# Error: {str(e)}",
        "action": "highlight",
        "state": {
            "type": "variables",
            "variables": [],
            "output": "".join(tracer.stdout).splitlines() + [f"Runtime Error: {str(e)}"]
        },
        "description": f"Runtime Error: {str(e)}",
        "variables": {}
    })
finally:
    sys.settrace(None)
    sys.stdout = original_stdout

canvas_tracer_output = json.dumps(tracer.steps)
    `);

    const outputJson = pyodide.globals.get("canvas_tracer_output");
    const steps = JSON.parse(outputJson);

    // Deduce visualizer dataStructure based on steps
    let dataStructure = "variables";
    if (steps.length > 0) {
      dataStructure = steps[steps.length - 1].state.type;
    }

    self.postMessage({ success: true, steps, dataStructure });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
