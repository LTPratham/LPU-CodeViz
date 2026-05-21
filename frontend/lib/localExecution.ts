import type { TraceResponse, TraceStep, StepAction, ArrayElement, RecursionFrame } from "./types";

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

  // Consolidate steps if they exceed 14 (leaving space for the initial step)
  let selectedSteps = tempSteps;
  if (tempSteps.length > 14) {
    const first8 = tempSteps.slice(0, 8);
    const last5 = tempSteps.slice(tempSteps.length - 5);
    selectedSteps = [...first8, ...last5];
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
  if (tempSteps.length > 14) {
    const first8 = tempSteps.slice(0, 8);
    const last5 = tempSteps.slice(tempSteps.length - 5);
    selectedSteps = [...first8, ...last5];
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
  if (tempSteps.length > 14) {
    const first8 = tempSteps.slice(0, 8);
    const last5 = tempSteps.slice(tempSteps.length - 5);
    selectedSteps = [...first8, ...last5];
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

  if (steps.length > 15) {
    const start = steps.slice(0, 9);
    const end = steps.slice(steps.length - 6);
    return [...start, ...end].map((s, idx) => ({ ...s, stepNum: idx + 1 }));
  }

  return steps;
}

// 9. Basic Variables Loop Simulation Tracer
function simulateVariables(code: string): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepNum = 1;

  steps.push({
    stepNum: stepNum++,
    line: 15,
    action: "assign",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: 10, type: "int", status: "active" },
        { name: "b", value: null, type: "int", status: "default" }
      ],
      output: []
    },
    description: "Initializing variables: a = 10",
    variables: { a: 10 }
  });

  steps.push({
    stepNum: stepNum++,
    line: 16,
    action: "assign",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: 10, type: "int", status: "default" },
        { name: "b", value: 20, type: "int", status: "active" }
      ],
      output: []
    },
    description: "Initializing variables: b = 20",
    variables: { a: 10, b: 20 }
  });

  steps.push({
    stepNum: stepNum++,
    line: 19,
    action: "assign",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: 10, type: "int", status: "default" },
        { name: "b", value: 20, type: "int", status: "default" },
        { name: "sum", value: 30, type: "int", status: "active" }
      ],
      output: []
    },
    description: "Calculating sum = a + b = 30",
    variables: { a: 10, b: 20, sum: 30 }
  });

  steps.push({
    stepNum: stepNum++,
    line: 23,
    action: "compare",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: 10, type: "int", status: "default" },
        { name: "b", value: 20, type: "int", status: "default" },
        { name: "sum", value: 30, type: "int", status: "active" }
      ],
      output: []
    },
    description: "Evaluating condition (sum > 25) which is True",
    variables: { a: 10, b: 20, sum: 30 }
  });

  steps.push({
    stepNum: stepNum++,
    line: 24,
    action: "highlight",
    state: {
      type: "variables",
      variables: [
        { name: "a", value: 10, type: "int", status: "default" },
        { name: "b", value: 20, type: "int", status: "default" },
        { name: "sum", value: 30, type: "int", status: "default" }
      ],
      output: ["Sum 30 is greater than 25"]
    },
    description: "Printing output to console: 'Sum 30 is greater than 25'",
    variables: { a: 10, b: 20, sum: 30 }
  });

  for (let i = 1; i <= 3; i++) {
    const outputs = i === 1 ? ["Sum 30 is greater than 25"] : i === 2 ? ["Sum 30 is greater than 25", "Loop count: 1"] : ["Sum 30 is greater than 25", "Loop count: 1", "Loop count: 2"];
    steps.push({
      stepNum: stepNum++,
      line: 30,
      action: "assign",
      state: {
        type: "variables",
        variables: [
          { name: "a", value: 10, type: "int", status: "default" },
          { name: "b", value: 20, type: "int", status: "default" },
          { name: "sum", value: 30, type: "int", status: "default" },
          { name: "i", value: i, type: "int", status: "active" }
        ],
        output: outputs
      },
      description: `Loop iteration: i = ${i}`,
      variables: { a: 10, b: 20, sum: 30, i }
    });

    const nextOutputs = [...outputs, `Loop count: ${i}`];
    steps.push({
      stepNum: stepNum++,
      line: 31,
      action: "highlight",
      state: {
        type: "variables",
        variables: [
          { name: "a", value: 10, type: "int", status: "default" },
          { name: "b", value: 20, type: "int", status: "default" },
          { name: "sum", value: 30, type: "int", status: "default" },
          { name: "i", value: i, type: "int", status: "default" }
        ],
        output: nextOutputs
      },
      description: `Printing loop value: 'Loop count: ${i}'`,
      variables: { a: 10, b: 20, sum: 30, i }
    });
  }

  return steps;
}

// Main Local Execution Switchboard
export function tryLocalExecution(lang: string, code: string): TraceResponse | null {
  const normalized = code.toLowerCase();

  // 1. Basic variables loop template
  if (normalized.includes("basics") && normalized.includes("int a = 10;") && normalized.includes("sum = a + b")) {
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
  if (normalized.includes("stack") || (normalized.includes("push") && normalized.includes("pop") && !normalized.includes("tree") && !normalized.includes("node"))) {
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
