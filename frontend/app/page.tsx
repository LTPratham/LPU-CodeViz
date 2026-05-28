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

function LandingPageContent() {
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get("school");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("pricing");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Retrieve dynamic school config
  const schoolConfig = getSchoolConfig(schoolParam);
  const activeColor = schoolConfig.primaryColor;

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
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 80px",
          overflow: "hidden",
        }}
      >
        {/* Dynamic theme gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${activeColor}12 0%, transparent 70%)`,
            filter: "blur(50px)",
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
            background: `radial-gradient(circle, ${schoolConfig.primaryGlow}08 0%, transparent 70%)`,
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
                background: "rgba(17, 22, 37, 0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: activeColor,
                opacity: 0.6,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
              }}
            >
              {s.code}
            </div>
          ))}

        {/* Institution Badge */}
        <div
          className="badge animate-fade-in"
          style={{
            marginBottom: 28,
            fontSize: 12,
            padding: "8px 20px",
            background: `${activeColor}15`,
            color: activeColor,
            border: `1px solid ${activeColor}30`,
            borderRadius: "999px",
            fontWeight: 700,
            letterSpacing: "0.5px"
          }}
        >
          🎓 Customized Portal for LPU {schoolConfig.name}
        </div>

        {/* Dynamic Headline */}
        <h1
          className="animate-fade-up"
          style={{
            fontSize: "clamp(38px, 6vw, 76px)",
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 1000,
            marginBottom: 24,
            letterSpacing: "-1.5px"
          }}
        >
          {schoolConfig.heroTitlePrefix}
          <span style={{
            background: `linear-gradient(135deg, ${activeColor}, #9F58FF)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>{schoolConfig.heroTitleHighlight}</span>
        </h1>

        {/* Sub headline */}
        <p
          className="animate-fade-up"
          style={{
            fontSize: "clamp(16px, 2.2vw, 21px)",
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: 760,
            marginBottom: 44,
            lineHeight: 1.7,
          }}
        >
          {schoolConfig.heroSub}
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href={`/visualize?school=${schoolConfig.id}`}
            className="btn btn-primary"
            style={{ 
              padding: "16px 40px", 
              fontSize: 16, 
              borderRadius: 14, 
              background: `linear-gradient(135deg, ${activeColor}, ${schoolConfig.primaryLight})`,
              boxShadow: `0 8px 24px ${activeColor}40`,
            }}
          >
            Start Visualizing Free
          </Link>
          <a
            href="#pricing"
            className="btn btn-ghost"
            style={{ padding: "16px 40px", fontSize: 16, borderRadius: 14 }}
          >
            View Student Plans
          </a>
        </div>

        {/* Syllabus / Subject list strip */}
        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            gap: 12,
            marginTop: 56,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {schoolConfig.subjects.map((s) => (
            <div
              key={s.code}
              style={{
                background: "rgba(17, 22, 37, 0.4)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "8px 18px",
                fontSize: 13,
                color: "var(--text-secondary)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              <span style={{ color: activeColor, fontWeight: 800, marginRight: 6 }}>{s.code}</span>{" "}
              {s.name}
            </div>
          ))}
        </div>

        {/* Showcase Image */}
        <div
          className="animate-fade-up"
          style={{
            marginTop: 64,
            width: "100%",
            maxWidth: 1000,
            background: "rgba(17, 22, 37, 0.4)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${activeColor}15`,
            padding: "8px"
          }}
        >
          <img
            src="/codecanvas_hero.png"
            alt="CodeCanvas Dashboard Visualizer"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 18,
              border: "1px solid rgba(255, 255, 255, 0.04)"
            }}
          />
        </div>
      </section>

      {/* ── Features Custom Visualizers Grid ── */}
      <section
        id="features"
        style={{
          padding: "100px 24px",
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
