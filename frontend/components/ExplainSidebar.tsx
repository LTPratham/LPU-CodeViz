"use client";
import { useState } from "react";
import type { ExplainLine, TraceStep } from "@/lib/types";

interface Props {
  explanations: ExplainLine[];
  currentStep: TraceStep | null;
  currentLine: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  core:      "#1D9E75",
  structure: "#3B82F6",
  io:        "#F59E0B",
  logic:     "#A78BFA",
  db:        "#F97316",
};

const CONCEPT_COLORS: Record<string, string> = {
  "Loop":        "#3B82F6",
  "Recursion":   "#A78BFA",
  "Comparison":  "#F59E0B",
  "Assignment":  "#22C55E",
  "Stack Push":  "#F97316",
  "Stack Pop":   "#EF4444",
  "Function":    "#1D9E75",
  "Condition":   "#F59E0B",
};

export default function ExplainSidebar({ explanations, currentStep, currentLine }: Props) {
  const [expandedWhy, setExpandedWhy] = useState<number | null>(null);

  const currentExplain = explanations.find((e) => e.line === currentLine);
  const prevExplains = explanations.filter((e) => e.line < currentLine).slice(-4).reverse();

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--card)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div className="panel-header">
        <span style={{ fontSize: 14 }}>📖</span>
        <span>Explanation</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {/* Current explanation */}
        {currentExplain ? (
          <div style={{
            background: "rgba(29,158,117,0.08)",
            border: "1px solid rgba(29,158,117,0.3)",
            borderRadius: 10,
            padding: "14px",
            marginBottom: 16,
          }}>
            {/* Line number */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--primary)",
                background: "var(--primary-glow)",
                border: "1px solid var(--primary)",
                borderRadius: 4,
                padding: "2px 8px",
                fontFamily: "var(--font-mono)",
              }}>
                Line {currentExplain.line}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: CATEGORY_COLORS[currentExplain.category] || "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {currentExplain.category}
              </span>
            </div>

            {/* Code snippet */}
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--primary-light)",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 6,
              padding: "6px 10px",
              marginBottom: 10,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}>
              {currentExplain.code}
            </div>

            {/* Explanation text */}
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>
              {currentExplain.explain}
            </p>

            {/* Concept badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                background: `${CONCEPT_COLORS[currentExplain.concept] || "#64748B"}20`,
                border: `1px solid ${CONCEPT_COLORS[currentExplain.concept] || "#64748B"}40`,
                color: CONCEPT_COLORS[currentExplain.concept] || "#94A3B8",
              }}>
                {currentExplain.concept}
              </span>
            </div>

            {/* Step description from trace */}
            {currentStep && (
              <div style={{
                marginTop: 10,
                padding: "8px 10px",
                background: "rgba(245,158,11,0.08)",
                borderLeft: "3px solid #F59E0B",
                borderRadius: "0 6px 6px 0",
                fontSize: 12,
                color: "#F59E0B",
                lineHeight: 1.6,
              }}>
                🔄 {currentStep.description}
              </div>
            )}

            {/* "Why does this work?" expandable */}
            <button
              onClick={() => setExpandedWhy(expandedWhy === currentExplain.line ? null : currentExplain.line)}
              style={{
                marginTop: 10,
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "5px 10px",
                fontSize: 11,
                color: "var(--text-muted)",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{expandedWhy === currentExplain.line ? "▼" : "▶"}</span>
              Why does this work?
            </button>
            {expandedWhy === currentExplain.line && (
              <div style={{
                marginTop: 6,
                padding: "10px",
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 6,
                fontSize: 12,
                color: "#94A3B8",
                lineHeight: 1.7,
              }}>
                This is a <strong style={{ color: "#60A5FA" }}>{currentExplain.concept}</strong> operation.{" "}
                {currentExplain.category === "structure"
                  ? "Data structures help organize and manage data efficiently. "
                  : currentExplain.category === "logic"
                  ? "Control flow decides which code runs based on conditions. "
                  : currentExplain.category === "core"
                  ? "This is a fundamental programming operation. "
                  : ""}
                Understanding this pattern is essential for your LPU exams.
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "24px 12px",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            {explanations.length > 0
              ? "Navigate to a step to see the explanation"
              : "Click Visualize to generate explanations"}
          </div>
        )}

        {/* Previous steps history */}
        {prevExplains.length > 0 && (
          <div>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              Previous Steps
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {prevExplains.map((e) => (
                <div key={e.line} style={{
                  padding: "8px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  opacity: 0.7,
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3, fontFamily: "var(--font-mono)" }}>
                    Line {e.line}
                    <span style={{ color: CATEGORY_COLORS[e.category], marginLeft: 6 }}>{e.concept}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{e.explain}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
