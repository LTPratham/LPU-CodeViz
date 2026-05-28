import type { TraceResponse, TraceStep, StepAction, ArrayElement, RecursionFrame } from "./types";
import { runPythonOffline } from "./pyodideRunner";

// Helper to extract an array of numbers from standard C/Python/Java syntax
function extractArray(code: string): number[] | null {
  // Try matching [64, 34, 25...]
  const bracketMatch = code.match(/\[\s*((-?\d+)\s*,\s*)*(-?\d+)\s*\]/);
  if (bracketMatch) {
    try {
      return JSON.parse(bracketMatch[0]);
    } catch (e) {}
  }
  // Try matching {64, 34, 25...}
  const braceMatch = code.match(/\{\s*((-?\d+)\s*,\s*)*(-?\d+)\s*\}/);
  if (braceMatch) {
    try {
      const cleaned = braceMatch[0].replace(/{/g, "[").replace(/}/g, "]");
      return JSON.parse(cleaned);
    } catch (e) {}
  }
  return null;
}

// 1. Bubble Sort Simulation Tracer
function simulateBubbleSort(arr: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  const n = arr.length;
  let workArr = [...arr];
  let stepNum = 1;

  steps.push({
    stepNum: stepNum++,
    line: 129,
    action: "highlight",
    state: {
      type: "array",
      elements: workArr.map((v, idx) => ({ value: v, index: idx, status: "default" }))
    },
    description: `Initial array: [${workArr.join(", ")}]`,
    variables: { i: 0, j: 0, temp: 0 }
  });

  const tempSteps: { action: StepAction; elements: ArrayElement[]; desc: string; vars: any }[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare
      const compareElements = workArr.map((v, idx) => {
        let status: "comparing" | "default" | "sorted" = "default";
        if (idx === j || idx === j + 1) status = "comparing";
        else if (idx >= n - i) status = "sorted";
        return { value: v, index: idx, status };
      });
      tempSteps.push({
        action: "compare",
        elements: compareElements,
        desc: `Comparing arr[${j}] (${workArr[j]}) and arr[${j+1}] (${workArr[j+1]})`,
        vars: { i, j, temp: 0 }
      });

      if (workArr[j] > workArr[j + 1]) {
        // Swap
        const temp = workArr[j];
        workArr[j] = workArr[j + 1];
        workArr[j + 1] = temp;

        const swapElements = workArr.map((v, idx) => {
          let status: "swapping" | "default" | "sorted" = "default";
          if (idx === j || idx === j + 1) status = "swapping";
          else if (idx >= n - i) status = "sorted";
          return { value: v, index: idx, status };
        });
        tempSteps.push({
          action: "swap",
          elements: swapElements,
          desc: `Swapping arr[${j}] and arr[${j+1}] because ${temp} > ${workArr[j]}`,
          vars: { i, j, temp }
        });
      }
    }
    // Mark pass element as sorted
    const passElements = workArr.map((v, idx) => ({
      value: v,
      index: idx,
      status: idx >= n - i - 1 ? ("sorted" as const) : ("default" as const)
    }));
    tempSteps.push({
      action: "highlight",
      elements: passElements,
      desc: `Pass ${i + 1} complete. arr[${n - i - 1}] (${workArr[n - i - 1]}) is in its sorted position.`,
      vars: { i, j: n - i - 2, temp: 0 }
    });
  }

  // Final sorted step
  const finalElements = workArr.map((v, idx) => ({ value: v, index: idx, status: "sorted" as const }));
  tempSteps.push({
    action: "sort",
    elements: finalElements,
    desc: `Array is fully sorted! Final state: [${workArr.join(", ")}]`,
    vars: { i: n - 1, j: 0, temp: 0 }
  });

  // Consolidate steps if they exceed 100
  let selectedSteps = tempSteps;
  if (tempSteps.length > 100) {
    selectedSteps = tempSteps.slice(0, 100);
  }

  selectedSteps.forEach((s) => {
    steps.push({
      stepNum: stepNum++,
      line: s.action === "swap" ? 134 : s.action === "compare" ? 132 : 130,
      action: s.action,
      state: { type: "array", elements: s.elements },
      description: s.desc,
      variables: s.vars
    });
  });

  return steps;
}

// 2. Selection Sort Simulation Tracer
function simulateSelectionSort(arr: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  const n = arr.length;
  let workArr = [...arr];
  let stepNum = 1;

  steps.push({
    stepNum: stepNum++,
    line: 489,
    action: "highlight",
    state: {
      type: "array",
      elements: workArr.map((v, idx) => ({ value: v, index: idx, status: "default" }))
    },
    description: `Initial array: [${workArr.join(", ")}]`,
    variables: { i: 0, j: 0, min_idx: 0 }
  });

  const tempSteps: { action: StepAction; elements: ArrayElement[]; desc: string; vars: any }[] = [];

  for (let i = 0; i < n; i++) {
    let min_idx = i;
    
    // Highlight min_idx selection
    const initMinElements = workArr.map((v, idx) => {
      let status: "active" | "default" | "sorted" = idx < i ? "sorted" : "default";
      if (idx === min_idx) status = "active";
      return { value: v, index: idx, status };
    });
    tempSteps.push({
      action: "highlight",
      elements: initMinElements,
      desc: `Setting initial minimum index to i = ${i} (value: ${workArr[i]})`,
      vars: { i, j: i + 1, min_idx }
    });

    for (let j = i + 1; j < n; j++) {
      const compareElements = workArr.map((v, idx) => {
        let status: "comparing" | "active" | "default" | "sorted" = idx < i ? "sorted" : "default";
        if (idx === j) status = "comparing";
        else if (idx === min_idx) status = "active";
        return { value: v, index: idx, status };
      });
      tempSteps.push({
        action: "compare",
        elements: compareElements,
        desc: `Comparing arr[${j}] (${workArr[j]}) with current minimum arr[${min_idx}] (${workArr[min_idx]})`,
        vars: { i, j, min_idx }
      });

      if (workArr[j] < workArr[min_idx]) {
        min_idx = j;
        const newMinElements = workArr.map((v, idx) => {
          let status: "active" | "default" | "sorted" = idx < i ? "sorted" : "default";
          if (idx === min_idx) status = "active";
          return { value: v, index: idx, status };
        });
        tempSteps.push({
          action: "highlight",
          elements: newMinElements,
          desc: `Found a smaller value! New minimum is arr[${min_idx}] (${workArr[min_idx]})`,
          vars: { i, j, min_idx }
        });
      }
    }

    if (min_idx !== i) {
      const temp = workArr[i];
      workArr[i] = workArr[min_idx];
      workArr[min_idx] = temp;

      const swapElements = workArr.map((v, idx) => {
        let status: "swapping" | "default" | "sorted" = idx <= i ? "sorted" : "default";
        if (idx === i || idx === min_idx) status = "swapping";
        return { value: v, index: idx, status };
      });
      tempSteps.push({
        action: "swap",
        elements: swapElements,
        desc: `Swapping arr[${i}] (${temp}) with minimum arr[${min_idx}] (${workArr[i]})`,
        vars: { i, j: n, min_idx }
      });
    } else {
      const noSwapElements = workArr.map((v, idx) => {
        let status: "sorted" | "default" = idx <= i ? "sorted" : "default";
        return { value: v, index: idx, status };
      });
      tempSteps.push({
        action: "highlight",
        elements: noSwapElements,
        desc: `Minimum is already at index ${i}. No swap needed.`,
        vars: { i, j: n, min_idx }
      });
    }
  }

  const finalElements = workArr.map((v, idx) => ({ value: v, index: idx, status: "sorted" as const }));
  tempSteps.push({
    action: "sort",
    elements: finalElements,
    desc: `Selection Sort complete. Array is fully sorted!`,
    vars: { i: n, j: n, min_idx: n }
  });

  // Consolidate
  let selectedSteps = tempSteps;
  if (tempSteps.length > 100) {
    selectedSteps = tempSteps.slice(0, 100);
  }

  selectedSteps.forEach((s) => {
    steps.push({
      stepNum: stepNum++,
      line: s.action === "swap" ? 494 : s.action === "compare" ? 492 : 489,
      action: s.action,
      state: { type: "array", elements: s.elements },
      description: s.desc,
      variables: s.vars
    });
  });

  return steps;
}

// 3. Insertion Sort Simulation Tracer
function simulateInsertionSort(arr: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  const n = arr.length;
  let workArr = [...arr];
  let stepNum = 1;

  steps.push({
    stepNum: stepNum++,
    line: 0,
    action: "highlight",
    state: {
      type: "array",
      elements: workArr.map((v, idx) => ({ value: v, index: idx, status: "default" }))
    },
    description: `Initial array: [${workArr.join(", ")}]`,
    variables: { i: 1, j: 0, key: 0 }
  });

  const tempSteps: { action: StepAction; elements: ArrayElement[]; desc: string; vars: any }[] = [];

  for (let i = 1; i < n; i++) {
    const key = workArr[i];
    let j = i - 1;

    const keyElements = workArr.map((v, idx) => {
      let status: "active" | "default" | "sorted" = idx < i ? "sorted" : "default";
      if (idx === i) status = "active";
      return { value: v, index: idx, status };
    });
    tempSteps.push({
      action: "highlight",
      elements: keyElements,
      desc: `Setting key = arr[${i}] (${key}) and starting inner comparison loop.`,
      vars: { i, j, key }
    });

    while (j >= 0 && workArr[j] > key) {
      const compareElements = workArr.map((v, idx) => {
        let status: "comparing" | "default" | "sorted" = idx <= i ? "sorted" : "default";
        if (idx === j) status = "comparing";
        return { value: v, index: idx, status };
      });
      tempSteps.push({
        action: "compare",
        elements: compareElements,
        desc: `Comparing arr[${j}] (${workArr[j]}) with key (${key}). Since ${workArr[j]} > ${key}, shift it.`,
        vars: { i, j, key }
      });

      workArr[j + 1] = workArr[j];
      const shiftElements = workArr.map((v, idx) => {
        let status: "swapping" | "default" | "sorted" = idx <= i ? "sorted" : "default";
        if (idx === j + 1) status = "swapping";
        return { value: v, index: idx, status };
      });
      tempSteps.push({
        action: "swap",
        elements: shiftElements,
        desc: `Shifted arr[${j}] to arr[${j+1}].`,
        vars: { i, j, key }
      });

      j--;
    }
    workArr[j + 1] = key;
    const insertElements = workArr.map((v, idx) => {
      let status: "active" | "default" | "sorted" = idx <= i ? "sorted" : "default";
      if (idx === j + 1) status = "active";
      return { value: v, index: idx, status };
    });
    tempSteps.push({
      action: "insert",
      elements: insertElements,
      desc: `Inserted key (${key}) at position arr[${j+1}].`,
      vars: { i, j, key }
    });
  }

  const finalElements = workArr.map((v, idx) => ({ value: v, index: idx, status: "sorted" as const }));
  tempSteps.push({
    action: "sort",
    elements: finalElements,
    desc: `Insertion Sort complete. Array is fully sorted!`,
    vars: { i: n, j: 0, key: 0 }
  });

  // Consolidate
  let selectedSteps = tempSteps;
  if (tempSteps.length > 100) {
    selectedSteps = tempSteps.slice(0, 100);
  }

  selectedSteps.forEach((s) => {
    steps.push({
      stepNum: stepNum++,
      line: s.action === "swap" ? 134 : s.action === "compare" ? 132 : 130,
      action: s.action,
      state: { type: "array", elements: s.elements },
      description: s.desc,
      variables: s.vars
    });
  });

  return steps;
}

// 4. Linear Search Simulation Tracer
function simulateLinearSearch(arr: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  const n = arr.length;
  let stepNum = 1;

  steps.push({
    stepNum: stepNum++,
    line: 179,
    action: "highlight",
    state: {
      type: "array",
      elements: arr.map((v, idx) => ({ value: v, index: idx, status: "default" }))
    },
    description: `Starting Linear Search for target = ${target} in array [${arr.join(", ")}]`,
    variables: { i: 0, target }
  });

  let foundIdx = -1;
  for (let i = 0; i < n; i++) {
    const checkElements = arr.map((v, idx) => ({
      value: v,
      index: idx,
      status: idx === i ? ("comparing" as const) : ("default" as const)
    }));

    if (arr[i] === target) {
      foundIdx = i;
      const foundElements = arr.map((v, idx) => ({
        value: v,
        index: idx,
        status: idx === i ? ("sorted" as const) : ("default" as const)
      }));
      steps.push({
        stepNum: stepNum++,
        line: 181,
        action: "compare",
        state: { type: "array", elements: foundElements },
        description: `Comparing arr[${i}] (${arr[i]}) with target (${target}). Match found!`,
        variables: { i, target }
      });
      break;
    } else {
      steps.push({
        stepNum: stepNum++,
        line: 180,
        action: "compare",
        state: { type: "array", elements: checkElements },
        description: `Comparing arr[${i}] (${arr[i]}) with target (${target}). No match.`,
        variables: { i, target }
      });
    }
  }

  if (foundIdx !== -1) {
    steps.push({
      stepNum: stepNum++,
      line: 182,
      action: "return",
      state: {
        type: "array",
        elements: arr.map((v, idx) => ({ value: v, index: idx, status: idx === foundIdx ? ("sorted" as const) : ("default" as const) }))
      },
      description: `Target ${target} found at index ${foundIdx}. Returning ${foundIdx}.`,
      variables: { i: foundIdx, target, result: foundIdx }
    });
  } else {
    steps.push({
      stepNum: stepNum++,
      line: 184,
      action: "return",
      state: {
        type: "array",
        elements: arr.map((v, idx) => ({ value: v, index: idx, status: "default" as const }))
      },
      description: `Target ${target} not found in array. Returning -1.`,
      variables: { i: n, target, result: -1 }
    });
  }

  return steps;
}

// 5. Binary Search Simulation Tracer
function simulateBinarySearch(arr: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepNum = 1;
  const sortedArr = [...arr].sort((a, b) => a - b);

  steps.push({
    stepNum: stepNum++,
    line: 444,
    action: "highlight",
    state: {
      type: "array",
      elements: sortedArr.map((v, idx) => ({ value: v, index: idx, status: "default" }))
    },
    description: `Starting Binary Search for target = ${target} on sorted array [${sortedArr.join(", ")}]`,
    variables: { left: 0, right: sortedArr.length - 1, mid: 0, target }
  });

  let left = 0;
  let right = sortedArr.length - 1;
  let foundIdx = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    const highlightElements = sortedArr.map((v, idx) => {
      let status: "pivot" | "comparing" | "default" = "default";
      if (idx === mid) status = "pivot";
      else if (idx >= left && idx <= right) status = "comparing";
      return { value: v, index: idx, status };
    });

    steps.push({
      stepNum: stepNum++,
      line: 447,
      action: "compare",
      state: { type: "array", elements: highlightElements },
      description: `Calculating mid = (${left} + ${right}) / 2 = ${mid}. Comparing arr[mid] (${sortedArr[mid]}) with target (${target}).`,
      variables: { left, right, mid, target }
    });

    if (sortedArr[mid] === target) {
      foundIdx = mid;
      const successElements = sortedArr.map((v, idx) => ({
        value: v,
        index: idx,
        status: idx === mid ? ("sorted" as const) : ("default" as const)
      }));
      steps.push({
        stepNum: stepNum++,
        line: 450,
        action: "compare",
        state: { type: "array", elements: successElements },
        description: `Found match! arr[${mid}] is equal to target (${target}).`,
        variables: { left, right, mid, target }
      });
      break;
    } else if (sortedArr[mid] < target) {
      left = mid + 1;
      steps.push({
        stepNum: stepNum++,
        line: 452,
        action: "highlight",
        state: {
          type: "array",
          elements: sortedArr.map((v, idx) => ({
            value: v,
            index: idx,
            status: idx >= left && idx <= right ? ("comparing" as const) : ("default" as const)
          }))
        },
        description: `arr[mid] (${sortedArr[mid]}) is less than target (${target}). Shifting left pointer to mid + 1 = ${left}.`,
        variables: { left, right, mid, target }
      });
    } else {
      right = mid - 1;
      steps.push({
        stepNum: stepNum++,
        line: 454,
        action: "highlight",
        state: {
          type: "array",
          elements: sortedArr.map((v, idx) => ({
            value: v,
            index: idx,
            status: idx >= left && idx <= right ? ("comparing" as const) : ("default" as const)
          }))
        },
        description: `arr[mid] (${sortedArr[mid]}) is greater than target (${target}). Shifting right pointer to mid - 1 = ${right}.`,
        variables: { left, right, mid, target }
      });
    }
  }

  if (foundIdx !== -1) {
    steps.push({
      stepNum: stepNum++,
      line: 463,
      action: "return",
      state: {
        type: "array",
        elements: sortedArr.map((v, idx) => ({ value: v, index: idx, status: idx === foundIdx ? ("sorted" as const) : ("default" as const) }))
      },
      description: `Binary Search finished. Returning target index ${foundIdx}.`,
      variables: { left, right, mid: foundIdx, target, result: foundIdx }
    });
  } else {
    steps.push({
      stepNum: stepNum++,
      line: 465,
      action: "return",
      state: {
        type: "array",
        elements: sortedArr.map((v, idx) => ({ value: v, index: idx, status: "default" as const }))
      },
      description: `Target ${target} not found in array. Returning -1.`,
      variables: { left, right, mid: 0, target, result: -1 }
    });
  }

  return steps;
}

// 6. Stack Simulation Tracer
function simulateStack(code: string): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepNum = 1;
  const elements: any[] = [];
  
  const opRegex = /(push|pop)\s*\(\s*(-?\w+)?\s*\)/g;
  let match;
  const ops: { type: "push" | "pop"; val?: string | number }[] = [];
  
  while ((match = opRegex.exec(code)) !== null) {
    if (match[1] === "push") {
      const valStr = match[2];
      const parsedVal = isNaN(Number(valStr)) ? (valStr || "10") : Number(valStr);
      ops.push({ type: "push", val: parsedVal });
    } else {
      ops.push({ type: "pop" });
    }
  }

  if (ops.length === 0) {
    ops.push({ type: "push", val: 10 });
    ops.push({ type: "push", val: 20 });
    ops.push({ type: "push", val: 30 });
    ops.push({ type: "pop" });
    ops.push({ type: "pop" });
  }

  steps.push({
    stepNum: stepNum++,
    line: 251,
    action: "highlight",
    state: { type: "stack", elements: [], top: -1 },
    description: "Initializing empty Stack.",
    variables: { top: -1 }
  });

  ops.forEach((op) => {
    if (op.type === "push") {
      const val = op.val!;
      elements.push({ value: val, status: "active" });
      const currentElements = elements.map((el, i) => ({
        value: el.value,
        status: i === elements.length - 1 ? ("active" as const) : ("default" as const)
      }));

      steps.push({
        stepNum: stepNum++,
        line: 253,
        action: "push",
        state: {
          type: "stack",
          elements: currentElements,
          top: elements.length - 1
        },
        description: `Pushed value ${val} onto the Stack.`,
        variables: { top: elements.length - 1, pushedValue: val }
      });

      elements[elements.length - 1].status = "default";
    } else {
      if (elements.length === 0) {
        steps.push({
          stepNum: stepNum++,
          line: 263,
          action: "pop",
          state: { type: "stack", elements: [], top: -1 },
          description: "Attempted to pop from empty Stack. Stack Underflow!",
          variables: { top: -1 }
        });
      } else {
        const poppedEl = elements.pop();
        const popElements = [
          ...elements.map(el => ({ value: el.value, status: "default" as const })),
          { value: poppedEl.value, status: "returning" as const }
        ];

        steps.push({
          stepNum: stepNum++,
          line: 267,
          action: "pop",
          state: {
            type: "stack",
            elements: popElements,
            top: elements.length - 1
          },
          description: `Popped value ${poppedEl.value} from the Stack.`,
          variables: { top: elements.length - 1, poppedValue: poppedEl.value }
        });
      }
    }
  });

  return steps;
}

// 7. Queue Simulation Tracer
function simulateQueue(code: string): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepNum = 1;
  const elements: any[] = [];

  const opRegex = /(enqueue|dequeue|push|pop)\s*\(\s*(-?\w+)?\s*\)/g;
  let match;
  const ops: { type: "enqueue" | "dequeue"; val?: string | number }[] = [];

  while ((match = opRegex.exec(code)) !== null) {
    const action = match[1];
    if (action === "enqueue" || action === "push") {
      const valStr = match[2];
      const parsedVal = isNaN(Number(valStr)) ? (valStr || "10") : Number(valStr);
      ops.push({ type: "enqueue", val: parsedVal });
    } else if (action === "dequeue" || action === "pop") {
      ops.push({ type: "dequeue" });
    }
  }

  if (ops.length === 0) {
    ops.push({ type: "enqueue", val: 10 });
    ops.push({ type: "enqueue", val: 20 });
    ops.push({ type: "enqueue", val: 30 });
    ops.push({ type: "dequeue" });
    ops.push({ type: "enqueue", val: 40 });
  }

  steps.push({
    stepNum: stepNum++,
    line: 634,
    action: "highlight",
    state: { type: "queue", elements: [], front: -1, rear: -1 },
    description: "Initializing empty Queue.",
    variables: { front: -1, rear: -1 }
  });

  let front = -1;
  let rear = -1;

  ops.forEach((op) => {
    if (op.type === "enqueue") {
      const val = op.val!;
      if (front === -1) front = 0;
      rear++;
      elements.push({ value: val, status: "enqueuing" });

      const currentElements = elements.map((el, i) => ({
        value: el.value,
        status: i === elements.length - 1 ? ("enqueuing" as const) : ("default" as const)
      }));

      steps.push({
        stepNum: stepNum++,
        line: 646,
        action: "enqueue",
        state: {
          type: "queue",
          elements: currentElements,
          front,
          rear
        },
        description: `Enqueued value ${val} into the Queue.`,
        variables: { front, rear, enqueuedValue: val }
      });

      elements[elements.length - 1].status = "default";
    } else {
      if (elements.length === 0 || front > rear) {
        steps.push({
          stepNum: stepNum++,
          line: 650,
          action: "dequeue",
          state: { type: "queue", elements: [], front: -1, rear: -1 },
          description: "Attempted to dequeue from empty Queue. Queue Underflow!",
          variables: { front, rear }
        });
      } else {
        const dequeuedVal = elements[0].value;
        const dequeueElements = elements.map((el, i) => ({
          value: el.value,
          status: i === 0 ? ("dequeuing" as const) : ("default" as const)
        }));

        steps.push({
          stepNum: stepNum++,
          line: 655,
          action: "dequeue",
          state: {
            type: "queue",
            elements: dequeueElements,
            front,
            rear
          },
          description: `Dequeued value ${dequeuedVal} from the front of the Queue.`,
          variables: { front, rear, dequeuedValue: dequeuedVal }
        });

        elements.shift();
        front++;
      }
    }
  });

  return steps;
}

// 8. Recursion Simulation Tracer (Fibonacci, Factorial)
function simulateRecursion(code: string): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepNum = 1;
  const frames: RecursionFrame[] = [];

  const isFib = /fib/i.test(code);
  const isFact = /fact/i.test(code);

  const numMatch = code.match(/(?:n\s*=\s*|fibonacci\(|factorial\()(\d+)/);
  const inputN = numMatch ? Math.min(6, Math.max(0, parseInt(numMatch[1]))) : 4;

  let frameCounter = 0;

  if (isFib) {
    const traceFib = (n: number): number => {
      const myId = `f${++frameCounter}`;
      frames.push({
        id: myId,
        funcName: "fibonacci",
        args: { n },
        status: "active"
      });

      steps.push({
        stepNum: stepNum++,
        line: 159,
        action: "call",
        state: {
          type: "recursion",
          frames: [...frames],
          depth: frames.length
        },
        description: `Calling fibonacci(n=${n})`,
        variables: { n }
      });

      if (n <= 1) {
        const idx = frames.findIndex(f => f.id === myId);
        frames[idx] = { ...frames[idx], returnValue: n, status: "returning" };

        steps.push({
          stepNum: stepNum++,
          line: 160,
          action: "return",
          state: {
            type: "recursion",
            frames: [...frames],
            depth: frames.length
          },
          description: `Base case reached. fibonacci(n=${n}) returns ${n}`,
          variables: { n }
        });

        frames.splice(idx, 1);
        return n;
      }

      const val1 = traceFib(n - 1);
      const val2 = traceFib(n - 2);
      const res = val1 + val2;

      const idx = frames.findIndex(f => f.id === myId);
      frames[idx] = { ...frames[idx], returnValue: res, status: "returning" };

      steps.push({
        stepNum: stepNum++,
        line: 162,
        action: "return",
        state: {
          type: "recursion",
          frames: [...frames],
          depth: frames.length
        },
        description: `fibonacci(n=${n}) returns fib(${n-1}) [${val1}] + fib(${n-2}) [${val2}] = ${res}`,
        variables: { n, result: res }
      });

      frames.splice(idx, 1);
      return res;
    };

    traceFib(inputN);
  } else {
    const traceFact = (n: number): number => {
      const myId = `f${++frameCounter}`;
      frames.push({
        id: myId,
        funcName: "factorial",
        args: { n },
        status: "active"
      });

      steps.push({
        stepNum: stepNum++,
        line: 473,
        action: "call",
        state: {
          type: "recursion",
          frames: [...frames],
          depth: frames.length
        },
        description: `Calling factorial(n=${n})`,
        variables: { n }
      });

      if (n <= 1) {
        const idx = frames.findIndex(f => f.id === myId);
        frames[idx] = { ...frames[idx], returnValue: 1, status: "returning" };

        steps.push({
          stepNum: stepNum++,
          line: 474,
          action: "return",
          state: {
            type: "recursion",
            frames: [...frames],
            depth: frames.length
          },
          description: `Base case reached. factorial(n=${n}) returns 1`,
          variables: { n }
        });

        frames.splice(idx, 1);
        return 1;
      }

      const subRes = traceFact(n - 1);
      const res = n * subRes;

      const idx = frames.findIndex(f => f.id === myId);
      frames[idx] = { ...frames[idx], returnValue: res, status: "returning" };

      steps.push({
        stepNum: stepNum++,
        line: 476,
        action: "return",
        state: {
          type: "recursion",
          frames: [...frames],
          depth: frames.length
        },
        description: `factorial(n=${n}) returns ${n} * factorial(${n-1}) [${subRes}] = ${res}`,
        variables: { n, result: res }
      });

      frames.splice(idx, 1);
      return res;
    };

    traceFact(inputN);
  }

  if (steps.length > 100) {
    return steps.slice(0, 100).map((s, idx) => ({ ...s, stepNum: idx + 1 }));
  }

  return steps;
}

// 9. Basic Variables Loop Simulation Tracer
// Parses actual values from the code so changing a, b, or threshold produces correct output.
function simulateVariables(code: string): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepNum = 1;

  // --- Parse actual variable values from code ---
  const aMatch = code.match(/\bint\s+a\s*=\s*(-?\d+)/);
  const bMatch = code.match(/\bint\s+b\s*=\s*(-?\d+)/);
  // For loop upper bound (e.g. i <= 3)
  const loopMatch = code.match(/i\s*<=\s*(\d+)/);
  // Threshold in the if condition (e.g. sum > 25)
  const threshMatch = code.match(/sum\s*>\s*(-?\d+)/);

  const a = aMatch ? parseInt(aMatch[1]) : 10;
  const b = bMatch ? parseInt(bMatch[1]) : 20;
  const sum = a + b;
  const loopMax = loopMatch ? parseInt(loopMatch[1]) : 3;
  const threshold = threshMatch ? parseInt(threshMatch[1]) : 25;
  const conditionTrue = sum > threshold;

  // Build the output message based on actual values
  const sumMsg = conditionTrue
    ? `Sum ${sum} is greater than ${threshold}`
    : `Sum is small`;

  // Step 1: assign a
  steps.push({
    stepNum: stepNum++,
    line: 15,
    action: "assign",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: a, type: "int", status: "active" },
        { name: "b", value: null, type: "int", status: "default" }
      ],
      output: []
    },
    description: `Initializing variables: a = ${a}`,
    variables: { a }
  });

  // Step 2: assign b
  steps.push({
    stepNum: stepNum++,
    line: 16,
    action: "assign",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: a, type: "int", status: "default" },
        { name: "b", value: b, type: "int", status: "active" }
      ],
      output: []
    },
    description: `Initializing variables: b = ${b}`,
    variables: { a, b }
  });

  // Step 3: calculate sum
  steps.push({
    stepNum: stepNum++,
    line: 19,
    action: "assign",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: a, type: "int", status: "default" },
        { name: "b", value: b, type: "int", status: "default" },
        { name: "sum", value: sum, type: "int", status: "active" }
      ],
      output: []
    },
    description: `Calculating sum = a + b = ${sum}`,
    variables: { a, b, sum }
  });

  // Step 4: evaluate condition
  steps.push({
    stepNum: stepNum++,
    line: 23,
    action: "compare",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: a, type: "int", status: "default" },
        { name: "b", value: b, type: "int", status: "default" },
        { name: "sum", value: sum, type: "int", status: "active" }
      ],
      output: []
    },
    description: `Evaluating condition (sum > ${threshold}) which is ${conditionTrue ? "True" : "False"}`,
    variables: { a, b, sum }
  });

  // Step 5: print result of if/else
  steps.push({
    stepNum: stepNum++,
    line: conditionTrue ? 24 : 26,
    action: "highlight",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: a, type: "int", status: "default" },
        { name: "b", value: b, type: "int", status: "default" },
        { name: "sum", value: sum, type: "int", status: "default" }
      ],
      output: [sumMsg]
    },
    description: `Printing output to console: '${sumMsg}'`,
    variables: { a, b, sum }
  });

  // Step 6+: loop iterations
  for (let i = 1; i <= loopMax; i++) {
    const priorOutputs: string[] = [sumMsg];
    for (let k = 1; k < i; k++) priorOutputs.push(`Loop count: ${k}`);

    steps.push({
      stepNum: stepNum++,
      line: 30,
      action: "assign",
      state: {
        type: "variables",
        variables: [
          { name: "a", value: a, type: "int", status: "default" },
          { name: "b", value: b, type: "int", status: "default" },
          { name: "sum", value: sum, type: "int", status: "default" },
          { name: "i", value: i, type: "int", status: "active" }
        ],
        output: priorOutputs
      },
      description: `Loop iteration: i = ${i}`,
      variables: { a, b, sum, i }
    });

    const nextOutputs = [...priorOutputs, `Loop count: ${i}`];
    steps.push({
      stepNum: stepNum++,
      line: 31,
      action: "highlight",
      state: {
        type: "variables",
        variables: [
          { name: "a", value: a, type: "int", status: "default" },
          { name: "b", value: b, type: "int", status: "default" },
          { name: "sum", value: sum, type: "int", status: "default" },
          { name: "i", value: i, type: "int", status: "default" }
        ],
        output: nextOutputs
      },
      description: `Printing loop value: 'Loop count: ${i}'`,
      variables: { a, b, sum, i }
    });
  }

  return steps;
}

function alignLocalSteps(steps: TraceStep[], code: string, lang: string, dataStructure: string): TraceStep[] {
  const lines = code.split("\n").map(l => l.trim());
  const lowerLines = lines.map(l => l.toLowerCase());

  // Helper to find a line matching criteria
  const findLineIdx = (includes: string[], excludes: string[] = []): number => {
    return lowerLines.findIndex(line => 
      includes.every(p => line.includes(p)) && !excludes.some(p => line.includes(p))
    );
  };

  // Find standard line indices
  let startLineIdx = -1;
  let compareLineIdx = -1;
  let swapLineIdx = -1;
  let innerLoopLineIdx = -1;
  let outerLoopLineIdx = -1;

  if (dataStructure === "sorting") {
    // 1. Sorting
    startLineIdx = findLineIdx(["sort"]);
    if (startLineIdx === -1) startLineIdx = findLineIdx(["bubble"]) || findLineIdx(["select"]) || findLineIdx(["insert"]);
    outerLoopLineIdx = findLineIdx(["for", "i"], ["j"]);
    innerLoopLineIdx = findLineIdx(["for", "j"]);
    compareLineIdx = findLineIdx(["if", "arr"]);
    if (compareLineIdx === -1) compareLineIdx = findLineIdx(["if", "key"]);
    swapLineIdx = findLineIdx(["temp", "="], ["for", "if", "while"]);
    if (swapLineIdx === -1) swapLineIdx = findLineIdx(["[j]", "="], ["for", "if", "while"]);
    if (swapLineIdx === -1) swapLineIdx = findLineIdx(["[i]", "="], ["for", "if", "while"]);
    if (swapLineIdx === -1) swapLineIdx = findLineIdx(["min_idx", "="], ["for", "if", "while", "min_idx = i"]);

    return steps.map(step => {
      let lineNum = step.line;
      if (step.action === "compare") {
        lineNum = compareLineIdx !== -1 ? compareLineIdx + 1 : startLineIdx !== -1 ? startLineIdx + 4 : step.line;
      } else if (step.action === "swap" || step.action === "insert") {
        lineNum = swapLineIdx !== -1 ? swapLineIdx + 1 : startLineIdx !== -1 ? startLineIdx + 6 : step.line;
      } else if (step.action === "sort") {
        const endIdx = lowerLines.findIndex((line, i) => i > startLineIdx && line.includes("}"));
        lineNum = endIdx !== -1 ? endIdx + 1 : lines.length;
      } else if (step.action === "highlight") {
        if (step.description.toLowerCase().includes("pass") || step.description.toLowerCase().includes("complete")) {
          lineNum = outerLoopLineIdx !== -1 ? outerLoopLineIdx + 1 : startLineIdx !== -1 ? startLineIdx + 2 : step.line;
        } else {
          const mainIdx = findLineIdx(["main"]);
          const arrIdx = lowerLines.findIndex((line, i) => i >= mainIdx && (line.includes("arr") || line.includes("elements")));
          lineNum = arrIdx !== -1 ? arrIdx + 1 : startLineIdx !== -1 ? startLineIdx : step.line;
        }
      }
      return { ...step, line: lineNum };
    });
  }

  if (dataStructure === "recursion") {
    // 2. Recursion
    startLineIdx = findLineIdx(["def "]) || findLineIdx(["int "]) || findLineIdx(["function "]);
    const baseCaseLineIdx = lowerLines.findIndex(line => line.includes("if") && (line.includes("<= 1") || line.includes("<=1") || line.includes("== 0") || line.includes("== 1")));
    const recurseLineIdx = lowerLines.findIndex(line => line.includes("return") && (line.includes("fib") || line.includes("fact") || line.includes("+") || line.includes("*")));

    return steps.map(step => {
      let lineNum = step.line;
      if (step.action === "call") {
        lineNum = startLineIdx !== -1 ? startLineIdx + 1 : step.line;
      } else if (step.action === "return") {
        if (step.description.toLowerCase().includes("base case")) {
          lineNum = baseCaseLineIdx !== -1 ? baseCaseLineIdx + 2 : startLineIdx !== -1 ? startLineIdx + 2 : step.line;
        } else {
          lineNum = recurseLineIdx !== -1 ? recurseLineIdx + 1 : startLineIdx !== -1 ? startLineIdx + 4 : step.line;
        }
      }
      return { ...step, line: lineNum };
    });
  }

  if (dataStructure === "array") {
    // 3. Search (Binary / Linear)
    startLineIdx = findLineIdx(["search"]);
    const loopLineIdx = lowerLines.findIndex(line => line.includes("while") || line.includes("for"));
    compareLineIdx = lowerLines.findIndex(line => line.includes("if") && (line.includes("==") || line.includes("[") || line.includes("target")));
    const assignLineIdx = lowerLines.findIndex(line => line.includes("low =") || line.includes("high =") || line.includes("mid =") || line.includes("low=") || line.includes("high=") || line.includes("mid="));
    const returnLineIdx = lowerLines.findIndex(line => line.includes("return"));

    return steps.map(step => {
      let lineNum = step.line;
      if (step.action === "compare") {
        lineNum = compareLineIdx !== -1 ? compareLineIdx + 1 : step.line;
      } else if (step.action === "assign") {
        lineNum = assignLineIdx !== -1 ? assignLineIdx + 1 : step.line;
      } else if (step.action === "return" || step.action === "select") {
        lineNum = returnLineIdx !== -1 ? returnLineIdx + 1 : step.line;
      } else if (step.action === "highlight" || step.action === "traverse") {
        lineNum = loopLineIdx !== -1 ? loopLineIdx + 1 : step.line;
      }
      return { ...step, line: lineNum };
    });
  }

  if (dataStructure === "stack") {
    // 4. Stack
    const initLineIdx = lowerLines.findIndex(line => line.includes("stack =") || line.includes("stack=") || line.includes("new stack") || line.includes("list()"));
    const pushLineIdx = lowerLines.findIndex(line => line.includes(".push") || line.includes("push("));
    const popLineIdx = lowerLines.findIndex(line => line.includes(".pop") || line.includes("pop("));

    return steps.map(step => {
      let lineNum = step.line;
      if (step.action === "push") {
        lineNum = pushLineIdx !== -1 ? pushLineIdx + 1 : step.line;
      } else if (step.action === "pop") {
        lineNum = popLineIdx !== -1 ? popLineIdx + 1 : step.line;
      } else if (step.action === "highlight") {
        lineNum = initLineIdx !== -1 ? initLineIdx + 1 : step.line;
      }
      return { ...step, line: lineNum };
    });
  }

  if (dataStructure === "queue") {
    // 5. Queue
    const initLineIdx = lowerLines.findIndex(line => line.includes("queue =") || line.includes("queue=") || line.includes("new queue"));
    const enqueueLineIdx = lowerLines.findIndex(line => line.includes("enqueue") || line.includes(".push") || line.includes(".append") || line.includes("push_back"));
    const dequeueLineIdx = lowerLines.findIndex(line => line.includes("dequeue") || line.includes("pop") || line.includes("shift"));

    return steps.map(step => {
      let lineNum = step.line;
      if (step.action === "enqueue") {
        lineNum = enqueueLineIdx !== -1 ? enqueueLineIdx + 1 : step.line;
      } else if (step.action === "dequeue") {
        lineNum = dequeueLineIdx !== -1 ? dequeueLineIdx + 1 : step.line;
      } else if (step.action === "highlight") {
        lineNum = initLineIdx !== -1 ? initLineIdx + 1 : step.line;
      }
      return { ...step, line: lineNum };
    });
  }

  if (dataStructure === "variables") {
    // 6. Variables (Basics)
    return steps.map(step => {
      let lineNum = step.line;
      const desc = step.description.toLowerCase();
      let matchIdx = -1;

      if (desc.includes("a = 10") || desc.includes("a=10") || desc.includes("name =") || desc.includes("initializ")) {
        matchIdx = lowerLines.findIndex(line => line.includes("a = 10") || line.includes("a=10") || line.includes("name ="));
      } else if (desc.includes("b = 20") || desc.includes("b=20") || desc.includes("age =")) {
        matchIdx = lowerLines.findIndex(line => line.includes("b = 20") || line.includes("b=20") || line.includes("age ="));
      } else if (desc.includes("sum =") || desc.includes("arithmetic") || desc.includes("operation")) {
        matchIdx = lowerLines.findIndex(line => line.includes("sum =") || line.includes("sum="));
      } else if (desc.includes("if") || desc.includes("condition") || desc.includes("greater than")) {
        matchIdx = lowerLines.findIndex(line => line.includes("if"));
      } else if (desc.includes("loop") || desc.includes("count") || desc.includes("for")) {
        matchIdx = lowerLines.findIndex(line => line.includes("for"));
      }

      if (matchIdx !== -1) {
        lineNum = matchIdx + 1;
      }
      return { ...step, line: lineNum };
    });
  }

  return steps;
}

// Raw Local Execution Switchboard (without line alignment)
function tryLocalExecutionRaw(lang: string, code: string): TraceResponse | null {
  const normalized = code.toLowerCase();

  // 1. Basic variables loop template
  const C_BASICS_DEFAULT_CODE = `#include <stdio.h>

int main() {
    // 1. Initialize variables
    int a = 10;
    int b = 20;
    
    // 2. Perform operations
    int sum = a + b;
    int diff = b - a;
    
    // 3. Conditional logic
    if (sum > 25) {
        printf("Sum %d is greater than 25\\n", sum);
    } else {
        printf("Sum is small\\n");
    }
    
    // 4. Simple loop
    for(int i = 1; i <= 3; i++) {
        printf("Loop count: %d\\n", i);
    }
    
    return 0;
}`;

  const norm = (str: string) => str.replace(/\r\n/g, "\n").trim();
  // Detect the C basics template structurally: any C code that has int a=..., int b=..., sum=a+b, if(sum>...) and a for loop.
  // This way, changing values like a=5 or b=5 still gets simulated correctly instead of falling through to the API.
  const isCBasicsTemplate = (
    /\bint\s+a\s*=\s*-?\d+/.test(code) &&
    /\bint\s+b\s*=\s*-?\d+/.test(code) &&
    /\bsum\s*=\s*a\s*\+\s*b/.test(code) &&
    /\bif\s*\(\s*sum/.test(code) &&
    /\bfor\s*\(/.test(code)
  );
  if (norm(code) === norm(C_BASICS_DEFAULT_CODE) || isCBasicsTemplate) {
    return {
      dataStructure: "variables",
      steps: simulateVariables(code)
    };
  }

  // 2. Sorting templates
  const isSorting = normalized.includes("sort") || (normalized.includes("swap") && normalized.includes("arr"));
  if (isSorting) {
    const arr = extractArray(code) || [34, 25, 12, 22, 11];
    if (normalized.includes("bubble")) {
      return {
        dataStructure: "sorting",
        steps: simulateBubbleSort(arr)
      };
    }
    if (normalized.includes("selection")) {
      return {
        dataStructure: "sorting",
        steps: simulateSelectionSort(arr)
      };
    }
    if (normalized.includes("insertion")) {
      return {
        dataStructure: "sorting",
        steps: simulateInsertionSort(arr)
      };
    }
    // Default fallback sorting
    return {
      dataStructure: "sorting",
      steps: simulateBubbleSort(arr)
    };
  }

  // 3. Searching templates
  if (normalized.includes("search")) {
    const arr = extractArray(code) || [10, 25, 8, 42, 17, 33];
    const targetMatch = code.match(/(?:target\s*=\s*|linearSearch\(arr,\s*\w+,\s*|binarySearch\(arr,\s*)(-?\d+)/);
    const target = targetMatch ? parseInt(targetMatch[1]) : 42;

    if (normalized.includes("binary")) {
      return {
        dataStructure: "array",
        steps: simulateBinarySearch(arr, target)
      };
    }
    return {
      dataStructure: "array",
      steps: simulateLinearSearch(arr, target)
    };
  }

  // 4. Stack templates
  if (normalized.includes("stack") || (/\bpush\b/.test(normalized) && /\bpop\b/.test(normalized) && !normalized.includes("tree") && !normalized.includes("node"))) {
    return {
      dataStructure: "stack",
      steps: simulateStack(code)
    };
  }

  // 5. Queue templates
  if (normalized.includes("queue") || (normalized.includes("enqueue") && normalized.includes("dequeue"))) {
    return {
      dataStructure: "queue",
      steps: simulateQueue(code)
    };
  }

  // 6. Recursion templates (Fibonacci, Factorial)
  if (normalized.includes("fibonacci") || normalized.includes("factorial") || normalized.includes("def fib") || normalized.includes("int fib")) {
    return {
      dataStructure: "recursion",
      steps: simulateRecursion(code)
    };
  }

  return null;
}

// Main Local Execution Switchboard with Line Alignment
export async function tryLocalExecution(lang: string, code: string): Promise<TraceResponse | null> {
  const res = tryLocalExecutionRaw(lang, code);
  if (res) {
    res.steps = alignLocalSteps(res.steps, code, lang, res.dataStructure);
    return res;
  }

  if (lang === "python") {
    try {
      return await runPythonOffline(code);
    } catch (err) {
      console.warn("Offline Pyodide execution failed:", err);
    }
  }

  return null;
}
