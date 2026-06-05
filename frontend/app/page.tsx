"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getSchoolConfig } from "../lib/schools";

// ─── Feature Data ────────────────────────────────────────────────────────────

const TRACER_FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "AI-Simulated Execution",
    desc: "Paste any C, C++, Python, Java, or SQL code. Our LLM-powered engine simulates memory line-by-line safety without server risks.",
    badge: "AI Powered",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "10+ Interactive Visualizers",
    desc: "Watch sorting bars swap, stacks pop, binary trees balance, and graph nodes light up dynamically as your code runs.",
    badge: "Canvas First",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Voice AI Tutor Sidebar",
    desc: "Stuck on a nested loop or pointer dereference? Click the floating AI tutor for explanations or trigger real voice guidance.",
    badge: "Smart Tutor",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: "LPU Syllabus Alignment",
    desc: "Includes pre-configured coding examples and visual challenges designed for CSE101, INT101, CSE205, and INT301 lab courses.",
    badge: "LPU Specific",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Select or Write Code",
    desc: "Choose from 20+ syllabus templates or write custom code in our VS Code-style editor with autocomplete.",
  },
  {
    step: "02",
    title: "Run Simulation",
    desc: "Hit 'Visualize' to generate trace states outlining line numbers, memory tables, and explanations.",
  },
  {
    step: "03",
    title: "Trace Line-by-Line",
    desc: "Click next or hit spacebar to step forward. Watch memory changes animate in real-time.",
  },
];

// ─── Interactive Algorithm Tracer Preview ───────────────────────────────────────

function MiniTracerPreview() {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      line: 3,
      explanation: "Starting inner sorting loop at j = 0. Comparing adjacent elements.",
      vars: { i: 0, j: 0, swapped: "False" },
      bars: [
        { value: 14, status: "default" },
        { value: 22, status: "default" },
        { value: 8, status: "default" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 4,
      explanation: "Comparing arr[j] (14) and arr[j+1] (22). Since 14 < 22, no swap is required.",
      vars: { i: 0, j: 0, swapped: "False" },
      bars: [
        { value: 14, status: "comparing" },
        { value: 22, status: "comparing" },
        { value: 8, status: "default" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 3,
      explanation: "Incrementing inner loop to index j = 1.",
      vars: { i: 0, j: 1, swapped: "False" },
      bars: [
        { value: 14, status: "default" },
        { value: 22, status: "default" },
        { value: 8, status: "default" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 4,
      explanation: "Comparing arr[1] (22) and arr[2] (8). Since 22 > 8, they must be swapped.",
      vars: { i: 0, j: 1, swapped: "False" },
      bars: [
        { value: 14, status: "default" },
        { value: 22, status: "comparing" },
        { value: 8, status: "comparing" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 5,
      explanation: "Swapping arr[1] and arr[2]. Value 22 shifts right, and swapped is set to True.",
      vars: { i: 0, j: 1, swapped: "True" },
      bars: [
        { value: 14, status: "default" },
        { value: 8, status: "active" },
        { value: 22, status: "active" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const currentStep = steps[stepIndex];

  return (
    <div
      style={{
        width: "100%",
        background: "#0F0F11",
        border: "1px solid #27272A",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "#111113",
          borderBottom: "1px solid #27272A",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#EF4444", "#F59E0B", "#22C55E"].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "#09090B",
            border: "1px solid #27272A",
            borderRadius: 4,
            padding: "3px 10px",
            fontSize: 10,
            color: "#52525B",
            fontFamily: "monospace",
          }}
        >
          codecanvas.lpu.edu/visualize
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ background: "#18181B", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#52525B", border: "1px solid #27272A" }}>
            Bubble Sort Demo ▾
          </div>
        </div>
      </div>

      {/* Editor & visualizer mock split */}
      <div style={{ display: "flex", height: 300, flexWrap: "wrap" }}>
        {/* Editor panel */}
        <div
          style={{
            flex: "1 1 240px",
            borderRight: "1px solid #27272A",
            padding: "12px",
            fontFamily: "monospace",
            fontSize: 11,
            background: "#09090B",
            color: "#A1A1AA",
            overflow: "hidden",
          }}
        >
          <div style={{ color: "#52525B", fontWeight: 700, textTransform: "uppercase", fontSize: 9, marginBottom: 8, letterSpacing: "0.05em" }}>
            bubble_sort.py
          </div>
          {[
            "def bubbleSort(arr):",
            "    n = len(arr)",
            "    for i in range(n):",
            "        for j in range(0, n-i-1):",
            "            if arr[j] > arr[j+1]:",
            "                arr[j], arr[j+1] = arr[j+1], arr[j]",
          ].map((line, idx) => {
            const isCurrent = idx + 1 === currentStep.line;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  background: isCurrent ? "rgba(59,130,246,0.12)" : "transparent",
                  color: isCurrent ? "#FAFAFA" : "#A1A1AA",
                  padding: "2px 4px",
                  borderRadius: 3,
                  borderLeft: isCurrent ? "3px solid #3B82F6" : "3px solid transparent",
                  transition: "all 150ms ease",
                }}
              >
                <span style={{ width: 16, color: "#52525B", userSelect: "none" }}>{idx + 1}</span>
                <span style={{ whiteSpace: "pre" }}>{line}</span>
              </div>
            );
          })}
        </div>

        {/* Visualizer canvas */}
        <div
          style={{
            flex: "1.2 1 280px",
            background: "#0F0F11",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: 180,
          }}
        >
          <div style={{ color: "#52525B", fontWeight: 700, textTransform: "uppercase", fontSize: 9, marginBottom: 8, letterSpacing: "0.05em" }}>
            Visual Canvas: Array
          </div>
          
          {/* Sorting bars */}
          <div style={{ display: "flex", alignContent: "flex-end", alignItems: "flex-end", gap: 10, flex: 1, justifyContent: "center", paddingBottom: 16 }}>
            {currentStep.bars.map((bar, idx) => {
              let barColor = "#27272A";
              if (bar.status === "comparing") barColor = "#3B82F6";
              if (bar.status === "active") barColor = "#22C55E";

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 24,
                      height: bar.value * 4,
                      background: barColor,
                      borderRadius: "4px 4px 0 0",
                      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: bar.status !== "default" ? "0 0 10px rgba(59,130,246,0.2)" : "none",
                    }}
                  />
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#52525B" }}>{bar.value}</span>
                </div>
              );
            })}
          </div>

          {/* Stepper control bar preview */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1C1C1F", paddingTop: 8, fontSize: 10, color: "#52525B" }}>
            <span>Step {stepIndex + 1} / 5</span>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: "#111113", padding: "2px 6px", borderRadius: 3, border: "1px solid #27272A" }}>Prev</span>
              <span style={{ background: "#111113", padding: "2px 6px", borderRadius: 3, border: "1px solid #27272A", color: "#FAFAFA" }}>Playing</span>
              <span style={{ background: "#111113", padding: "2px 6px", borderRadius: 3, border: "1px solid #27272A" }}>Next</span>
            </div>
          </div>
        </div>

        {/* AI Tutor Sidebar panel */}
        <div
          style={{
            flex: "1 1 220px",
            borderLeft: "1px solid #27272A",
            background: "#111113",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ color: "#52525B", fontWeight: 700, textTransform: "uppercase", fontSize: 9, marginBottom: 8, letterSpacing: "0.05em" }}>
            AI Tutor Explanation
          </div>
          <div style={{ fontSize: 11, color: "#A1A1AA", lineHeight: 1.5, flex: 1 }}>
            {currentStep.explanation}
          </div>
          
          <div style={{ borderTop: "1px solid #27272A", paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontSize: 8, color: "#52525B", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Variables Watch</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(currentStep.vars).map(([name, val]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 10 }}>
                  <span style={{ color: "#52525B" }}>{name}</span>
                  <span style={{ color: "#FAFAFA", fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPageContent() {
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get("school");
  const schoolConfig = getSchoolConfig(schoolParam);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", letterSpacing: "-0.3px" }}>
            CodeCanvas
          </span>
          <span
            style={{
              fontSize: 10,
              background: "var(--primary-dim)",
              color: "var(--primary)",
              padding: "2px 7px",
              borderRadius: 4,
              border: "1px solid var(--primary-border)",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            LPU
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link
            href={`/visualize?school=${schoolConfig.id}`}
            className="btn btn-primary"
            style={{ fontSize: 13 }}
            id="nav-open-tracer"
          >
            Launch Visualizer
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, width: "100%", textAlign: "center" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontSize: 12,
              color: "var(--muted)",
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--success)",
                display: "inline-block",
              }}
            />
            Curriculum Aligned for {schoolConfig.name} · LPU
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: "var(--text)",
              marginBottom: 20,
            }}
          >
            Visualize Your Code.
            <br />
            <span style={{ color: "var(--primary)" }}>Master Algorithms.</span>
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "var(--muted)",
              maxWidth: 580,
              margin: "0 auto 36px",
              lineHeight: 1.65,
            }}
          >
            Watch your variables change, stacks pop, and structures animate in real-time.
            An interactive sandbox with voice AI tutor explanations designed to make coding intuitive.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 56,
            }}
          >
            <Link
              href={`/visualize?school=${schoolConfig.id}`}
              className="btn btn-primary"
              style={{ padding: "11px 28px", fontSize: 14, fontWeight: 600 }}
              id="hero-cta-tracer"
            >
              Start Visualizing Free →
            </Link>
          </div>

          {/* Product preview */}
          <MiniTracerPreview />
        </div>
      </section>

      {/* ── How it Works ── */}
      <section
        style={{
          padding: "80px 24px",
          maxWidth: 900,
          margin: "0 auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 12 }}>
            How CodeCanvas Works
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            Go from syntax confusion to visual confidence in three steps.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
          }}
        >
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              style={{
                padding: "24px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--primary)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 12,
                  letterSpacing: "0.05em",
                }}
              >
                {step.step}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
                {step.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{
          padding: "80px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 12 }}>
            Purpose-Built for LPU Coding Learners
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            All the features you need to bridge the gap between code structure and mental models.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {TRACER_FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "24px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "var(--primary-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
                {f.title}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
                {f.desc}
              </p>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--muted)",
                  background: "var(--surface-2)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                }}
              >
                {f.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        style={{
          padding: "80px 24px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 3.5vw, 40px)",
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--text)",
          }}
        >
          Ready to see your code in motion?
        </h2>
        <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 32 }}>
          Launch the CodeCanvas algorithm sandbox and start simulating.
        </p>
        <Link
          href={`/visualize?school=${schoolConfig.id}`}
          className="btn btn-primary"
          style={{ padding: "12px 32px", fontSize: 15, fontWeight: 600 }}
          id="cta-bottom-visualizer"
        >
          Launch Visualizer →
        </Link>
      </section>

      {/* ── Pricing ── */}
      <section
        id="pricing"
        style={{
          padding: "80px 24px",
          borderTop: "1px solid var(--border)",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 12 }}>
            Simple Semester-Based Plans
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            Get started for free or upgrade to expand your daily runs and AI tutor access.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {/* Free */}
          <div
            style={{
              padding: "28px 24px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Free Sandbox</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Core visualizer access</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
              ₹0 <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ semester</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)", flex: 1 }}>
              {["5 traces / day", "Standard visual layouts", "Basic AI explanations"].map((f) => (
                <li key={f} style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--success)" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href={`/visualize?school=${schoolConfig.id}`} className="btn btn-ghost" style={{ textAlign: "center" }}>
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div
            style={{
              padding: "28px 24px",
              background: "var(--surface-1)",
              border: "1.5px solid var(--primary)",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "var(--primary)",
                color: "white",
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Popular
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pro Student</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Unlimited traces & variables</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
              ₹299 <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ semester</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)", flex: 1 }}>
              {["Unlimited code traces", "50 AI tutor queries / day", "Interactive graph builder", "Custom variables watchlist"].map((f) => (
                <li key={f} style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--success)" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/payment?plan=pro&school=${schoolConfig.id}`}
              className="btn btn-primary"
              style={{ textAlign: "center" }}
              id="pricing-pro-cta"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* Premium */}
          <div
            style={{
              padding: "28px 24px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Premium Guide</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Full AI capability</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
              ₹499 <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ semester</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)", flex: 1 }}>
              {["Everything in Pro", "Unlimited voice AI queries", "Vector SVG export", "Mock challenge assessments"].map((f) => (
                <li key={f} style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--success)" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href={`/payment?plan=premium&school=${schoolConfig.id}`} className="btn btn-ghost" style={{ textAlign: "center" }}>
              Get Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 24px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 12,
        }}
      >
        <p>© 2026 CodeCanvas. Built by Prathamesh Sawarkar.</p>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <LandingPageContent />
    </Suspense>
  );
}
