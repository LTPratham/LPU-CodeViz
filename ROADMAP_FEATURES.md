# CodeCanvas Future Features & Roadmap Implementation Plan

This document details the blueprints, technical details, and code templates for the 5 key features to be added to CodeCanvas to elevate it into a premium educational platform.

---

## 🧩 1. AI Voice Tutor (Text-to-Speech Narration)
Provide real-time voice narrations of the AI's explanation when code execution steps are triggered, creating a classroom lecture experience.

### Technical Approach
* Use the HTML5 **Web Speech Synthesis API** (supported in all modern browsers without external dependencies).
* Add a play/stop speaker toggle to the `ExplainSidebar` component.
* Sync voice reading with the active line step controller.

### Code Blueprint
Add this to `frontend/components/ExplainSidebar.tsx`:
```tsx
import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Speech Hook/Controller inside ExplainSidebar
const [isSpeaking, setIsSpeaking] = useState(false);
const [autoRead, setAutoRead] = useState(false);

const speakExplanation = (text: string) => {
  window.speechSynthesis.cancel(); // Stop any ongoing speech
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0; // Adjust speech rate
  utterance.pitch = 1.0;
  
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => setIsSpeaking(false);

  setIsSpeaking(true);
  window.speechSynthesis.speak(utterance);
};

const stopSpeaking = () => {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
};

// Auto-read on step change if enabled
useEffect(() => {
  if (autoRead && currentExplain) {
    speakExplanation(currentExplain.explain);
  }
}, [currentLine, autoRead]);
```

---

## 📚 2. Pre-Built Algorithm Catalog (Templates)
A quick-access sidebar catalog with standard computer science code templates so users don't have to write basic algorithms from scratch.

### Suggested Templates
1. **Arrays & Sorting**:
   * Bubble Sort, Quick Sort, Selection Sort
2. **Linear Structures**:
   * Stack push/pop operations
   * Queue enqueue/dequeue operations
3. **Non-Linear Structures**:
   * Singly Linked List reversal
   * Binary Search Tree (BST) insertion
4. **Recursion**:
   * Fibonacci sequence
   * Tower of Hanoi
5. **Databases**:
   * SQL JOIN query demo

### Implementation
Add a template registry file `frontend/lib/templates.ts` mapping languages and names to boilerplate code. When selected, update the state of the Monaco Editor container.

---

## 🏆 3. Gamified Challenge Mode ("Predict the Next State")
Turns passive watching into active learning by prompting the student to predict the next execution state (e.g. element swap, stack state) before letting them proceed.

### Technical Approach
* In normal mode, steps are run automatically. In **Challenge Mode**, execution halts at critical actions (e.g. `action: "swap"`, `action: "push"`).
* The UI locks the next step button and displays a prompt: *"What will the array look like next? Click the two elements that will swap."*
* Match user clicks/inputs against the pre-calculated next step's state. Reward points on match.

---

## ⚡ 4. Client-Side (AST) Local Execution Fallback
Runs simple algorithm logic instantly in the browser using Abstract Syntax Tree (AST) tracing, reducing backend server loads and bypassing LLM latency.

### Technical Approach
* Check code size and syntax locally.
* For standard loops, variable assignments, and basic array manipulations, parse the JS code using a client-side parser (e.g., `acorn` or a simple JS interpreter).
* Generate trace steps instantly (0ms delay) in the client.
* Fallback to the Python Groq LLM backend for advanced or complex scripts (e.g., recursive trees, SQL queries, or complex data structures).

---

## 🎨 5. Enhanced Custom Canvas Themes & Animations
Bring UI layouts to life with futuristic cyberpunk/synthwave dark modes, premium glassmorphism panels, and smooth layout-based animations.

### Ideas
* **Active Glows**: Apply CSS glow animations to active structures:
  ```css
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.6));
  ```
* **Interactive Drag-and-Drop**: Let users manually rearrange visual elements or pointers on the canvas.
* **Responsive Visualizers**: Add full-screen modal visualizers for presentation modes in classrooms.
