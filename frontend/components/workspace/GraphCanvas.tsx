"use client";
import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type NodeTypes,
  type Connection,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  MOCK_NODES,
  MOCK_EDGES,
  NODE_TYPE_META,
  INITIAL_POSITIONS,
  type GraphNode,
} from "@/lib/mockGraphData";

// ─── Custom Node Component ───────────────────────────────────────────────────

function FileNode({ data, selected }: { data: GraphNode & { visible: boolean }; selected: boolean }) {
  const meta = NODE_TYPE_META[data.type];
  const complexityColor =
    data.complexity >= 8
      ? "var(--danger)"
      : data.complexity >= 6
      ? "var(--warning)"
      : "var(--success)";

  return (
    <div
      style={{
        background: selected ? "var(--surface-3)" : "var(--surface-1)",
        border: selected
          ? `1.5px solid var(--primary)`
          : data.hasCycle
          ? `1.5px solid var(--danger)`
          : data.isDeadCode
          ? `1.5px solid var(--warning)`
          : `1px solid var(--border)`,
        borderRadius: 8,
        minWidth: 180,
        maxWidth: 220,
        overflow: "hidden",
        boxShadow: selected
          ? "0 0 0 3px rgba(59,130,246,0.15), 0 4px 16px rgba(0,0,0,0.5)"
          : "0 2px 8px rgba(0,0,0,0.4)",
        transition: "border-color 150ms ease, box-shadow 150ms ease, background 150ms ease",
        cursor: "pointer",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 2,
          background: meta.color,
          opacity: selected ? 1 : 0.6,
        }}
      />

      {/* Node body */}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
          {/* Type icon dot */}
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: meta.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {data.label}
          </span>
          {data.isDeadCode && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--warning)",
                background: "var(--warning-dim)",
                padding: "1px 5px",
                borderRadius: 3,
                flexShrink: 0,
              }}
            >
              dead
            </span>
          )}
          {data.hasCycle && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--danger)",
                background: "var(--danger-dim)",
                padding: "1px 5px",
                borderRadius: 3,
                flexShrink: 0,
              }}
            >
              cycle
            </span>
          )}
        </div>

        {/* Path */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted-dim)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 8,
          }}
        >
          {data.path}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 7,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--muted-dim)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ color: meta.color, fontWeight: 600 }}>{data.linesOfCode}</span> loc
          </span>
          <span style={{ fontSize: 10, color: "var(--muted-dim)" }}>·</span>
          <span
            style={{
              fontSize: 10,
              color: "var(--muted-dim)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ color: complexityColor, fontWeight: 600 }}>{data.complexity}</span>/10
          </span>
          <span style={{ marginLeft: "auto" }}>
            <span
              style={{
                fontSize: 9,
                color: meta.color,
                background: meta.bg,
                padding: "1px 5px",
                borderRadius: 3,
                fontWeight: 600,
              }}
            >
              {META_LABEL_SHORT[data.type]}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

const META_LABEL_SHORT: Record<GraphNode["type"], string> = {
  page: "PAGE",
  component: "COMP",
  hook: "HOOK",
  service: "SVC",
  util: "UTIL",
  config: "CFG",
};

const NODE_TYPES: NodeTypes = {
  file: FileNode as any,
};

// ─── Build React Flow nodes & edges from mock data ────────────────────────────

function buildFlowNodes(
  visibleTypes: Set<GraphNode["type"]>,
  showDeadCode: boolean,
  showCycles: boolean
): Node[] {
  return MOCK_NODES.filter((n) => {
    if (!visibleTypes.has(n.type)) return false;
    if (n.isDeadCode && !showDeadCode) return false;
    return true;
  }).map((n) => ({
    id: n.id,
    type: "file",
    position: INITIAL_POSITIONS[n.id] ?? { x: 0, y: 0 },
    data: { ...n, visible: true },
    selectable: true,
    draggable: true,
  }));
}

function buildFlowEdges(
  visibleNodeIds: Set<string>,
  showCycles: boolean
): Edge[] {
  return MOCK_EDGES.filter((e) => {
    if (!visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)) return false;
    return true;
  }).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 10,
      height: 10,
      color: "#3F3F46",
    },
    style: {
      stroke: "#3F3F46",
      strokeWidth: 1.5,
    },
  }));
}

// ─── Auto Layout ─────────────────────────────────────────────────────────────

function getAutoLayoutPositions(nodes: Node[]): Record<string, { x: number; y: number }> {
  // Simple row-based auto layout grouped by node type order
  const typeOrder: GraphNode["type"][] = ["page", "component", "hook", "service", "util", "config"];
  const grouped: Record<string, Node[]> = {};
  typeOrder.forEach((t) => (grouped[t] = []));

  nodes.forEach((n) => {
    const t = (n.data as unknown as GraphNode).type;
    if (grouped[t]) grouped[t].push(n);
  });

  const result: Record<string, { x: number; y: number }> = {};
  let y = 60;

  typeOrder.forEach((t) => {
    const row = grouped[t];
    if (row.length === 0) return;
    const startX = 60;
    const gap = 240;
    row.forEach((node, i) => {
      result[node.id] = { x: startX + i * gap, y };
    });
    y += 180;
  });

  return result;
}

// ─── Main Canvas ──────────────────────────────────────────────────────────────

interface GraphCanvasProps {
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  visibleTypes: Set<GraphNode["type"]>;
  showDeadCode: boolean;
  showCycles: boolean;
  onZoomChange: (zoom: number) => void;
  resetKey: number;
  autoLayoutKey: number;
}

function GraphCanvasInner({
  selectedNodeId,
  onSelectNode,
  visibleTypes,
  showDeadCode,
  showCycles,
  onZoomChange,
  resetKey,
  autoLayoutKey,
}: GraphCanvasProps) {
  const { fitView, setCenter, getZoom, zoomTo } = useReactFlow();

  const initialNodes = useMemo(
    () => buildFlowNodes(visibleTypes, showDeadCode, showCycles),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const visibleNodeIds = useMemo(
    () => new Set(initialNodes.map((n) => n.id)),
    [initialNodes]
  );

  const initialEdges = useMemo(
    () => buildFlowEdges(visibleNodeIds, showCycles),
    [visibleNodeIds, showCycles]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Rebuild visible nodes when filters change
  useEffect(() => {
    const newNodes = buildFlowNodes(visibleTypes, showDeadCode, showCycles);
    setNodes((prev) => {
      const posMap: Record<string, { x: number; y: number }> = {};
      prev.forEach((n) => (posMap[n.id] = n.position));
      return newNodes.map((n) => ({
        ...n,
        position: posMap[n.id] ?? n.position,
      }));
    });
    const newVisibleIds = new Set(newNodes.map((n) => n.id));
    setEdges(buildFlowEdges(newVisibleIds, showCycles));
  }, [visibleTypes, showDeadCode, showCycles, setNodes, setEdges]);

  // Update selected node styling
  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => ({ ...n, selected: n.id === selectedNodeId }))
    );

    if (selectedNodeId) {
      const pos = nodes.find((n) => n.id === selectedNodeId)?.position;
      if (pos) {
        setCenter(pos.x + 100, pos.y + 60, { zoom: getZoom(), duration: 400 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  // Reset view
  useEffect(() => {
    if (resetKey > 0) fitView({ duration: 400, padding: 0.1 });
  }, [resetKey, fitView]);

  // Auto layout
  useEffect(() => {
    if (autoLayoutKey === 0) return;
    setNodes((prev) => {
      const positions = getAutoLayoutPositions(prev);
      return prev.map((n) => ({
        ...n,
        position: positions[n.id] ?? n.position,
      }));
    });
    setTimeout(() => fitView({ duration: 500, padding: 0.1 }), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLayoutKey]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  const onMoveEnd = useCallback(() => {
    onZoomChange(getZoom());
  }, [getZoom, onZoomChange]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onMoveEnd={onMoveEnd}
      nodeTypes={NODE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.12 }}
      minZoom={0.1}
      maxZoom={2.5}
      defaultEdgeOptions={{
        type: "smoothstep",
        style: { stroke: "#3F3F46", strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3F3F46",
        },
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#27272A"
        style={{ background: "var(--canvas)" }}
      />
      <Controls
        position="bottom-left"
        style={{ bottom: 16, left: 16 }}
        showInteractive={false}
      />
      <MiniMap
        position="bottom-right"
        style={{ bottom: 16, right: 16, width: 160, height: 100 }}
        nodeColor={(n) => {
          const t = (n.data as unknown as GraphNode)?.type;
          return t ? NODE_TYPE_META[t]?.color ?? "#52525B" : "#52525B";
        }}
        maskColor="rgba(0,0,0,0.4)"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}

// Wrap with ReactFlowProvider at the page level, but export the inner component
export default GraphCanvasInner;
