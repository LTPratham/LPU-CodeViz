"use client";
import { MOCK_NODES, NODE_TYPE_META, type GraphNode } from "@/lib/mockGraphData";

interface RightPanelProps {
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  totalNodes: number;
  totalEdges: number;
}

const INSIGHTS: Record<
  string,
  { type: "warning" | "danger" | "info"; icon: string; text: string }[]
> = {
  "page-visualize": [
    { type: "warning", icon: "⚠", text: "High complexity score (9/10). Consider splitting into smaller modules." },
    { type: "info", icon: "ℹ", text: "This file has 6 direct imports — above the recommended threshold of 5." },
  ],
  "hook-visualizer": [
    { type: "danger", icon: "🔄", text: "Circular dependency detected with svc-api." },
    { type: "warning", icon: "⚠", text: "High complexity (8/10) in a hook. Consider extracting logic into services." },
  ],
  "util-legacy-tracer": [
    { type: "warning", icon: "⚠", text: "No modules import this file. Potential dead code — safe to remove." },
  ],
  "comp-visual-canvas": [
    { type: "warning", icon: "⚠", text: "High complexity (9/10). Consider decomposing into smaller canvas primitives." },
    { type: "info", icon: "ℹ", text: "Largest component in the codebase at 421 lines." },
  ],
  "comp-algo-catalog": [
    { type: "info", icon: "ℹ", text: "452 lines — second largest component. Consider lazy loading sections." },
  ],
  "comp-code-editor": [
    { type: "info", icon: "ℹ", text: "High coupling to Monaco Editor API. Consider abstracting with a wrapper." },
  ],
};

const REPO_STATS = {
  name: "LPU-CodeViz",
  branch: "main",
  totalFiles: 30,
  totalComponents: 14,
  totalHooks: 2,
  totalServices: 2,
  totalUtils: 6,
  lastAnalyzed: "just now",
  avgComplexity: 4.8,
};

function MetricRow({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: accent || "var(--text)" }}>{value}</span>
    </div>
  );
}

function ComplexityBar({ value }: { value: number }) {
  const color =
    value >= 8 ? "var(--danger)" : value >= 6 ? "var(--warning)" : "var(--success)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 4,
          background: "var(--surface-3)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value * 10}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 300ms ease",
          }}
        />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600, minWidth: 20 }}>{value}</span>
    </div>
  );
}

export default function RightPanel({ selectedNodeId, onSelectNode, totalNodes, totalEdges }: RightPanelProps) {
  const node = selectedNodeId ? MOCK_NODES.find((n) => n.id === selectedNodeId) ?? null : null;

  if (!node) {
    // Repository Overview
    return (
      <div style={{ height: "100%", overflowY: "auto" }}>
        {/* Header */}
        <div className="inspector-section">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "var(--primary-dim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{REPO_STATS.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>branch: {REPO_STATS.branch}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <span className="badge badge-blue">Next.js 16</span>
            <span className="badge badge-muted">TypeScript</span>
            <span className="badge badge-muted">TailwindCSS</span>
          </div>
        </div>

        {/* Stats */}
        <div className="inspector-section">
          <div className="inspector-label">Overview</div>
          <MetricRow label="Total nodes" value={totalNodes} />
          <MetricRow label="Total edges" value={totalEdges} />
          <MetricRow label="Pages" value={REPO_STATS.totalFiles} />
          <MetricRow label="Components" value={REPO_STATS.totalComponents} />
          <MetricRow label="Services" value={REPO_STATS.totalServices} />
          <MetricRow label="Avg complexity" value={`${REPO_STATS.avgComplexity}/10`} accent="var(--warning)" />
          <MetricRow label="Last analyzed" value={REPO_STATS.lastAnalyzed} />
        </div>

        {/* AI Insights */}
        <div className="inspector-section">
          <div className="inspector-label">AI Insights</div>
          <div className="insight-chip warning">
            <span>⚠</span>
            <span>3 files have complexity above 8/10. Review VisualCanvas, visualize/page, and useVisualizer.</span>
          </div>
          <div className="insight-chip danger">
            <span>🔄</span>
            <span>Circular dependency detected: useVisualizer ↔ svc-api. This can cause initialization issues.</span>
          </div>
          <div className="insight-chip info">
            <span>ℹ</span>
            <span>legacyTracer.ts appears to be dead code — no other module imports it.</span>
          </div>
        </div>

        {/* Click hint */}
        <div
          style={{
            padding: "20px 16px",
            textAlign: "center",
            color: "var(--muted-dim)",
            fontSize: 12,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ margin: "0 auto 8px", display: "block" }}
          >
            <path d="M5 9l4 4 4-4" /><path d="M17 9v4a4 4 0 0 1-4 4H9" />
          </svg>
          Click any node on the canvas to inspect it
        </div>
      </div>
    );
  }

  // Node Inspector
  const meta = NODE_TYPE_META[node.type];
  const importedByNodes = MOCK_NODES.filter((n) => n.imports.includes(node.id));
  const insights = INSIGHTS[node.id] ?? [];

  return (
    <div style={{ height: "100%", overflowY: "auto" }} className="animate-fade-in">
      {/* Node Header */}
      <div className="inspector-section">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: meta.bg,
              border: `1px solid ${meta.color}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {node.type === "page" ? "📄" : node.type === "component" ? "⚛" : node.type === "hook" ? "🪝" : node.type === "service" ? "⚙️" : node.type === "config" ? "⚙" : "🔧"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {node.label}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {meta.label}
              {node.isDeadCode && (
                <span className="badge badge-amber" style={{ marginLeft: 6, fontSize: 9 }}>
                  Dead Code
                </span>
              )}
              {node.hasCycle && (
                <span className="badge badge-red" style={{ marginLeft: 6, fontSize: 9 }}>
                  Cycle
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="inspector-label">Path</div>
        <div className="inspector-path">{node.path}</div>
      </div>

      {/* Metrics */}
      <div className="inspector-section">
        <div className="inspector-label">Metrics</div>
        <MetricRow label="Lines of code" value={node.linesOfCode} />
        <MetricRow label="Direct imports" value={node.imports.length} />
        <MetricRow label="Imported by" value={importedByNodes.length} />
        <div style={{ padding: "6px 0 2px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            <span>Complexity</span>
          </div>
          <ComplexityBar value={node.complexity} />
        </div>
      </div>

      {/* Exports */}
      {node.exports.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Exports</div>
          {node.exports.map((exp) => (
            <div
              key={exp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 0",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--success)",
              }}
            >
              <span style={{ color: "var(--muted-dim)" }}>↗</span>
              {exp}
            </div>
          ))}
        </div>
      )}

      {/* Dependencies (what this node imports) */}
      {node.imports.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Dependencies ({node.imports.length})</div>
          {node.imports.map((depId) => {
            const depNode = MOCK_NODES.find((n) => n.id === depId);
            if (!depNode) return null;
            const depMeta = NODE_TYPE_META[depNode.type];
            return (
              <div
                key={depId}
                className="dep-item"
                onClick={() => onSelectNode(depId)}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: depMeta.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, flex: 1 }}>
                  {depNode.path}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Dependents (what imports this node) */}
      {importedByNodes.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-label">Dependents ({importedByNodes.length})</div>
          {importedByNodes.map((dep) => {
            const depMeta = NODE_TYPE_META[dep.type];
            return (
              <div
                key={dep.id}
                className="dep-item"
                onClick={() => onSelectNode(dep.id)}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: depMeta.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, flex: 1 }}>
                  {dep.path}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Insights */}
      <div className="inspector-section">
        <div className="inspector-label">AI Insights</div>
        {insights.length > 0 ? (
          insights.map((ins, i) => (
            <div key={i} className={`insight-chip ${ins.type}`}>
              <span>{ins.icon}</span>
              <span>{ins.text}</span>
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 0",
            }}
          >
            <span style={{ color: "var(--success)" }}>✓</span>
            No issues detected in this module.
          </div>
        )}
      </div>
    </div>
  );
}
