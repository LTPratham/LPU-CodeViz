"use client";
import type { TraceStep, VisualizationState } from "@/lib/types";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import ComplexityProfiler from "./visualizers/ComplexityProfiler";
import { exportAllStepsAsSVG } from "@/lib/exportAllSteps";
import GraphBuilder from "./visualizers/GraphBuilder";
import VisualizerErrorBoundary from "./VisualizerErrorBoundary";

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

interface TerminalOutputProps {
  currentOutput: string[];
  finalOutput: string[];
  language?: string;
}

function TerminalOutput({ currentOutput, finalOutput, language }: TerminalOutputProps) {
  const [showFull, setShowFull] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const linesToDisplay = showFull ? finalOutput : currentOutput;

  const filteredLines = linesToDisplay.filter(line => 
    line.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(linesToDisplay.join("\n"));
    alert("Output copied to clipboard!");
  };

  const getLanguageTip = () => {
    switch (language) {
      case "python":
        return `print("value")`;
      case "c":
      case "cpp":
        return `printf("value\\n");  // or std::cout << value << std::endl;`;
      case "java":
        return `System.out.println("value");`;
      case "sql":
        return `SELECT * FROM table;  // or SELECT value;`;
      default:
        return `print/printf statements`;
    }
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#090D16",
      borderRadius: 12,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    }}>
      {/* Terminal Title Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        background: "rgba(255, 255, 255, 0.03)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }}></div>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }}></div>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }}></div>
          <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-mono)", marginLeft: 8 }}>
            bash - console - {linesToDisplay.length} lines
          </span>
        </div>

        {/* Toolbar controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Mode Switcher */}
          <div style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 6,
            padding: 2,
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            <button
              onClick={() => setShowFull(false)}
              style={{
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                border: "none",
                background: !showFull ? "rgba(255,255,255,0.1)" : "transparent",
                color: !showFull ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer"
              }}
            >
              Current Step
            </button>
            <button
              onClick={() => setShowFull(true)}
              style={{
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                border: "none",
                background: showFull ? "rgba(255,255,255,0.1)" : "transparent",
                color: showFull ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer"
              }}
            >
              Full Program
            </button>
          </div>

          {/* Search box */}
          {linesToDisplay.length > 0 && (
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 10,
                color: "#fff",
                outline: "none",
                width: 100,
              }}
            />
          )}

          {/* Copy Button */}
          {linesToDisplay.length > 0 && (
            <button
              onClick={handleCopy}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              📋 Copy
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output Area */}
      <div style={{
        flex: 1,
        padding: 16,
        overflow: "auto",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        lineHeight: 1.6,
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
      }}>
        {linesToDisplay.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "rgba(255, 255, 255, 0.3)",
            textAlign: "center",
            padding: 32,
            gap: 12
          }}>
            <span style={{ fontSize: 24 }}>💻</span>
            <div>
              <p style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>No Output Generated</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                Write code that outputs to console using e.g. <code style={{ color: "var(--primary-light)", background: "rgba(255,255,255,0.05)", padding: "2px 4px", borderRadius: 4 }}>{getLanguageTip()}</code>
              </p>
            </div>
          </div>
        ) : filteredLines.length === 0 ? (
          <div style={{ color: "rgba(255, 255, 255, 0.3)", textAlign: "center", padding: 24 }}>
            No matches found for "{searchQuery}"
          </div>
        ) : (
          filteredLines.map((line, i) => (
            <div key={i} style={{ color: "#34D399", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.15)", userSelect: "none", minWidth: 20, textAlign: "right" }}>{i + 1}</span>
              <span style={{ color: "rgba(255, 255, 255, 0.4)", userSelect: "none" }}>&gt;</span>
              <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line}</span>
            </div>
          ))
        )}
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState<"visualizer" | "complexity" | "builder" | "output">("visualizer");
  const canvasRef = useRef<HTMLDivElement>(null);

  // All hooks must be called before any conditional returns.
  // isLoading guard is handled inside renderContent below.
  const ds = dataStructure.toLowerCase();
  const isGraph = ds.includes("graph") || (step && step.state && step.state.type === "graph");

  const currentOutput: string[] = (step?.state as any)?.output || [];
  const finalStep = steps[steps.length - 1];
  const finalOutput: string[] = (finalStep?.state as any)?.output || [];

  const handleExportSVG = () => {
    exportAllStepsAsSVG(steps, dataStructure, code, language);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingCanvas />;

    if (activeTab === "builder") {
      return <GraphBuilder onGenerateCode={onGenerateCode || (() => {})} />;
    }

    if (activeTab === "complexity") {
      return <ComplexityProfiler steps={steps} currentStepIdx={currentStepIdx} />;
    }

    if (activeTab === "output") {
      return (
        <TerminalOutput
          currentOutput={currentOutput}
          finalOutput={finalOutput}
          language={language}
        />
      );
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
    if (state.type === "recursion")   return <RecursionViz state={state} speed={speed} stepDescription={typeof step.description === "string" ? step.description : ""} stepCode={step.code || ""} />;
    if (state.type === "sqltable")    return <SqlTableViz state={state} speed={speed} />;
    if (state.type === "variables")   return <VariableBoard state={state} speed={speed} stepAction={step.action} stepDescription={typeof step.description === "string" ? step.description : ""} stepCode={step.code || ""} stepNum={step.stepNum} />;
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
          <button
            onClick={() => setActiveTab("output")}
            style={{
              padding: "0 12px",
              height: "100%",
              border: "none",
              background: activeTab === "output" ? "rgba(29,158,117,0.15)" : "transparent",
              color: activeTab === "output" ? "var(--primary-light)" : "var(--text-muted)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              borderBottom: activeTab === "output" ? "2px solid var(--primary)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            💻 Output {finalOutput.length > 0 && (
              <span style={{
                background: "rgba(255,255,255,0.1)",
                color: "var(--text-secondary)",
                padding: "1px 5px",
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 700
              }}>
                {finalOutput.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "visualizer" && steps.length > 0 && (
          <button
            onClick={handleExportSVG}
            title={`Export all ${steps.length} steps as a single SVG file for your lab record`}
            style={{
              background: "rgba(29,158,117,0.1)",
              border: "1px solid rgba(29,158,117,0.3)",
              color: "var(--primary-light)",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(29,158,117,0.25)";
              e.currentTarget.style.borderColor = "rgba(29,158,117,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(29,158,117,0.1)";
              e.currentTarget.style.borderColor = "rgba(29,158,117,0.3)";
            }}
          >
            📥 Download Lab Record SVG
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
          {typeof step.description === "string" ? step.description : JSON.stringify(step.description)}
        </div>
      )}

      {/* Main Content Area */}
      <div
        ref={canvasRef}
        style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px" }}
      >
        <div style={{ width: "100%", display: "flex", justifyContent: "center", flex: 1 }}>
          <VisualizerErrorBoundary key={dataStructure}>
            {renderContent()}
          </VisualizerErrorBoundary>
        </div>

        {/* Global Console Output */}
        {activeTab === "visualizer" && step && step.state && Array.isArray((step.state as any).output) && (step.state as any).output.length > 0 && (
          <div style={{ width: "100%", maxWidth: 600, marginTop: 24, flexShrink: 0, alignSelf: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, textAlign: "left" }}>
              Console Output
            </div>
            <div style={{
              background: "#0D1117",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.8,
              textAlign: "left",
            }}>
              {(step.state as any).output.map((line: string, i: number) => (
                <div
                  key={i}
                  style={{ color: "#22C55E" }}
                >
                  <span style={{ color: "#64748B", marginRight: 8 }}>{">"}</span>{line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

