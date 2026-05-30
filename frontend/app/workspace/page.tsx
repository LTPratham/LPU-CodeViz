"use client";
import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { ReactFlowProvider } from "@xyflow/react";
import { MOCK_NODES, MOCK_EDGES, type GraphNode } from "@/lib/mockGraphData";

const TopToolbar   = dynamic(() => import("@/components/workspace/TopToolbar"),   { ssr: false });
const LeftPanel    = dynamic(() => import("@/components/workspace/LeftPanel"),    { ssr: false });
const GraphCanvas  = dynamic(() => import("@/components/workspace/GraphCanvas"),  { ssr: false });
const RightPanel   = dynamic(() => import("@/components/workspace/RightPanel"),   { ssr: false });
const StatusBar    = dynamic(() => import("@/components/workspace/StatusBar"),    { ssr: false });

const ALL_TYPES = new Set<GraphNode["type"]>(["page", "component", "hook", "service", "util", "config"]);

export default function WorkspacePage() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleTypes, setVisibleTypes] = useState<Set<GraphNode["type"]>>(new Set(ALL_TYPES));
  const [showDeadCode, setShowDeadCode] = useState(true);
  const [showCycles, setShowCycles] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [autoLayoutKey, setAutoLayoutKey] = useState(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setSearchQuery("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setLeftOpen(true);
        const searchInput = document.getElementById("toolbar-search") as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleType = useCallback((t: GraphNode["type"]) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }, []);

  // Compute visible node and edge counts for status bar
  const visibleNodes = MOCK_NODES.filter((n) => {
    if (!visibleTypes.has(n.type)) return false;
    if (n.isDeadCode && !showDeadCode) return false;
    return true;
  });
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = MOCK_EDGES.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );
  const selectedCount = selectedNodeId ? 1 : 0;

  return (
    <>
      {/* Mobile warning */}
      <div className="mobile-warning">
        <div style={{ fontSize: 32 }}>🖥️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
          Desktop Recommended
        </div>
        <div style={{ fontSize: 14, color: "var(--muted)", maxWidth: 280, textAlign: "center" }}>
          The CodeViz workspace is designed for desktop use. Please open this page on a larger screen for the full experience.
        </div>
        <a
          href="/"
          style={{
            marginTop: 8,
            padding: "10px 20px",
            background: "var(--primary)",
            color: "white",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Back to Home
        </a>
      </div>

      <div className="workspace-root">
        {/* Top Toolbar */}
        <Suspense fallback={<div style={{ height: "var(--toolbar-h)", background: "var(--panel)", borderBottom: "1px solid var(--border)" }} />}>
          <TopToolbar
            leftPanelOpen={leftOpen}
            onToggleLeft={() => setLeftOpen((v) => !v)}
            rightPanelOpen={rightOpen}
            onToggleRight={() => setRightOpen((v) => !v)}
            onResetLayout={() => setResetKey((k) => k + 1)}
            onAutoLayout={() => setAutoLayoutKey((k) => k + 1)}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            onSearchFocus={() => setLeftOpen(true)}
          />
        </Suspense>

        {/* Workspace Body */}
        <div className="workspace-body">
          {/* Left Panel */}
          <div
            className={`panel-left ${leftOpen ? "" : "collapsed"}`}
            style={{
              width: leftOpen ? "var(--left-panel-w)" : 0,
              minWidth: leftOpen ? "var(--left-panel-w)" : 0,
              overflow: "hidden",
              transition: "width 200ms ease, min-width 200ms ease",
            }}
          >
            <Suspense fallback={null}>
              <LeftPanel
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                visibleTypes={visibleTypes}
                onToggleType={toggleType}
                showDeadCode={showDeadCode}
                onToggleDeadCode={() => setShowDeadCode((v) => !v)}
                showCycles={showCycles}
                onToggleCycles={() => setShowCycles((v) => !v)}
                searchQuery={searchQuery}
              />
            </Suspense>
          </div>

          {/* Center Canvas */}
          <div className="canvas-center">
            <ReactFlowProvider>
              <Suspense
                fallback={
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--muted)",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        border: "2px solid var(--border)",
                        borderTopColor: "var(--primary)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span style={{ fontSize: 13 }}>Loading workspace…</span>
                  </div>
                }
              >
                <GraphCanvas
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  visibleTypes={visibleTypes}
                  showDeadCode={showDeadCode}
                  showCycles={showCycles}
                  onZoomChange={setZoom}
                  resetKey={resetKey}
                  autoLayoutKey={autoLayoutKey}
                />
              </Suspense>
            </ReactFlowProvider>
          </div>

          {/* Right Panel */}
          {rightOpen && (
            <div className="panel-right">
              {/* Panel header */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <span>{selectedNodeId ? "Inspector" : "Repository"}</span>
                {selectedNodeId && (
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--muted-dim)",
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 2,
                    }}
                    title="Clear selection"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Suspense fallback={null}>
                <RightPanel
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  totalNodes={visibleNodes.length}
                  totalEdges={visibleEdges.length}
                />
              </Suspense>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <Suspense fallback={null}>
          <StatusBar
            nodeCount={visibleNodes.length}
            edgeCount={visibleEdges.length}
            zoom={zoom}
            selectedCount={selectedCount}
          />
        </Suspense>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
