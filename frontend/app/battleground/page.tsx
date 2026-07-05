"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Flame, Zap, Shield, Play, Users, Award, ChevronRight, Sparkles, Terminal, Code2, Cpu } from "lucide-react";
import BattlegroundLeaderboard, { BattlePlayer } from "@/components/BattlegroundLeaderboard";

const MOCK_LEADERBOARD: BattlePlayer[] = [
  { id: "user-1", name: "Prathamesh Sawarkar", avatar: "P", score: 4850, timeSeconds: 112, complexity: "O(N log N)", status: "solved", streak: 8, elo: 1840 },
  { id: "user-2", name: "Aarav Sharma", avatar: "A", score: 4200, timeSeconds: 145, complexity: "O(N log N)", status: "solved", streak: 5, elo: 1720 },
  { id: "user-3", name: "Rohan Mehta", avatar: "R", score: 3800, timeSeconds: 189, complexity: "O(N)", status: "compiling", streak: 3, elo: 1690 },
  { id: "user-4", name: "Priya Patel", avatar: "P", score: 3450, timeSeconds: 210, complexity: "O(N²)", status: "bugged", streak: 2, elo: 1610 },
  { id: "user-5", name: "Aditya Verma", avatar: "A", score: 3100, timeSeconds: 240, complexity: "O(1)", status: "solved", streak: 4, elo: 1580 },
  { id: "user-6", name: "Sneha Gupta", avatar: "S", score: 2900, timeSeconds: 260, complexity: "O(N)", status: "idle", streak: 1, elo: 1540 },
];

export default function BattlegroundLobby() {
  const [pinCode, setPinCode] = useState("LPU-8821");
  const [leaderboardMode, setLeaderboardMode] = useState<"live" | "elo">("live");

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 0%, #1E1B4B 0%, #0F172A 70%, #020617 100%)",
      color: "#F8FAFC",
      padding: "40px 24px",
    }}>
      {/* Top Navbar Bar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#FFF",
            fontSize: 20,
            fontWeight: 800,
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
            }}>
              <Zap size={20} color="#FFF" />
            </div>
            <span>CodeCanvas <span style={{ color: "#F59E0B" }}>BATTLEGROUND</span></span>
          </Link>
          <span style={{
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#F59E0B",
            padding: "4px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.05em",
          }}>
            LIVE ESPORT ARENA
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard/teacher" style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#CBD5E1",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <Users size={16} /> Faculty Hub
          </Link>
          <Link href="/visualize" style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "var(--primary)",
            color: "#000",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 0 15px rgba(5, 223, 114, 0.4)",
          }}>
            <Code2 size={16} /> Sandbox Visualizer
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", marginBottom: 56 }}>
        <h1 style={{
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          background: "linear-gradient(to right, #FFF, #94A3B8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 16,
        }}>
          Kahoot! Meets LeetCode for Classrooms.
        </h1>
        <p style={{ fontSize: 18, color: "#94A3B8", maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
          Transform dry algorithm lectures into an adrenaline-pumping esports coding combat. Project real-time Big-O efficiency leaderboards on classroom screens while students duel in Monaco visualizer arenas.
        </p>
      </div>

      {/* 3 Arena Mode Cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 64 }}>
        {/* Card 1: Faculty Live Host Mode */}
        <div style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          borderRadius: 20,
          padding: 28,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "rgba(139, 92, 246, 0.15)", borderRadius: "50%", filter: "blur(30px)" }} />
          <div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(139, 92, 246, 0.2)",
              color: "#A78BFA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}>
              <Terminal size={24} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
              Faculty Classroom Host
            </h2>
            <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, marginBottom: 24 }}>
              Launch a live 5-minute coding battle on classroom projectors. Track real-time algorithmic time complexity ($O(1)$ vs $O(N^2)$) and generate post-battle NAAC engagement telemetry.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, fontSize: 13, color: "#CBD5E1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#A78BFA" /> 3 Preset Battles: Bug Hunt, Big-O Race & Trace</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#A78BFA" /> Cyberpunk projector leaderboard display</div>
            </div>
          </div>
          <Link href="/battleground/host" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            color: "#FFF",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 10px 20px rgba(139, 92, 246, 0.3)",
            transition: "all 0.2s ease",
          }}>
            Launch Classroom Projector <ChevronRight size={18} />
          </Link>
        </div>

        {/* Card 2: Student Combat Arena Mode */}
        <div style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
          border: "2px solid #F59E0B",
          borderRadius: 20,
          padding: 28,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(245, 158, 11, 0.15)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div style={{ position: "absolute", top: 16, right: 16, background: "#F59E0B", color: "#000", fontSize: 10, fontWeight: 900, padding: "3px 8px", borderRadius: 6, textTransform: "uppercase" }}>
            Most Popular
          </div>
          <div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(245, 158, 11, 0.2)",
              color: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}>
              <Play size={24} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
              Student Combat Arena
            </h2>
            <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, marginBottom: 20 }}>
              Enter your classroom battle PIN or join an open arena. Use Mario Kart-style power-ups like **AI Hint Beacon** and **Time Freeze** to outsmart rivals in split-screen Monaco.
            </p>

            {/* PIN Code Box */}
            <div style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 12, padding: 12, marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Enter Battle Room PIN
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. LPU-8821"
                  style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#FFF",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    fontFamily: "monospace",
                  }}
                />
              </div>
            </div>
          </div>
          <Link href={`/battleground/play?pin=${pinCode}`} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#000",
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 15,
            boxShadow: "0 10px 20px rgba(245, 158, 11, 0.3)",
            transition: "all 0.2s ease",
          }}>
            Enter Combat Arena <ChevronRight size={18} />
          </Link>
        </div>

        {/* Card 3: 1v1 Duels & Global ELO */}
        <div style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: 20,
          padding: 28,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(16, 185, 129, 0.2)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}>
              <Shield size={24} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
              1v1 Duels & ELO Ladder
            </h2>
            <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, marginBottom: 24 }}>
              Challenge peers across India to 3-minute algorithm duels. Climb from Bronze Gladiator to Grandmaster ELO and unlock verified institutional badges.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, fontSize: 13, color: "#CBD5E1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#10B981" /> Instant matchmaking & peer challenges</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#10B981" /> Verified ELO ratings for recruiters & NAAC</div>
            </div>
          </div>
          <Link href="/battleground/play?mode=duel" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#FFF",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)",
            transition: "all 0.2s ease",
          }}>
            Find 1v1 Duel <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {/* Live Leaderboard Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setLeaderboardMode("live")}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: leaderboardMode === "live" ? "#3B82F6" : "rgba(255, 255, 255, 0.05)",
                color: "#FFF",
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🔥 Live Arena Rankings
            </button>
            <button
              onClick={() => setLeaderboardMode("elo")}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: leaderboardMode === "elo" ? "#3B82F6" : "rgba(255, 255, 255, 0.05)",
                color: "#FFF",
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🏆 Global University ELO Ladder
            </button>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>
            Showing top 6 active algorithm gladiators from <strong style={{ color: "#FFF" }}>Lovely Professional University</strong>
          </div>
        </div>

        <BattlegroundLeaderboard players={MOCK_LEADERBOARD} mode={leaderboardMode} />
      </div>
    </div>
  );
}
