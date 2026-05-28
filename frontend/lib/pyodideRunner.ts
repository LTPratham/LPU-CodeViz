import type { TraceResponse } from "./types";

let pyodideWorker: Worker | null = null;
let currentPromiseReject: ((reason?: any) => void) | null = null;

function getWorker(): Worker {
  if (!pyodideWorker) {
    // Standard initialization of Web Worker inside Next.js public directory
    pyodideWorker = new Worker("/pyodideWorker.js");
  }
  return pyodideWorker;
}

/**
 * Runs Python code offline inside the Pyodide Web Worker.
 * Automatically handles timeouts (e.g. infinite loops) and manages worker lifecycle.
 */
export function runPythonOffline(code: string): Promise<TraceResponse> {
  return new Promise((resolve, reject) => {
    // If a run is already in progress, cancel and terminate it
    if (currentPromiseReject) {
      if (pyodideWorker) {
        pyodideWorker.terminate();
        pyodideWorker = null;
      }
      currentPromiseReject(new Error("Execution cancelled by a newer execution request."));
    }
    
    currentPromiseReject = reject;

    let worker: Worker;
    try {
      worker = getWorker();
    } catch (err: any) {
      currentPromiseReject = null;
      reject(new Error(`Failed to initialize Web Worker: ${err.message}`));
      return;
    }

    // Terminate worker if it runs longer than 4.5 seconds (e.g. infinite loop protection)
    const timeoutId = setTimeout(() => {
      if (pyodideWorker) {
        pyodideWorker.terminate();
        pyodideWorker = null;
      }
      currentPromiseReject = null;
      reject(new Error("Python execution timed out. (Infinite loop detected)"));
    }, 4500);

    worker.onmessage = (event) => {
      clearTimeout(timeoutId);
      currentPromiseReject = null;
      
      const { success, error, steps, dataStructure } = event.data;
      if (success) {
        resolve({
          dataStructure: dataStructure || "variables",
          steps: steps || []
        });
      } else {
        reject(new Error(error || "Execution failed inside Pyodide worker."));
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeoutId);
      currentPromiseReject = null;
      if (pyodideWorker) {
        pyodideWorker.terminate();
        pyodideWorker = null;
      }
      reject(new Error(`Pyodide Worker crash: ${err.message}`));
    };

    worker.postMessage({ code });
  });
}
