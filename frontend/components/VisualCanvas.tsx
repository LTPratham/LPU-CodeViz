"use client";
import type { TraceStep, VisualizationState } from "@/lib/types";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import ComplexityProfiler from "./visualizers/ComplexityProfiler";
import GraphBuilder from "./visualizers/GraphBuilder";

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
  steps?: TraceStep[];
  currentStepIdx?: number;
  onGenerateCode?: (code: string) => void;
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

export default function VisualCanvas({
  step,
  dataStructure,
  speed = 1,
  isLoading = false,
  comparisons = 0,
  swaps = 0,
  code,
  language,
  isLastStep,
  steps = [],
  currentStepIdx = 0,
  onGenerateCode,
}: Props) {
  const [activeTab, setActiveTab] = useState<"visualizer" | "complexity" | "builder">("visualizer");
  const canvasRef = useRef<HTMLDivElement>(null);

  if (isLoading) return <LoadingCanvas />;

  const ds = dataStructure.toLowerCase();
  const isGraph = ds.includes("graph") || (step && step.state && step.state.type === "graph");
  const handleExportSVG = () => {
    if (!canvasRef.current) return;
    
    // Check if there is an active SVG element
    const svgEl = canvasRef.current.querySelector("svg");
    
    let source = "";
    
    if (svgEl) {
      // Direct SVG Export
      try {
        const serializer = new XMLSerializer();
        source = serializer.serializeToString(svgEl);
        
        if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
      } catch (err) {
        console.error("Failed to serialize SVG:", err);
      }
    }
    
    // Fallback to HTML foreignObject wrapper if no direct SVG found or serialization failed
    if (!source) {
      const htmlContent = canvasRef.current.innerHTML;
      const width = canvasRef.current.offsetWidth || 800;
      const height = canvasRef.current.offsetHeight || 600;
      
      // Grab all active CSS rules to preserve colors, themes, variables
      let styles = "";
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            const rules = Array.from(sheet.cssRules);
            styles += rules.map(rule => rule.cssText).join("\n");
          } catch (e) {
            // ignore cross-origin stylesheet access restriction
          }
        }
      } catch (e) {
        console.error("Failed to read stylesheets:", e);
      }
      
      // Parse the HTML string and serialize it to valid XHTML (escaping raw ampersands/entities)
      let xhtmlContent = "";
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        
        // XMLSerializer will correctly escape characters like ampersands & and self-close non-closing tags like img/br
        const serializer = new XMLSerializer();
        const wrapperDiv = doc.createElement("div");
        wrapperDiv.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        wrapperDiv.setAttribute("style", "width: 100%; height: 100%; color: var(--text); background: var(--bg); display: flex; align-items: flex-start; justify-content: center; overflow: auto; padding: 10px;");
        
        while (doc.body.firstChild) {
          wrapperDiv.appendChild(doc.body.firstChild);
        }
        
        xhtmlContent = serializer.serializeToString(wrapperDiv);
      } catch (err) {
        console.error("Failed to serialize HTML content to XHTML:", err);
        // Safe fallback escaping basic ampersands
        xhtmlContent = `
    <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; color: var(--text); background: var(--bg); display: flex; align-items: flex-start; justify-content: center; overflow: auto; padding: 10px;">
      ${htmlContent.replace(/&/g, "&amp;")}
    </div>
        `.trim();
      }
      
      source = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <style type="text/css">
    /* <![CDATA[ */
    ${styles}
    /* ]]> */
  </style>
  <foreignObject width="100%" height="100%">
    ${xhtmlContent}
  </foreignObject>
</svg>
      `.trim();
    }
    
    try {
      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `codeviz_${dataStructure || "visualization"}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } catch (err) {
      console.error("Failed to export SVG:", err);
      alert("Failed to export visualization.");
    }
  };

  const renderContent = () => {
    if (activeTab === "builder") {
      return <GraphBuilder onGenerateCode={onGenerateCode || (() => {})} />;
    }

    if (activeTab === "complexity") {
      return <ComplexityProfiler steps={steps} currentStepIdx={currentStepIdx} />;
    }

    // Default Visualizer
    if (!step) return <EmptyCanvas message="No visualization yet" />;
    const state = step.state as VisualizationState;
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
      {/* Tabs Header bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
        padding: "0 16px",
        height: 40,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 4, height: "100%", alignItems: "center" }}>
          <button
            onClick={() => setActiveTab("visualizer")}
            style={{
              padding: "0 12px",
              height: "100%",
              border: "none",
              background: activeTab === "visualizer" ? "rgba(29,158,117,0.15)" : "transparent",
              color: activeTab === "visualizer" ? "var(--primary-light)" : "var(--text-muted)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              borderBottom: activeTab === "visualizer" ? "2px solid var(--primary)" : "none",
            }}
          >
            👁️ Visualizer
          </button>
          <button
            onClick={() => setActiveTab("complexity")}
            style={{
              padding: "0 12px",
              height: "100%",
              border: "none",
              background: activeTab === "complexity" ? "rgba(29,158,117,0.15)" : "transparent",
              color: activeTab === "complexity" ? "var(--primary-light)" : "var(--text-muted)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              borderBottom: activeTab === "complexity" ? "2px solid var(--primary)" : "none",
            }}
          >
            📈 Complexity
          </button>
          {(isGraph || language === "python") && (
            <button
              onClick={() => setActiveTab("builder")}
              style={{
                padding: "0 12px",
                height: "100%",
                border: "none",
                background: activeTab === "builder" ? "rgba(29,158,117,0.15)" : "transparent",
                color: activeTab === "builder" ? "var(--primary-light)" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                borderBottom: activeTab === "builder" ? "2px solid var(--primary)" : "none",
              }}
            >
              ✏️ Graph Builder
            </button>
          )}
        </div>

        {activeTab === "visualizer" && step && (
          <button
            onClick={handleExportSVG}
            style={{
              background: "rgba(29,158,117,0.1)",
              border: "1px solid rgba(29,158,117,0.3)",
              color: "var(--primary-light)",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(29,158,117,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(29,158,117,0.1)";
            }}
          >
            📥 Export SVG
          </button>
        )}
      </div>

      {/* Step description banner (only shown for visualizer step contexts) */}
      {activeTab === "visualizer" && step && (
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
      )}

      {/* Main Content Area */}
      <div
        ref={canvasRef}
        style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center" }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

