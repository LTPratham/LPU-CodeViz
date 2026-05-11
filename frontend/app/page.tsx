"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: "▦",
    title: "Array & Sorting",
    desc: "Bubble, Selection, Insertion sort animated with swap arcs and comparison counters",
    badge: "CSE101 / CSE202",
    color: "#1D9E75",
  },
  {
    icon: "⊟",
    title: "Stack",
    desc: "LIFO push/pop with vertical tower animation — perfect for recursion understanding",
    badge: "CSE202",
    color: "#3B82F6",
  },
  {
    icon: "⊞",
    title: "Queue",
    desc: "FIFO enqueue/dequeue with sliding animation, front and rear pointers shown",
    badge: "CSE202",
    color: "#8B5CF6",
  },
  {
    icon: "⬡",
    title: "Linked List",
    desc: "Nodes with live pointer arrows — insert and delete with smooth reconnect animation",
    badge: "CSE202",
    color: "#F59E0B",
  },
  {
    icon: "⎇",
    title: "Binary Tree",
    desc: "BST with in-order, pre-order, post-order traversal animations and node highlighting",
    badge: "CSE202",
    color: "#22C55E",
  },
  {
    icon: "↩",
    title: "Recursion",
    desc: "Call stack visualization — each function call pushes a card, return pops it with value",
    badge: "CSE101 / INT108",
    color: "#EF4444",
  },
  {
    icon: "≋",
    title: "Sorting Algorithms",
    desc: "Watch algorithms sort in real-time with color-coded states and operation counts",
    badge: "CSE202",
    color: "#06B6D4",
  },
  {
    icon: "⊞",
    title: "SQL Tables",
    desc: "INSERT row animation, SELECT highlighting, WHERE filter fade-out, JOIN connections",
    badge: "INT306 / DBMS",
    color: "#F97316",
  },
];

const SUBJECTS = [
  { code: "CSE101", name: "C Programming" },
  { code: "INT108", name: "Python" },
  { code: "INT306", name: "DBMS / SQL" },
  { code: "CSE202", name: "Data Structures" },
];

const FLOATING_SNIPPETS = [
  { code: "arr[j] > arr[j+1]", x: "8%", y: "20%", delay: 0 },
  { code: "fibonacci(n-1)", x: "75%", y: "15%", delay: 0.5 },
  { code: "stack.push(val)", x: "85%", y: "60%", delay: 1 },
  { code: "SELECT * FROM", x: "5%", y: "70%", delay: 1.5 },
  { code: "node->next = NULL", x: "60%", y: "80%", delay: 0.8 },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        overflowX: "hidden",
      }}
    >
      {/* ── Topbar ── */}
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
          height: 60,
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
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "white",
              boxShadow: "0 0 12px var(--primary-glow)",
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 18,
              background: "linear-gradient(135deg, #fff, var(--primary-light))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LPU CodeViz
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {SUBJECTS.slice(0, 4).map((s) => (
            <span
              key={s.code}
              className="badge badge-primary"
              style={{ display: "none" }}
              data-desktop="true"
            >
              {s.code}
            </span>
          ))}
          <Link href="/visualize" className="btn btn-primary" style={{ fontSize: 13 }}>
            Try Free →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          overflow: "hidden",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Floating code snippets */}
        {mounted &&
          FLOATING_SNIPPETS.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y,
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "6px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--primary-light)",
                opacity: 0.5,
                animation: `float 4s ease-in-out ${s.delay}s infinite`,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {s.code}
            </div>
          ))}

        {/* LPU badge */}
        <div
          className="badge badge-primary animate-fade-in"
          style={{
            marginBottom: 24,
            fontSize: 12,
            padding: "6px 16px",
            animationDelay: "0.1s",
          }}
        >
          Built for LPU B.Tech Students
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up"
          style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 20,
            animationDelay: "0.15s",
          }}
        >
          Stop memorizing code.{" "}
          <span className="gradient-text">Start understanding it.</span>
        </h1>

        {/* Sub headline */}
        <p
          className="animate-fade-up"
          style={{
            fontSize: "clamp(16px, 2.5vw, 22px)",
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: 700,
            marginBottom: 40,
            lineHeight: 1.6,
            animationDelay: "0.25s",
          }}
        >
          Ace your mid-terms and practicals with step-by-step animated visualizers for{" "}
          <strong style={{ color: "var(--text)" }}>C, C++, Python, and SQL</strong>. 
          Includes plain-English line-by-line explanations and an AI tutor ready to answer all your "Why?" questions.
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.35s",
          }}
        >
          <Link
            href="/visualize"
            className="btn btn-primary animate-pulse-glow"
            style={{ padding: "14px 36px", fontSize: 16, borderRadius: 12 }}
          >
            Start Visualizing Free
          </Link>
          <a
            href="#features"
            className="btn btn-ghost"
            style={{ padding: "14px 36px", fontSize: 16, borderRadius: 12 }}
          >
            See How It Works
          </a>
        </div>

        {/* Subjects strip */}
        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            gap: 10,
            marginTop: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.45s",
          }}
        >
          {SUBJECTS.map((s) => (
            <div
              key={s.code}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>{s.code}</span>{" "}
              {s.name}
            </div>
          ))}
        </div>

        {/* Preview window */}
        <div
          className="animate-fade-up"
          style={{
            marginTop: 64,
            width: "100%",
            maxWidth: 900,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            animationDelay: "0.5s",
          }}
        >
          {/* Mock window chrome */}
          <div
            style={{
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#EF4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#F59E0B" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#22C55E" }} />
            <span style={{ marginLeft: 12, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              lpucodeviz.vercel.app/visualize
            </span>
          </div>

          {/* Mock layout preview */}
          <div style={{ display: "flex", height: 220 }}>
            {/* Code panel mock */}
            <div
              style={{
                width: "30%",
                borderRight: "1px solid var(--border)",
                padding: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                lineHeight: 1.8,
                color: "var(--text-muted)",
                overflow: "hidden",
              }}
            >
              <div style={{ color: "#569CD6" }}>void bubbleSort(</div>
              <div style={{ paddingLeft: 16, color: "#9CDCFE" }}>int arr[], int n)</div>
              <div>{"{"}</div>
              <div style={{ paddingLeft: 16, color: "#C586C0" }}>for (i = 0; i &lt; n; i++)</div>
              <div
                style={{
                  paddingLeft: 32,
                  background: "rgba(245,158,11,0.15)",
                  borderLeft: "2px solid #F59E0B",
                  color: "var(--highlight)",
                  paddingTop: 2,
                  paddingBottom: 2,
                }}
              >
                if (arr[j] &gt; arr[j+1])
              </div>
              <div style={{ paddingLeft: 48 }}>swap(arr, j, j+1);</div>
            </div>

            {/* Visual canvas mock */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 16,
              }}
            >
              {[64, 34, 25, 12, 22].map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    background:
                      i === 1
                        ? "rgba(245,158,11,0.2)"
                        : i === 2
                        ? "rgba(245,158,11,0.2)"
                        : i === 3
                        ? "rgba(34,197,94,0.15)"
                        : "var(--card-hover)",
                    border:
                      i === 1
                        ? "1px solid rgba(245,158,11,0.5)"
                        : i === 2
                        ? "1px solid rgba(245,158,11,0.5)"
                        : i === 3
                        ? "1px solid rgba(34,197,94,0.4)"
                        : "1px solid var(--border)",
                    color:
                      i === 1 || i === 2
                        ? "var(--highlight)"
                        : i === 3
                        ? "var(--success)"
                        : "var(--text)",
                    transform: i === 1 || i === 2 ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>

            {/* Sidebar mock */}
            <div
              style={{
                width: "25%",
                borderLeft: "1px solid var(--border)",
                padding: 16,
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              <div
                style={{
                  background: "var(--primary-glow)",
                  border: "1px solid var(--primary)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  marginBottom: 10,
                  color: "var(--primary-light)",
                }}
              >
                Comparing arr[1] and arr[2]
              </div>
              <div style={{ lineHeight: 1.7 }}>
                Since 34 &gt; 25, they need to be swapped to move the smaller value forward.
              </div>
              <div
                className="badge badge-amber"
                style={{ marginTop: 10, fontSize: 10 }}
              >
                Swap Operation
              </div>
            </div>
          </div>

          {/* Step controls mock */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "var(--bg-secondary)",
            }}
          >
            {["|◀", "◀", "▶", "▶|"].map((icon, i) => (
              <button
                key={i}
                className="btn-icon"
                style={{
                  background: i === 2 ? "var(--primary)" : undefined,
                  color: i === 2 ? "white" : undefined,
                  border: i === 2 ? "none" : undefined,
                  width: 32,
                  height: 32,
                }}
              >
                {icon}
              </button>
            ))}
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
              Step 3 / 14
            </span>
          </div>
        </div>
      </section>

      {/* ── Why I Built This ── */}
      <section
        style={{
          padding: "80px 24px",
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div className="badge badge-amber" style={{ marginBottom: 16, fontSize: 12 }}>
            The Motivation
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", marginBottom: 24 }}>
            Why I built LPU CodeViz
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.8, marginBottom: 20 }}>
            When I started coding, I realized many students struggle because they don't have any initial knowledge about how code actually executes in memory. Popular platforms like GeeksForGeeks are great, but they can be <strong style={{color: "var(--highlight)"}}>a bit tricky and overwhelming</strong> for beginners who just need to see exactly what each line does.
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.8 }}>
            I created this platform so LPU students can visually step through their C, C++, Python, and SQL programs. By seeing variables change, stacks pop, and arrays sort in real-time, learning becomes intuitive rather than intimidating.
          </p>
          <div style={{ marginTop: 24, fontStyle: "italic", color: "var(--text-muted)" }}>
            — Prathamesh Sawarkar
          </div>
        </div>
      </section>

      {/* ── Built for Curriculum ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", marginBottom: 16 }}>Perfectly Aligned with LPU Subjects</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>We took the syllabus and turned it into an interactive sandbox.</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            <div style={{ background: "var(--card)", padding: 32, borderRadius: 16, border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>INT108 - Python</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Visualize dictionaries, lists, loops, and OOP concepts exactly as they appear in memory.</p>
            </div>
            <div style={{ background: "var(--card)", padding: 32, borderRadius: 16, border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>CSE101 - C Prog</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Watch arrays and pointers update in real-time to master memory management.</p>
            </div>
            <div style={{ background: "var(--card)", padding: 32, borderRadius: 16, border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>INT306 - DBMS</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>See SQL queries visually join, filter, and modify tables step-by-step.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "80px 24px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", textAlign: "center", marginBottom: 64 }}>How LPU CodeViz Works</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", flexShrink: 0 }}>1</div>
              <div>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>Write or Paste Code</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6 }}>Use our built-in Monaco editor to write your code or select from our pre-loaded LPU syllabus examples. The environment feels exactly like VS Code.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", flexShrink: 0 }}>2</div>
              <div>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>AI Execution Engine</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6 }}>Click "Visualize". Our secure Python backend uses the Llama-3 model to trace your code line-by-line, determining exactly how variables and data structures change in memory.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", flexShrink: 0 }}>3</div>
              <div>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>Step-by-Step Animation</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6 }}>Watch your code come to life. Click "Next" to execute the next line. See nodes connect, stacks pop, and tables update while the AI Tutor explains the logic in simple English.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section
        id="features"
        style={{
          padding: "100px 24px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="badge badge-primary" style={{ marginBottom: 16, fontSize: 12 }}>
            8 Visualization Types
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>
            Every data structure, <span className="gradient-text">animated</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 560, margin: "0 auto" }}>
            From simple arrays to BST traversals — each concept gets its own custom animation engine
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: 24,
                animationDelay: `${i * 0.05}s`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${f.color}, transparent)`,
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 14,
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                {f.desc}
              </p>
              <span className="badge badge-primary" style={{ fontSize: 10 }}>
                {f.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        style={{
          padding: "80px 24px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", marginBottom: 12 }}>
              How it works
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
              Three steps to finally understanding your code
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 32,
            }}
          >
            {[
              {
                num: "01",
                title: "Paste or write your code",
                desc: "Use the built-in Monaco editor (same as VS Code) or pick from LPU exam sample codes for C, C++, Python, SQL.",
                icon: "📝",
              },
              {
                num: "02",
                title: "Click Visualize",
                desc: "Our AI analyzes your code, generates step-by-step execution states, and explains every line in plain English.",
                icon: "⚡",
              },
              {
                num: "03",
                title: "Step through and ask",
                desc: "Use play/pause controls to walk through each step. Ask the AI tutor anything — 'why n-1 here?' — get a real answer.",
                icon: "🎓",
              },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--primary-glow)",
                    border: "2px solid var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 28,
                  }}
                >
                  {step.icon}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginBottom: 8,
                    letterSpacing: "0.1em",
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎓</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>
            Stop copying. <span className="gradient-text">Start understanding.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>
            Built specifically for LPU students — covers every data structure topic in your
            CSE101, CSE202, and INT108 exams.
          </p>
          <Link
            href="/visualize"
            className="btn btn-primary animate-pulse-glow"
            style={{ padding: "16px 48px", fontSize: 18, borderRadius: 14 }}
          >
            Open Code Editor →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, color: "var(--primary)" }}>LPU CodeViz</span>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              — Built for LPU B.Tech Students
            </span>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
            Developed by Prathamesh Sawarkar | Reg ID: 12509401 | <a href="mailto:prathameshsawarkar1@gmail.com" style={{color: "var(--primary)"}}>prathameshsawarkar1@gmail.com</a>
          </div>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
          Powered by Groq AI · llama-3.3-70b-versatile
        </div>
      </footer>
    </div>
  );
}
