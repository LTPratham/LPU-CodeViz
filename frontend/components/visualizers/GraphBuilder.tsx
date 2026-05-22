"use client";
import { useState, useRef, useMemo } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  weight?: number;
}

interface Props {
  onGenerateCode: (code: string) => void;
}

export default function GraphBuilder({ onGenerateCode }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isWeighted, setIsWeighted] = useState(false);
  const [isDirected, setIsDirected] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodeRadius = 20;

  // Save state to undo history
  const saveToHistory = (newNodes: Node[], newEdges: Edge[]) => {
    setHistory((prev) => [...prev, { nodes, edges }]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setHistory((prevHistory) => prevHistory.slice(0, -1));
  };

  const handleClear = () => {
    saveToHistory(nodes, edges);
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
  };

  // Click handler on SVG background to add node
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Generate node label (A, B, C...)
    const nextChar = String.fromCharCode(65 + (nodes.length % 26)) + (nodes.length >= 26 ? Math.floor(nodes.length / 26) : "");
    const newNode: Node = {
      id: nextChar,
      label: nextChar,
      x,
      y,
    };

    saveToHistory(nodes, edges);
    setNodes((prev) => [...prev, newNode]);
  };

  // Click on a node
  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectedNodeId === null) {
      setSelectedNodeId(nodeId);
    } else if (selectedNodeId === nodeId) {
      setSelectedNodeId(null); // Deselect
    } else {
      // Connect selectedNodeId to nodeId
      const alreadyConnected = edges.some(
        (edge) =>
          (edge.from === selectedNodeId && edge.to === nodeId) ||
          (!isDirected && edge.from === nodeId && edge.to === selectedNodeId)
      );

      if (!alreadyConnected) {
        saveToHistory(nodes, edges);
        const newEdge: Edge = {
          from: selectedNodeId,
          to: nodeId,
          weight: isWeighted ? 1 : undefined,
        };
        setEdges((prev) => [...prev, newEdge]);
      }
      setSelectedNodeId(null);
    }
  };

  // Double click node to delete it
  const handleNodeDoubleClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveToHistory(nodes, edges);
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((edge) => edge.from !== nodeId && edge.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Double click edge to edit weight or delete edge
  const handleEdgeDoubleClick = (from: string, to: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isWeighted) {
      // If unweighted, double click simply deletes the edge
      saveToHistory(nodes, edges);
      setEdges((prev) => prev.filter((edge) => !(edge.from === from && edge.to === to)));
      return;
    }

    const currentEdge = edges.find((edge) => edge.from === from && edge.to === to);
    if (!currentEdge) return;

    const res = prompt(`Enter weight for edge ${from} -> ${to} (leave empty to delete edge):`, String(currentEdge.weight ?? 1));
    saveToHistory(nodes, edges);

    if (res === null) return; // cancelled
    if (res.trim() === "") {
      // delete edge
      setEdges((prev) => prev.filter((edge) => !(edge.from === from && edge.to === to)));
    } else {
      const w = parseInt(res, 10);
      if (!isNaN(w)) {
        setEdges((prev) =>
          prev.map((edge) => (edge.from === from && edge.to === to ? { ...edge, weight: w } : edge))
        );
      }
    }
  };

  // Generate python adjacency list representation
  const handleGenerateClick = () => {
    if (nodes.length === 0) {
      alert("Please add some nodes to your graph first!");
      return;
    }

    let codeString = "";
    if (isWeighted) {
      codeString += `# Custom weighted graph generated via Visual Builder\ngraph = {\n`;
      nodes.forEach((node) => {
        const neighbors: Record<string, number> = {};
        edges.forEach((edge) => {
          if (edge.from === node.id) {
            neighbors[edge.to] = edge.weight ?? 1;
          }
          if (!isDirected && edge.to === node.id) {
            neighbors[edge.from] = edge.weight ?? 1;
          }
        });

        const entry = Object.entries(neighbors)
          .map(([k, v]) => `'${k}': ${v}`)
          .join(", ");
        codeString += `    '${node.id}': {${entry}},\n`;
      });
      codeString += `}\n\n`;
      codeString += `# Example algorithm call:\n# print(dijkstra(graph, '${nodes[0].id}', '${nodes[Math.min(nodes.length - 1, 4)].id}'))\n`;
    } else {
      codeString += `# Custom unweighted graph generated via Visual Builder\ngraph = {\n`;
      nodes.forEach((node) => {
        const neighbors: string[] = [];
        edges.forEach((edge) => {
          if (edge.from === node.id && !neighbors.includes(edge.to)) {
            neighbors.push(edge.to);
          }
          if (!isDirected && edge.to === node.id && !neighbors.includes(edge.from)) {
            neighbors.push(edge.from);
          }
        });

        const entry = neighbors.map((n) => `'${n}'`).join(", ");
        codeString += `    '${node.id}': [${entry}],\n`;
      });
      codeString += `}\n\n`;
      codeString += `# Example algorithm call:\n# print(bfs_traversal(graph, '${nodes[0].id}'))\n`;
    }

    onGenerateCode(codeString);
  };

  // Compute layout values for connections
  const computedEdges = useMemo(() => {
    return edges.map((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return null;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return null;

      const angle = Math.atan2(dy, dx);
      // Offset by nodeRadius
      const x1 = fromNode.x + Math.cos(angle) * nodeRadius;
      const y1 = fromNode.y + Math.sin(angle) * nodeRadius;
      const arrowOffset = isDirected ? 6 : 0;
      const x2 = toNode.x - Math.cos(angle) * (nodeRadius + arrowOffset);
      const y2 = toNode.y - Math.sin(angle) * (nodeRadius + arrowOffset);

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      // Perpendicular offset for weight labels
      const perpX = Math.sin(angle) * 10;
      const perpY = -Math.cos(angle) * 10;

      return {
        ...edge,
        x1, y1, x2, y2,
        labelX: midX + perpX,
        labelY: midY + perpY,
      };
    }).filter(Boolean);
  }, [edges, nodes, isDirected]);

  return (
    <div style={{ width: "100%", height: "100%", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Settings bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              checked={isWeighted}
              onChange={(e) => {
                setIsWeighted(e.target.checked);
                // convert existing edges weights if changing
                setEdges((prev) => prev.map((edge) => ({ ...edge, weight: e.target.checked ? 1 : undefined })));
              }}
            />
            Weighted
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              checked={isDirected}
              onChange={(e) => setIsDirected(e.target.checked)}
            />
            Directed
          </label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleUndo} disabled={history.length === 0} className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11, height: "auto" }}>
            Undo
          </button>
          <button onClick={handleClear} className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11, height: "auto" }}>
            Clear All
          </button>
          <button onClick={handleGenerateClick} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12, height: "auto" }}>
            ⚡ Generate Code
          </button>
        </div>
      </div>

      {/* Editor instructions banner */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, background: "rgba(255,255,255,0.02)", padding: 8, borderRadius: 6, border: "1px solid var(--border)" }}>
        💡 <strong>Instructions:</strong> Click empty canvas space to <strong>Add Node</strong>. Click node-to-node to <strong>Add Edge</strong>. Double-click any Node to delete it. Double-click Edge to edit weight or delete edge.
      </div>

      {/* SVG Canvas Area */}
      <div style={{ flex: 1, minHeight: 280, background: "rgba(17,24,39,0.4)", borderRadius: 12, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 600 350"
          onClick={handleSvgClick}
          style={{ cursor: "crosshair" }}
        >
          <defs>
            <marker
              id="arrow-builder"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 10 5 L 0 8 z" fill="var(--primary)" />
            </marker>
          </defs>

          {/* Render Connections */}
          {computedEdges.map((edge, idx) => {
            if (!edge) return null;
            return (
              <g key={`builder-edge-${edge.from}-${edge.to}-${idx}`}>
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={selectedNodeId === edge.from || selectedNodeId === edge.to ? "var(--primary-light)" : "#475569"}
                  strokeWidth={2}
                  markerEnd={isDirected ? "url(#arrow-builder)" : undefined}
                  style={{ cursor: "pointer" }}
                  onDoubleClick={(e) => handleEdgeDoubleClick(edge.from, edge.to, e)}
                >
                  <title>Double click to edit weight/delete</title>
                </line>
                {isWeighted && edge.weight !== undefined && (
                  <g
                    onDoubleClick={(e) => handleEdgeDoubleClick(edge.from, edge.to, e)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={edge.labelX - 10}
                      y={edge.labelY - 8}
                      width={20}
                      height={16}
                      rx={4}
                      fill="var(--card)"
                      stroke="var(--border)"
                      strokeWidth={1}
                    />
                    <text
                      x={edge.labelX}
                      y={edge.labelY}
                      fill="var(--text)"
                      fontSize={9}
                      fontWeight={700}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Vertices */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <g
                key={`builder-node-${node.id}`}
                onClick={(e) => handleNodeClick(node.id, e)}
                onDoubleClick={(e) => handleNodeDoubleClick(node.id, e)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={isSelected ? "rgba(29,158,117,0.3)" : "#1E293B"}
                  stroke={isSelected ? "var(--primary)" : "#475569"}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ filter: isSelected ? "drop-shadow(0 0 6px var(--primary))" : undefined }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  fill={isSelected ? "var(--primary-light)" : "var(--text)"}
                  fontSize={11}
                  fontWeight={800}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ userSelect: "none" }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
