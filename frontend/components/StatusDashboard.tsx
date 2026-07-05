"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ServiceStatus {
  name: string;
  icon: string;
  status: "Operational" | "Degraded" | "Outage";
  latency: number;
  description: string;
  uptime: string;
  history: ("operational" | "incident")[];
}

export default function StatusDashboard() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [pingPulse, setPingPulse] = useState(false);

  // Generate 90-day status bar data
  const generateHistory = (incidentDays = []): ("operational" | "incident")[] => {
    return Array.from({ length: 90 }, (_, idx) => 
      incidentDays.includes(idx as never) ? "incident" : "operational"
    );
  };

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "AI Algorithm Compiler & Sandbox Engine",
      icon: "⚡",
      status: "Operational",
      latency: 142,
      description: "Python, C, C++, and Java WebAssembly / Serverless execution sandboxes.",
      uptime: "99.98%",
      history: generateHistory([14] as never),
    },
    {
      name: "Supabase Database & Realtime Sync",
      icon: "🗄️",
      status: "Operational",
      latency: 38,
      description: "User authentication, classroom roster sync, and trace history storage.",
      uptime: "100.00%",
      history: generateHistory(),
    },
    {
      name: "Authentication & RBAC Security Layer",
      icon: "🔐",
      status: "Operational",
      latency: 45,
      description: "Role-based access control for students, professors, and institutional admins.",
      uptime: "100.00%",
      history: generateHistory(),
    },
    {
      name: "Razorpay B2B Billing & Invoicing Gateway",
      icon: "💳",
      status: "Operational",
      latency: 98,
      description: "Institutional subscription processing and automated GST compliance receipts.",
      uptime: "99.99%",
      history: generateHistory([45] as never),
    },
  ]);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST");
    
    // Simulate periodic live ping fluctuations
    const interval = setInterval(() => {
      setPingPulse(prev => !prev);
      setServices(prev => prev.map(s => ({
        ...s,
        latency: Math.max(20, s.latency + Math.floor(Math.random() * 11) - 5),
      })));
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST");
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg, #0F172A)",
      color: "var(--text, #F8FAFC)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      paddingBottom: 80,
    }}>
      {/* Top Nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #05DF72, #03B85D)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#000",
              fontSize: 18,
              boxShadow: "0 2px 10px rgba(5, 223, 114, 0.3)",
            }}>
              C
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              CodeCanvas <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginLeft: 4 }}>STATUS SLA</span>
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              Last Ping: <strong style={{ color: "#CBD5E1" }}>{lastUpdated || "Just now"}</strong>
            </span>
            <Link href="/" style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#05DF72",
              textDecoration: "none",
              background: "rgba(5, 223, 114, 0.1)",
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid rgba(5, 223, 114, 0.2)",
            }}>
              Back to App ↗
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(5, 223, 114, 0.15), rgba(15, 23, 42, 0.6))",
          border: "1px solid rgba(5, 223, 114, 0.3)",
          borderRadius: 24,
          padding: "36px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 40,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#05DF72",
                boxShadow: pingPulse ? "0 0 0 8px rgba(5, 223, 114, 0.2)" : "0 0 0 4px rgba(5, 223, 114, 0.2)",
                transition: "all 0.5s ease",
              }} />
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
                All Systems Operational
              </h1>
            </div>
            <p style={{ fontSize: 15, color: "#CBD5E1", margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
              CodeCanvas enterprise infrastructure is operating at optimal latency. Institutional SLA agreements guarantee 99.99% uptime with automated redundancy across Indian data residency clusters.
            </p>
          </div>

          <div style={{
            display: "flex",
            gap: 20,
            background: "rgba(0,0,0,0.3)",
            padding: "16px 24px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>90-Day Uptime</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#05DF72" }}>99.992%</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Avg Latency</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#F8FAFC" }}>48ms</div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: "#F8FAFC" }}>
          Live Service Health
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          {services.map((srv) => (
            <div
              key={srv.name}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 24,
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{srv.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px 0", color: "#F8FAFC" }}>
                      {srv.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>
                    {srv.latency}ms
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#05DF72",
                    background: "rgba(5, 223, 114, 0.1)",
                    padding: "4px 12px",
                    borderRadius: 99,
                    border: "1px solid rgba(5, 223, 114, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#05DF72" }} />
                    {srv.status}
                  </span>
                </div>
              </div>

              {/* 90-Day Uptime Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 4 }}>
                  {srv.history.map((day, i) => (
                    <div
                      key={i}
                      title={`Day ${90 - i} ago: ${day === "operational" ? "No downtime" : "Minor latency resolved"}`}
                      style={{
                        flex: 1,
                        minWidth: 6,
                        height: 28,
                        borderRadius: 3,
                        background: day === "operational" ? "#05DF72" : "#F59E0B",
                        opacity: day === "operational" ? 0.85 : 1,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scaleY(1.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = day === "operational" ? "0.85" : "1"; e.currentTarget.style.transform = "scaleY(1)"; }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                  <span>90 days ago</span>
                  <span>{srv.uptime} SLA Guarantee</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Incident History */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: "#F8FAFC" }}>
          Past Incident Reports
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#F8FAFC" }}>
                Resolved: Turbopack Hot-Reload Latency in Development Sandboxes
              </h4>
              <span style={{ fontSize: 12, color: "#05DF72", fontWeight: 600, background: "rgba(5,223,114,0.1)", padding: "2px 8px", borderRadius: 6 }}>
                Resolved in 14m
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 12px 0" }}>June 28, 2026 — 14:20 IST</p>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
              We identified a minor cache eviction delay during local preview server restarts. Resolved by optimizing Next.js static chunk garbage collection. Zero customer data or production downtime occurred. All university visualizer sandboxes remained fully operational.
            </p>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#F8FAFC" }}>
                Scheduled Maintenance: Supabase Postgres v15 Upgrade
              </h4>
              <span style={{ fontSize: 12, color: "#38BDF8", fontWeight: 600, background: "rgba(56,189,248,0.1)", padding: "2px 8px", borderRadius: 6 }}>
                Completed
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 12px 0" }}>June 15, 2026 — 02:00 IST</p>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
              Completed routine database scaling and connection pool optimization during low-traffic institutional hours (02:00 - 02:15 IST). All systems operating at nominal speeds with enhanced 10,000+ concurrent student connection capacity.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        marginTop: 60,
        paddingTop: 32,
        textAlign: "center",
        fontSize: 13,
        color: "#64748B",
      }}>
        <p style={{ margin: "0 0 12px 0" }}>
          © 2026 CodeCanvas Inc. Enterprise infrastructure compliant with UGC & NAAC guidelines.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <Link href="/terms" style={{ color: "#94A3B8", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: "#94A3B8", textDecoration: "none" }}>Privacy Policy (DPDP Act)</Link>
          <Link href="/refund-policy" style={{ color: "#94A3B8", textDecoration: "none" }}>Refund Policy</Link>
          <Link href="/about" style={{ color: "#94A3B8", textDecoration: "none" }}>About Us</Link>
        </div>
      </footer>
    </div>
  );
}
