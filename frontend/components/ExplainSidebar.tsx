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

const renderSafeVal = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  return JSON.stringify(val);
};

export default function ExplainSidebar({ explanations, currentStep, currentLine }: Props) {
  const [expandedWhy, setExpandedWhy] = useState<number | null>(null);

  const safeExplanations = Array.isArray(explanations) ? explanations : [];
  // Coerce to number on both sides — API returns line as string, currentLine is number
  const currentLineNum = Number(currentLine) || 0;
  const currentExplain = safeExplanations.find((e) => Number(e?.line) === currentLineNum);
  const prevExplains = safeExplanations.filter((e) => e && Number(e.line) < currentLineNum).slice(-4).reverse();

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--card)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                color: CATEGORY_COLORS[String(currentExplain.category)] || "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {renderSafeVal(currentExplain.category)}
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
              {renderSafeVal(currentExplain.code)}
            </div>

            {/* Explanation text */}
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>
              {renderSafeVal(currentExplain.explain)}
            </p>

            {/* Concept badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                background: `${CONCEPT_COLORS[String(currentExplain.concept)] || "#64748B"}20`,
                border: `1px solid ${CONCEPT_COLORS[String(currentExplain.concept)] || "#64748B"}40`,
                color: CONCEPT_COLORS[String(currentExplain.concept)] || "#94A3B8",
              }}>
                {renderSafeVal(currentExplain.concept)}
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
                {typeof currentStep.description === "string" ? currentStep.description : JSON.stringify(currentStep.description)}
              </div>
            )}

            {/* Active Variables Display */}
            {currentStep && currentStep.variables && typeof currentStep.variables === "object" && Object.keys(currentStep.variables).length > 0 && (
              <div style={{
                marginTop: 12,
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 12px",
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <span>📊</span> Active Variables on this Step
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(currentStep.variables).map(([name, val]) => (
                    <div key={name} style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: 6,
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11.5,
                      fontFamily: "var(--font-mono)",
                    }}>
                      <span style={{ color: "var(--primary-light)", fontWeight: 600 }}>{name}</span>
                      <span style={{ color: "var(--text-muted)" }}>=</span>
                      <span style={{ color: "#E2E8F0" }}>{renderSafeVal(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Syntax & Logic Breakdown */}
            <div style={{
              marginTop: 12,
              padding: "12px",
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "#E2E8F0",
              lineHeight: 1.7,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#60A5FA",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                <span>🔍</span> Syntax &amp; Logic Breakdown
              </div>
              <div style={{ color: "#94A3B8", fontSize: "12px", whiteSpace: "pre-line" }}>
                {renderSafeVal(currentExplain.why) || (
                  <>
                    {currentExplain.category === "structure"
                      ? "Data structures help organize and manage data efficiently. "
                      : currentExplain.category === "logic"
                      ? "Control flow decides which code runs based on conditions. "
                      : currentExplain.category === "core"
                      ? "This is a fundamental programming operation. "
                      : ""}
                    Understanding this pattern is essential for writing correct algorithms.
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "24px 12px",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            {safeExplanations.length > 0
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
                    <span style={{ color: CATEGORY_COLORS[String(e.category)], marginLeft: 6 }}>{renderSafeVal(e.concept)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{renderSafeVal(e.explain)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
