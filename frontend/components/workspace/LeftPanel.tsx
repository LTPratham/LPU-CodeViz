"use client";
import { useState } from "react";
import { MOCK_NODES, NODE_TYPE_META, type GraphNode } from "@/lib/mockGraphData";

interface LeftPanelProps {
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  visibleTypes: Set<GraphNode["type"]>;
  onToggleType: (t: GraphNode["type"]) => void;
  showDeadCode: boolean;
  onToggleDeadCode: () => void;
  showCycles: boolean;
  onToggleCycles: () => void;
  searchQuery: string;
}

const FILE_TREE: {
  label: string;
  icon: string;
  children: { label: string; nodeId?: string }[];
}[] = [
  {
    label: "app",
    icon: "📁",
    children: [
      { label: "page.tsx", nodeId: "page-home" },
      { label: "layout.tsx" },
      { label: "globals.css" },
      { label: "login/page.tsx", nodeId: "page-login" },
      { label: "visualize/page.tsx", nodeId: "page-visualize" },
      { label: "workspace/page.tsx", nodeId: "page-workspace" },
    ],
  },
  {
    label: "components",
    icon: "📦",
    children: [
      { label: "CodeEditor.tsx", nodeId: "comp-code-editor" },
      { label: "VisualCanvas.tsx", nodeId: "comp-visual-canvas" },
      { label: "ExplainSidebar.tsx", nodeId: "comp-explain-sidebar" },
      { label: "StepController.tsx", nodeId: "comp-step-controller" },
      { label: "TutorChat.tsx", nodeId: "comp-tutor-chat" },
      { label: "AlgorithmCatalog.tsx", nodeId: "comp-algo-catalog" },
    ],
  },
  {
    label: "components/workspace",
    icon: "📦",
    children: [
      { label: "TopToolbar.tsx", nodeId: "comp-toolbar" },
      { label: "LeftPanel.tsx", nodeId: "comp-left-panel" },
      { label: "GraphCanvas.tsx", nodeId: "comp-graph-canvas" },
      { label: "RightPanel.tsx", nodeId: "comp-right-panel" },
      { label: "StatusBar.tsx", nodeId: "comp-statusbar" },
    ],
  },
  {
    label: "lib",
    icon: "🔧",
    children: [
      { label: "api.ts", nodeId: "svc-api" },
      { label: "types.ts", nodeId: "util-types" },
      { label: "schools.ts", nodeId: "util-schools" },
      { label: "sampleCodes.ts", nodeId: "util-sample-codes" },
      { label: "mockGraphData.ts", nodeId: "lib-mockdata" },
      { label: "legacyTracer.ts", nodeId: "util-legacy-tracer" },
    ],
  },
];

const ALL_TYPES: GraphNode["type"][] = ["page", "component", "hook", "service", "util", "config"];

export default function LeftPanel({
  selectedNodeId,
  onSelectNode,
  visibleTypes,
  onToggleType,
  showDeadCode,
  onToggleDeadCode,
  showCycles,
  onToggleCycles,
  searchQuery,
}: LeftPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["tree", "layers", "filters"])
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["app", "components"])
  );

  const toggleSection = (s: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const toggleFolder = (f: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const filteredNodes = MOCK_NODES.filter(
    (n) =>
      searchQuery &&
      (n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.path.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Search results if any */}
      {searchQuery && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 0",
          }}
        >
          <div
            style={{
              padding: "6px 12px 4px",
              fontSize: 10,
              fontWeight: 600,
              color: "var(--muted-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Search Results ({filteredNodes.length})
          </div>
          {filteredNodes.map((n) => {
            const meta = NODE_TYPE_META[n.type];
            return (
              <div
                key={n.id}
                className={`tree-item ${selectedNodeId === n.id ? "active" : ""}`}
                onClick={() => onSelectNode(n.id)}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: meta.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {n.label}
                </span>
                {n.isDeadCode && (
                  <span className="badge badge-amber" style={{ fontSize: 9 }}>dead</span>
                )}
              </div>
            );
          })}
          {filteredNodes.length === 0 && (
            <div style={{ padding: "12px", fontSize: 12, color: "var(--muted)" }}>
              No files match "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {!searchQuery && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Repository Tree */}
          <div className="panel-section">
            <div
              className="panel-section-header"
              onClick={() => toggleSection("tree")}
              id="left-panel-tree-header"
            >
              <span>Repository</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: expandedSections.has("tree") ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {expandedSections.has("tree") && (
              <div className="panel-section-body">
                {FILE_TREE.map((folder) => (
                  <div key={folder.label}>
                    <div
                      className="tree-item"
                      onClick={() => toggleFolder(folder.label)}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{
                          transform: expandedFolders.has(folder.label)
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 150ms ease",
                          flexShrink: 0,
                        }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span style={{ fontSize: 12 }}>{folder.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 12, color: "var(--text)" }}>
                        {folder.label}
                      </span>
                    </div>

                    {expandedFolders.has(folder.label) &&
                      folder.children.map((child) => {
                        const isSelected = child.nodeId && selectedNodeId === child.nodeId;
                        const node = child.nodeId
                          ? MOCK_NODES.find((n) => n.id === child.nodeId)
                          : null;
                        return (
                          <div
                            key={child.label}
                            className={`tree-item tree-item-indent-2 ${isSelected ? "active" : ""}`}
                            onClick={() => child.nodeId && onSelectNode(child.nodeId)}
                            style={{ cursor: child.nodeId ? "pointer" : "default" }}
                          >
                            <span style={{ fontSize: 12, color: "var(--muted-dim)" }}>
                              {child.label.endsWith(".tsx")
                                ? "⚛"
                                : child.label.endsWith(".ts")
                                ? "🔷"
                                : child.label.endsWith(".css")
                                ? "🎨"
                                : "📄"}
                            </span>
                            <span
                              style={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: 12,
                              }}
                            >
                              {child.label}
                            </span>
                            {node?.isDeadCode && (
                              <span
                                className="badge badge-amber"
                                style={{ fontSize: 9, padding: "1px 5px" }}
                              >
                                dead
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Graph Layers */}
          <div className="panel-section">
            <div
              className="panel-section-header"
              onClick={() => toggleSection("layers")}
              id="left-panel-layers-header"
            >
              <span>Graph Layers</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: expandedSections.has("layers") ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {expandedSections.has("layers") && (
              <div style={{ padding: "4px 0" }}>
                {ALL_TYPES.map((t) => {
                  const meta = NODE_TYPE_META[t];
                  const isOn = visibleTypes.has(t);
                  return (
                    <div
                      key={t}
                      className="toggle-row"
                      onClick={() => onToggleType(t)}
                      id={`left-panel-layer-${t}`}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: meta.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 12 }}>{meta.label}s</span>
                      </div>
                      <div className={`toggle ${isOn ? "on" : ""}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="panel-section">
            <div
              className="panel-section-header"
              onClick={() => toggleSection("filters")}
              id="left-panel-filters-header"
            >
              <span>Quick Filters</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: expandedSections.has("filters") ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {expandedSections.has("filters") && (
              <div style={{ padding: "4px 0" }}>
                <div className="toggle-row" onClick={onToggleDeadCode} id="filter-dead-code">
                  <span style={{ fontSize: 12 }}>Show Dead Code</span>
                  <div className={`toggle ${showDeadCode ? "on" : ""}`} />
                </div>
                <div className="toggle-row" onClick={onToggleCycles} id="filter-cycles">
                  <span style={{ fontSize: 12 }}>Show Cycles</span>
                  <div className={`toggle ${showCycles ? "on" : ""}`} />
                </div>
                <div className="toggle-row" id="filter-external" style={{ opacity: 0.5 }}>
                  <span style={{ fontSize: 12 }}>Show External Deps</span>
                  <div className="toggle" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
