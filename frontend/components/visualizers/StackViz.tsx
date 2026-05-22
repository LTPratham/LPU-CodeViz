"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { StackState } from "@/lib/types";

interface Props {
  state: StackState;
  speed?: number;
}

const STATUS_STYLES = {
  default:   { bg: "#1E293B", border: "#374151", color: "#94A3B8" },
  active:    { bg: "rgba(245,158,11,0.2)", border: "#F59E0B", color: "#F59E0B" },
  returning: { bg: "rgba(34,197,94,0.15)", border: "#22C55E", color: "#22C55E" },
};

export default function StackViz({ state, speed = 1 }: Props) {
  const duration = 0.4 / speed;
  const elements = [...state.elements].reverse(); // top first for display

  return (
    <div style={{ width: "100%", padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 16, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Stack — LIFO
      </div>

      {/* Stack tower */}
      <div style={{ position: "relative", width: 200 }}>
        {/* TOP label */}
        {state.elements.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>TOP ↓</span>
          </div>
        )}

        {/* Empty state */}
        {state.elements.length === 0 && (
          <div style={{
            width: 200, height: 60, border: "2px dashed var(--border)", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)", fontSize: 13
          }}>
            Empty Stack
          </div>
        )}

        {/* Stack elements */}
        <AnimatePresence mode="popLayout">
          {elements.map((el, i) => {
            const style = STATUS_STYLES[el.status] || STATUS_STYLES.default;
            return (
              <motion.div
                key={`stack-el-${state.elements.length - 1 - i}-${el.value}`}
                layout
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                whileDrag={{
                  scale: 1.05,
                  boxShadow: `0 8px 24px ${style.border}`,
                  zIndex: 10,
                }}
                whileTap={{ cursor: "grabbing" }}
                initial={{ opacity: 0, x: -40, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.8 }}
                transition={{ duration, ease: "easeInOut" }}
                style={{
                  width: 200,
                  height: 52,
                  borderRadius: i === 0 ? "10px 10px 0 0" : i === elements.length - 1 ? "0 0 10px 10px" : 0,
                  border: `2px solid ${style.border}`,
                  borderBottomWidth: i === elements.length - 1 ? 2 : 0,
                  background: style.bg,
                  color: style.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px",
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "var(--font-mono)",
                  boxShadow: el.status !== "default" ? `0 0 16px ${style.border}40` : "none",
                  marginBottom: 1,
                  cursor: "grab",
                }}
              >
                <span>{el.value}</span>
                {i === 0 && (
                  <span style={{ fontSize: 10, color: style.color, fontWeight: 600 }}>← TOP</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Bottom base */}
        <div style={{
          width: 200, height: 6, background: "var(--border)", borderRadius: "0 0 4px 4px",
          marginTop: state.elements.length > 0 ? 0 : 8
        }} />
      </div>

      {/* Counter */}
      <div style={{ marginTop: 24, display: "flex", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>{state.elements.length}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Size</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{state.top}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Top Index</div>
        </div>
      </div>
    </div>
  );
}

