"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { getSchoolConfig } from "../lib/schools";

const FLOATING_SNIPPETS = [
  { code: "arr[j] > arr[j+1]", x: "8%", y: "20%", delay: 0 },
  { code: "fibonacci(n-1)", x: "75%", y: "15%", delay: 0.5 },
  { code: "stack.push(val)", x: "85%", y: "60%", delay: 1 },
  { code: "SELECT * FROM", x: "5%", y: "70%", delay: 1.5 },
  { code: "node->next = NULL", x: "60%", y: "80%", delay: 0.8 },
];

const BUBBLE_SORT_STEPS = [
  {
    array: [5, 2, 8, 1, 4],
    activeLine: 1, // def bubble_sort(arr):
    compared: [],
    swapped: [],
    sorted: [],
    explanation: "Initialize array: [5, 2, 8, 1, 4] and start outer loop."
  },
  {
    array: [5, 2, 8, 1, 4],
    activeLine: 2, // for i in range(len(arr)):
    compared: [],
    swapped: [],
    sorted: [],
    explanation: "Start outer loop pass 1 (i = 0)."
  },
  {
    array: [5, 2, 8, 1, 4],
    activeLine: 3, // for j in range(len(arr)-i-1):
    compared: [0, 1],
    swapped: [],
    sorted: [],
    explanation: "Compare elements at index 0 (5) and index 1 (2)."
  },
  {
    array: [5, 2, 8, 1, 4],
    activeLine: 4, // if arr[j] > arr[j+1]:
    compared: [0, 1],
    swapped: [],
    sorted: [],
    explanation: "Since 5 > 2, swap condition is met."
  },
  {
    array: [2, 5, 8, 1, 4],
    activeLine: 5, // arr[j], arr[j+1] = arr[j+1], arr[j]
    compared: [],
    swapped: [0, 1],
    sorted: [],
    explanation: "Swapped 5 and 2. Array is now [2, 5, 8, 1, 4]."
  },
  {
    array: [2, 5, 8, 1, 4],
    activeLine: 3, // Next iteration j = 1
    compared: [1, 2],
    swapped: [],
    sorted: [],
    explanation: "Compare elements at index 1 (5) and index 2 (8)."
  },
  {
    array: [2, 5, 8, 1, 4],
    activeLine: 4,
    compared: [1, 2],
    swapped: [],
    sorted: [],
    explanation: "Since 5 < 8, no swap is required. Proceed."
  },
  {
    array: [2, 5, 8, 1, 4],
    activeLine: 3, // j = 2
    compared: [2, 3],
    swapped: [],
    sorted: [],
    explanation: "Compare elements at index 2 (8) and index 3 (1)."
  },
  {
    array: [2, 5, 8, 1, 4],
    activeLine: 4,
    compared: [2, 3],
    swapped: [],
    sorted: [],
    explanation: "Since 8 > 1, swap condition is met."
  },
  {
    array: [2, 5, 1, 8, 4],
    activeLine: 5,
    compared: [],
    swapped: [2, 3],
    sorted: [],
    explanation: "Swapped 8 and 1. Array is now [2, 5, 1, 8, 4]."
  },
  {
    array: [2, 5, 1, 8, 4],
    activeLine: 3, // j = 3
    compared: [3, 4],
    swapped: [],
    sorted: [],
    explanation: "Compare elements at index 3 (8) and index 4 (4)."
  },
  {
    array: [2, 5, 1, 8, 4],
    activeLine: 4,
    compared: [3, 4],
    swapped: [],
    sorted: [],
    explanation: "Since 8 > 4, swap condition is met."
  },
  {
    array: [2, 5, 1, 4, 8],
    activeLine: 5,
    compared: [],
    swapped: [3, 4],
    sorted: [4],
    explanation: "Swapped 8 and 4. The element 8 is now in its final sorted position."
  },
  {
    array: [2, 5, 1, 4, 8],
    activeLine: 2, // i = 1
    compared: [],
    swapped: [],
    sorted: [4],
    explanation: "Start outer loop pass 2 (i = 1). Checking remaining elements."
  },
  {
    array: [2, 5, 1, 4, 8],
    activeLine: 3, // j = 0
    compared: [0, 1],
    swapped: [],
    sorted: [4],
    explanation: "Compare elements at index 0 (2) and index 1 (5). In order."
  },
  {
    array: [2, 5, 1, 4, 8],
    activeLine: 3, // j = 1
    compared: [1, 2],
    swapped: [],
    sorted: [4],
    explanation: "Compare elements at index 1 (5) and index 2 (1)."
  },
  {
    array: [2, 1, 5, 4, 8],
    activeLine: 5,
    compared: [],
    swapped: [1, 2],
    sorted: [4],
    explanation: "Swapped 5 and 1. Array is now [2, 1, 5, 4, 8]."
  },
  {
    array: [2, 1, 5, 4, 8],
    activeLine: 3, // j = 2
    compared: [2, 3],
    swapped: [],
    sorted: [4],
    explanation: "Compare elements at index 2 (5) and index 3 (4)."
  },
  {
    array: [2, 1, 4, 5, 8],
    activeLine: 5,
    compared: [],
    swapped: [2, 3],
    sorted: [3, 4],
    explanation: "Swapped 5 and 4. Element 5 is now sorted."
  },
  {
    array: [2, 1, 4, 5, 8],
    activeLine: 2, // i = 2
    compared: [],
    swapped: [],
    sorted: [3, 4],
    explanation: "Start outer loop pass 3 (i = 2)."
  },
  {
    array: [2, 1, 4, 5, 8],
    activeLine: 3, // j = 0
    compared: [0, 1],
    swapped: [],
    sorted: [3, 4],
    explanation: "Compare elements at index 0 (2) and index 1 (1)."
  },
  {
    array: [1, 2, 4, 5, 8],
    activeLine: 5,
    compared: [],
    swapped: [0, 1],
    sorted: [2, 3, 4],
    explanation: "Swapped 2 and 1. Element 2 is now sorted."
  },
  {
    array: [1, 2, 4, 5, 8],
    activeLine: 0,
    compared: [],
    swapped: [],
    sorted: [0, 1, 2, 3, 4],
    explanation: "All passes complete. Array is fully sorted: [1, 2, 4, 5, 8]!"
  }
];

function LandingPageContent() {
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get("school");
  const [mounted, setMounted] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  // Mini Visualizer State
  const [stepIndex, setStepIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // How it works active step state
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percent = maxScroll > 0 ? scrolled / maxScroll : 0;
      setScrollPercentage(percent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mini visualizer autoplay timer
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % BUBBLE_SORT_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // Retrieve dynamic school config
  const schoolConfig = getSchoolConfig(schoolParam);
  const activeColor = schoolConfig.primaryColor;

  const currentStep = BUBBLE_SORT_STEPS[stepIndex];

  const handleStepForward = () => {
    setStepIndex((prev) => (prev + 1) % BUBBLE_SORT_STEPS.length);
    setIsAutoPlay(false);
  };

  const handleStepBack = () => {
    setStepIndex((prev) => (prev - 1 + BUBBLE_SORT_STEPS.length) % BUBBLE_SORT_STEPS.length);
    setIsAutoPlay(false);
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsAutoPlay(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        overflowX: "hidden",
      }}
    >
      {/* ── Dynamic Topbar ── */}
      <nav
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: 64,
          borderBottom: "1px solid var(--border)",
          borderRadius: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${activeColor}, #9A4BFF)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "white",
              boxShadow: `0 0 16px ${activeColor}40`,
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontWeight: 900,
              fontSize: 20,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: "-0.5px"
            }}
          >
            CodeCanvas
            <span style={{ 
              fontSize: 9, 
              background: `${activeColor}15`, 
              color: activeColor, 
              padding: "2px 8px", 
              borderRadius: 6, 
              border: `1px solid ${activeColor}30`,
              fontWeight: 800,
              letterSpacing: "0.8px",
              textTransform: "uppercase"
            }}>{schoolConfig.shortName}</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {schoolConfig.subjects.slice(0, 3).map((s) => (
            <span
              key={s.code}
              className="badge"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "10px",
                display: "inline-flex"
              }}
            >
              {s.code}
            </span>
          ))}
          <Link href={`/visualize?school=${schoolConfig.id}`} className="btn btn-primary" style={{ fontSize: 13, background: `linear-gradient(135deg, ${activeColor}, ${schoolConfig.primaryLight})`, boxShadow: `0 4px 14px ${activeColor}30` }}>
            Launch Visualizer →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          minHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 80px",
          overflow: "hidden",
        }}
      >
        {/* Layered vibrant theme gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${activeColor}18 0%, transparent 70%)`,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${schoolConfig.primaryGlow}15 0%, transparent 70%)`,
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        {/* Floating code snippets */}
        {mounted &&
          FLOATING_SNIPPETS.map((s, i) => (
            <div
              key={i}
              className="animate-float"
              style={{
                position: "absolute",
                left: s.x,
                top: s.y,
                background: "rgba(17, 22, 37, 0.4)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: activeColor,
                opacity: 0.5,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
              }}
            >
              {s.code}
            </div>
          ))}

        <div style={{
          width: "100%",
          maxWidth: "1240px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
          zIndex: 10,
          position: "relative"
        }} className="hero-grid">
          
          {/* Left Column: Copy & Actions */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            {/* Institution Badge */}
            <div
              className="badge animate-fade-in"
              style={{
                marginBottom: 20,
                fontSize: 11,
                padding: "6px 16px",
                background: `${activeColor}12`,
                color: activeColor,
                border: `1px solid ${activeColor}30`,
                borderRadius: "999px",
                fontWeight: 750,
                letterSpacing: "0.5px"
              }}
            >
              🎓 Customized Portal for LPU {schoolConfig.name}
            </div>

            {/* Dynamic Headline */}
            <h1
              className="animate-fade-up"
              style={{
                fontSize: "clamp(34px, 4vw, 58px)",
                fontWeight: 800,
                textAlign: "left",
                lineHeight: 1.15,
                marginBottom: 20,
                letterSpacing: "-1.5px",
                background: "linear-gradient(135deg, #FFFFFF 0%, #A0A0A0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              {schoolConfig.heroTitlePrefix}
              <span style={{
                background: `linear-gradient(135deg, ${activeColor}, #00F2FE)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>{schoolConfig.heroTitleHighlight}</span>
            </h1>

            {/* Sub headline */}
            <p
              className="animate-fade-up"
              style={{
                fontSize: "clamp(15px, 1.8vw, 17px)",
                color: "rgba(255, 255, 255, 0.7)",
                textAlign: "left",
                maxWidth: 600,
                marginBottom: 32,
                lineHeight: 1.65,
              }}
            >
              {schoolConfig.heroSub}
            </p>

            {/* CTA buttons */}
            <div
              className="animate-fade-up"
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 40
              }}
            >
              <Link
                href={`/visualize?school=${schoolConfig.id}`}
                className="btn btn-primary"
                style={{ 
                  padding: "14px 32px", 
                  fontSize: 15, 
                  borderRadius: "14px", 
                  background: `linear-gradient(135deg, ${activeColor}, ${schoolConfig.primaryLight})`,
                  color: "#000000",
                  fontWeight: 700,
                  boxShadow: `0 8px 24px ${activeColor}40`,
                }}
              >
                Start Visualizing Free
              </Link>
              <a
                href="#how-it-works"
                className="btn"
                style={{ 
                  padding: "14px 32px", 
                  fontSize: 15, 
                  borderRadius: "14px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  fontWeight: 600
                }}
              >
                See How It Works
              </a>
            </div>

            {/* Syllabus / Subject list strip */}
            <div
              className="animate-fade-up"
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              {schoolConfig.subjects.map((s) => (
                <div
                  key={s.code}
                  style={{
                    background: "rgba(17, 22, 37, 0.4)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                >
                  <span style={{ color: activeColor, fontWeight: 800, marginRight: 4 }}>{s.code}</span>{" "}
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Layered Premium Interactive Mini-Visualizer Viewport */}
          <div
            className="animate-fade-up"
            style={{
              width: "100%",
              position: "relative",
              aspectRatio: "16/11",
              zIndex: 5
            }}
          >
            {/* The main browser-frame mock */}
            <div
              className="glass"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 30px ${activeColor}10`,
                display: "flex",
                flexDirection: "column",
                background: "#03050a"
              }}
            >
              {/* Browser Header Bar */}
              <div
                style={{
                  height: 38,
                  background: "rgba(255, 255, 255, 0.02)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  justifyContent: "space-between"
                }}
              >
                {/* Dots */}
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                </div>
                {/* Simulated URL input */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    borderRadius: "6px",
                    padding: "2px 24px",
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.4)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  codecanvas.edu/visualizer/bubble_sort
                </div>
                <div style={{ width: 40 }} />
              </div>

              {/* Grid content split: editor on left, visualization bars on right */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
                
                {/* Editor Column */}
                <div style={{ borderRight: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", background: "#010204" }}>
                  <div style={{ padding: "8px 12px", background: "rgba(255, 255, 255, 0.01)", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>Editor Preview</span>
                    <span style={{ color: activeColor }}>Python</span>
                  </div>
                  
                  {/* Code Lines */}
                  <div style={{ flex: 1, padding: 14, fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: "1.7", overflowY: "auto" }}>
                    {[
                      "def bubble_sort(arr):",
                      "  for i in range(len(arr)):",
                      "    for j in range(len(arr)-i-1):",
                      "      if arr[j] > arr[j+1]:",
                      "        arr[j], arr[j+1] = arr[j+1], arr[j]"
                    ].map((line, idx) => {
                      const isCurrent = idx + 1 === currentStep.activeLine;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            background: isCurrent ? `${activeColor}15` : "transparent",
                            borderLeft: isCurrent ? `3px solid ${activeColor}` : "3px solid transparent",
                            paddingLeft: 6,
                            marginLeft: -6,
                            borderRadius: "0 4px 4px 0",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.15)", width: 18, userSelect: "none" }}>{idx + 1}</span>
                          <span style={{ color: isCurrent ? "#FFFFFF" : "rgba(255, 255, 255, 0.65)" }}>{line}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visualizer Column */}
                <div style={{ display: "flex", flexDirection: "column", background: "#04060c", padding: 12 }}>
                  <div style={{ padding: "0 0 8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>Visualizer Output</span>
                    <span style={{ color: "#FFF" }}>Step {stepIndex} / {BUBBLE_SORT_STEPS.length - 1}</span>
                  </div>

                  {/* Dynamic Render Bars */}
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "24px 12px 12px 12px", height: "140px" }}>
                    {currentStep.array.map((val, index) => {
                      const isCompared = (currentStep.compared as number[]).includes(index);
                      const isSwapped = (currentStep.swapped as number[]).includes(index);
                      const isSorted = (currentStep.sorted as number[]).includes(index);
                      
                      let barColor = "rgba(255, 255, 255, 0.12)";
                      let shadow = "none";
                      
                      if (isCompared) {
                        barColor = "#3B82F6"; // Blue comparing
                        shadow = "0 0 14px rgba(59, 130, 246, 0.4)";
                      } else if (isSwapped) {
                        barColor = "#EF4444"; // Red swap
                        shadow = "0 0 14px rgba(239, 68, 68, 0.4)";
                      } else if (isSorted) {
                        barColor = activeColor; // Green sorted
                        shadow = `0 0 14px ${activeColor}40`;
                      }

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "14%",
                            gap: 8,
                            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                          }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 800, color: (isCompared || isSwapped || isSorted) ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}>{val}</span>
                          <div
                            style={{
                              width: "100%",
                              height: `${val * 16}px`,
                              background: barColor,
                              boxShadow: shadow,
                              borderRadius: "4px 4px 0 0",
                              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                            }}
                          />
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>j={index}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visualizer Mini Controls */}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      paddingTop: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <button
                      onClick={handleStepBack}
                      className="btn"
                      style={{
                        padding: "6px 12px",
                        fontSize: 11,
                        background: "rgba(255, 255, 255, 0.04)",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 0.08)"
                      }}
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className="btn"
                      style={{
                        padding: "6px 14px",
                        fontSize: 11,
                        background: isAutoPlay ? "#ef4444" : activeColor,
                        color: isAutoPlay ? "#FFF" : "#000",
                        fontWeight: 700
                      }}
                    >
                      {isAutoPlay ? "⏸ Pause" : "▶ Autoplay"}
                    </button>

                    <button
                      onClick={handleStepForward}
                      className="btn btn-ghost"
                      style={{
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "#fff",
                      }}
                    >
                      Step
                    </button>

                    <button
                      onClick={handleReset}
                      className="btn-icon"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                      title="Reset trace"
                    >
                      ↺
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* OVERLAY WIDGET 1: Floating Telemetry Card (Bottom-Left) */}
            <div
              className="float-card animate-float"
              style={{
                position: "absolute",
                bottom: "-16px",
                left: "-28px",
                background: "rgba(8, 12, 24, 0.85)",
                backdropFilter: "blur(20px)",
                border: `1.5px solid rgba(255, 255, 255, 0.08)`,
                borderRadius: "14px",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                zIndex: 10,
                transition: "all 0.3s ease"
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${activeColor}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: activeColor,
                  fontWeight: 800
                }}
              >
                ⇄
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>TELEMETRY</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Swaps: <span style={{ color: "#EF4444" }}>{currentStep.swapped.length > 0 ? "1" : "0"}</span> &bull; Compares: <span style={{ color: "#3B82F6" }}>{currentStep.compared.length > 0 ? "1" : "0"}</span>
                </div>
              </div>
            </div>

            {/* OVERLAY WIDGET 2: AI Tutor chat bubble (Top-Right) */}
            <div
              className="animate-float"
              style={{
                position: "absolute",
                top: "-24px",
                right: "-24px",
                background: "rgba(11, 19, 32, 0.9)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${activeColor}40`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 15px ${activeColor}15`,
                borderRadius: "16px",
                padding: "12px 16px",
                maxWidth: "240px",
                zIndex: 10,
                animationDelay: "0.8s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, background: `${activeColor}20`, color: activeColor, padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>AI TUTOR</span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeColor, display: "inline-block" }} className="animate-pulse" />
              </div>
              <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.5, margin: 0 }}>
                "{currentStep.explanation}"
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── Section: Interactive How it Works Stepper ── */}
      <section
        id="how-it-works"
        style={{
          padding: "100px 24px",
          maxWidth: 1200,
          margin: "0 auto",
          borderTop: "1px solid var(--border)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <div className="badge" style={{ marginBottom: 16, fontSize: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            The Workflow
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 16, fontWeight: 850 }}>
            Four steps to <span style={{ color: activeColor }}>comprehending</span> logic
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>
            CodeCanvas automates code tracing and displays algorithms dynamically.
          </p>
        </div>

        {/* Stepper Header Selectors */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 800,
            margin: "0 auto 48px",
            position: "relative"
          }}
        >
          {/* Connector Line */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: 40,
              right: 40,
              height: 2,
              background: "rgba(255, 255, 255, 0.08)",
              zIndex: 1
            }}
          />
          {/* Active Connector Progress */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: 40,
              width: `${activeStep * 33.3}%`,
              height: 2,
              background: activeColor,
              zIndex: 2,
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          />

          {[
            { num: 1, label: "Input Code" },
            { num: 2, label: "Trace Generation" },
            { num: 3, label: "Simulation" },
            { num: 4, label: "AI Feedback" }
          ].map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 3,
                  cursor: "pointer",
                  width: 90
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    background: isCompleted || isActive ? (isActive ? "#FFFFFF" : activeColor) : "#111524",
                    color: isActive ? "#000" : (isCompleted ? "#000" : "rgba(255,255,255,0.4)"),
                    border: `1.5px solid ${isCompleted || isActive ? activeColor : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isActive ? `0 0 16px ${activeColor}40` : "none",
                    transition: "all 0.3s ease"
                  }}
                >
                  {step.num}
                </div>
                <span
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    color: isActive ? activeColor : (isCompleted ? "#FFF" : "rgba(255,255,255,0.4)"),
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stepper Content Slides */}
        <div
          className="glass"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            borderRadius: "16px",
            padding: 32,
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            minHeight: "180px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          {activeStep === 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Step 1: Write or Paste Your Code</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
                Write clean algorithms directly inside the Monaco-powered editor or select built-in templates covering array sorting, recursive Fibonacci sequences, dynamic queues, and relational SQL statements linked directly to your school syllabus.
              </p>
            </div>
          )}
          {activeStep === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Step 2: Automated AST Trace Parsing</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
                Our parser breaks down code blocks, tracing pointer links, dynamic array structures, and recursive loops. It constructs an execution stack sequence that tracks the changes of local scope variables across every loop iteration.
              </p>
            </div>
          )}
          {activeStep === 2 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Step 3: Play through Interactive Visual Animations</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
                Step forward or autoplay through transitions. Variable watchlists and console logs update simultaneously as visual elements (such as node links, swap arcs, stack towers, and binary grids) respond in real-time.
              </p>
            </div>
          )}
          {activeStep === 3 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Step 4: AI Tutor Explanations & Mock Exams</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
                Stuck on a specific execution loop? Query our line-level AI assistant which evaluates the code context to answer complexity, syntax, and logic queries instantly in plain English.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Features Custom Visualizers Grid ── */}
      <section
        id="features"
        style={{
          padding: "80px 24px 100px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="badge" style={{ marginBottom: 16, fontSize: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            School Specific Visualizers
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 16, fontWeight: 850 }}>
            Interactive dynamic algorithms, <span style={{ color: activeColor }}>animated</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 580, margin: "0 auto" }}>
            Each syllabus topic is fully trace-integrated with a custom visualizer canvas.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {schoolConfig.features.map((f, i) => (
            <div
              key={i}
              className="card glass"
              style={{
                padding: 32,
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "16px"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${activeColor}, transparent)`,
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${activeColor}15`,
                  border: `1px solid ${activeColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 20,
                  color: activeColor,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 750, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                {f.desc}
              </p>
              <span className="badge" style={{ fontSize: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {f.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing / Payment Portal Section ── */}
      <section
        id="pricing"
        style={{
          padding: "100px 24px",
          background: "rgba(11, 14, 23, 0.5)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="badge" style={{ marginBottom: 16, fontSize: 12, background: `${activeColor}15`, color: activeColor, border: `1px solid ${activeColor}30` }}>
              Flexible Student Plans
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 16, fontWeight: 850 }}>
              Upgrade to premium learning
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
              Get unlimited execution steps, live AI query assistant, and syllabus-linked mock exams.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {/* Free Plan */}
            <div className="glass" style={{ padding: "40px 32px", borderRadius: "20px", display: "flex", flexDirection: "column", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 750, marginBottom: 8 }}>Free Trial</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: 24 }}>Perfect for getting started</p>
              <div style={{ fontSize: "36px", fontWeight: 900, marginBottom: 32 }}>₹0 <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ semester</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <li>✓ 5 code traces per day</li>
                <li>✓ Standard speed visualization</li>
                <li>✓ Access to core visualizers</li>
                <li style={{ opacity: 0.5 }}>✗ Live AI Tutor query support</li>
                <li style={{ opacity: 0.5 }}>✗ Unlimited runtime history</li>
              </ul>
              <Link href={`/visualize?school=${schoolConfig.id}`} className="btn btn-ghost" style={{ marginTop: "auto", width: "100%", padding: "12px" }}>
                Use Free Version
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="glass" style={{ padding: "40px 32px", borderRadius: "20px", display: "flex", flexDirection: "column", border: `1px solid ${activeColor}50`, boxShadow: `0 0 32px ${activeColor}15`, position: "relative" }}>
              <div style={{ position: "absolute", top: "16px", right: "24px", background: activeColor, color: "#060913", fontSize: "10px", fontWeight: 800, padding: "4px 10px", borderRadius: "10px", textTransform: "uppercase" }}>Popular</div>
              <h3 style={{ fontSize: "20px", fontWeight: 750, marginBottom: 8 }}>Pro Plan</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: 24 }}>For active students</p>
              <div style={{ fontSize: "36px", fontWeight: 900, marginBottom: 32 }}>₹299 <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ semester</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <li>✓ Unlimited execution traces</li>
                <li>✓ 50 AI Tutor credits / day</li>
                <li>✓ Interactive step control buttons</li>
                <li>✓ Variable watch-list panel</li>
                <li>✓ Priority processing queue</li>
              </ul>
              <Link href={`/payment?plan=pro&school=${schoolConfig.id}`} className="btn btn-primary" style={{ marginTop: "auto", width: "100%", padding: "12px", background: `linear-gradient(135deg, ${activeColor}, ${schoolConfig.primaryLight})` }}>
                Upgrade to Pro
              </Link>
            </div>

            {/* Institutional Premium */}
            <div className="glass" style={{ padding: "40px 32px", borderRadius: "20px", display: "flex", flexDirection: "column", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 750, marginBottom: 8 }}>Premium Plus</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: 24 }}>The complete learning portal</p>
              <div style={{ fontSize: "36px", fontWeight: 900, marginBottom: 32 }}>₹499 <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ semester</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <li>✓ Everything in Pro</li>
                <li>✓ Unlimited AI Tutor responses</li>
                <li>✓ Full dynamic history storage</li>
                <li>✓ Code export & PDF reports</li>
                <li>✓ Mock syllabus exams & solutions</li>
              </ul>
              <Link href={`/payment?plan=premium&school=${schoolConfig.id}`} className="btn btn-ghost" style={{ marginTop: "auto", width: "100%", padding: "12px" }}>
                Get Premium Plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "48px 24px", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
        <p>© 2026 CodeCanvas LPU Portal. Built by Prathamesh Sawarkar.</p>
      </footer>
      <style jsx global>{`
        @media (max-width: 968px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center !important;
          }
          .hero-grid > div:first-child {
            align-items: center !important;
          }
          .hero-grid h1 {
            text-align: center !important;
          }
          .hero-grid p {
            text-align: center !important;
            margin: 0 auto 32px !important;
          }
          .hero-grid > div:first-child > div:last-child {
            justify-content: center !important;
          }
          .hero-grid > div:last-child {
            transform: none !important;
            max-width: 600px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#060913" }} />}>
      <LandingPageContent />
    </Suspense>
  );
}
