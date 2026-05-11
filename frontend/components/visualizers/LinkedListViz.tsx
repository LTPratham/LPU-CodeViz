"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { LinkedListState, LinkedListNode } from "@/lib/types";

interface Props {
  state: LinkedListState;
  speed?: number;
}

const STATUS_STYLES = {
  default:   { bg: "#1E293B", border: "#374151", color: "#94A3B8" },
  active:    { bg: "rgba(245,158,11,0.2)", border: "#F59E0B", color: "#F59E0B" },
  inserting: { bg: "rgba(34,197,94,0.15)", border: "#22C55E", color: "#22C55E" },
  deleting:  { bg: "rgba(239,68,68,0.15)", border: "#EF4444", color: "#EF4444" },
  null:      { bg: "transparent", border: "#374151", color: "#475569" },
};

export default function LinkedListViz({ state, speed = 1 }: Props) {
  const duration = 0.4 / speed;
  const nodes = state.nodes;

  return (
    <div style={{ width: "100%", padding: "32px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 28, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Singly Linked List
      </div>

      {/* Scrollable node row */}
      <div style={{ overflowX: "auto", padding: "16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "fit-content", margin: "0 auto" }}>
          <AnimatePresence mode="popLayout">
            {nodes.map((node, i) => {
              const style = STATUS_STYLES[node.status] || STATUS_STYLES.default;
              const isLast = i === nodes.length - 1;
              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: -30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 30 }}
                  transition={{ duration, ease: "easeInOut" }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {/* Node box */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        border: `2px solid ${style.border}`,
                        borderRadius: 10,
                        overflow: "hidden",
                        boxShadow: node.status !== "default" ? `0 0 16px ${style.border}50` : "none",
                      }}
                    >
                      {/* Data cell */}
                      <div
                        style={{
                          width: 56,
                          height: 52,
                          background: style.bg,
                          color: style.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 16,
                          fontFamily: "var(--font-mono)",
                          borderRight: `1px solid ${style.border}`,
                        }}
                      >
                        {node.value}
                      </div>
                      {/* Next pointer cell */}
                      <div
                        style={{
                          width: 40,
                          height: 52,
                          background: style.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          color: isLast ? "#EF4444" : style.color,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                        }}
                      >
                        {isLast ? "∅" : "→"}
                      </div>
                    </div>
                    {/* Node ID */}
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {node.id}
                    </span>
                  </div>

                  {/* Arrow between nodes */}
                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0 8px",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="40" height="20" viewBox="0 0 40 20">
                        <defs>
                          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#1D9E75" />
                          </marker>
                        </defs>
                        <line
                          x1="0" y1="10" x2="34" y2="10"
                          stroke="#1D9E75"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      </svg>
                    </motion.div>
                  )}

                  {/* NULL at the end */}
                  {isLast && (
                    <div
                      style={{
                        marginLeft: 12,
                        padding: "6px 12px",
                        border: "1px dashed #475569",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#EF4444",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                      }}
                    >
                      NULL
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div style={{
              padding: "20px 40px", border: "2px dashed var(--border)", borderRadius: 12,
              color: "var(--text-muted)", fontSize: 14, margin: "0 auto"
            }}>
              Empty List — HEAD → NULL
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>{nodes.length}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Nodes</div>
        </div>
      </div>
    </div>
  );
}
