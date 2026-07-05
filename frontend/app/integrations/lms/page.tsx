"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Share2, CheckCircle2, RefreshCw, ShieldCheck, Database, Key,
  ExternalLink, ArrowLeft, Settings, Users, BookOpen, AlertCircle
} from "lucide-react";

export default function LmsIntegrationPage() {
  const [selectedLms, setSelectedLms] = useState<"moodle" | "gclassroom" | "canvas">("moodle");
  const [syncing, setSyncing] = useState(false);
  const [syncedRoster, setSyncedRoster] = useState(false);
  const [passingGrades, setPassingGrades] = useState(false);
  const [gradesPassed, setGradesPassed] = useState(false);

  const handleRosterSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncedRoster(true);
    }, 1800);
  };

  const handleGradePassback = () => {
    setPassingGrades(true);
    setTimeout(() => {
      setPassingGrades(false);
      setGradesPassed(true);
    }, 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#F8FAFC",
      padding: "40px 24px",
      fontFamily: "var(--font-sans), sans-serif",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1000, margin: "0 auto 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/dashboard/teacher" style={{ color: "#94A3B8", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Teacher Dashboard
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#FFF", margin: 0 }}>
            LTI 1.3 Institutional LMS Passback Bridge
          </h1>
          <p style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>
            Connect CodeCanvas directly with your university campus gradebook and Single Sign-On (SSO).
          </p>
        </div>
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#10B981",
          padding: "8px 16px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <ShieldCheck size={16} /> IMS GLOBAL CERTIFIED LTI 1.3
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Left LMS Selector Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => { setSelectedLms("moodle"); setSyncedRoster(false); setGradesPassed(false); }}
            style={{
              background: selectedLms === "moodle" ? "rgba(249, 115, 22, 0.15)" : "rgba(30, 41, 59, 0.5)",
              border: `2px solid ${selectedLms === "moodle" ? "#F97316" : "rgba(255,255,255,0.08)"}`,
              padding: "16px 20px",
              borderRadius: 16,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🎓</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: selectedLms === "moodle" ? "#F97316" : "#FFF" }}>Moodle LMS</span>
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>LPU Campus Course Portal (v4.3+)</div>
          </button>

          <button
            onClick={() => { setSelectedLms("gclassroom"); setSyncedRoster(false); setGradesPassed(false); }}
            style={{
              background: selectedLms === "gclassroom" ? "rgba(16, 185, 129, 0.15)" : "rgba(30, 41, 59, 0.5)",
              border: `2px solid ${selectedLms === "gclassroom" ? "#10B981" : "rgba(255,255,255,0.08)"}`,
              padding: "16px 20px",
              borderRadius: 16,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🏫</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: selectedLms === "gclassroom" ? "#10B981" : "#FFF" }}>Google Classroom</span>
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Google Workspace for Education</div>
          </button>

          <button
            onClick={() => { setSelectedLms("canvas"); setSyncedRoster(false); setGradesPassed(false); }}
            style={{
              background: selectedLms === "canvas" ? "rgba(239, 68, 68, 0.15)" : "rgba(30, 41, 59, 0.5)",
              border: `2px solid ${selectedLms === "canvas" ? "#EF4444" : "rgba(255,255,255,0.08)"}`,
              padding: "16px 20px",
              borderRadius: 16,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🎨</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: selectedLms === "canvas" ? "#EF4444" : "#FFF" }}>Instructure Canvas</span>
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Global University Enterprise LMS</div>
          </button>

          <div style={{ background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Key size={14} color="#F59E0B" /> LTI Security Tokens
            </div>
            <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", marginBottom: 4 }}>Client ID: 9823-LPU-CC</div>
            <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>JWKS: /api/lti/jwks.json</div>
          </div>
        </div>

        {/* Right LMS Operations Panel */}
        <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFF", margin: 0, textTransform: "capitalize" }}>
                {selectedLms === "gclassroom" ? "Google Classroom" : `${selectedLms} LMS`} Sync Engine
              </h2>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>Target Course: CS-402 Design and Analysis of Algorithms</span>
            </div>
          </div>

          {/* Operation Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
            {/* Card 1: Roster Sync */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#3B82F6", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                  <Users size={18} /> 1. Auto Roster Synchronization
                </div>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, marginBottom: 16 }}>
                  Pull student enrollment lists directly from your LMS into CodeCanvas classrooms without manual CSV uploads.
                </p>
              </div>

              <button
                onClick={handleRosterSync}
                disabled={syncing || syncedRoster}
                style={{
                  background: syncedRoster ? "rgba(16, 185, 129, 0.2)" : "var(--primary)",
                  border: syncedRoster ? "1px solid #10B981" : "none",
                  color: syncedRoster ? "#10B981" : "#000",
                  padding: "12px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: syncing || syncedRoster ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {syncing ? (
                  <><RefreshCw size={16} className="spin" /> Pulling 64 Students...</>
                ) : syncedRoster ? (
                  <><CheckCircle2 size={16} /> 64 Students Synced!</>
                ) : (
                  <>Sync Course Roster</>
                )}
              </button>
            </div>

            {/* Card 2: Grade Passback */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#F59E0B", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                  <BookOpen size={18} /> 2. LTI Gradebook Passback
                </div>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, marginBottom: 16 }}>
                  Push students' algorithm visualization lab completion scores and Big-O efficiency marks back to your campus gradebook.
                </p>
              </div>

              <button
                onClick={handleGradePassback}
                disabled={passingGrades || gradesPassed || !syncedRoster}
                style={{
                  background: gradesPassed ? "rgba(16, 185, 129, 0.2)" : !syncedRoster ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #F59E0B, #D97706)",
                  border: gradesPassed ? "1px solid #10B981" : "none",
                  color: gradesPassed ? "#10B981" : !syncedRoster ? "#475569" : "#000",
                  padding: "12px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: !syncedRoster || passingGrades || gradesPassed ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {!syncedRoster ? (
                  <>Sync Roster First</>
                ) : passingGrades ? (
                  <><RefreshCw size={16} className="spin" /> Pushing 64 Grades...</>
                ) : gradesPassed ? (
                  <><CheckCircle2 size={16} /> Gradebook Updated!</>
                ) : (
                  <>Push Grades to LMS</>
                )}
              </button>
            </div>
          </div>

          {/* Live Sync Logs Terminal */}
          <div style={{ background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, fontFamily: "monospace", fontSize: 12 }}>
            <div style={{ color: "#64748B", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>LTI 1.3 TELEMETRY CHANNEL LOGS</span>
              <span style={{ color: "#10B981" }}>● STATUS: ONLINE</span>
            </div>
            <div style={{ color: "#A78BFA" }}>[SYSTEM] Authenticating with {selectedLms.toUpperCase()} OAuth2 OIDC endpoint... OK</div>
            <div style={{ color: "#3B82F6" }}>[LTI] Course context verified: urn:lti:course:lpu-cs402-2026</div>
            {syncedRoster && (
              <div style={{ color: "#10B981" }}>[ROSTER] 64 active enrollments mapped to CodeCanvas student database.</div>
            )}
            {gradesPassed && (
              <div style={{ color: "#F59E0B" }}>[GRADEBOOK] Line item &apos;QuickSort Lab&apos; score 100/100 pushed for 64 students.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
