"use client";
import type { TraceStep, VisualizationState } from "@/lib/types";
import dynamic from "next/dynamic";

// Lazy-load all visualizers (they use Framer Motion / SVG)
const ArrayViz     = dynamic(() => import("./visualizers/ArrayViz"),     { ssr: false });
const SortingViz   = dynamic(() => import("./visualizers/SortingViz"),   { ssr: false });
const StackViz     = dynamic(() => import("./visualizers/StackViz"),     { ssr: false });
const QueueViz     = dynamic(() => import("./visualizers/QueueViz"),     { ssr: false });
const LinkedListViz= dynamic(() => import("./visualizers/LinkedListViz"),{ ssr: false });
const TreeViz      = dynamic(() => import("./visualizers/TreeViz"),      { ssr: false });
const RecursionViz = dynamic(() => import("./visualizers/RecursionViz"), { ssr: false });
const SqlTableViz  = dynamic(() => import("./visualizers/SqlTableViz"),  { ssr: false });
const VariableBoard= dynamic(() => import("./visualizers/VariableBoard"),{ ssr: false });
const GraphViz     = dynamic(() => import("./visualizers/GraphViz"),     { ssr: false });

interface Props {
  step: TraceStep | null;
  dataStructure: string;
  speed?: number;
  isLoading?: boolean;
  comparisons?: number;
  swaps?: number;
  code?: string;
  language?: string;
  isLastStep?: boolean;
}

function EmptyCanvas({ message }: { message: string }) {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      color: "var(--text-muted)",
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "var(--card)",
        border: "2px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
      }}>
        ◈
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
          {message}
        </p>
        <p style={{ fontSize: 13 }}>Write or select code, then click Visualize</p>
      </div>
    </div>
  );
}

function LoadingCanvas() {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: "3px solid var(--border)",
        borderTop: "3px solid var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 600 }}>Analyzing code...</p>
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>AI is generating execution trace</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function isSortingCode(ds: string): boolean {
  return ["sorting", "bubblesort", "selectionsort", "insertionsort", "sort"].includes(
    ds.toLowerCase().replace(/[\s_-]/g, "")
  );
}

export default function VisualCanvas({ step, dataStructure, speed = 1, isLoading = false, comparisons = 0, swaps = 0, code, language, isLastStep }: Props) {
  if (isLoading) return <LoadingCanvas />;
  if (!step) return <EmptyCanvas message="No visualization yet" />;

  const state = step.state as VisualizationState;
  const ds = dataStructure.toLowerCase();

  const renderViz = () => {
    if (!state) return <EmptyCanvas message="No state data" />;

    // Route to correct visualizer based on dataStructure type
    if (language === "html" && isLastStep && code) {
      return (
        <div style={{ width: "100%", height: "100%", padding: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ marginBottom: 12, fontWeight: 700, color: "var(--primary)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Rendered Web Output
          </div>
          <iframe
            srcDoc={code}
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "#fff",
              width: "100%"
            }}
            title="HTML Output"
            sandbox="allow-scripts"
          />
        </div>
      );
    }
    
    if (ds.includes("sort") || isSortingCode(ds)) {
      if (state.type === "array") {
        return <SortingViz state={state} speed={speed} comparisons={comparisons} swaps={swaps} />;
      }
    }
    if (state.type === "array")       return <ArrayViz state={state} speed={speed} />;
    if (state.type === "stack")       return <StackViz state={state} speed={speed} />;
    if (state.type === "queue")       return <QueueViz state={state} speed={speed} />;
    if (state.type === "linkedlist")  return <LinkedListViz state={state} speed={speed} />;
    if (state.type === "binarytree")  return <TreeViz state={state} speed={speed} />;
    if (state.type === "recursion")   return <RecursionViz state={state} speed={speed} />;
    if (state.type === "sqltable")    return <SqlTableViz state={state} speed={speed} />;
    if (state.type === "variables")   return <VariableBoard state={state} speed={speed} />;
    if (state.type === "graph")       return <GraphViz state={state} speed={speed} />;

    const unknownState = state as unknown as { type: string };
    return <EmptyCanvas message={`Unknown type: ${unknownState.type}`} />;
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto", display: "flex", flexDirection: "column" }}>
      {/* Step description banner */}
      <div style={{
        padding: "10px 16px",
        background: "rgba(29,158,117,0.08)",
        borderBottom: "1px solid rgba(29,158,117,0.2)",
        fontSize: 13,
        color: "var(--primary-light)",
        fontWeight: 500,
        flexShrink: 0,
        minHeight: 40,
      }}>
        <span style={{ color: "var(--text-muted)", marginRight: 6 }}>Step {step.stepNum}:</span>
        {step.description}
      </div>

      {/* Visualizer */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        {renderViz()}
      </div>
    </div>
  );
}

