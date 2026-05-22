"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { TreeState, TreeNode } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";

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
  if (!state || !Array.isArray(state.nodes)) {
    return (
      <div style={{ width: "100%", padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Tree Visualization: No valid tree data available.
      </div>
    );
  }

  const duration = 0.4 / speed;
  const layout = useMemo(() => buildLayout(state.nodes), [state.nodes]);
  const nodeMap = useMemo(() => new Map(layout.map((n) => [n.id, n])), [layout]);

  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({});

  // Reset offsets when layout structure changes (e.g. node additions/deletions)
  const layoutHash = useMemo(() => state.nodes.map((n) => n.id).join(","), [state.nodes]);
  useEffect(() => {
    setOffsets({});
  }, [layoutHash]);

  // Dynamically compute width and height to accommodate dragged nodes
  const svgWidth = useMemo(() => {
    return Math.max(
      480,
      layout.reduce((m, n) => {
        const dx = offsets[n.id]?.x || 0;
        return Math.max(m, n.x + dx + 40);
      }, 0) + 40
    );
  }, [layout, offsets]);

  const svgHeight = useMemo(() => {
    return Math.max(
      200,
      layout.reduce((m, n) => {
        const dy = offsets[n.id]?.y || 0;
        return Math.max(m, n.y + dy + 40);
      }, 0) + 40
    );
  }, [layout, offsets]);

  return (
    <div style={{ width: "100%", padding: "16px" }}>
      <div style={{ textAlign: "center", marginBottom: 12, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Binary Tree Visualization
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg width={svgWidth} height={svgHeight} style={{ display: "block", margin: "0 auto" }}>
          {/* Edges & Labels */}
          {layout.map((node) => {
            const nodeX = node.x + (offsets[node.id]?.x || 0);
            const nodeY = node.y + (offsets[node.id]?.y || 0);

            return (
              <g key={`edges-group-${node.id}`}>
                {node.left && nodeMap.has(node.left) && (() => {
                  const child = nodeMap.get(node.left)!;
                  const childX = child.x + (offsets[child.id]?.x || 0);
                  const childY = child.y + (offsets[child.id]?.y || 0);
                  const mx = (nodeX + childX) / 2 - 8;
                  const my = (nodeY + childY) / 2;
                  return (
                    <g key={`edge-L-${node.id}`}>
                      <line
                        x1={nodeX} y1={nodeY}
                        x2={childX} y2={childY}
                        stroke="#2D3E56" strokeWidth={2}
                      />
                      <text x={mx} y={my} fill="#64748B" fontSize={9} fontWeight={700}>L</text>
                    </g>
                  );
                })()}
                {node.right && nodeMap.has(node.right) && (() => {
                  const child = nodeMap.get(node.right)!;
                  const childX = child.x + (offsets[child.id]?.x || 0);
                  const childY = child.y + (offsets[child.id]?.y || 0);
                  const mx = (nodeX + childX) / 2 + 4;
                  const my = (nodeY + childY) / 2;
                  return (
                    <g key={`edge-R-${node.id}`}>
                      <line
                        x1={nodeX} y1={nodeY}
                        x2={childX} y2={childY}
                        stroke="#2D3E56" strokeWidth={2}
                      />
                      <text x={mx} y={my} fill="#64748B" fontSize={9} fontWeight={700}>R</text>
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* Nodes */}
          {layout.map((node) => {
            const s = STATUS_STYLES[node.status] || STATUS_STYLES.default;
            return (
              <motion.g
                key={`${node.id}-${layoutHash}`}
                drag
                dragMomentum={false}
                dragElastic={0}
                onDrag={(event, info) => {
                  setOffsets((prev) => {
                    const current = prev[node.id] || { x: 0, y: 0 };
                    const newX = current.x + info.delta.x;
                    const newY = current.y + info.delta.y;
                    return {
                      ...prev,
                      [node.id]: {
                        x: Math.max(-node.x + 30, newX),
                        y: Math.max(-node.y + 30, newY),
                      },
                    };
                  });
                }}
                whileHover={{ cursor: "grab", scale: 1.05 }}
                whileTap={{ cursor: "grabbing", scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration }}
              >
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
                  style={{ filter: node.status !== "default" ? `drop-shadow(0 0 10px ${s.stroke})` : "none" }}
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
                  style={{ pointerEvents: "none" }}
                >
                  {node.value}
                </text>
              </motion.g>
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

