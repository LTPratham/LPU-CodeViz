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
  const [scrollPercentage, setScrollPercentage] = useState(0);

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

        <div style={{
          width: "100%",
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
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
                background: "rgba(255,255,255,0.03)",
                color: activeColor,
                border: "1px solid rgba(255,255,255,0.06)",
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
                fontSize: "clamp(32px, 3.8vw, 56px)",
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
                fontSize: "clamp(15px, 1.8vw, 18px)",
                color: "rgba(255, 255, 255, 0.6)",
                textAlign: "left",
                maxWidth: 600,
                marginBottom: 32,
                lineHeight: 1.6,
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
                className="btn"
                style={{ 
                  padding: "14px 32px", 
                  fontSize: 15, 
                  borderRadius: "14px", 
                  background: "#FFFFFF",
                  color: "#000000",
                  fontWeight: 700,
                  boxShadow: `0 8px 24px rgba(255, 255, 255, 0.1)`,
                }}
              >
                Start Visualizing Free
              </Link>
              <a
                href="#pricing"
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
                View Plans
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

          {/* Right Column: MacBook Mockup with Parallax Scroll Display */}
          <div
            className="animate-fade-up"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)",
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 5
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1200px) rotateY(-8deg) rotateX(4deg)";
            }}
          >
            {/* Laptop Screen Body */}
            <div style={{
              width: "100%",
              background: "linear-gradient(135deg, #161A26 0%, #0A0C12 100%)",
              padding: "12px 12px 14px",
              borderRadius: "20px 20px 4px 4px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${activeColor}10`,
              position: "relative"
            }}>
              {/* Webcam Notch / Camera Dot */}
              <div style={{
                position: "absolute",
                top: "4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#050608",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{
                  width: "2px",
                  height: "2px",
                  borderRadius: "50%",
                  background: "#4EECD6",
                  opacity: 0.8
                }} />
              </div>

              {/* Display Screen */}
              <div style={{
                width: "100%",
                aspectRatio: "16/10",
                background: "#05070F",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(0,0,0,0.5)"
              }}>
                {/* Scrollable Display Content (Image) */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(-${scrollPercentage * 42}%)`,
                  transition: "transform 0.15s cubic-bezier(0.1, 0.8, 0.3, 1)",
                  willChange: "transform"
                }}>
                  <img
                    src="/codecanvas_hero.png"
                    alt="CodeCanvas Dashboard Visualizer"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block"
                    }}
                  />
                </div>

                {/* Glass Sheen / Reflection Overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 45%, transparent 46%, transparent 100%)",
                  pointerEvents: "none",
                  zIndex: 2
                }} />
              </div>
            </div>

            {/* Laptop Base Plate */}
            <div style={{
              width: "106%",
              height: "10px",
              background: "linear-gradient(to bottom, #252B3E 0%, #11141E 50%, #07090D 100%)",
              borderRadius: "0 0 16px 16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
              position: "relative",
              zIndex: 6
            }}>
              {/* Display Opening Notch */}
              <div style={{
                width: "50px",
                height: "3px",
                background: "#07090D",
                margin: "0 auto",
                borderRadius: "0 0 4px 4px"
              }} />
            </div>

            {/* Ambient Shadow underneath Base */}
            <div style={{
              width: "90%",
              height: "12px",
              background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 80%)",
              position: "absolute",
              bottom: "-12px",
              zIndex: 1,
              pointerEvents: "none"
            }} />

          </div>

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
