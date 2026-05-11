"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { TreeState, TreeNode } from "@/lib/types";
import { useMemo } from "react";

interface Props {
  state: TreeState;
  speed?: number;
}

interface LayoutNode extends TreeNode {
  x: number;
  y: number;
  level: number;
}

const STATUS_STYLES = {
  default:   { fill: "#1E293B", stroke: "#374151", color: "#94A3B8" },
  visiting:  { fill: "rgba(245,158,11,0.25)", stroke: "#F59E0B", color: "#F59E0B" },
  visited:   { fill: "rgba(34,197,94,0.2)",   stroke: "#22C55E", color: "#22C55E" },
  inserting: { fill: "rgba(29,158,117,0.2)",   stroke: "#1D9E75", color: "#24C28F" },
};

function buildLayout(nodes: TreeNode[]): LayoutNode[] {
  if (nodes.length === 0) return [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const result: LayoutNode[] = [];
  const LEVEL_HEIGHT = 80;
  const BASE_WIDTH = 480;

  function layout(id: string | null, level: number, left: number, right: number) {
    if (!id || !nodeMap.has(id)) return;
    const node = nodeMap.get(id)!;
    const x = (left + right) / 2;
    const y = 40 + level * LEVEL_HEIGHT;
    result.push({ ...node, x, y, level });
    layout(node.left, level + 1, left, x);
    layout(node.right, level + 1, x, right);
  }

  const rootId = nodes[0].id;
  layout(rootId, 0, 0, BASE_WIDTH);
  return result;
}

export default function TreeViz({ state, speed = 1 }: Props) {
  const duration = 0.4 / speed;
  const layout = useMemo(() => buildLayout(state.nodes), [state.nodes]);
  const nodeMap = useMemo(() => new Map(layout.map((n) => [n.id, n])), [layout]);

  const svgWidth = Math.max(480, layout.reduce((m, n) => Math.max(m, n.x + 40), 0) + 40);
  const svgHeight = Math.max(200, layout.reduce((m, n) => Math.max(m, n.y + 40), 0) + 40);

  return (
    <div style={{ width: "100%", padding: "16px" }}>
      <div style={{ textAlign: "center", marginBottom: 12, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Binary Tree Visualization
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg width={svgWidth} height={svgHeight} style={{ display: "block", margin: "0 auto" }}>
          {/* Edges */}
          {layout.map((node) => {
            const s = STATUS_STYLES[node.status] || STATUS_STYLES.default;
            return (
              <>
                {node.left && nodeMap.has(node.left) && (() => {
                  const child = nodeMap.get(node.left)!;
                  return (
                    <line
                      key={`edge-${node.id}-L`}
                      x1={node.x} y1={node.y}
                      x2={child.x} y2={child.y}
                      stroke="#2D3E56" strokeWidth={2}
                    />
                  );
                })()}
                {node.right && nodeMap.has(node.right) && (() => {
                  const child = nodeMap.get(node.right)!;
                  return (
                    <line
                      key={`edge-${node.id}-R`}
                      x1={node.x} y1={node.y}
                      x2={child.x} y2={child.y}
                      stroke="#2D3E56" strokeWidth={2}
                    />
                  );
                })()}
              </>
            );
          })}

          {/* Nodes */}
          {layout.map((node) => {
            const s = STATUS_STYLES[node.status] || STATUS_STYLES.default;
            return (
              <g key={node.id}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={24}
                  fill={s.fill}
                  stroke={s.stroke}
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration, ease: "easeOut" }}
                  style={{ filter: node.status !== "default" ? `drop-shadow(0 0 8px ${s.stroke})` : "none" }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={s.color}
                  fontSize={13}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                >
                  {node.value}
                </text>
                {/* L/R labels */}
                {node.left && nodeMap.has(node.left) && (() => {
                  const child = nodeMap.get(node.left)!;
                  const mx = (node.x + child.x) / 2 - 8;
                  const my = (node.y + child.y) / 2;
                  return <text key={`lbl-L-${node.id}`} x={mx} y={my} fill="#64748B" fontSize={9} fontWeight={700}>L</text>;
                })()}
                {node.right && nodeMap.has(node.right) && (() => {
                  const child = nodeMap.get(node.right)!;
                  const mx = (node.x + child.x) / 2 + 4;
                  const my = (node.y + child.y) / 2;
                  return <text key={`lbl-R-${node.id}`} x={mx} y={my} fill="#64748B" fontSize={9} fontWeight={700}>R</text>;
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Empty state */}
      {layout.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
          Empty Tree
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
        {[
          { label: "Default", color: "#64748B" },
          { label: "Visiting", color: "#F59E0B" },
          { label: "Visited", color: "#22C55E" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
