"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { RecursionState } from "@/lib/types";

interface Props {
  state: RecursionState;
  speed?: number;
}

const STATUS_STYLES = {
  active:    { bg: "rgba(245,158,11,0.18)", border: "#F59E0B", color: "#F59E0B", label: "ACTIVE" },
  returning: { bg: "rgba(34,197,94,0.15)",  border: "#22C55E", color: "#22C55E", label: "RETURNING" },
  completed: { bg: "rgba(100,116,139,0.15)", border: "#475569", color: "#64748B", label: "DONE" },
};

export default function RecursionViz({ state, speed = 1 }: Props) {
  if (!state || !Array.isArray(state.frames)) {
    return (
      <div style={{ width: "100%", padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Recursion Visualization: No valid recursion data available.
      </div>
    );
  }

  const duration = 0.4 / speed;
  const frames = [...state.frames].reverse(); // Top of stack first

  return (
    <div style={{ width: "100%", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 16, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Call Stack — Depth: {state.depth}
      </div>

      {/* Stack depth indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {Array.from({ length: Math.max(state.depth, 1) }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i < state.depth ? "var(--primary)" : "var(--border)",
              transition: "background 0.2s",
            }}
          />
        ))}
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>Recursion depth</span>
      </div>

      {/* Call stack frames */}
      <div style={{ width: "100%", maxWidth: 420 }}>
        {frames.length === 0 && (
          <div style={{
            border: "2px dashed var(--border)", borderRadius: 12, padding: 24,
            textAlign: "center", color: "var(--text-muted)", fontSize: 13
          }}>
            No active function calls
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {frames.map((frame, i) => {
            const style = STATUS_STYLES[frame.status] || STATUS_STYLES.active;
            const isTop = i === 0;
            return (
              <motion.div
                key={frame.id}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: isTop ? 1 : 0.98 - i * 0.01 }}
                exit={{ opacity: 0, y: -30, scale: 0.8 }}
                transition={{ duration, ease: "easeInOut" }}
                style={{
                  background: style.bg,
                  border: `2px solid ${style.border}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 4,
                  position: "relative",
                  boxShadow: isTop ? `0 0 20px ${style.border}40` : "none",
                }}
              >
                {/* Frame label */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 15, color: style.color }}>
                    {frame.funcName}(
                    {Object.entries(frame.args).map(([k, v]) => `${k}=${v}`).join(", ")}
                    )
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px",
                    borderRadius: 4, background: style.border + "30", color: style.color
                  }}>
                    {style.label}
                  </span>
                </div>

                {/* Args */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {Object.entries(frame.args).map(([k, v]) => (
                    <div key={k} style={{
                      background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "3px 10px",
                      fontFamily: "var(--font-mono)", fontSize: 12
                    }}>
                      <span style={{ color: "#94A3B8" }}>{k} = </span>
                      <span style={{ color: style.color, fontWeight: 700 }}>{String(v)}</span>
                    </div>
                  ))}
                </div>

                {/* Return value if returning */}
                {frame.returnValue !== undefined && (
                  <div style={{
                    marginTop: 8, padding: "4px 12px", background: "rgba(34,197,94,0.1)",
                    borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12
                  }}>
                    <span style={{ color: "#94A3B8" }}>returns → </span>
                    <span style={{ color: "#22C55E", fontWeight: 700 }}>{String(frame.returnValue)}</span>
                  </div>
                )}

                {/* Depth indicator */}
                <div style={{
                  position: "absolute", left: -24, top: "50%", transform: "translateY(-50%)",
                  fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)"
                }}>
                  #{state.frames.length - i}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Base of stack */}
        {frames.length > 0 && (
          <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: "0 0 4px 4px" }} />
        )}
      </div>
    </div>
  );
}

