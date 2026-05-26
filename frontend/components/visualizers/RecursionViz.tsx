"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { RecursionState } from "@/lib/types";

interface Props {
  state: RecursionState;
  speed?: number;
  stepDescription?: string;
  stepCode?: string;
}

const STATUS_STYLES = {
  active:    { bg: "rgba(245,158,11,0.18)", border: "#F59E0B", color: "#F59E0B", label: "ACTIVE",    glow: "0 0 18px rgba(245,158,11,0.4)" },
  returning: { bg: "rgba(34,197,94,0.15)",  border: "#22C55E", color: "#22C55E", label: "RETURNING", glow: "0 0 18px rgba(34,197,94,0.4)" },
  completed: { bg: "rgba(100,116,139,0.12)", border: "#475569", color: "#64748B", label: "DONE",     glow: "none" },
};

export default function RecursionViz({ state, speed = 1, stepDescription = "", stepCode = "" }: Props) {
  if (!state || !Array.isArray(state.frames)) {
    return (
      <div style={{ width: "100%", padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Recursion Visualization: No valid recursion data available.
      </div>
    );
  }

  const duration = 0.4 / speed;
  // Show frames in stack order: bottom (earliest call) at bottom, top (most recent) at top
  const frames = [...state.frames].filter(f => f && f.id !== undefined);
  const framesReversed = [...frames].reverse(); // Top of stack shown first

  // Determine which frame is the currently active one
  const activeFrame = frames.find(f => f.status === "active") || frames[frames.length - 1];
  const returningFrame = frames.find(f => f.status === "returning");

  return (
    <div style={{ width: "100%", maxWidth: 580, padding: "20px 16px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          📞 Call Stack
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F59E0B" }}>{state.depth}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Depth</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>{frames.length}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Frames</div>
          </div>
        </div>
      </div>

      {/* ── Current Step Banner ── */}
      {(stepDescription || stepCode) && (
        <motion.div
          key={stepDescription}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: "rgba(167,139,250,0.10)",
            border: "1.5px solid rgba(167,139,250,0.3)",
            borderLeft: "4px solid #A78BFA",
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          {stepCode && (
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
              color: "#C4B5FD", marginBottom: 4,
            }}>
              <span style={{ color: "#A78BFA", marginRight: 6 }}>▶</span>{stepCode}
            </div>
          )}
          {stepDescription && (
            <div style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.5 }}>{stepDescription}</div>
          )}
        </motion.div>
      )}

      {/* ── Recursion depth indicator bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {Array.from({ length: Math.max(state.depth, 1) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            style={{
              height: 6,
              flex: 1,
              borderRadius: 3,
              background: i < frames.length
                ? frames[i]?.status === "returning" ? "#22C55E"
                : frames[i]?.status === "active" ? "#F59E0B"
                : "#475569"
                : "var(--border)",
              transition: "background 0.3s",
            }}
          />
        ))}
        <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 4, minWidth: 40 }}>
          depth {state.depth}
        </span>
      </div>

      {/* ── Stack Frames ── */}
      <div style={{ position: "relative" }}>
        {/* TOP label */}
        {frames.length > 0 && (
          <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700, fontFamily: "var(--font-mono)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
            ↑ TOP of stack (most recent call)
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {framesReversed.map((frame, i) => {
            const style = STATUS_STYLES[frame.status] || STATUS_STYLES.active;
            const isTop = i === 0;
            const depth = frames.length - i; // frame depth number (1 = base call)

            return (
              <motion.div
                key={frame.id}
                layout
                initial={{ opacity: 0, x: -40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: isTop ? 1 : 0.995 }}
                exit={{ opacity: 0, x: 40, scale: 0.85 }}
                transition={{ duration, ease: "easeInOut" }}
                style={{
                  background: style.bg,
                  border: `2px solid ${style.border}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 3,
                  position: "relative",
                  boxShadow: isTop ? style.glow : "none",
                  transition: "box-shadow 0.3s",
                }}
              >
                {/* Depth number on left edge */}
                <div style={{
                  position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)",
                  fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                  textAlign: "center", lineHeight: 1.2,
                }}>
                  <div style={{ color: style.color, fontWeight: 800 }}>#{depth}</div>
                </div>

                {/* Row 1: function signature + status badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: style.color }}>
                    {frame.funcName}(
                    {Object.entries(frame.args).map(([k, v]) => `${k}=${v}`).join(", ")}
                    )
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: "2px 8px",
                    borderRadius: 4, background: style.border + "25", color: style.color,
                    letterSpacing: "0.1em",
                  }}>
                    {style.label}
                  </span>
                </div>

                {/* Row 2: args as memory blocks */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(frame.args).map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "5px 10px",
                      border: `1px solid ${style.border}30`,
                      minWidth: 44,
                    }}>
                      <span style={{ fontSize: 9, color: "#64748B", fontFamily: "var(--font-mono)", marginBottom: 2 }}>{k}</span>
                      <span style={{ fontSize: 17, fontWeight: 800, color: style.color, fontFamily: "var(--font-mono)" }}>{String(v)}</span>
                    </div>
                  ))}

                  {/* Return value block */}
                  {frame.returnValue !== undefined && (
                    <div style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      background: "rgba(34,197,94,0.08)", borderRadius: 8, padding: "5px 10px",
                      border: "1px solid rgba(34,197,94,0.3)",
                      minWidth: 44,
                    }}>
                      <span style={{ fontSize: 9, color: "#22C55E", fontFamily: "var(--font-mono)", marginBottom: 2 }}>returns</span>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "#22C55E", fontFamily: "var(--font-mono)" }}>
                        {String(frame.returnValue)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow connector to frame below */}
                {i < framesReversed.length - 1 && (
                  <div style={{
                    position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
                    fontSize: 12, color: "var(--border)", lineHeight: 1, zIndex: 1,
                  }}>
                    ↓
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {frames.length === 0 && (
          <div style={{
            border: "2px dashed var(--border)", borderRadius: 12, padding: 24,
            textAlign: "center", color: "var(--text-muted)", fontSize: 13
          }}>
            No active function calls
          </div>
        )}

        {/* Bottom of stack label */}
        {frames.length > 0 && (
          <>
            <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: "0 0 6px 6px", marginTop: 2 }} />
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
              ↓ BOTTOM (base / first call)
            </div>
          </>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 4 }}>
        {Object.entries(STATUS_STYLES).map(([key, s]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.border }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
