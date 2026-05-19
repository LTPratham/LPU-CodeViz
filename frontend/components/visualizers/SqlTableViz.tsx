"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { SqlTableState } from "@/lib/types";

interface Props {
  state: SqlTableState;
  speed?: number;
}

const ROW_STATUS_STYLES = {
  default:  { bg: "transparent",               border: "transparent",            color: "var(--text-secondary)" },
  inserted: { bg: "rgba(167,139,250,0.12)",     border: "rgba(167,139,250,0.4)",  color: "#C4B5FD" },
  selected: { bg: "rgba(29,158,117,0.15)",      border: "rgba(29,158,117,0.5)",   color: "var(--primary-light)" },
  filtered: { bg: "rgba(239,68,68,0.08)",       border: "transparent",            color: "#64748B" },
  joining:  { bg: "rgba(245,158,11,0.15)",      border: "rgba(245,158,11,0.5)",   color: "#F59E0B" },
};

function TableView({ state, label }: { state: Omit<SqlTableState, "type">; label?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {label && (
        <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          {label}
        </div>
      )}
      {/* Table name */}
      <div style={{
        background: "var(--primary)", color: "white", fontWeight: 700, fontSize: 13,
        padding: "8px 16px", borderRadius: "8px 8px 0 0", fontFamily: "var(--font-mono)"
      }}>
        {state.tableName}
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${state.columns.length}, 1fr)`,
          background: "#1a2744",
          borderBottom: "1px solid var(--border)",
        }}>
          {state.columns.map((col) => (
            <div key={col} style={{
              padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)"
            }}>
              {col}
            </div>
          ))}
        </div>

        {/* Data rows */}
        <AnimatePresence>
          {state.rows.map((row, ri) => {
            const s = ROW_STATUS_STYLES[row.status] || ROW_STATUS_STYLES.default;
            const isFiltered = row.status === "filtered";
            return (
              <motion.div
                key={ri}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isFiltered ? 0.25 : 1,
                  x: 0,
                  background: s.bg,
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${state.columns.length}, 1fr)`,
                  borderBottom: ri < state.rows.length - 1 ? "1px solid var(--border)" : "none",
                  borderLeft: `3px solid ${s.border}`,
                }}
              >
                {row.values.map((val, vi) => (
                  <div key={vi} style={{
                    padding: "8px 14px", fontSize: 13, color: s.color,
                    fontFamily: "var(--font-mono)", fontWeight: row.status !== "default" ? 600 : 400
                  }}>
                    {val === null ? <span style={{ color: "#475569", fontStyle: "italic" }}>NULL</span> : String(val)}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {state.rows.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No rows yet
          </div>
        )}
      </div>

      {/* Row count */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "right" }}>
        {state.rows.filter((r) => r.status !== "filtered").length} row(s)
      </div>
    </div>
  );
}

export default function SqlTableViz({ state, speed = 1 }: Props) {
  return (
    <div style={{ width: "100%", padding: "24px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 20, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        SQL Table Visualization
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <TableView state={state} label={state.secondTable ? "Left Table" : undefined} />
        {state.secondTable && (
          <>
            {/* JOIN connector */}
            <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "var(--primary)", fontWeight: 800, flexShrink: 0 }}>
              ⟷
            </div>
            <TableView state={state.secondTable} label="Right Table" />
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
        {[
          { label: "Inserted", color: "#C4B5FD" },
          { label: "Selected", color: "#24C28F" },
          { label: "Filtered Out", color: "#475569" },
          { label: "Joining", color: "#F59E0B" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

