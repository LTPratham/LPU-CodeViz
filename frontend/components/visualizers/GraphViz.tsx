"use client";
import { motion } from "framer-motion";
import type { GraphState } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";

interface Props {
  state: GraphState;
  speed?: number;
}

const STATUS_STYLES: Record<string, { fill: string; stroke: string; color: string; filter?: string; strokeWidth?: number }> = {
  default:       { fill: "#1E293B", stroke: "#374151", color: "#94A3B8" },
  visiting:      { fill: "rgba(245,158,11,0.25)", stroke: "#F59E0B", color: "#F59E0B", filter: "drop-shadow(0 0 8px rgba(245,158,11,0.5))" },
  visited:       { fill: "rgba(34,197,94,0.2)",   stroke: "#22C55E", color: "#22C55E", filter: "drop-shadow(0 0 8px rgba(34,197,94,0.5))" },
  highlighted:   { fill: "rgba(139,92,246,0.25)", stroke: "#8B5CF6", color: "#C084FC", filter: "drop-shadow(0 0 8px rgba(139,92,246,0.5))" },
  shortest_path: { fill: "rgba(59,130,246,0.25)", stroke: "#3B82F6", color: "#60A5FA", filter: "drop-shadow(0 0 12px rgba(59,130,246,0.6))", strokeWidth: 3 },
};

const EDGE_STATUS_STYLES: Record<string, { stroke: string; strokeWidth: number; opacity: number; filter?: string }> = {
  default:       { stroke: "#2D3E56", strokeWidth: 2, opacity: 0.6 },
  highlighted:   { stroke: "#8B5CF6", strokeWidth: 3, opacity: 1.0, filter: "drop-shadow(0 0 4px rgba(139,92,246,0.5))" },
  shortest_path: { stroke: "#3B82F6", strokeWidth: 4, opacity: 1.0, filter: "drop-shadow(0 0 6px rgba(59,130,246,0.6))" },
};

export default function GraphViz({ state, speed = 1 }: Props) {
  const validNodes = state && Array.isArray(state.nodes) ? state.nodes : [];
  const validEdges = state && Array.isArray(state.edges) ? state.edges : [];

  const duration = 0.4 / speed;

  // SVG parameters
  const width = 600;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 120; // Radius of circular layout
  const nodeRadius = 22;

  // Sort nodes by ID to guarantee consistent position index assignment
  const sortedNodes = useMemo(() => {
    return [...validNodes].sort((a, b) => a.id.localeCompare(b.id));
  }, [validNodes]);

  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({});

  // Reset offsets when layout structure changes (e.g., node list changes)
  const layoutHash = useMemo(() => sortedNodes.map((n) => n.id).join(","), [sortedNodes]);
  
  useEffect(() => {
    setOffsets({});
  }, [layoutHash]);

  // Compute node coordinates map
  const coordMap = useMemo(() => {
    const map: Record<string, { x: number; y: number; defaultX: number; defaultY: number }> = {};
    sortedNodes.forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / sortedNodes.length - Math.PI / 2; // Offset by -90 deg to start top center
      const defaultX = cx + radius * Math.cos(angle);
      const defaultY = cy + radius * Math.sin(angle);
      const offset = offsets[node.id] || { x: 0, y: 0 };
      map[node.id] = {
        defaultX,
        defaultY,
        x: defaultX + offset.x,
        y: defaultY + offset.y,
      };
    });
    return map;
  }, [sortedNodes, offsets, cx, cy, radius]);

  // Adjust edge lines so they don't intersect the circle boundary, and directed arrowheads point perfectly at boundary
  const edges = useMemo(() => {
    return validEdges.map((edge) => {
      const fromNode = coordMap[edge.from];
      const toNode = coordMap[edge.to];
      if (!fromNode || !toNode) return null;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) return null;

      const angle = Math.atan2(dy, dx);
      // Start line at boundary of fromNode
      const x1 = fromNode.x + Math.cos(angle) * nodeRadius;
      const y1 = fromNode.y + Math.sin(angle) * nodeRadius;
      // End line at boundary of toNode. If directed, add extra offset for marker
      const isDirected = edge.directed ?? state?.directed ?? false;
      const arrowPadding = isDirected ? 6 : 0;
      const x2 = toNode.x - Math.cos(angle) * (nodeRadius + arrowPadding);
      const y2 = toNode.y - Math.sin(angle) * (nodeRadius + arrowPadding);

      // Midpoint for weights label
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      // Offset perpendicularly
      const perpX = Math.sin(angle) * 12;
      const perpY = -Math.cos(angle) * 12;

      return {
        ...edge,
        x1, y1, x2, y2,
        midX, midY,
        labelX: midX + perpX,
        labelY: midY + perpY,
        isDirected,
      };
    }).filter(Boolean);
  }, [validEdges, state?.directed, coordMap]);

  if (!state || !Array.isArray(state.nodes) || !Array.isArray(state.edges)) {
    return (
      <div style={{ width: "100%", height: "100%", padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Graph Visualization: No valid graph data available.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 12, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Graph Visualization
      </div>

      <div style={{ width: "100%", maxWidth: 600, height: 400, background: "rgba(17,24,39,0.4)", borderRadius: 12, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#2D3E56" />
            </marker>
            <marker
              id="arrow-highlighted"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#8B5CF6" />
            </marker>
            <marker
              id="arrow-shortest_path"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#3B82F6" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            if (!edge) return null;
            const style = EDGE_STATUS_STYLES[edge.status] || EDGE_STATUS_STYLES.default;
            const markerId = edge.isDirected ? `url(#arrow-${edge.status || "default"})` : undefined;

            return (
              <g key={`edge-${edge.from}-${edge.to}-${idx}`}>
                <motion.line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  opacity={style.opacity}
                  style={{ filter: style.filter }}
                  markerEnd={markerId}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration }}
                />

                {edge.weight !== undefined && (
                  <g>
                    <rect
                      x={edge.labelX - 12}
                      y={edge.labelY - 8}
                      width={24}
                      height={16}
                      rx={4}
                      fill="var(--card)"
                      stroke="var(--border)"
                      strokeWidth={1}
                      opacity={0.8}
                    />
                    <text
                      x={edge.labelX}
                      y={edge.labelY}
                      fill="var(--text-secondary)"
                      fontSize={9}
                      fontWeight={700}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ userSelect: "none" }}
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {sortedNodes.map((node) => {
            const coords = coordMap[node.id];
            if (!coords) return null;

            const style = STATUS_STYLES[node.status] || STATUS_STYLES.default;

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

                    // Constraints to prevent nodes from being dragged outside the visible area
                    return {
                      ...prev,
                      [node.id]: {
                        x: Math.max(-coords.defaultX + nodeRadius + 10, Math.min(width - coords.defaultX - nodeRadius - 10, newX)),
                        y: Math.max(-coords.defaultY + nodeRadius + 10, Math.min(height - coords.defaultY - nodeRadius - 10, newY)),
                      },
                    };
                  });
                }}
                whileHover={{ scale: 1.08 }}
                whileDrag={{ cursor: "grabbing" }}
                style={{ cursor: "grab" }}
              >
                {/* Node Outer Ring / Glow */}
                <motion.circle
                  cx={coords.x}
                  cy={coords.y}
                  r={nodeRadius}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth ?? 2}
                  style={{ filter: style.filter }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                {/* Node Label Text */}
                <text
                  x={coords.x}
                  y={coords.y}
                  fill={style.color}
                  fontSize={12}
                  fontWeight={800}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {node.value}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "Unvisited", bg: "#1E293B", border: "#374151" },
          { label: "Visiting", bg: "rgba(245,158,11,0.25)", border: "#F59E0B" },
          { label: "Visited", bg: "rgba(34,197,94,0.2)", border: "#22C55E" },
          { label: "Highlighted Path", bg: "rgba(139,92,246,0.25)", border: "#8B5CF6" },
          { label: "Shortest Path", bg: "rgba(59,130,246,0.25)", border: "#3B82F6" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: l.bg, border: `2px solid ${l.border}` }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
