"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { ArrayState } from "@/lib/types";
import { useState, useEffect } from "react";

interface Props {
  state: ArrayState;
  speed?: number;
  comparisons?: number;
  swaps?: number;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; glow?: string }> = {
  default:    { bg: "#1E293B",               border: "#374151",              color: "#94A3B8" },
  active:     { bg: "rgba(245,158,11,0.2)",   border: "#F59E0B",              color: "#F59E0B", glow: "#F59E0B" },
  comparing:  { bg: "rgba(59,130,246,0.2)",   border: "#3B82F6",              color: "#60A5FA", glow: "#3B82F6" },
  sorted:     { bg: "rgba(34,197,94,0.18)",   border: "#22C55E",              color: "#22C55E" },
  pivot:      { bg: "rgba(239,68,68,0.2)",    border: "#EF4444",              color: "#EF4444", glow: "#EF4444" },
  swapping:   { bg: "rgba(167,139,250,0.2)",  border: "#A78BFA",              color: "#C4B5FD", glow: "#A78BFA" },
};

export default function SortingViz({ state, speed = 1, comparisons = 0, swaps = 0 }: Props) {
  if (!state || !Array.isArray(state.elements)) {
    return (
      <div style={{ width: "100%", padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Sorting Visualization: No valid sorting data available.
      </div>
    );
  }

  const duration = 0.4 / speed;
  const maxVal = Math.max(...state.elements.map((e) => Number(e.value) || 1), 1);

  return (
    <div style={{ width: "100%", padding: "24px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 16, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Sorting Visualization
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#3B82F6" }}>{comparisons}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Comparisons</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>{swaps}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Swaps</div>
        </div>
      </div>

      {/* Bar chart view */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 6,
        height: 160,
        padding: "0 12px",
        marginBottom: 16,
      }}>
        <AnimatePresence mode="popLayout">
          {state.elements.map((el) => {
            const s = STATUS_STYLES[el.status] || STATUS_STYLES.default;
            const heightPct = (Number(el.value) / maxVal) * 100;
            return (
              <motion.div
                key={el.index}
                layout
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration, ease: "easeInOut" }}
                style={{
                  flex: 1,
                  maxWidth: 60,
                  minWidth: 24,
                  height: `${heightPct}%`,
                  minHeight: 28,
                  background: `linear-gradient(to top, ${s.border}, ${s.bg})`,
                  border: `1px solid ${s.border}`,
                  borderRadius: "6px 6px 0 0",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 4,
                  transformOrigin: "bottom",
                  boxShadow: s.glow ? `0 0 12px ${s.glow}50` : "none",
                  position: "relative",
                }}
              >
                {/* Value label on top of bar */}
                <span style={{
                  position: "absolute",
                  top: -22,
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "var(--font-mono)",
                }}>
                  {el.value}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Box row view below bars */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 8,
      }}>
        {state.elements.map((el) => {
          const s = STATUS_STYLES[el.status] || STATUS_STYLES.default;
          return (
            <motion.div
              key={el.index}
              layout
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.8}
              whileDrag={{
                scale: 1.15,
                boxShadow: `0 8px 24px ${s.border}`,
                zIndex: 10,
              }}
              whileTap={{ cursor: "grabbing" }}
              animate={{
                background: s.bg,
                borderColor: s.border,
                color: s.color,
              }}
              transition={{ duration: 0.2 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                border: `2px solid ${s.border}`,
                background: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                cursor: "grab",
              }}
            >
              {el.value}
            </motion.div>
          );
        })}
      </div>

      {/* Index labels */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
        {state.elements.map((el) => (
          <div key={el.index} style={{
            width: 40, textAlign: "center", fontSize: 10,
            color: "var(--text-muted)", fontFamily: "var(--font-mono)"
          }}>
            [{el.index}]
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
        {[
          { label: "Unsorted", color: "#64748B" },
          { label: "Comparing", color: "#3B82F6" },
          { label: "Swapping", color: "#A78BFA" },
          { label: "Pivot", color: "#EF4444" },
          { label: "Sorted ✓", color: "#22C55E" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

