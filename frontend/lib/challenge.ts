import type { TraceStep, PredictionChallenge } from "./types";

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateChallenge(currentStep: TraceStep, nextStep: TraceStep): PredictionChallenge | null {
  if (!currentStep || !nextStep) return null;

  const action = nextStep.action;

  // 1. SWAP Challenge
  if (action === "swap") {
    const currState = currentStep.state;
    const nextState = nextStep.state;
    if (currState.type === "array" && nextState.type === "array") {
      const currElems = currState.elements;
      const nextElems = nextState.elements;
      const changedIndices: number[] = [];
      for (let i = 0; i < currElems.length; i++) {
        if (currElems[i]?.value !== nextElems[i]?.value) {
          changedIndices.push(i);
        }
      }
      if (changedIndices.length >= 2) {
        const idx1 = changedIndices[0];
        const idx2 = changedIndices[1];
        const val1 = currElems[idx1].value;
        const val2 = currElems[idx2].value;

        const correct = `Swap ${val1} and ${val2}`;
        const optionsSet = new Set<string>();
        optionsSet.add(correct);

        // Try to generate random pairs
        const allVals = currElems.map((e) => e.value);
        for (let attempt = 0; attempt < 10 && optionsSet.size < 4; attempt++) {
          const r1 = Math.floor(Math.random() * allVals.length);
          const r2 = Math.floor(Math.random() * allVals.length);
          if (r1 !== r2) {
            optionsSet.add(`Swap ${allVals[r1]} and ${allVals[r2]}`);
          }
        }
        
        // Fallbacks
        if (optionsSet.size < 4) optionsSet.add("Keep them as they are");
        if (optionsSet.size < 4) optionsSet.add("Swap first and last elements");
        if (optionsSet.size < 4) optionsSet.add("No swap needed");

        return {
          type: "swap",
          question: `Line ${nextStep.line}: What elements will be swapped in the next step?`,
          options: Array.from(optionsSet).slice(0, 4),
          correctAnswer: correct,
          description: nextStep.description,
        };
      }
    }
  }

  // 2. PUSH / ENQUEUE Challenge
  if (action === "push" || action === "enqueue") {
    const nextState = nextStep.state;
    let addedValue: string | number | null = null;
    if (nextState.type === "stack" && nextState.elements.length > 0) {
      addedValue = nextState.elements[nextState.elements.length - 1].value;
    } else if (nextState.type === "queue" && nextState.elements.length > 0) {
      addedValue = nextState.elements[nextState.elements.length - 1].value;
    }

    if (addedValue !== null) {
      const correct = String(addedValue);
      const optionsSet = new Set<string>();
      optionsSet.add(correct);

      const valNum = Number(addedValue);
      if (!isNaN(valNum)) {
        optionsSet.add(String(valNum + 1));
        optionsSet.add(String(valNum - 1));
        optionsSet.add(String(valNum * 2));
      } else {
        optionsSet.add("None");
        optionsSet.add("Null");
        optionsSet.add("0");
      }

      const structureName = action === "push" ? "stack" : "queue";
      return {
        type: action,
        question: `Line ${nextStep.line}: What value is about to be ${action}ed onto the ${structureName}?`,
        options: Array.from(optionsSet).slice(0, 4),
        correctAnswer: correct,
        description: nextStep.description,
      };
    }
  }

  // 3. POP / DEQUEUE Challenge
  if (action === "pop" || action === "dequeue") {
    const currState = currentStep.state;
    let removedValue: string | number | null = null;
    if (currState.type === "stack" && currState.elements.length > 0) {
      removedValue = currState.elements[currState.elements.length - 1].value;
    } else if (currState.type === "queue" && currState.elements.length > 0) {
      removedValue = currState.elements[0]?.value ?? null;
    }

    if (removedValue !== null) {
      const correct = String(removedValue);
      const optionsSet = new Set<string>();
      optionsSet.add(correct);

      const valNum = Number(removedValue);
      if (!isNaN(valNum)) {
        optionsSet.add(String(valNum + 10));
        optionsSet.add(String(valNum - 5));
        optionsSet.add("0");
      } else {
        optionsSet.add("Empty");
        optionsSet.add("None");
        optionsSet.add("Null");
      }

      const structureName = action === "pop" ? "stack" : "queue";
      return {
        type: action,
        question: `Line ${nextStep.line}: What value will be ${action}ed from the ${structureName}?`,
        options: Array.from(optionsSet).slice(0, 4),
        correctAnswer: correct,
        description: nextStep.description,
      };
    }
  }

  // 4. COMPARE Challenge
  if (action === "compare") {
    const desc = nextStep.description.toLowerCase();
    const isTrue = desc.includes("true") || (!desc.includes("false") && nextStep.stepNum > currentStep.stepNum);

    let condition = "the condition";
    const match = nextStep.description.match(/Comparing\s+([^\(]+)/i);
    if (match) {
      condition = match[1].trim();
    }

    const correct = isTrue ? "True" : "False";
    return {
      type: "compare",
      question: `Line ${nextStep.line}: Will the comparison result of '${condition}' be True or False?`,
      options: ["True", "False"],
      correctAnswer: correct,
      description: nextStep.description,
    };
  }

  // 5. ASSIGN Challenge
  if (action === "assign") {
    const currVars = currentStep.variables || {};
    const nextVars = nextStep.variables || {};
    let changedVarName = "";
    let newValue: any = null;

    for (const key of Object.keys(nextVars)) {
      if (currVars[key] !== nextVars[key]) {
        changedVarName = key;
        newValue = nextVars[key];
        break;
      }
    }

    if (changedVarName && newValue !== null) {
      const correct = String(newValue);
      const optionsSet = new Set<string>();
      optionsSet.add(correct);

      const valNum = Number(newValue);
      if (!isNaN(valNum)) {
        optionsSet.add(String(valNum + 1));
        optionsSet.add(String(valNum - 1));
        optionsSet.add("0");
      } else {
        optionsSet.add("undefined");
        optionsSet.add("null");
        optionsSet.add("false");
      }

      return {
        type: "assign",
        question: `Line ${nextStep.line}: What will be the new value assigned to variable '${changedVarName}'?`,
        options: Array.from(optionsSet).slice(0, 4),
        correctAnswer: correct,
        description: nextStep.description,
      };
    }
  }

  return null;
}
