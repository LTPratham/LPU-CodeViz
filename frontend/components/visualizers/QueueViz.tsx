"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { QueueState } from "@/lib/types";

interface Props {
  state: QueueState;
  speed?: number;
}

const STATUS_STYLES = {
  default:   { bg: "#1E293B", border: "#374151", color: "#94A3B8" },
  active:    { bg: "rgba(245,158,11,0.2)", border: "#F59E0B", color: "#F59E0B" },
  enqueuing: { bg: "rgba(34,197,94,0.15)", border: "#22C55E", color: "#22C55E" },
  dequeuing: { bg: "rgba(239,68,68,0.15)", border: "#EF4444", color: "#EF4444" },
};

export default function QueueViz({ state, speed = 1 }: Props) {
  const duration = 0.4 / speed;

  return (
    <div style={{ width: "100%", padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 24, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Queue — FIFO
      </div>

      {/* Direction labels */}
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 500, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 700 }}>← DEQUEUE (Front)</span>
        <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 700 }}>ENQUEUE (Rear) →</span>
      </div>

      {/* Queue row */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 64, maxWidth: "100%", overflowX: "auto", padding: "8px 4px" }}>
        {/* Front arrow */}
        <div style={{
          width: 32, height: 52, borderRadius: "10px 0 0 10px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#EF4444", fontSize: 16, flexShrink: 0
        }}>
          ←
        </div>

        {/* Empty state */}
        {state.elements.length === 0 && (
          <div style={{
            width: 200, height: 52, border: "2px dashed var(--border)", borderRadius: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)", fontSize: 13
          }}>
            Empty Queue
          </div>
        )}

        {/* Queue elements */}
        <AnimatePresence mode="popLayout">
          {state.elements.map((el, i) => {
            const style = STATUS_STYLES[el.status] || STATUS_STYLES.default;
            return (
              <motion.div
                key={`queue-${i}-${el.value}`}
                layout
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration, ease: "easeInOut" }}
                style={{
                  minWidth: 60,
                  height: 52,
                  border: `2px solid ${style.border}`,
                  borderLeft: i === 0 ? `2px solid ${style.border}` : "none",
                  background: style.bg,
                  color: style.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "var(--font-mono)",
                  padding: "0 16px",
                  flexShrink: 0,
                  boxShadow: el.status !== "default" ? `0 0 12px ${style.border}40` : "none",
                }}
              >
                {el.value}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Rear arrow */}
        <div style={{
          width: 32, height: 52, borderRadius: "0 10px 10px 0",
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#22C55E", fontSize: 16, flexShrink: 0
        }}>
          →
        </div>
      </div>

      {/* Front/Rear labels */}
      {state.elements.length > 0 && (
        <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#EF4444" }}>{state.front}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Front</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22C55E" }}>{state.rear}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Rear</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{state.elements.length}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Size</div>
          </div>
        </div>
      )}
    </div>
  );
}
