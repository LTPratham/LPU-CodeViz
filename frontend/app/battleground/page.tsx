"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Trophy, Flame, Zap, Shield, Play, Users, Award, ChevronRight, Sparkles, Terminal, Code2, Cpu, Sun, Moon } from "lucide-react";
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
  const { theme, setTheme } = useTheme();

  // Theme-aware values
  const isDark = theme === "dark";
  const bgPage = isDark
    ? "radial-gradient(circle at 50% 0%, #1E1B4B 0%, #0F172A 70%, #020617 100%)"
    : "radial-gradient(circle at 50% 0%, #EDE9FE 0%, #F8FAFC 70%, #FFFFFF 100%)";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const textBody = isDark ? "#CBD5E1" : "#475569";
  const cardBg = isDark
    ? "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))"
    : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))";
  const cardShadow = isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.08)";
  const navBtnBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const navBtnBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  const navBtnColor = isDark ? "#CBD5E1" : "#334155";
  const pinInputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const pinInputBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
  const pinInputColor = isDark ? "#FFF" : "#0F172A";
  const lbActiveBg = isDark ? "var(--primary)" : "var(--primary)";
  const lbInactiveBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const lbInactiveColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <div style={{
      minHeight: "100vh",
      background: bgPage,
      color: textPrimary,
      padding: "40px 24px",
      transition: "background 0.3s ease, color 0.3s ease",
    }}>
      {/* Top Navbar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none", color: textPrimary, fontSize: 20, fontWeight: 800,
          }}>
            <img
              src={isDark ? "/logo-dark.png" : "/logo-light.png"}
              alt="CodeCanvas Logo"
              style={{ height: 32, width: "auto", objectFit: "contain" }}
            />
            <span style={{ color: "#F59E0B", marginLeft: 8 }}>BATTLEGROUND</span>
          </Link>
          <span style={{
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#F59E0B",
            padding: "4px 10px", borderRadius: 99,
            fontSize: 11, fontWeight: 800, letterSpacing: "0.05em",
          }}>
            LIVE ESPORT ARENA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              background: navBtnBg, border: `1px solid ${navBtnBorder}`,
              color: navBtnColor, borderRadius: 8, padding: "8px 10px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 600,
            }}
            title="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/dashboard" style={{
            padding: "8px 16px", borderRadius: 8,
            background: navBtnBg, border: `1px solid ${navBtnBorder}`,
            color: navBtnColor, textDecoration: "none",
            fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Users size={16} /> Dashboard
          </Link>
          <Link href="/visualize" style={{
            padding: "8px 16px", borderRadius: 8,
            background: "var(--primary)", color: "#000",
            textDecoration: "none", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 0 15px rgba(245, 158, 11, 0.35)",
          }}>
            <Code2 size={16} /> Sandbox Visualizer
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", marginBottom: 56 }}>
        <h1 style={{
          fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1,
          color: textPrimary, marginBottom: 16,
        }}>
          Kahoot! Meets LeetCode for Classrooms.
        </h1>
        <p style={{ fontSize: 18, color: textMuted, maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
          Transform dry algorithm lectures into an adrenaline-pumping esports coding combat. Project real-time Big-O efficiency leaderboards on classroom screens while students duel in Monaco visualizer arenas.
        </p>
      </div>

      {/* 3 Arena Mode Cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 64 }}>
        {/* Card 1: Faculty Live Host Mode */}
        <div style={{
          background: cardBg,
          border: `1px solid ${isDark ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.3)"}`,
          borderRadius: 20, padding: 28, position: "relative", overflow: "hidden",
          boxShadow: cardShadow,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "rgba(139,92,246,0.12)", borderRadius: "50%", filter: "blur(30px)" }} />
          <div>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(139,92,246,0.15)", color: "#A78BFA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Terminal size={24} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>Faculty Classroom Host</h2>
            <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              Launch a live 5-minute coding battle on classroom projectors. Track real-time algorithmic time complexity and generate post-battle NAAC engagement telemetry.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, fontSize: 13, color: textBody }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#A78BFA" /> 3 Preset Battles: Bug Hunt, Big-O Race & Trace</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#A78BFA" /> Cyberpunk projector leaderboard display</div>
            </div>
          </div>
          <Link href="/battleground/host" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            color: "#FFF", textDecoration: "none", fontWeight: 800, fontSize: 15,
            boxShadow: "0 10px 20px rgba(139,92,246,0.3)", transition: "all 0.2s ease",
          }}>
            Launch Classroom Projector <ChevronRight size={18} />
          </Link>
        </div>

        {/* Card 2: Student Combat Arena Mode */}
        <div style={{
          background: cardBg,
          border: "2px solid #F59E0B",
          borderRadius: 20, padding: 28, position: "relative", overflow: "hidden",
          boxShadow: isDark ? "0 20px 40px rgba(245,158,11,0.15)" : "0 20px 40px rgba(245,158,11,0.1)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div style={{ position: "absolute", top: 16, right: 16, background: "#F59E0B", color: "#000", fontSize: 10, fontWeight: 900, padding: "3px 8px", borderRadius: 6, textTransform: "uppercase" }}>
            Most Popular
          </div>
          <div>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(245,158,11,0.15)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Play size={24} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>Student Combat Arena</h2>
            <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.6, marginBottom: 20 }}>
              Enter your classroom battle PIN or join an open arena. Use power-ups like AI Hint Beacon and Time Freeze to outsmart rivals in split-screen Monaco.
            </p>
            <div style={{ background: pinInputBg, border: `1px solid ${pinInputBorder}`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: textMuted, fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Enter Battle Room PIN
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="e.g. LPU-8821"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "transparent", border: `1px solid ${pinInputBorder}`,
                  borderRadius: 8, padding: "8px 12px",
                  color: pinInputColor, fontSize: 15, fontWeight: 700,
                  letterSpacing: "0.05em", fontFamily: "monospace", outline: "none",
                }}
              />
            </div>
          </div>
          <Link href={`/battleground/play?pin=${pinCode}`} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#000", textDecoration: "none", fontWeight: 900, fontSize: 15,
            boxShadow: "0 10px 20px rgba(245,158,11,0.3)", transition: "all 0.2s ease",
          }}>
            Enter Combat Arena <ChevronRight size={18} />
          </Link>
        </div>

        {/* Card 3: 1v1 Duels & ELO */}
        <div style={{
          background: cardBg,
          border: `1px solid ${isDark ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.3)"}`,
          borderRadius: 20, padding: 28, position: "relative", overflow: "hidden",
          boxShadow: cardShadow,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.15)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Shield size={24} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>1v1 Duels & ELO Ladder</h2>
            <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              Challenge peers across India to 3-minute algorithm duels. Climb from Bronze Gladiator to Grandmaster ELO and unlock verified institutional badges.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, fontSize: 13, color: textBody }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#10B981" /> Instant matchmaking & peer challenges</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} color="#10B981" /> Verified ELO ratings for recruiters & NAAC</div>
            </div>
          </div>
          <Link href="/battleground/play?mode=duel" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#FFF", textDecoration: "none", fontWeight: 800, fontSize: 15,
            boxShadow: "0 10px 20px rgba(16,185,129,0.3)", transition: "all 0.2s ease",
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
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                background: leaderboardMode === "live" ? "var(--primary)" : lbInactiveBg,
                color: leaderboardMode === "live" ? "#000" : lbInactiveColor,
                fontSize: 14, fontWeight: 700, transition: "all 0.15s ease",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Flame size={15} /> Live Arena Rankings
            </button>
            <button
              onClick={() => setLeaderboardMode("elo")}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                background: leaderboardMode === "elo" ? "var(--primary)" : lbInactiveBg,
                color: leaderboardMode === "elo" ? "#000" : lbInactiveColor,
                fontSize: 14, fontWeight: 700, transition: "all 0.15s ease",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Trophy size={15} /> Global University ELO Ladder
            </button>
          </div>
          <div style={{ fontSize: 13, color: textMuted }}>
            Top 6 active algorithm gladiators from <strong style={{ color: textPrimary }}>Lovely Professional University</strong>
          </div>
        </div>
        <BattlegroundLeaderboard players={MOCK_LEADERBOARD} mode={leaderboardMode} />
      </div>
    </div>
  );
}
