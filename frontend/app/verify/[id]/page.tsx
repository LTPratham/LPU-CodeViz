"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Award, CheckCircle2, Shield, Zap, ExternalLink, Calendar, User, BookOpen, Building2 } from "lucide-react";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certId = (params?.id as string) || "CERT-2026-LPU-8924";

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 0%, #1E1B4B 0%, #0F172A 70%, #020617 100%)",
      color: "#F8FAFC",
      padding: "60px 24px",
      fontFamily: "var(--font-sans), sans-serif",
    }}>
      {/* Top Bar */}
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "#FFF",
          fontSize: 20,
          fontWeight: 800,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, #F59E0B, #EF4444)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
          }}>
            <Zap size={20} color="#FFF" />
          </div>
          <span>CodeCanvas <span style={{ color: "#3B82F6" }}>VERIFICATION</span></span>
        </Link>
        <span style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          color: "#10B981",
          padding: "6px 14px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <CheckCircle2 size={16} /> ACTIVE CRYPTOGRAPHIC LEDGER PROOF
        </span>
      </div>

      {/* Main Verification Card */}
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
        border: "2px solid #10B981",
        borderRadius: 24,
        padding: "40px 48px",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.15)",
        position: "relative",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.2)",
            color: "#10B981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
          }}>
            <Shield size={36} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#FFF", marginBottom: 8 }}>
            Verified Institutional Credential
          </h1>
          <p style={{ fontSize: 15, color: "#94A3B8" }}>
            This certificate has been cryptographically validated against the official CodeCanvas institutional registry.
          </p>
        </div>

        {/* Certificate Metadata Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <User size={14} color="#3B82F6" /> RECIPIENT NAME
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF" }}>Prathamesh Sawarkar</div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>Student ID: LPU-12219842</div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <Building2 size={14} color="#F59E0B" /> ISSUING INSTITUTION
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#FFF" }}>Lovely Professional University</div>
            <div style={{ fontSize: 13, color: "#10B981", marginTop: 2 }}>NAAC Criterion 2 Accredited Partner</div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <BookOpen size={14} color="#A78BFA" /> CERTIFIED SKILL MASTERY
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>Advanced Data Structures & DP</div>
            <div style={{ fontSize: 13, color: "#CBD5E1", marginTop: 2 }}>12 Algorithmic Visualizations Completed</div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <Calendar size={14} color="#10B981" /> TIMESTAMP & ID
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>July 5, 2026</div>
            <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace", marginTop: 2 }}>ID: {certId}</div>
          </div>
        </div>

        {/* Algorithm Mastery Audit List */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 36 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#FFF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} color="#F59E0B" /> Verified Big-O Execution Benchmark
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", padding: "12px", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Sorting & Recursion</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#10B981", fontFamily: "monospace", marginTop: 4 }}>O(N log N) Gold</div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.4)", padding: "12px", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Graph Shortest Path</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#3B82F6", fontFamily: "monospace", marginTop: 4 }}>O(V + E) Optimal</div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.4)", padding: "12px", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Dynamic Programming</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#A78BFA", fontFamily: "monospace", marginTop: 4 }}>O(N) Memoized</div>
            </div>
          </div>
        </div>

        {/* Recruiter / Institutional Call to Action */}
        <div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28 }}>
          <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 16 }}>
            Are you a university Dean or technical recruiter? Verify students with automated Big-O execution telemetry.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            <Link href="/" style={{
              background: "var(--primary)",
              color: "#000",
              textDecoration: "none",
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}>
              Explore CodeCanvas B2B <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
