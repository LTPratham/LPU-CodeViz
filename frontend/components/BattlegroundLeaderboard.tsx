"use client";

import React from "react";
import { Trophy, Flame, Zap, Award, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

export interface BattlePlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  timeSeconds: number;
  complexity: "O(1)" | "O(log N)" | "O(N)" | "O(N log N)" | "O(N²)";
  status: "solved" | "compiling" | "bugged" | "idle";
  streak: number;
  elo: number;
}

interface BattlegroundLeaderboardProps {
  players: BattlePlayer[];
  currentUserId?: string;
  mode?: "live" | "elo";
}

export default function BattlegroundLeaderboard({
  players,
  currentUserId = "user-1",
  mode = "live",
}: BattlegroundLeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds);

  const getComplexityColor = (comp: string) => {
    switch (comp) {
      case "O(1)":
      case "O(log N)":
        return { bg: "rgba(16, 185, 129, 0.2)", color: "#10B981", border: "#10B981" };
      case "O(N)":
      case "O(N log N)":
        return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", border: "#3B82F6" };
      default:
        return { bg: "rgba(244, 63, 94, 0.2)", color: "#F43F5E", border: "#F43F5E" };
    }
  };

  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.8)",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
          }}>
            <Trophy size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>
              {mode === "live" ? "Live Arena Leaderboard" : "Global ELO Rankings"}
            </h3>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
              {mode === "live" ? "Real-time algorithmic speed & Big-O execution tracking" : "Top university algorithm gladiators"}
            </p>
          </div>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          padding: "6px 12px",
          borderRadius: 99,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981", letterSpacing: "0.05em" }}>LIVE SYNC</span>
        </div>
      </div>

      {/* Column Headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "40px 2fr 1fr 1fr 1fr 1fr",
        padding: "0 16px 12px 16px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#64748B",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        <div>Rank</div>
        <div>Gladiator</div>
        <div>Status</div>
        <div>Big-O Efficiency</div>
        <div>Time / ELO</div>
        <div style={{ textAlign: "right" }}>Score</div>
      </div>

      {/* Player List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {sortedPlayers.map((player, index) => {
          const isCurrentUser = player.id === currentUserId;
          const rank = index + 1;
          const compStyle = getComplexityColor(player.complexity);

          return (
            <div
              key={player.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 2fr 1fr 1fr 1fr 1fr",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: 12,
                background: isCurrentUser
                  ? "linear-gradient(90deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.15))"
                  : rank === 1
                  ? "linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0))"
                  : "rgba(255, 255, 255, 0.02)",
                border: isCurrentUser
                  ? "1px solid rgba(59, 130, 246, 0.6)"
                  : rank === 1
                  ? "1px solid rgba(245, 158, 11, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.05)",
                transition: "all 0.2s ease",
              }}
            >
              {/* Rank */}
              <div style={{ fontWeight: 800, fontSize: 15, color: rank === 1 ? "#F59E0B" : rank === 2 ? "#94A3B8" : rank === 3 ? "#D97706" : "#64748B" }}>
                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
              </div>

              {/* Gladiator Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#FFF",
                  border: isCurrentUser ? "2px solid #3B82F6" : "1px solid rgba(255, 255, 255, 0.2)",
                }}>
                  {player.avatar || player.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{player.name}</span>
                    {isCurrentUser && (
                      <span style={{ fontSize: 10, background: "#3B82F6", color: "#FFF", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>YOU</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: "#94A3B8", display: "flex", alignItems: "center", gap: 3 }}>
                      <Flame size={12} color="#F59E0B" /> {player.streak}x Streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                {player.status === "solved" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(16, 185, 129, 0.15)", color: "#10B981", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    <CheckCircle2 size={12} /> Solved
                  </span>
                )}
                {player.status === "compiling" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    <Zap size={12} /> Tracing...
                  </span>
                )}
                {player.status === "bugged" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(244, 63, 94, 0.15)", color: "#F43F5E", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    <XCircle size={12} /> Bugged
                  </span>
                )}
                {player.status === "idle" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(148, 163, 184, 0.15)", color: "#94A3B8", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    <Clock size={12} /> Thinking
                  </span>
                )}
              </div>

              {/* Big-O Efficiency */}
              <div>
                <span style={{
                  background: compStyle.bg,
                  color: compStyle.color,
                  border: `1px solid ${compStyle.border}`,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: "monospace",
                }}>
                  {player.complexity}
                </span>
              </div>

              {/* Time / ELO */}
              <div style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                {mode === "live" ? (
                  <>
                    <Clock size={14} color="#64748B" />
                    {Math.floor(player.timeSeconds / 60)}:{((player.timeSeconds % 60) + "").padStart(2, "0")}s
                  </>
                ) : (
                  <>
                    <TrendingUp size={14} color="#3B82F6" />
                    {player.elo} ELO
                  </>
                )}
              </div>

              {/* Score */}
              <div style={{ textAlign: "right", fontSize: 16, fontWeight: 800, color: "#F8FAFC" }}>
                {player.score.toLocaleString()}
                <span style={{ fontSize: 11, color: "#64748B", marginLeft: 2 }}>pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
