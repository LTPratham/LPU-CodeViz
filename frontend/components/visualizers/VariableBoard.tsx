"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { VariableState } from "@/lib/types";

interface Props {
  state: VariableState;
  speed?: number;
}

const STATUS_STYLES = {
  default: { bg: "#1E293B", border: "#374151", color: "#94A3B8", labelColor: "#64748B" },
  active:  { bg: "rgba(245,158,11,0.18)", border: "#F59E0B", color: "#F59E0B", labelColor: "#94A3B8" },
  updated: { bg: "rgba(29,158,117,0.18)", border: "#1D9E75", color: "#24C28F", labelColor: "#94A3B8" },
};

export default function VariableBoard({ state, speed = 1 }: Props) {
  if (!state || !Array.isArray(state.variables)) {
    return (
      <div style={{ width: "100%", padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Memory Board: No valid variable data available.
      </div>
    );
  }

  const duration = 0.35 / speed;
  const variables = state.variables.filter(v => v && v.name !== undefined);

  return (
    <div style={{ width: "100%", padding: "24px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 24, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Memory Board — Variable Snapshot
      </div>

      {/* Variable grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: 12,
        maxWidth: 600,
        margin: "0 auto",
      }}>
        <AnimatePresence>
          {variables.map((v) => {
            const style = STATUS_STYLES[v.status] || STATUS_STYLES.default;
            return (
              <motion.div
                key={v.name}
                layout
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                whileDrag={{
                  scale: 1.06,
                  boxShadow: `0 8px 24px ${style.border}`,
                  zIndex: 10,
                }}
                whileTap={{ cursor: "grabbing" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration }}
                style={{
                  background: style.bg,
                  border: `2px solid ${style.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  boxShadow: v.status !== "default" ? `0 0 14px ${style.border}40` : "none",
                  cursor: "grab",
                }}
              >
                {/* Type tag */}
                <div style={{ fontSize: 10, color: "var(--primary)", fontFamily: "var(--font-mono)", marginBottom: 4, fontWeight: 600 }}>
                  {v.type}
                </div>
                {/* Variable name */}
                <div style={{ fontSize: 12, color: style.labelColor, fontFamily: "var(--font-mono)", marginBottom: 6, fontWeight: 600 }}>
                  {v.name}
                </div>
                {/* Value */}
                <motion.div
                  key={String(v.value)}
                  initial={{ scale: 1.3, color: "#fff" }}
                  animate={{ scale: 1, color: style.color }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.2,
                    wordBreak: "break-all",
                  }}
                >
                  {v.value === null ? "null" : String(v.value)}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}

