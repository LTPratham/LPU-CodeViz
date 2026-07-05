"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Play, Pause, Trophy, Flame, Zap, Shield, Sparkles, AlertTriangle, CheckCircle2, ArrowLeft, RefreshCw, Eye, Send, Code2, Clock } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const INITIAL_CODE = `# QuickSort Lomuto Partition - Fix the Bug!
def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        # BUG: Why is it comparing greater than instead of less than?
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
`;

function CombatArenaContent() {
  const searchParams = useSearchParams();
  const pin = searchParams.get("pin") || "LPU-8821";
  const mode = searchParams.get("mode") || "class";

  const [code, setCode] = useState(INITIAL_CODE);
  const [streakPoints, setStreakPoints] = useState(65);
  const [score, setScore] = useState(4850);
  const [timeLeft, setTimeLeft] = useState(240);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [turboActive, setTurboActive] = useState(false);
  const [status, setStatus] = useState<"coding" | "tracing" | "victory">("coding");
  const [traceStep, setTraceStep] = useState(0);
  const [arrayState, setArrayState] = useState([38, 27, 43, 3, 9, 82, 10]);

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
    } else if (type === "freeze" && streakPoints >= 30) {
      setStreakPoints((prev) => prev - 30);
      setTimeFrozen(true);
      setTimeout(() => setTimeFrozen(false), 15000); // 15s freeze
    } else if (type === "turbo" && streakPoints >= 15) {
      setStreakPoints((prev) => prev - 15);
      setTurboActive(true);
      setArrayState([3, 9, 10, 27, 38, 43, 82]); // instant sort demo
    }
  };

  const handleSubmitCombat = () => {
    setStatus("tracing");
    setTimeout(() => {
      setStatus("victory");
      setScore((prev) => prev + 500);
    }, 2000);
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
          <Link href="/battleground" style={{ color: "#94A3B8", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={18} /> Leave Battle
          </Link>
          <div style={{ height: 20, width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#F59E0B", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {mode === "duel" ? "⚔️ 1v1 PEER DUEL" : `ROOM: ${pin}`}
            </span>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#FFF" }}>QuickSort Partition Bug Hunt</div>
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

      {/* Gamified Power-Ups Bar (Mario Kart for Code!) */}
      <div style={{
        background: "rgba(30, 41, 59, 0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "10px 24px",
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
              padding: "6px 14px",
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
              padding: "6px 14px",
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
              padding: "6px 14px",
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

      {/* Main Split-Screen: Editor vs Visualizer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, minHeight: 600 }}>
        {/* Left Pane: Monaco Code Editor */}
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 16px", background: "rgba(15, 23, 42, 0.5)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1", display: "flex", alignItems: "center", gap: 6 }}>
              <Code2 size={16} color="#3B82F6" /> Python Gladiator Workspace
            </span>
            <span style={{ fontSize: 11, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 4 }}>
              Target: O(N log N)
            </span>
          </div>

          {hintActive && (
            <div style={{ background: "rgba(245, 158, 11, 0.15)", borderBottom: "1px solid #F59E0B", padding: "10px 16px", fontSize: 13, color: "#FDE68A", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} color="#F59E0B" />
              <strong>AI Hint Beacon:</strong> Look at Line 8! The Lomuto partition should sort elements less than or equal to pivot (&apos;&lt;=&apos;), not greater than (&apos;&gt;=&apos;)!
            </div>
          )}

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

        {/* Right Pane: Live Visualizer & Combat Tracing */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(15, 23, 42, 0.3)" }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FFF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={20} color="#F59E0B" /> Real-Time Array Mutation Canvas
            </h3>

            {/* Array Bars Visualizer */}
            <div style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 14,
              height: 240,
              marginBottom: 24,
            }}>
              {arrayState.map((val, idx) => {
                const maxVal = Math.max(...arrayState);
                const heightPct = Math.max(15, (val / maxVal) * 100);
                const isSorted = status === "victory" || turboActive;

                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 42,
                      height: `${heightPct * 1.8}px`,
                      background: isSorted
                        ? "linear-gradient(180deg, #10B981, #059669)"
                        : idx === 3
                        ? "linear-gradient(180deg, #F43F5E, #E11D48)"
                        : "linear-gradient(180deg, #3B82F6, #2563EB)",
                      borderRadius: "8px 8px 0 0",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: isSorted ? "0 0 15px rgba(16,185,129,0.5)" : "none",
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFF", fontFamily: "monospace" }}>{val}</span>
                  </div>
                );
              })}
            </div>

            {/* Execution Telemetry Box */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>COMPLEXITY</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#3B82F6", fontFamily: "monospace" }}>O(N log N)</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>RECURSION DEPTH</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#A78BFA", fontFamily: "monospace" }}>3 Frames</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>TEST CASES</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: status === "victory" ? "#10B981" : "#F59E0B" }}>
                    {status === "victory" ? "4/4 PASSED" : "2/4 PASSED"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Submit Trigger */}
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <button
              onClick={() => setArrayState([3, 9, 10, 27, 38, 43, 82])}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#FFF",
                padding: "16px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Eye size={18} /> Step Trace Preview
            </button>

            <button
              onClick={handleSubmitCombat}
              disabled={status === "tracing" || status === "victory"}
              style={{
                flex: 2,
                background: status === "victory"
                  ? "#10B981"
                  : "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFF",
                border: "none",
                padding: "16px",
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 18,
                cursor: status === "victory" ? "default" : "pointer",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {status === "tracing" ? (
                <>⏳ Tracing Call Stack...</>
              ) : status === "victory" ? (
                <>🎉 VICTORY! +500 ELO ADDED</>
              ) : (
                <><Send size={20} /> SUBMIT BATTLE CODE</>
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
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(10px)",
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
            maxWidth: 500,
            textAlign: "center",
            boxShadow: "0 25px 50px rgba(16,185,129,0.3)",
          }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.2)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Trophy size={48} />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#FFF", marginBottom: 8 }}>GLADIATOR VICTORY!</h2>
            <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.6, marginBottom: 24 }}>
              You conquered the QuickSort Partition Bug in <strong style={{ color: "#FFF" }}>{240 - timeLeft} seconds</strong> with optimal <strong style={{ color: "#10B981" }}>O(N log N)</strong> Big-O time complexity!
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
              <Link
                href="/battleground"
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                  color: "#FFF",
                  textDecoration: "none",
                  padding: "16px",
                  borderRadius: 14,
                  fontWeight: 900,
                  fontSize: 16,
                  display: "inline-block",
                }}
              >
                Return to Lobby
              </Link>
              <Link
                href="/dashboard/student"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  color: "#FFF",
                  textDecoration: "none",
                  padding: "16px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 16,
                  display: "inline-block",
                }}
              >
                View Achievements
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
        ⏳ Loading Gladiator Combat Arena...
      </div>
    }>
      <CombatArenaContent />
    </Suspense>
  );
}
