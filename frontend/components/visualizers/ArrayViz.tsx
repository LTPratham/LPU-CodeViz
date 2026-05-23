"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { ArrayState } from "@/lib/types";

interface Props {
  state: ArrayState;
  speed?: number;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; scale?: number }> = {
  default:    { bg: "#1E293B",               border: "#374151",              color: "#94A3B8" },
  active:     { bg: "rgba(245,158,11,0.18)",  border: "rgba(245,158,11,0.6)", color: "#F59E0B", scale: 1.1 },
  comparing:  { bg: "rgba(59,130,246,0.18)",  border: "rgba(59,130,246,0.6)", color: "#60A5FA", scale: 1.08 },
  sorted:     { bg: "rgba(34,197,94,0.15)",   border: "rgba(34,197,94,0.5)",  color: "#22C55E" },
  pivot:      { bg: "rgba(239,68,68,0.18)",   border: "rgba(239,68,68,0.6)",  color: "#EF4444", scale: 1.08 },
  swapping:   { bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.6)",color: "#C4B5FD", scale: 1.1 },
};

export default function ArrayViz({ state, speed = 1 }: Props) {
  const duration = 0.4 / speed;

  if (!state || !Array.isArray(state.elements)) {
    return (
      <div style={{ width: "100%", padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Array Visualization: No valid array data available.
      </div>
    );
  }

  const elements = state.elements.filter(e => e && e.index !== undefined && e.value !== undefined);

  return (
    <div style={{ width: "100%", padding: "32px 16px" }}>
      {/* Label */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 24,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Array Visualization
      </div>

      {/* Array boxes */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 8,
          flexWrap: "wrap",
          padding: "0 16px",
        }}
      >
        <AnimatePresence mode="popLayout">
          {elements.map((el) => {
            const style = STATUS_STYLES[el.status] || STATUS_STYLES.default;
            return (
              <motion.div
                key={`${el.index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: style.scale ?? 1,
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration, ease: "easeInOut" }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {/* Value box */}
                <motion.div
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.8}
                  whileDrag={{
                    scale: 1.15,
                    boxShadow: `0 8px 30px ${style.border}`,
                    zIndex: 10,
                  }}
                  whileTap={{ cursor: "grabbing" }}
                  animate={{
                    background: style.bg,
                    borderColor: style.border,
                    color: style.color,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    border: `2px solid ${style.border}`,
                    background: style.bg,
                    color: style.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 18,
                    fontFamily: "var(--font-mono)",
                    boxShadow:
                      el.status !== "default"
                        ? `0 4px 20px ${style.border}`
                        : "none",
                    transition: "box-shadow 0.2s",
                    cursor: "grab",
                  }}
                >
                  {el.value}
                </motion.div>

                {/* Index label */}
                <span
                  style={{
                    fontSize: 11,
                    color:
                      el.status !== "default"
                        ? style.color
                        : "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    transition: "color 0.2s",
                  }}
                >
                  [{el.index}]
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 32,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Default", color: "#64748B" },
          { label: "Comparing", color: "#60A5FA" },
          { label: "Active / Pivot", color: "#F59E0B" },
          { label: "Sorted", color: "#22C55E" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: l.color,
              }}
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

