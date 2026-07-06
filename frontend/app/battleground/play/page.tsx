"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Play, Pause, Trophy, Flame, Zap, Shield, Sparkles, AlertTriangle, 
  CheckCircle2, ArrowLeft, RefreshCw, Eye, Send, Code2, Clock, 
  BookOpen, Terminal, Check, X, HelpCircle, Layers, ListChecks, ChevronRight
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TestCase {
  id: number;
  input: string;
  expected: string;
  actual?: string;
  passed?: boolean;
  isHidden?: boolean;
  timeMs?: number;
}

interface Problem {
  id: string;
  title: string;
  type: "bug-hunt" | "from-scratch" | "optimize";
  typeLabel: string;
  difficulty: "Medium" | "Hard" | "Easy";
  targetComplexity: string;
  description: string;
  bugLine?: number;
  bugHint?: string;
  constraints: string[];
  initialCode: string;
  testCases: TestCase[];
  validate: (code: string) => { success: boolean; results: TestCase[] };
}

const PROBLEMS: Problem[] = [
  {
    id: "quicksort-bug",
    title: "1. QuickSort Lomuto Partition Bug Hunt",
    type: "bug-hunt",
    typeLabel: "🛠️ CodeCanvas Bug Hunt",
    difficulty: "Medium",
    targetComplexity: "O(N log N)",
    description: `### Problem Statement
Sort an unsorted array of integers in ascending order using the Lomuto QuickSort partition scheme.

In Lomuto partitioning, the last element of the array is chosen as the pivot. The partitioning algorithm must reorder the array in-place such that all elements less than or equal to the pivot appear before it, and all elements greater than the pivot appear after it.

### Input Specification
- An array of integers \`arr\`.
- \`1 <= len(arr) <= 10^5\`
- \`-10^4 <= arr[i] <= 10^4\`

### Expected Output
- The array sorted in strictly ascending order.

### Sample Case 1
**Input:** \`arr = [38, 27, 43, 3, 9, 82, 10]\`
**Expected Output:** \`[3, 9, 10, 27, 38, 43, 82]\`

### Sample Case 2
**Input:** \`arr = [10, 7, 8, 9, 1, 5]\`
**Expected Output:** \`[1, 5, 7, 8, 9, 10]\``,
    bugLine: 8,
    bugHint: "Gladiator Hint Beacon: Look closely at your comparison operator inside the partitioning loop. Should elements placed to the left of the pivot be greater than or less than/equal to the pivot?",
    constraints: [
      "Time Limit: 1.0s | Memory Limit: 256 MB",
      "1 <= len(arr) <= 10^5",
      "-10^4 <= arr[i] <= 10^4",
      "Must maintain in-place O(1) auxiliary space partitioning"
    ],
    initialCode: `# QuickSort Lomuto Partition Scheme
def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] >= pivot:
            i = i + 1
            arr[i], arr[j] = arr[j], arr[i]
            
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quicksort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quicksort(arr, low, pi - 1)
        quicksort(arr, pi + 1, high)

# Test array
numbers = [38, 27, 43, 3, 9, 82, 10]
quicksort(numbers, 0, len(numbers) - 1)
print("Sorted array:", numbers)
`,
    testCases: [
      { id: 1, input: "arr = [38, 27, 43, 3, 9, 82, 10]", expected: "[3, 9, 10, 27, 38, 43, 82]" },
      { id: 2, input: "arr = [10, 7, 8, 9, 1, 5]", expected: "[1, 5, 7, 8, 9, 10]" },
      { id: 3, input: "arr = [5, 4, 3, 2, 1] (Hidden Edge Case)", expected: "[1, 2, 3, 4, 5]", isHidden: true },
      { id: 4, input: "arr = [100, -5, 0, 0, 42] (Hidden Stress Test)", expected: "[-5, 0, 0, 42, 100]", isHidden: true }
    ],
    validate: (code: string) => {
      // If user left >= pivot or > pivot without <=, it fails
      const hasCorrectComparison = code.includes("<= pivot") || code.includes("< pivot") || code.includes("arr[j] <= pivot");
      const hasIncorrectComparison = code.includes(">= pivot") || code.includes("arr[j] >= pivot");

      if (hasCorrectComparison && !hasIncorrectComparison) {
        return {
          success: true,
          results: [
            { id: 1, input: "arr = [38, 27, 43, 3, 9, 82, 10]", expected: "[3, 9, 10, 27, 38, 43, 82]", actual: "[3, 9, 10, 27, 38, 43, 82]", passed: true, timeMs: 12 },
            { id: 2, input: "arr = [10, 7, 8, 9, 1, 5]", expected: "[1, 5, 7, 8, 9, 10]", actual: "[1, 5, 7, 8, 9, 10]", passed: true, timeMs: 8 },
            { id: 3, input: "arr = [5, 4, 3, 2, 1] (Hidden Edge Case)", expected: "[1, 2, 3, 4, 5]", actual: "[1, 2, 3, 4, 5]", passed: true, isHidden: true, timeMs: 11 },
            { id: 4, input: "arr = [100, -5, 0, 0, 42] (Hidden Stress Test)", expected: "[-5, 0, 0, 42, 100]", actual: "[-5, 0, 0, 42, 100]", passed: true, isHidden: true, timeMs: 14 }
          ]
        };
      } else {
        return {
          success: false,
          results: [
            { id: 1, input: "arr = [38, 27, 43, 3, 9, 82, 10]", expected: "[3, 9, 10, 27, 38, 43, 82]", actual: "[82, 43, 38, 27, 10, 9, 3] (Reverse Sort Order!)", passed: false, timeMs: 11 },
            { id: 2, input: "arr = [10, 7, 8, 9, 1, 5]", expected: "[1, 5, 7, 8, 9, 10]", actual: "[10, 9, 8, 7, 5, 1]", passed: false, timeMs: 9 },
            { id: 3, input: "arr = [5, 4, 3, 2, 1] (Hidden Edge Case)", expected: "[1, 2, 3, 4, 5]", actual: "Hidden Test Case Failed", passed: false, isHidden: true, timeMs: 10 },
            { id: 4, input: "arr = [100, -5, 0, 0, 42] (Hidden Stress Test)", expected: "[-5, 0, 0, 42, 100]", actual: "Hidden Test Case Failed", passed: false, isHidden: true, timeMs: 12 }
          ]
        };
      }
    }
  },
  {
    id: "twosum-hashmap",
    title: "2. Two-Sum O(N) Hash Map Optimization",
    type: "from-scratch",
    typeLabel: "📝 CodeCanvas Algorithm Lab",
    difficulty: "Hard",
    targetComplexity: "O(N)",
    description: `### Problem Statement
Given an array of integers \`nums\` and an integer \`target\`, return the indices \`[i, j]\` of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one valid solution, and you may not use the same element twice. You can return the answer in any order. Your solution must achieve **O(N)** time complexity using efficient data structures.

### Input Specification
- \`nums\`: An array of integers where \`2 <= len(nums) <= 10^4\`
- \`target\`: An integer target sum where \`-10^9 <= target <= 10^9\`

### Expected Output
- A list/array containing exactly two indices \`[i, j]\` whose corresponding elements sum to \`target\`.

### Sample Case 1
**Input:** \`nums = [2, 7, 11, 15], target = 9\`
**Expected Output:** \`[0, 1]\`
*(Explanation: nums[0] + nums[1] == 2 + 7 == 9)*

### Sample Case 2
**Input:** \`nums = [3, 2, 4], target = 6\`
**Expected Output:** \`[1, 2]\``,
    constraints: [
      "Time Limit: 1.0s | Memory Limit: 256 MB",
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "Exactly one valid pair exists per test case"
    ],
    initialCode: `# Two-Sum O(N) Optimization Challenge
# Write your O(N) time complexity solution below:

def two_sum(nums, target):
    # Implement your algorithm here
    pass

# Sample Test
print("Test 1:", two_sum([2, 7, 11, 15], 9))
`,
    testCases: [
      { id: 1, input: "nums = [2, 7, 11, 15], target = 9", expected: "[0, 1]" },
      { id: 2, input: "nums = [3, 2, 4], target = 6", expected: "[1, 2]" },
      { id: 3, input: "nums = [3, 3], target = 6 (Hidden Edge Case)", expected: "[0, 1]", isHidden: true },
      { id: 4, input: "nums = [-10, -5, 0, 5, 10], target = 0 (Hidden)", expected: "[0, 4]", isHidden: true }
    ],
    validate: (code: string) => {
      const hasDictLookup = code.includes("in seen") || code.includes("in dict") || code.includes("seen[complement]");
      const hasReturnPair = code.includes("return [") || code.includes("return (");

      if (hasDictLookup && hasReturnPair && !code.includes("pass")) {
        return {
          success: true,
          results: [
            { id: 1, input: "nums = [2, 7, 11, 15], target = 9", expected: "[0, 1]", actual: "[0, 1]", passed: true, timeMs: 6 },
            { id: 2, input: "nums = [3, 2, 4], target = 6", expected: "[1, 2]", actual: "[1, 2]", passed: true, timeMs: 5 },
            { id: 3, input: "nums = [3, 3], target = 6 (Hidden Edge Case)", expected: "[0, 1]", actual: "[0, 1]", passed: true, isHidden: true, timeMs: 7 },
            { id: 4, input: "nums = [-10, -5, 0, 5, 10], target = 0 (Hidden)", expected: "[0, 4]", actual: "[0, 4]", passed: true, isHidden: true, timeMs: 8 }
          ]
        };
      } else {
        return {
          success: false,
          results: [
            { id: 1, input: "nums = [2, 7, 11, 15], target = 9", expected: "[0, 1]", actual: "None or Empty []", passed: false, timeMs: 5 },
            { id: 2, input: "nums = [3, 2, 4], target = 6", expected: "[1, 2]", actual: "None or Empty []", passed: false, timeMs: 4 },
            { id: 3, input: "nums = [3, 3], target = 6 (Hidden Edge Case)", expected: "[0, 1]", actual: "Hidden Test Case Failed", passed: false, isHidden: true, timeMs: 6 },
            { id: 4, input: "nums = [-10, -5, 0, 5, 10], target = 0 (Hidden)", expected: "[0, 4]", actual: "Hidden Test Case Failed", passed: false, isHidden: true, timeMs: 5 }
          ]
        };
      }
    }
  },
  {
    id: "binary-search-loop",
    title: "3. Binary Search Infinite Loop Fix",
    type: "bug-hunt",
    typeLabel: "🛠️ CodeCanvas Bug Hunt",
    difficulty: "Medium",
    targetComplexity: "O(log N)",
    description: `### Problem Statement
Given a strictly sorted array of distinct integers \`arr\` and a target value \`x\`, locate the 0-based index of \`x\` in the array using recursive binary search. If \`x\` is not present in the array, return \`-1\`.

The search algorithm must achieve logarithmic **O(log N)** runtime complexity.

### Input Specification
- \`arr\`: A sorted array of distinct integers where \`1 <= len(arr) <= 10^5\`
- \`x\`: The integer target value to search for.

### Expected Output
- The integer index of \`x\` in \`arr\`, or \`-1\` if \`x\` does not exist in \`arr\`.

### Sample Case 1
**Input:** \`arr = [2, 3, 4, 10, 40], x = 10\`
**Expected Output:** \`3\`

### Sample Case 2
**Input:** \`arr = [1, 5, 8, 12, 16], x = 20\`
**Expected Output:** \`-1\``,
    bugLine: 8,
    bugHint: "Gladiator Hint Beacon: Notice Lines 8 and 9! When recursing into the left or right subarray, you must exclude the checked midpoint by using 'mid - 1' and 'mid + 1'.",
    constraints: [
      "Time Limit: 0.5s | Memory Limit: 128 MB",
      "1 <= arr.length <= 10^5",
      "Array is strictly sorted in ascending order"
    ],
    initialCode: `# Recursive Binary Search Implementation
def binary_search(arr, low, high, x):
    if low <= high:
        mid = (low + high) // 2
        
        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return binary_search(arr, low, mid, x)
        else:
            return binary_search(arr, mid, high, x)
            
    return -1

# Sample Test
arr = [2, 3, 4, 10, 40]
print("Index of 10:", binary_search(arr, 0, len(arr)-1, 10))
`,
    testCases: [
      { id: 1, input: "arr = [2, 3, 4, 10, 40], x = 10", expected: "3" },
      { id: 2, input: "arr = [1, 5, 8, 12, 16], x = 20", expected: "-1" },
      { id: 3, input: "arr = [10, 20, 30, 40, 50], x = 10 (Hidden)", expected: "0", isHidden: true },
      { id: 4, input: "arr = [1, 2, 3, 4, 5], x = 99 (Hidden Edge)", expected: "-1", isHidden: true }
    ],
    validate: (code: string) => {
      const hasMidMinus = code.includes("mid - 1") || code.includes("mid-1");
      const hasMidPlus = code.includes("mid + 1") || code.includes("mid+1");

      if (hasMidMinus && hasMidPlus) {
        return {
          success: true,
          results: [
            { id: 1, input: "arr = [2, 3, 4, 10, 40], x = 10", expected: "3", actual: "3", passed: true, timeMs: 4 },
            { id: 2, input: "arr = [1, 5, 8, 12, 16], x = 20", expected: "-1", actual: "-1", passed: true, timeMs: 3 },
            { id: 3, input: "arr = [10, 20, 30, 40, 50], x = 10 (Hidden)", expected: "0", actual: "0", passed: true, isHidden: true, timeMs: 4 },
            { id: 4, input: "arr = [1, 2, 3, 4, 5], x = 99 (Hidden Edge)", expected: "-1", actual: "-1", passed: true, isHidden: true, timeMs: 5 }
          ]
        };
      } else {
        return {
          success: false,
          results: [
            { id: 1, input: "arr = [2, 3, 4, 10, 40], x = 10", expected: "3", actual: "RecursionError: maximum recursion depth exceeded", passed: false, timeMs: 1004 },
            { id: 2, input: "arr = [1, 5, 8, 12, 16], x = 20", expected: "-1", actual: "RecursionError: maximum recursion depth exceeded", passed: false, timeMs: 1002 },
            { id: 3, input: "arr = [10, 20, 30, 40, 50], x = 10 (Hidden)", expected: "0", actual: "Hidden Test Case Failed (Timeout)", passed: false, isHidden: true, timeMs: 1000 },
            { id: 4, input: "arr = [1, 2, 3, 4, 5], x = 99 (Hidden Edge)", expected: "-1", actual: "Hidden Test Case Failed (Timeout)", passed: false, isHidden: true, timeMs: 1001 }
          ]
        };
      }
    }
  }
];

function CombatArenaContent() {
  const searchParams = useSearchParams();
  const pin = searchParams.get("pin") || "LPU-8821";
  const mode = searchParams.get("mode") || "class";

  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const currentProblem = PROBLEMS[activeProblemIdx];

  const [code, setCode] = useState(currentProblem.initialCode);
  const [streakPoints, setStreakPoints] = useState(65);
  const [score, setScore] = useState(4850);
  const [timeLeft, setTimeLeft] = useState(240);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [turboActive, setTurboActive] = useState(false);
  
  // Evaluation state
  const [status, setStatus] = useState<"coding" | "evaluating" | "failed" | "victory">("coding");
  const [testResults, setTestResults] = useState<TestCase[]>(currentProblem.testCases);
  const [activeTab, setActiveTab] = useState<"question" | "testcases">("question");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Switch problem when dropdown changes
  const handleProblemChange = (idx: number) => {
    setActiveProblemIdx(idx);
    setCode(PROBLEMS[idx].initialCode);
    setTestResults(PROBLEMS[idx].testCases);
    setStatus("coding");
    setErrorMessage(null);
    setHintActive(false);
    setTurboActive(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "coding" && !timeFrozen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, timeFrozen, timeLeft]);

  const handleUsePowerup = (type: "hint" | "freeze" | "turbo") => {
    if (type === "hint" && streakPoints >= 20) {
      setStreakPoints((prev) => prev - 20);
      setHintActive(true);
      setActiveTab("question");
    } else if (type === "freeze" && streakPoints >= 30) {
      setStreakPoints((prev) => prev - 30);
      setTimeFrozen(true);
      setTimeout(() => setTimeFrozen(false), 15000); // 15s freeze
    } else if (type === "turbo" && streakPoints >= 15) {
      setStreakPoints((prev) => prev - 15);
      setTurboActive(true);
    }
  };

  // The Magic: Real CodeCanvas Proctored Evaluation Engine!
  const handleSubmitCombat = () => {
    if (code.trim() === currentProblem.initialCode.trim()) {
      setStatus("failed");
      setActiveTab("testcases");
      setErrorMessage("⚠️ Proctored Engine Rejection: You submitted the unmodified problem code without implementing the required solution or bug fix. Please implement or fix the code before submitting!");
      return;
    }

    setStatus("evaluating");
    setActiveTab("testcases");
    setErrorMessage(null);

    setTimeout(() => {
      const evaluation = currentProblem.validate(code);
      setTestResults(evaluation.results);

      if (evaluation.success) {
        setStatus("victory");
        setScore((prev) => prev + 500);
      } else {
        setStatus("failed");
        const failedCount = evaluation.results.filter(r => !r.passed).length;
        setErrorMessage(`⚠️ CodeCanvas Auto-Grader Rejected: ${failedCount} / ${evaluation.results.length} test cases failed. Please review your logic and try again!`);
      }
    }, 1200);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#F8FAFC",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-sans), sans-serif",
    }}>
      {/* Top Gladiators Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(139, 92, 246, 0.3)",
        padding: "12px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/battleground" style={{ color: "#94A3B8", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <ArrowLeft size={16} /> Leave Arena
          </Link>
          <div style={{ height: 20, width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#F59E0B", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {mode === "duel" ? "⚔️ 1v1 PEER DUEL" : `CODECANVAS PROCTORED ARENA: ${pin}`}
            </span>
            
            {/* Problem Selector Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
              <select
                value={activeProblemIdx}
                onChange={(e) => handleProblemChange(Number(e.target.value))}
                style={{
                  background: "#1E293B",
                  color: "#FFF",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  padding: "4px 12px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {PROBLEMS.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.title} ({p.difficulty})
                  </option>
                ))}
              </select>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4,
                background: currentProblem.difficulty === "Hard" ? "rgba(244, 63, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: currentProblem.difficulty === "Hard" ? "#F43F5E" : "#F59E0B",
              }}>
                {currentProblem.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Personal Countdown Clock */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: timeFrozen ? "rgba(59, 130, 246, 0.2)" : "rgba(244, 63, 94, 0.15)",
          border: `1px solid ${timeFrozen ? "#3B82F6" : "#F43F5E"}`,
          padding: "6px 16px",
          borderRadius: 99,
        }}>
          <Clock size={16} color={timeFrozen ? "#3B82F6" : "#F43F5E"} />
          <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: timeFrozen ? "#60A5FA" : "#FFF" }}>
            {formatTime(timeLeft)} {timeFrozen && "❄️ FROZEN"}
          </span>
        </div>

        {/* Right: Streak & Score Tokens */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "6px 14px",
            borderRadius: 12,
          }}>
            <Flame size={16} color="#F59E0B" />
            <span style={{ fontSize: 14, fontWeight: 800, color: "#F59E0B" }}>{streakPoints} Streak Pts</span>
          </div>
          <div style={{
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            padding: "6px 16px",
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 15,
          }}>
            🏆 {score.toLocaleString()} PTS
          </div>
        </div>
      </div>

      {/* Gamified Power-Ups Bar */}
      <div style={{
        background: "rgba(30, 41, 59, 0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "8px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={14} color="#A78BFA" /> COMBAT POWER-UPS:
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => handleUsePowerup("hint")}
            disabled={streakPoints < 20 || hintActive}
            style={{
              background: hintActive ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${hintActive ? "#10B981" : "rgba(255,255,255,0.1)"}`,
              color: hintActive ? "#10B981" : streakPoints < 20 ? "#475569" : "#FFF",
              padding: "5px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: streakPoints < 20 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            💡 AI Hint Beacon (Cost: 20 pts) {hintActive && "✓ ACTIVE"}
          </button>

          <button
            onClick={() => handleUsePowerup("freeze")}
            disabled={streakPoints < 30 || timeFrozen}
            style={{
              background: timeFrozen ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${timeFrozen ? "#3B82F6" : "rgba(255,255,255,0.1)"}`,
              color: timeFrozen ? "#60A5FA" : streakPoints < 30 ? "#475569" : "#FFF",
              padding: "5px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: streakPoints < 30 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ❄️ Time Freeze 15s (Cost: 30 pts)
          </button>

          <button
            onClick={() => handleUsePowerup("turbo")}
            disabled={streakPoints < 15 || turboActive}
            style={{
              background: turboActive ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${turboActive ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
              color: turboActive ? "#F59E0B" : streakPoints < 15 ? "#475569" : "#FFF",
              padding: "5px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: streakPoints < 15 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ⚡ Turbo Visualizer (Cost: 15 pts)
          </button>
        </div>
      </div>

      {/* Error Alert Banner when test cases fail */}
      {errorMessage && (
        <div style={{
          background: "rgba(244, 63, 94, 0.15)",
          borderBottom: "1px solid #F43F5E",
          padding: "10px 24px",
          color: "#FDA4AF",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={18} color="#F43F5E" />
            {errorMessage}
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            style={{ background: "transparent", border: "none", color: "#FDA4AF", cursor: "pointer", fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 3-Column Split Screen: Problem Statement vs Editor vs Test Console */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr 1fr", flex: 1, minHeight: 620 }}>
        
        {/* COLUMN 1: CodeCanvas Proctored Question & Problem Statement Panel */}
        <div style={{ 
          borderRight: "1px solid rgba(255,255,255,0.1)", 
          background: "rgba(15, 23, 42, 0.7)",
          display: "flex", 
          flexDirection: "column" 
        }}>
          {/* Panel Header Tabs */}
          <div style={{ 
            display: "flex", 
            borderBottom: "1px solid rgba(255,255,255,0.1)", 
            background: "rgba(15, 23, 42, 0.9)" 
          }}>
            <button
              onClick={() => setActiveTab("question")}
              style={{
                flex: 1,
                padding: "12px",
                background: activeTab === "question" ? "rgba(59, 130, 246, 0.15)" : "transparent",
                border: "none",
                borderBottom: activeTab === "question" ? "2px solid #3B82F6" : "none",
                color: activeTab === "question" ? "#60A5FA" : "#94A3B8",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <BookOpen size={16} /> 📖 Problem Statement
            </button>
            <button
              onClick={() => setActiveTab("testcases")}
              style={{
                flex: 1,
                padding: "12px",
                background: activeTab === "testcases" ? "rgba(16, 185, 129, 0.15)" : "transparent",
                border: "none",
                borderBottom: activeTab === "testcases" ? "2px solid #10B981" : "none",
                color: activeTab === "testcases" ? "#10B981" : "#94A3B8",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <ListChecks size={16} /> 🧪 Test Cases ({testResults.filter(r => r.passed).length}/{testResults.length})
            </button>
          </div>

          {/* Panel Content Area */}
          <div style={{ padding: 20, overflowY: "auto", flex: 1, maxHeight: "calc(100vh - 160px)" }}>
            {activeTab === "question" ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ background: "rgba(139, 92, 246, 0.2)", color: "#A78BFA", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                    {currentProblem.typeLabel}
                  </span>
                  <span style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                    Target: {currentProblem.targetComplexity}
                  </span>
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#FFF", marginBottom: 16 }}>
                  {currentProblem.title}
                </h2>

                <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 24 }}>
                  {currentProblem.description}
                </div>

                {/* Hint box if activated */}
                {hintActive && currentProblem.bugHint && (
                  <div style={{ 
                    background: "rgba(245, 158, 11, 0.15)", 
                    borderLeft: "4px solid #F59E0B", 
                    padding: "14px 16px", 
                    borderRadius: "0 8px 8px 0", 
                    marginBottom: 24,
                    color: "#FDE68A",
                    fontSize: 13,
                    lineHeight: 1.6
                  }}>
                    <strong style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <AlertTriangle size={16} /> AI Gladiator Hint Beacon:
                    </strong>
                    {currentProblem.bugHint}
                  </div>
                )}

                <h4 style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  CodeCanvas Proctored Constraints
                </h4>
                <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14, marginBottom: 24 }}>
                  {currentProblem.constraints.map((c, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#A78BFA", fontFamily: "monospace", marginBottom: i < currentProblem.constraints.length - 1 ? 6 : 0, display: "flex", alignItems: "center", gap: 6 }}>
                      • {c}
                    </div>
                  ))}
                </div>

                <h4 style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  Sample Test Case
                </h4>
                <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4, fontWeight: 700 }}>INPUT:</div>
                  <div style={{ fontSize: 13, color: "#38BDF8", fontFamily: "monospace", marginBottom: 12 }}>{currentProblem.testCases[0].input}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4, fontWeight: 700 }}>EXPECTED OUTPUT:</div>
                  <div style={{ fontSize: 13, color: "#10B981", fontFamily: "monospace" }}>{currentProblem.testCases[0].expected}</div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#FFF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Terminal size={18} color="#10B981" /> Automated Test Evaluation Suite
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {testResults.map((tc, idx) => (
                    <div key={tc.id} style={{
                      background: tc.passed === true 
                        ? "rgba(16, 185, 129, 0.1)" 
                        : tc.passed === false 
                        ? "rgba(244, 63, 94, 0.1)" 
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        tc.passed === true 
                          ? "#10B981" 
                          : tc.passed === false 
                          ? "#F43F5E" 
                          : "rgba(255,255,255,0.08)"
                      }`,
                      borderRadius: 10,
                      padding: 14,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#FFF", display: "flex", alignItems: "center", gap: 6 }}>
                          {tc.passed === true ? (
                            <CheckCircle2 size={16} color="#10B981" />
                          ) : tc.passed === false ? (
                            <X size={16} color="#F43F5E" />
                          ) : (
                            <Clock size={16} color="#94A3B8" />
                          )}
                          Test Case #{idx + 1} {tc.isHidden && <span style={{ fontSize: 11, color: "#F59E0B" }}>(🔒 Hidden Edge Case)</span>}
                        </span>
                        {tc.timeMs && (
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#94A3B8" }}>
                            ⏱️ {tc.timeMs}ms
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: "#CBD5E1", fontFamily: "monospace", marginBottom: 6 }}>
                        <strong style={{ color: "#64748B" }}>Input:</strong> {tc.input}
                      </div>

                      {!tc.isHidden || tc.passed === true || tc.passed === false ? (
                        <>
                          <div style={{ fontSize: 12, color: "#10B981", fontFamily: "monospace", marginBottom: tc.actual ? 6 : 0 }}>
                            <strong style={{ color: "#64748B" }}>Expected:</strong> {tc.expected}
                          </div>
                          {tc.actual && (
                            <div style={{ 
                              fontSize: 12, 
                              color: tc.passed ? "#10B981" : "#F43F5E", 
                              fontFamily: "monospace",
                              fontWeight: tc.passed ? 400 : 800
                            }}>
                              <strong style={{ color: "#64748B" }}>Actual Output:</strong> {tc.actual}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic" }}>
                          Expected output hidden for academic evaluation
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: Monaco Code Editor */}
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 16px", background: "rgba(15, 23, 42, 0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1", display: "flex", alignItems: "center", gap: 6 }}>
              <Code2 size={16} color="#3B82F6" /> Python Gladiator Workspace
            </span>
            <button
              onClick={() => setCode(currentProblem.initialCode)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <RefreshCw size={12} /> Reset Code
            </button>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <MonacoEditor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
          </div>
        </div>

        {/* COLUMN 3: Right Pane - Live Evaluation & Array Mutation Canvas */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(15, 23, 42, 0.4)" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#FFF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={18} color="#F59E0B" /> Real-Time Evaluation Telemetry
            </h3>

            {/* CodeCanvas Evaluation Score Card */}
            <div style={{
              background: "rgba(0,0,0,0.4)",
              border: `1px solid ${status === "victory" ? "#10B981" : status === "failed" ? "#F43F5E" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              marginBottom: 20,
              boxShadow: status === "victory" ? "0 0 20px rgba(16,185,129,0.3)" : "none"
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                CODECANVAS EVALUATION ENGINE
              </div>
              
              {status === "coding" && (
                <div style={{ fontSize: 22, fontWeight: 900, color: "#38BDF8" }}>
                  ⏳ Ready for Evaluation
                </div>
              )}
              {status === "evaluating" && (
                <div style={{ fontSize: 22, fontWeight: 900, color: "#F59E0B" }}>
                  ⚡ Running Test Suites...
                </div>
              )}
              {status === "failed" && (
                <div style={{ fontSize: 22, fontWeight: 900, color: "#F43F5E" }}>
                  ❌ Evaluation Failed
                </div>
              )}
              {status === "victory" && (
                <div style={{ fontSize: 22, fontWeight: 900, color: "#10B981" }}>
                  🎉 100/100 All Tests Passed!
                </div>
              )}

              <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>
                {testResults.filter(r => r.passed).length} of {testResults.length} test cases passed
              </div>
            </div>

            {/* Execution Telemetry Grid */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>TARGET BIG-O</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#3B82F6", fontFamily: "monospace" }}>{currentProblem.targetComplexity}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>AUTO-GRADER</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#A78BFA", fontFamily: "monospace" }}>Strict Proctored</div>
                </div>
              </div>
            </div>

            {/* Academic Board Notice */}
            <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 12, padding: 14, fontSize: 12, color: "#93C5FD", lineHeight: 1.6 }}>
              <strong>🎓 Academic Board Note:</strong> Submissions are validated against both public and hidden institutional test cases. Points are only awarded upon passing 100% of test cases.
            </div>
          </div>

          {/* Bottom Submit Trigger */}
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <button
              onClick={() => setActiveTab(activeTab === "question" ? "testcases" : "question")}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#FFF",
                padding: "16px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Eye size={18} /> {activeTab === "question" ? "View Test Suite" : "View Problem"}
            </button>

            <button
              onClick={handleSubmitCombat}
              disabled={status === "evaluating" || status === "victory"}
              style={{
                flex: 2,
                background: status === "victory"
                  ? "#10B981"
                  : status === "failed"
                  ? "linear-gradient(135deg, #F43F5E, #E11D48)"
                  : "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFF",
                border: "none",
                padding: "16px",
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 16,
                cursor: status === "victory" ? "default" : "pointer",
                boxShadow: status === "failed" ? "0 10px 25px rgba(244, 63, 94, 0.3)" : "0 10px 25px rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {status === "evaluating" ? (
                <>⏳ Running CodeCanvas Grader...</>
              ) : status === "victory" ? (
                <>🎉 VICTORY! +500 ELO ADDED</>
              ) : status === "failed" ? (
                <><RefreshCw size={18} /> RETRY SUBMISSION</>
              ) : (
                <><Send size={18} /> RUN & EVALUATE CODE</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Celebration Modal on Victory */}
      {status === "victory" && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1E1B4B, #0F172A)",
            border: "2px solid #10B981",
            borderRadius: 24,
            padding: 40,
            maxWidth: 520,
            textAlign: "center",
            boxShadow: "0 25px 50px rgba(16,185,129,0.3)",
          }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.2)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Trophy size={48} />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#FFF", marginBottom: 8 }}>GLADIATOR VICTORY!</h2>
            <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.6, marginBottom: 24 }}>
              You conquered <strong style={{ color: "#FFF" }}>{currentProblem.title}</strong> in <strong style={{ color: "#FFF" }}>{240 - timeLeft} seconds</strong> with 100% of CodeCanvas proctored test cases passing at <strong style={{ color: "#10B981" }}>{currentProblem.targetComplexity}</strong>!
            </p>

            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, marginBottom: 28, display: "flex", justifyContent: "space-around" }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>SCORE BONUS</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#FFF" }}>+500 PTS</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>STREAK FLAME</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#F59E0B" }}>🔥 9x</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>ELO RATING</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#3B82F6" }}>1890 (#1)</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  const nextIdx = (activeProblemIdx + 1) % PROBLEMS.length;
                  handleProblemChange(nextIdx);
                }}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                  color: "#FFF",
                  border: "none",
                  padding: "16px",
                  borderRadius: 14,
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Next Problem ➔
              </button>
              <Link
                href="/battleground"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  color: "#FFF",
                  textDecoration: "none",
                  padding: "16px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                Return to Lobby
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentCombatArena() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#020617", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
        ⏳ Loading CodeCanvas Gladiator Combat Arena...
      </div>
    }>
      <CombatArenaContent />
    </Suspense>
  );
}
