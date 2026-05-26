"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { VariableState } from "@/lib/types";
import { useRef, useEffect } from "react";

interface Props {
  state: VariableState;
  speed?: number;
  stepAction?: string;
  stepDescription?: string;
  stepCode?: string;
  stepNum?: number;
}

// ── Action palette: every action type gets a color + icon + label ──
const ACTION_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  assign:       { color: "#22C55E",  bg: "rgba(34,197,94,0.12)",    border: "rgba(34,197,94,0.4)",   icon: "←",  label: "ASSIGN" },
  compare:      { color: "#3B82F6",  bg: "rgba(59,130,246,0.12)",   border: "rgba(59,130,246,0.4)",  icon: "⚖",  label: "COMPARE" },
  highlight:    { color: "#F59E0B",  bg: "rgba(245,158,11,0.12)",   border: "rgba(245,158,11,0.4)",  icon: "▶",  label: "EXECUTE" },
  call:         { color: "#A78BFA",  bg: "rgba(167,139,250,0.12)",  border: "rgba(167,139,250,0.4)", icon: "⤵",  label: "CALL" },
  return:       { color: "#EC4899",  bg: "rgba(236,72,153,0.12)",   border: "rgba(236,72,153,0.4)",  icon: "⤴",  label: "RETURN" },
  push:         { color: "#F97316",  bg: "rgba(249,115,22,0.12)",   border: "rgba(249,115,22,0.4)",  icon: "↑",  label: "PUSH" },
  pop:          { color: "#F87171",  bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.4)", icon: "↓",  label: "POP" },
  insert:       { color: "#34D399",  bg: "rgba(52,211,153,0.12)",   border: "rgba(52,211,153,0.4)",  icon: "+",  label: "INSERT" },
  traverse:     { color: "#60A5FA",  bg: "rgba(96,165,250,0.12)",   border: "rgba(96,165,250,0.4)",  icon: "→",  label: "TRAVERSE" },
  select:       { color: "#FBBF24",  bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.4)",  icon: "◉",  label: "SELECT" },
  filter:       { color: "#4ADE80",  bg: "rgba(74,222,128,0.12)",   border: "rgba(74,222,128,0.4)",  icon: "⊘",  label: "FILTER" },
  sort:         { color: "#C084FC",  bg: "rgba(192,132,252,0.12)",  border: "rgba(192,132,252,0.4)", icon: "⇅",  label: "SORT" },
  swap:         { color: "#F472B6",  bg: "rgba(244,114,182,0.12)",  border: "rgba(244,114,182,0.4)", icon: "⇄",  label: "SWAP" },
  enqueue:      { color: "#2DD4BF",  bg: "rgba(45,212,191,0.12)",   border: "rgba(45,212,191,0.4)",  icon: "→|", label: "ENQUEUE" },
  dequeue:      { color: "#FB923C",  bg: "rgba(251,146,60,0.12)",   border: "rgba(251,146,60,0.4)",  icon: "|→", label: "DEQUEUE" },
  create_table: { color: "#38BDF8",  bg: "rgba(56,189,248,0.12)",   border: "rgba(56,189,248,0.4)",  icon: "⊞",  label: "CREATE" },
  default:      { color: "#94A3B8",  bg: "rgba(100,116,139,0.10)",  border: "rgba(100,116,139,0.3)", icon: "●",  label: "EXECUTE" },
};

// Parse what kind of control flow this is from description + code
function detectFlowType(description: string, code: string, action: string): {
  type: "loop" | "switch" | "if" | "function_call" | "return" | "assign" | "compare" | "generic";
  detail: string;
} {
  const desc = (description || "").toLowerCase();
  const c = (code || "").toLowerCase();

  if (action === "return" || desc.includes("return")) return { type: "return", detail: description };
  if (action === "call" || c.includes("(") && !c.includes("if") && !c.includes("for") && !c.includes("while"))
    return { type: "function_call", detail: description };
  if (c.includes("switch") || desc.includes("switch") || desc.includes("case"))
    return { type: "switch", detail: description };
  if (c.includes("for") || c.includes("while") || desc.includes("loop") || desc.includes("iteration") || desc.includes("i =") || desc.includes("i++"))
    return { type: "loop", detail: description };
  if (c.includes("if") || c.includes("else") || desc.includes("condition") || desc.includes("branch") || desc.includes("true") || desc.includes("false"))
    return { type: "if", detail: description };
  if (action === "assign" || c.includes("=") || desc.includes("assign") || desc.includes("set"))
    return { type: "assign", detail: description };
  if (action === "compare" || desc.includes("compar") || desc.includes("check"))
    return { type: "compare", detail: description };
  return { type: "generic", detail: description };
}

// Flow type visual config
const FLOW_CONFIG: Record<string, { icon: string; title: string; accent: string; bg: string }> = {
  loop:          { icon: "🔁", title: "LOOP ITERATION",    accent: "#F59E0B", bg: "rgba(245,158,11,0.07)" },
  switch:        { icon: "🔀", title: "SWITCH / CASE",     accent: "#3B82F6", bg: "rgba(59,130,246,0.07)" },
  if:            { icon: "🔱", title: "CONDITION CHECK",   accent: "#A78BFA", bg: "rgba(167,139,250,0.07)" },
  function_call: { icon: "📞", title: "FUNCTION CALL",     accent: "#EC4899", bg: "rgba(236,72,153,0.07)" },
  return:        { icon: "↩️", title: "RETURN VALUE",      accent: "#22C55E", bg: "rgba(34,197,94,0.07)" },
  assign:        { icon: "📝", title: "VARIABLE UPDATE",   accent: "#22C55E", bg: "rgba(34,197,94,0.07)" },
  compare:       { icon: "⚖️", title: "COMPARISON",        accent: "#60A5FA", bg: "rgba(96,165,250,0.07)" },
  generic:       { icon: "▶️", title: "EXECUTING",         accent: "#94A3B8", bg: "rgba(100,116,139,0.07)" },
};

const VAR_STATUS_STYLES = {
  default: { bg: "#1A2234", border: "#2D3748", color: "#94A3B8", labelColor: "#64748B", glow: "none" },
  active:  { bg: "rgba(245,158,11,0.15)", border: "#F59E0B", color: "#F59E0B", labelColor: "#F59E0B", glow: "0 0 12px rgba(245,158,11,0.35)" },
  updated: { bg: "rgba(29,158,117,0.15)", border: "#1D9E75", color: "#24C28F", labelColor: "#24C28F", glow: "0 0 12px rgba(29,158,117,0.35)" },
};

export default function VariableBoard({ state, speed = 1, stepAction = "highlight", stepDescription = "", stepCode = "", stepNum = 0 }: Props) {
  const historyRef = useRef<Array<{ desc: string; action: string; code: string; num: number }>>([]);
  const duration = 0.35 / speed;

  // Maintain last-N history
  useEffect(() => {
    if (stepDescription) {
      const last = historyRef.current[historyRef.current.length - 1];
      if (!last || last.desc !== stepDescription || last.num !== stepNum) {
        historyRef.current = [
          ...historyRef.current.slice(-4),
          { desc: stepDescription, action: stepAction, code: stepCode, num: stepNum },
        ];
      }
    }
  }, [stepDescription, stepAction, stepCode, stepNum]);

  if (!state || !Array.isArray(state.variables)) {
    return (
      <div style={{ width: "100%", padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Variable Board: No data available.
      </div>
    );
  }

  const variables = state.variables.filter(v => v && v.name !== undefined);
  const actionCfg = ACTION_CONFIG[stepAction] || ACTION_CONFIG.default;
  const flow = detectFlowType(stepDescription, stepCode, stepAction);
  const flowCfg = FLOW_CONFIG[flow.type] || FLOW_CONFIG.generic;

  return (
    <div style={{ width: "100%", maxWidth: 680, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 18, margin: "0 auto" }}>

      {/* ── Action Badge ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <motion.div
          key={stepAction + stepNum}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 14px",
            borderRadius: 20,
            border: `1px solid ${actionCfg.border}`,
            background: actionCfg.bg,
            color: actionCfg.color,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ fontSize: 14 }}>{actionCfg.icon}</span>
          {actionCfg.label}
        </motion.div>
      </div>

      {/* ── Execution Flow Block ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepDescription + stepNum}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration }}
          style={{
            background: flowCfg.bg,
            border: `1.5px solid ${flowCfg.accent}40`,
            borderLeft: `4px solid ${flowCfg.accent}`,
            borderRadius: 12,
            padding: "14px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow effect */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 12,
            background: `radial-gradient(ellipse at 0% 50%, ${flowCfg.accent}08 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{flowCfg.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
              color: flowCfg.accent, fontFamily: "var(--font-mono)",
            }}>
              {flowCfg.title}
            </span>
          </div>

          {/* Code being executed */}
          {stepCode && (
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              fontWeight: 700,
              color: "#E2E8F0",
              background: "rgba(0,0,0,0.25)",
              borderRadius: 6,
              padding: "6px 12px",
              marginBottom: 8,
              border: `1px solid ${flowCfg.accent}25`,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}>
              <span style={{ color: flowCfg.accent, marginRight: 6 }}>▶</span>
              {stepCode}
            </div>
          )}

          {/* Description */}
          <div style={{
            fontSize: 13,
            color: "#CBD5E1",
            lineHeight: 1.5,
          }}>
            {stepDescription}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Variables Memory Panel ── */}
      {variables.length > 0 && (
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            color: "var(--text-muted)", textTransform: "uppercase",
            marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{
              display: "inline-block", width: 8, height: 8,
              borderRadius: "50%", background: "var(--primary)"
            }} />
            MEMORY — Variables
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 10,
          }}>
            <AnimatePresence>
              {variables.map((v) => {
                const s = VAR_STATUS_STYLES[v.status] || VAR_STATUS_STYLES.default;
                return (
                  <motion.div
                    key={v.name}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration }}
                    style={{
                      background: s.bg,
                      border: `2px solid ${s.border}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      boxShadow: s.glow,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Memory address style decoration */}
                    <div style={{
                      position: "absolute", top: 0, right: 0,
                      width: 0, height: 0,
                      borderStyle: "solid",
                      borderWidth: "0 16px 16px 0",
                      borderColor: `transparent ${s.border} transparent transparent`,
                      opacity: 0.5,
                    }} />

                    {/* Type label */}
                    <div style={{
                      fontSize: 9, color: "var(--primary)",
                      fontFamily: "var(--font-mono)", marginBottom: 2,
                      fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      {v.type}
                    </div>

                    {/* Variable name */}
                    <div style={{
                      fontSize: 12, color: s.labelColor,
                      fontFamily: "var(--font-mono)", marginBottom: 6,
                      fontWeight: 600,
                    }}>
                      {v.name}
                    </div>

                    {/* Value — animated on change */}
                    <motion.div
                      key={`${v.name}-${String(v.value)}`}
                      initial={{ scale: 1.4, color: "#FFFFFF" }}
                      animate={{ scale: 1, color: s.color }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: 20, fontWeight: 800,
                        fontFamily: "var(--font-mono)", lineHeight: 1.2,
                        wordBreak: "break-all",
                      }}
                    >
                      {v.value === null ? "null" : v.value === undefined ? "?" : String(v.value)}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Execution Trail (last N steps) ── */}
      {historyRef.current.length > 1 && (
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            color: "var(--text-muted)", textTransform: "uppercase",
            marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>📜</span> Execution Trail
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {historyRef.current.slice().reverse().map((entry, i) => {
              const aCfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.default;
              const isCurrentStep = i === 0;
              return (
                <div
                  key={entry.num + "-" + i}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 10px",
                    borderRadius: 7,
                    background: isCurrentStep ? "rgba(255,255,255,0.05)" : "transparent",
                    opacity: isCurrentStep ? 1 : Math.max(0.3, 1 - i * 0.2),
                    fontSize: 12,
                    color: isCurrentStep ? "#E2E8F0" : "#64748B",
                    borderLeft: isCurrentStep ? `3px solid ${aCfg.color}` : "3px solid transparent",
                    transition: "all 0.3s",
                  }}
                >
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: aCfg.color,
                    fontFamily: "var(--font-mono)", minWidth: 52,
                    padding: "1px 5px", borderRadius: 4,
                    background: aCfg.bg,
                    border: `1px solid ${aCfg.border}`,
                    textAlign: "center",
                  }}>
                    {aCfg.label}
                  </span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.desc}
                  </span>
                  {isCurrentStep && (
                    <span style={{ fontSize: 9, color: aCfg.color, fontWeight: 700 }}>← NOW</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
