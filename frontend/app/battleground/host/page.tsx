"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, Square, Trophy, Users, Zap, Volume2, VolumeX, Sparkles, Share2, Award, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import BattlegroundLeaderboard, { BattlePlayer } from "@/components/BattlegroundLeaderboard";

const INITIAL_PLAYERS: BattlePlayer[] = [
  { id: "user-1", name: "Prathamesh Sawarkar", avatar: "P", score: 4850, timeSeconds: 112, complexity: "O(N log N)", status: "solved", streak: 8, elo: 1840 },
  { id: "user-2", name: "Aarav Sharma", avatar: "A", score: 4200, timeSeconds: 145, complexity: "O(N log N)", status: "solved", streak: 5, elo: 1720 },
  { id: "user-3", name: "Rohan Mehta", avatar: "R", score: 3800, timeSeconds: 189, complexity: "O(N)", status: "compiling", streak: 3, elo: 1690 },
  { id: "user-4", name: "Priya Patel", avatar: "P", score: 3450, timeSeconds: 210, complexity: "O(N²)", status: "bugged", streak: 2, elo: 1610 },
  { id: "user-5", name: "Aditya Verma", avatar: "A", score: 3100, timeSeconds: 240, complexity: "O(1)", status: "solved", streak: 4, elo: 1580 },
  { id: "user-6", name: "Sneha Gupta", avatar: "S", score: 2900, timeSeconds: 260, complexity: "O(N)", status: "idle", streak: 1, elo: 1540 },
];

const PRESET_CHALLENGES = [
  {
    id: "challenge-1",
    title: "QuickSort Partition Bug Hunt",
    difficulty: "Hard",
    targetBigO: "O(N log N)",
    desc: "Students must locate and fix the infinite recursion bug in the Lomuto partition index.",
    timeLimit: 300,
  },
  {
    id: "challenge-2",
    title: "Array Two-Sum Big-O Race",
    difficulty: "Medium",
    targetBigO: "O(N)",
    desc: "Optimize the O(N²) nested loop brute-force solution into a single-pass hash map algorithm.",
    timeLimit: 240,
  },
  {
    id: "challenge-3",
    title: "BST Balancing Traversal Trace",
    difficulty: "Easy",
    targetBigO: "O(log N)",
    desc: "Predict variable pointers and step trace output during AVL tree left-right rotation.",
    timeLimit: 180,
  },
];

export default function FacultyProjectorHost() {
  const [selectedChallenge, setSelectedChallenge] = useState(PRESET_CHALLENGES[0]);
  const [battleStatus, setBattleStatus] = useState<"lobby" | "active" | "finished">("lobby");
  const [timeLeft, setTimeLeft] = useState(300);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [players, setPlayers] = useState<BattlePlayer[]>(INITIAL_PLAYERS);
  const [activityFeed, setActivityFeed] = useState<string[]>([
    "🚀 Room LPU-8821 created! Waiting for gladiators...",
    "👋 Prathamesh Sawarkar joined the arena.",
    "👋 Aarav Sharma joined the arena.",
    "👋 Rohan Mehta joined the arena.",
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (battleStatus === "active" && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setBattleStatus("finished");
            return 0;
          }
          return prev - 1;
        });

        // Simulate live activity ticker events
        if (Math.random() > 0.7) {
          const events = [
            "🔥 Prathamesh achieved O(N log N) optimal speed!",
            "⚡ Aarav Sharma submitted 18-step clean trace!",
            "⚠️ Priya Patel triggered infinite recursion warning.",
            "💡 Rohan Mehta activated AI Hint Beacon (-20 pts).",
          ];
          const randomEvent = events[Math.floor(Math.random() * events.length)];
          setActivityFeed((prev) => [randomEvent, ...prev.slice(0, 8)]);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [battleStatus, isPaused, timeLeft]);

  const handleLaunch = () => {
    setTimeLeft(selectedChallenge.timeLimit);
    setBattleStatus("active");
    setActivityFeed((prev) => [`🚨 BATTLE LAUNCHED: ${selectedChallenge.title}!`, ...prev]);
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
      padding: "24px",
      fontFamily: "var(--font-sans), sans-serif",
    }}>
      {/* Top Controller Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid rgba(139, 92, 246, 0.4)",
        borderRadius: 16,
        padding: "16px 24px",
        marginBottom: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/battleground" style={{ color: "#94A3B8", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={18} /> Exit Arena
          </Link>
          <div style={{ height: 24, width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#A78BFA", letterSpacing: "0.05em" }}>PROJECTOR HOST MODE</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#FFF" }}>{selectedChallenge.title}</span>
          </div>
        </div>

        {/* Big PIN Box for Classroom Projector */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#000",
            padding: "8px 20px",
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "0.1em",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span>PIN: <span style={{ textDecoration: "underline" }}>LPU-8821</span></span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: soundEnabled ? "#10B981" : "#64748B",
              padding: 10,
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Main Grid: Challenge Selector & Arena vs Leaderboard */}
      {battleStatus === "lobby" ? (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#FFF", marginBottom: 12 }}>Select Classroom Challenge</h2>
            <p style={{ fontSize: 16, color: "#94A3B8" }}>Choose an algorithmic puzzle. When you hit launch, students in room LPU-8821 will enter live combat.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
            {PRESET_CHALLENGES.map((chal) => (
              <div
                key={chal.id}
                onClick={() => setSelectedChallenge(chal)}
                style={{
                  background: selectedChallenge.id === chal.id ? "rgba(139, 92, 246, 0.2)" : "rgba(30, 41, 59, 0.5)",
                  border: selectedChallenge.id === chal.id ? "2px solid #8B5CF6" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 24,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: chal.difficulty === "Hard" ? "rgba(244,63,94,0.2)" : chal.difficulty === "Medium" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                    color: chal.difficulty === "Hard" ? "#F43F5E" : chal.difficulty === "Medium" ? "#F59E0B" : "#10B981",
                  }}>
                    {chal.difficulty.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#A78BFA", fontFamily: "monospace" }}>{chal.targetBigO}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FFF", marginBottom: 8 }}>{chal.title}</h3>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, marginBottom: 16 }}>{chal.desc}</p>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Time Limit: {chal.timeLimit / 60} minutes</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleLaunch}
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFF",
                border: "none",
                padding: "18px 48px",
                borderRadius: 16,
                fontSize: 20,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 0 30px rgba(16, 185, 129, 0.5)",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Play size={24} /> LAUNCH LIVE ARENA COMBAT
            </button>
          </div>
        </div>
      ) : (
        /* Active or Finished Arena Dashboard */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* Left Column: Live Leaderboard or Post-Battle Report */}
          <div>
            {battleStatus === "active" ? (
              <>
                {/* Big Countdown Clock Banner */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "linear-gradient(90deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  borderRadius: 16,
                  padding: "20px 32px",
                  marginBottom: 24,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>Time Remaining</div>
                    <div style={{ fontSize: 44, fontWeight: 900, color: timeLeft < 60 ? "#F43F5E" : "#FFF", fontFamily: "monospace", letterSpacing: "-0.02em" }}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "#FFF",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {isPaused ? <Play size={18} /> : <Pause size={18} />} {isPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                      onClick={() => setBattleStatus("finished")}
                      style={{
                        background: "#EF4444",
                        color: "#FFF",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Square size={18} /> End & Analyze
                    </button>
                  </div>
                </div>

                <BattlegroundLeaderboard players={players} mode="live" />
              </>
            ) : (
              /* Finished - ESPN AI Sports Commentary & NAAC Report */
              <div style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))",
                border: "2px solid #8B5CF6",
                borderRadius: 20,
                padding: 32,
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={24} color="#FFF" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#FFF", margin: 0 }}>ESPN AI Sportscaster Arena Analysis</h2>
                    <p style={{ fontSize: 13, color: "#A78BFA", margin: 0 }}>Generated automatically for NAAC Criterion 2 & Faculty Evaluation</p>
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.4)", borderLeft: "4px solid #8B5CF6", padding: 20, borderRadius: 12, marginBottom: 24 }}>
                  <p style={{ fontSize: 16, color: "#F8FAFC", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                    "🎙️ What an electrifying 5-minute combat session! The class demonstrated exceptional mastery over <strong>{selectedChallenge.title}</strong> with an overall completion rate of <strong>83.3%</strong>. Gladiator <strong>Prathamesh Sawarkar</strong> took Gold in just 112 seconds with an optimal <strong>O(N log N)</strong> complexity! Noticeably, 2 students experienced call-stack overflow warnings—our AI system has automatically generated targeted recursion practice sets for their dashboards. All telemetry has been successfully exported to your NAAC Criterion 2 portfolio!"
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#10B981" }}>83.3%</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700 }}>Class Success Rate</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#3B82F6" }}>112s</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700 }}>Fastest Speed (Gold)</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#A78BFA" }}>100%</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700 }}>NAAC Sync Status</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <button
                    onClick={() => setBattleStatus("lobby")}
                    style={{
                      background: "#3B82F6",
                      color: "#FFF",
                      border: "none",
                      padding: "14px 28px",
                      borderRadius: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <RefreshCw size={18} /> Host Another Challenge
                  </button>
                  <Link
                    href="/dashboard/teacher"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "#FFF",
                      textDecoration: "none",
                      padding: "14px 28px",
                      borderRadius: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={18} /> View in NAAC Portfolio
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Activity Feed & Combat Stats */}
          <div style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            maxHeight: 650,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#FFF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} color="#F59E0B" /> Live Combat Ticker
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flex: 1 }}>
              {activityFeed.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 13,
                    color: "#CBD5E1",
                    background: "rgba(255,255,255,0.03)",
                    borderLeft: idx === 0 ? "3px solid #F59E0B" : "3px solid rgba(255,255,255,0.1)",
                    padding: "10px 12px",
                    borderRadius: "0 8px 8px 0",
                    animation: idx === 0 ? "fadeIn 0.3s ease" : "none",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 12, color: "#64748B", textAlign: "center" }}>
              Room Active • 6 Connected Devices
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
