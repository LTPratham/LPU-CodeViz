"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { getSchoolConfig } from "../lib/schools";

// ─── Feature Data ────────────────────────────────────────────────────────────

const WORKSPACE_FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    ),
    title: "Visual Dependency Graph",
    desc: "Explore your codebase as an interactive node graph. Pan, zoom, and drag nodes to understand architecture at a glance.",
    badge: "Canvas First",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Step-by-Step Code Tracer",
    desc: "Paste any C, C++, Python, or SQL algorithm and trace it line-by-line with animated data structure visualizations.",
    badge: "Algorithm Tracer",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "AI Code Insights",
    desc: "Get intelligent analysis — detect high coupling, circular dependencies, dead code, and complexity hotspots automatically.",
    badge: "AI Powered",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "LPU Syllabus Coverage",
    desc: "Every CSE101, INT101, CSE205, and INT301 topic has a built-in visualizer mapped directly to the LPU curriculum.",
    badge: "LPU Specific",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Open the Workspace",
    desc: "Launch the visual workspace — it opens instantly with your project's dependency graph pre-loaded.",
  },
  {
    step: "02",
    title: "Explore the Graph",
    desc: "Click any node to inspect its imports, exports, complexity, and AI-generated insights.",
  },
  {
    step: "03",
    title: "Trace & Understand",
    desc: "Paste any algorithm and step through it line-by-line with animated data structure rendering.",
  },
];

// ─── Mini Graph Preview ───────────────────────────────────────────────────────

function MiniGraphPreview() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>("page-vis");

  const nodes = [
    { id: "page-vis",  label: "visualize/page.tsx",  type: "page",      x: 90,  y: 36,  color: "#3B82F6" },
    { id: "comp-canvas", label: "VisualCanvas.tsx",  type: "component", x: 270, y: 10,  color: "#8B5CF6" },
    { id: "comp-editor", label: "CodeEditor.tsx",    type: "component", x: 270, y: 74,  color: "#8B5CF6" },
    { id: "svc-api",   label: "api.ts",              type: "service",   x: 440, y: 36,  color: "#10B981" },
    { id: "hook-vis",  label: "useVisualizer.ts",    type: "hook",      x: 440, y: 90,  color: "#F59E0B", cycle: true },
    { id: "util-types",label: "types.ts",            type: "util",      x: 600, y: 36,  color: "#6B7280" },
    { id: "page-home", label: "page.tsx",            type: "page",      x: 90,  y: 130, color: "#3B82F6" },
    { id: "comp-hero", label: "Hero.tsx",            type: "component", x: 270, y: 130, color: "#8B5CF6" },
    { id: "dead-util", label: "legacyTracer.ts",     type: "util",      x: 600, y: 120, color: "#6B7280", dead: true },
  ];

  const edges = [
    { from: "page-vis",  to: "comp-canvas" },
    { from: "page-vis",  to: "comp-editor" },
    { from: "page-vis",  to: "svc-api" },
    { from: "comp-canvas", to: "svc-api" },
    { from: "svc-api",   to: "hook-vis" },
    { from: "svc-api",   to: "util-types" },
    { from: "page-home", to: "comp-hero" },
  ];

  const getNode = (id: string) => nodes.find((n) => n.id === id)!;

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
          codecanvas.lpu.edu/workspace
        </div>
        {/* Toolbar mock */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ background: "#18181B", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#52525B", border: "1px solid #27272A" }}>
            LPU-CodeViz ▾
          </div>
          <div style={{ background: "#18181B", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#52525B", border: "1px solid #27272A" }}>
            🔍
          </div>
        </div>
      </div>

      {/* Workspace mock */}
      <div style={{ display: "flex", height: 280 }}>
        {/* Left panel mini */}
        <div
          style={{
            width: 110,
            borderRight: "1px solid #27272A",
            padding: "8px 0",
            fontSize: 10,
          }}
        >
          <div style={{ padding: "4px 8px", fontSize: 9, color: "#52525B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Layers
          </div>
          {[
            { label: "Pages",       color: "#3B82F6", on: true },
            { label: "Components",  color: "#8B5CF6", on: true },
            { label: "Hooks",       color: "#F59E0B", on: true },
            { label: "Services",    color: "#10B981", on: true },
            { label: "Utils",       color: "#6B7280", on: true },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", color: "#A1A1AA" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 9 }}>{l.label}</span>
              <span style={{ marginLeft: "auto", width: 16, height: 8, borderRadius: 4, background: l.on ? l.color : "#27272A" }} />
            </div>
          ))}
          <div style={{ height: 1, background: "#27272A", margin: "6px 0" }} />
          <div style={{ padding: "4px 8px", fontSize: 9, color: "#52525B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Filters
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", color: "#A1A1AA" }}>
            <span style={{ fontSize: 9 }}>Dead Code</span>
            <span style={{ marginLeft: "auto", width: 16, height: 8, borderRadius: 4, background: "#F59E0B" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", color: "#A1A1AA" }}>
            <span style={{ fontSize: 9 }}>Cycles</span>
            <span style={{ marginLeft: "auto", width: 16, height: 8, borderRadius: 4, background: "#3B82F6" }} />
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Dot grid */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#27272A" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Edges */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
          >
            {edges.map((e) => {
              const from = getNode(e.from);
              const to = getNode(e.to);
              if (!from || !to) return null;
              const isHighlighted =
                (hoveredNode === e.from || hoveredNode === e.to) ||
                (selectedNode === e.from || selectedNode === e.to);
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={from.x + 55}
                  y1={from.y + 14}
                  x2={to.x}
                  y2={to.y + 14}
                  stroke={isHighlighted ? "#3B82F6" : "#27272A"}
                  strokeWidth={isHighlighted ? 1.5 : 1}
                  strokeOpacity={isHighlighted ? 1 : 0.7}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((n) => {
            const isSelected = selectedNode === n.id;
            const isHovered = hoveredNode === n.id;
            return (
              <div
                key={n.id}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(isSelected ? null : n.id)}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y + 16,
                  width: 110,
                  background: isSelected ? "#18181B" : "#111113",
                  border: isSelected
                    ? "1.5px solid #3B82F6"
                    : (n as any).dead
                    ? "1px solid #F59E0B"
                    : (n as any).cycle
                    ? "1px solid #EF4444"
                    : "1px solid #27272A",
                  borderRadius: 5,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
                  transition: "all 100ms ease",
                }}
              >
                <div style={{ height: 2, background: n.color }} />
                <div style={{ padding: "5px 7px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: n.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontWeight: 600, color: "#FAFAFA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.label}
                    </span>
                    {(n as any).dead && (
                      <span style={{ fontSize: 8, color: "#F59E0B", marginLeft: "auto", background: "rgba(245,158,11,0.12)", padding: "0 3px", borderRadius: 2 }}>dead</span>
                    )}
                    {(n as any).cycle && (
                      <span style={{ fontSize: 8, color: "#EF4444", marginLeft: "auto", background: "rgba(239,68,68,0.12)", padding: "0 3px", borderRadius: 2 }}>cycle</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4, borderTop: "1px solid #1C1C1F", paddingTop: 4, marginTop: 2 }}>
                    <span style={{ fontSize: 8, background: "#18181B", padding: "1px 4px", borderRadius: 2, fontWeight: 600, color: n.color }}>
                      {n.type.toUpperCase().slice(0, 4)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Minimap */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 72,
              height: 44,
              background: "#111113",
              border: "1px solid #27272A",
              borderRadius: 4,
              overflow: "hidden",
              opacity: 0.8,
            }}
          >
            {nodes.map((n) => (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: n.x / 10,
                  top: n.y / 8,
                  width: 12,
                  height: 6,
                  background: n.color,
                  opacity: 0.5,
                  borderRadius: 1,
                }}
              />
            ))}
          </div>

          {/* Zoom controls */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              background: "#111113",
              border: "1px solid #27272A",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {["+", "−", "⊡"].map((sym) => (
              <div
                key={sym}
                style={{
                  width: 22,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#52525B",
                  borderBottom: sym !== "⊡" ? "1px solid #27272A" : "none",
                }}
              >
                {sym}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel mini */}
        <div style={{ width: 130, borderLeft: "1px solid #27272A", padding: "8px 0", overflow: "hidden" }}>
          {selectedNode ? (
            <>
              <div style={{ padding: "4px 10px 8px", borderBottom: "1px solid #27272A" }}>
                <div style={{ fontSize: 9, color: "#52525B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Inspector</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#FAFAFA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nodes.find((n) => n.id === selectedNode)?.label}
                </div>
                <div style={{ fontSize: 9, color: "#52525B", marginTop: 1 }}>Page Component</div>
              </div>
              <div style={{ padding: "6px 10px", borderBottom: "1px solid #27272A" }}>
                <div style={{ fontSize: 9, color: "#52525B", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Metrics</div>
                {[["Lines", "985"], ["Imports", "7"], ["Complexity", "9/10"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#A1A1AA", marginBottom: 2 }}>
                    <span>{k}</span>
                    <span style={{ fontWeight: 600, color: k === "Complexity" ? "#F59E0B" : "#FAFAFA" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "6px 10px" }}>
                <div style={{ fontSize: 9, color: "#52525B", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>AI Insights</div>
                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 3, padding: "4px 6px", fontSize: 9, color: "#FDE68A", lineHeight: 1.4 }}>
                  ⚠ High complexity detected. Consider splitting.
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "8px 10px", color: "#52525B", fontSize: 10, textAlign: "center" }}>
              Click a node to inspect
            </div>
          )}
        </div>
      </div>

      {/* Status bar mock */}
      <div
        style={{
          background: "#111113",
          borderTop: "1px solid #27272A",
          padding: "5px 12px",
          display: "flex",
          gap: 16,
          fontSize: 9,
          color: "#52525B",
        }}
      >
        <span>Nodes: <span style={{ color: "#FAFAFA" }}>30</span></span>
        <span>Edges: <span style={{ color: "#FAFAFA" }}>45</span></span>
        <span>Zoom: <span style={{ color: "#FAFAFA" }}>82%</span></span>
        <span>Selected: <span style={{ color: "#3B82F6" }}>1</span></span>
        <span style={{ marginLeft: "auto" }}>LPU CodeViz — Visual Workspace</span>
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
            CodeViz
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
            className="btn btn-ghost"
            style={{ fontSize: 13 }}
          >
            Algorithm Tracer
          </Link>
          <Link
            href="/workspace"
            className="btn btn-primary"
            style={{ fontSize: 13 }}
            id="nav-open-workspace"
          >
            Open Workspace
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        {/* Subtle background gradient — non-flashy */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, width: "100%", textAlign: "center" }}>
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
            Built for {schoolConfig.name} · LPU
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 60px)",
              fontWeight: 800,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: "var(--text)",
              marginBottom: 20,
            }}
          >
            Explore Your Code
            <br />
            <span style={{ color: "var(--primary)" }}>Architecture</span>
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "var(--muted)",
              maxWidth: 540,
              margin: "0 auto 36px",
              lineHeight: 1.65,
            }}
          >
            A professional visual workspace for code exploration. Trace algorithms,
            map dependencies, and understand structure — all in one place.
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
              href="/workspace"
              className="btn btn-primary"
              style={{ padding: "11px 28px", fontSize: 14, fontWeight: 600 }}
              id="hero-cta-workspace"
            >
              Open Workspace →
            </Link>
            <Link
              href={`/visualize?school=${schoolConfig.id}`}
              className="btn btn-ghost"
              style={{ padding: "11px 28px", fontSize: 14 }}
              id="hero-cta-tracer"
            >
              Algorithm Tracer
            </Link>
          </div>

          {/* Product preview */}
          <MiniGraphPreview />
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
            How it works
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            From zero to understanding in three steps.
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
            Everything you need to understand code
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            Purpose-built for {schoolConfig.name} students.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {WORKSPACE_FEATURES.map((f, i) => (
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
          Ready to explore your code?
        </h2>
        <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 32 }}>
          Open the workspace and understand your codebase in minutes.
        </p>
        <Link
          href="/workspace"
          className="btn btn-primary"
          style={{ padding: "12px 32px", fontSize: 15, fontWeight: 600 }}
          id="cta-bottom-workspace"
        >
          Open Workspace →
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
            Simple pricing
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            Start free. Upgrade when you need more.
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
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Free</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Get started</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
              ₹0 <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ semester</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)", flex: 1 }}>
              {["5 code traces / day", "Workspace access", "Core visualizers"].map((f) => (
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
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pro</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>For active students</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
              ₹299 <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ semester</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)", flex: 1 }}>
              {["Unlimited traces", "50 AI queries / day", "Variable watch-list", "Priority processing"].map((f) => (
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
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Premium</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Complete portal</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
              ₹499 <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ semester</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)", flex: 1 }}>
              {["Everything in Pro", "Unlimited AI queries", "Code export + PDF", "Mock syllabus exams"].map((f) => (
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
        <p>© 2026 LPU CodeViz. Built by Prathamesh Sawarkar.</p>
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
