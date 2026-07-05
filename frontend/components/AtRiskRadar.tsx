"use client";

import React, { useState } from "react";

interface AtRiskStudent {
  id: string;
  name: string;
  regNo: string;
  section: string;
  riskScore: number;
  riskLevel: "High Risk" | "Moderate Risk";
  conceptBlock: string;
  errorRatio: string;
  inactivity: string;
  aiDiagnosis: string;
  recommendedChallenge: string;
  email: string;
}

export default function AtRiskRadar() {
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "MODERATE">("ALL");
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState<AtRiskStudent | null>(null);
  const [selectedStudentForPractice, setSelectedStudentForPractice] = useState<AtRiskStudent | null>(null);
  const [emailBody, setEmailBody] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [students, setStudents] = useState<AtRiskStudent[]>([
    {
      id: "stu-1",
      name: "Aarav Sharma",
      regNo: "12204512",
      section: "K22EH",
      riskScore: 88,
      riskLevel: "High Risk",
      conceptBlock: "Recursion & Call Stack Overflow",
      errorRatio: "4.8 runtime errors per compile",
      inactivity: "Active today",
      aiDiagnosis: "Student attempted fibonacci(50) 14 times without base case memoization. High compilation frustration indicator detected in visualizer telemetry.",
      recommendedChallenge: "Memoization & Dynamic Programming Fundamentals",
      email: "aarav.sharma@lpu.co.in",
    },
    {
      id: "stu-2",
      name: "Rohan Mehta",
      regNo: "12208910",
      section: "K22EH",
      riskScore: 82,
      riskLevel: "High Risk",
      conceptBlock: "Pointers & Memory Allocation (C++)",
      errorRatio: "3.9 segfault errors per compile",
      inactivity: "2 days ago",
      aiDiagnosis: "Repeated segmentation fault on linked list reversal step 4. Student has not visualized memory address pointer arrows since Tuesday.",
      recommendedChallenge: "Step-by-Step Linked List Pointer Manipulation",
      email: "rohan.mehta@lpu.co.in",
    },
    {
      id: "stu-3",
      name: "Priya Patel",
      regNo: "12201145",
      section: "K22EH",
      riskScore: 64,
      riskLevel: "Moderate Risk",
      conceptBlock: "SQL JOIN & Subquery Optimization",
      errorRatio: "2.1 syntax errors per query",
      inactivity: "1 day ago",
      aiDiagnosis: "Confusing LEFT JOIN with INNER JOIN in employee departmental queries. Completed only 1 of 4 weekly lab milestones.",
      recommendedChallenge: "Visual SQL Relational Table Merging",
      email: "priya.patel@lpu.co.in",
    },
    {
      id: "stu-4",
      name: "Aditya Verma",
      regNo: "12205567",
      section: "K22EH",
      riskScore: 58,
      riskLevel: "Moderate Risk",
      conceptBlock: "Binary Search Tree Balancing",
      errorRatio: "1.8 infinite loop errors",
      inactivity: "6 days ago (Warning)",
      aiDiagnosis: "Inactivity alert: No sandbox login in 6 days. Last active session ended prematurely during AVL tree left-right rotation module.",
      recommendedChallenge: "AVL Tree Rotation Interactive Sandbox",
      email: "aditya.verma@lpu.co.in",
    },
  ]);

  const filteredStudents = students.filter(s => {
    if (filter === "HIGH") return s.riskLevel === "High Risk";
    if (filter === "MODERATE") return s.riskLevel === "Moderate Risk";
    return true;
  });

  const openEmailModal = (student: AtRiskStudent) => {
    setSelectedStudentForEmail(student);
    setEmailBody(
      `Hi ${student.name.split(" ")[0]},\n\n` +
      `I noticed through our CodeCanvas learning telemetry that you've been working hard on ${student.conceptBlock}, but ran into some challenging compile errors recently.\n\n` +
      `Don't worry—this is one of the trickier concepts in CSE101! I have assigned a guided interactive sandbox challenge ("${student.recommendedChallenge}") to your student dashboard.\n\n` +
      `If you'd like to step through the call stack together, feel free to drop by my cabin or reply to this email to set up a quick 1-on-1 visualizer walkthrough.\n\n` +
      `Best regards,\nProf. Prathamesh Sawarkar\nSchool of Computer Science & Engineering, LPU`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendEmail = () => {
    if (!selectedStudentForEmail) return;
    showToast(`✅ Intervention email dispatched to ${selectedStudentForEmail.name} and logged in NAAC mentoring records!`);
    setSelectedStudentForEmail(null);
  };

  const handleAssignPractice = (student: AtRiskStudent) => {
    showToast(`📌 Assigned "${student.recommendedChallenge}" to ${student.name}'s Student Dashboard!`);
    setSelectedStudentForPractice(null);
  };

  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 20,
      padding: 28,
      color: "#F8FAFC",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid #05DF72",
          borderRadius: 12,
          padding: "16px 24px",
          color: "#05DF72",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(5,223,114,0.3)",
          zIndex: 1000000,
          animation: "fadeInToast 0.3s ease",
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyItems: "space-between", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#F8FAFC" }}>
              AI Predictive At-Risk Student Radar
            </h2>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#F43F5E",
              background: "rgba(244, 63, 94, 0.15)",
              padding: "3px 10px",
              borderRadius: 99,
              border: "1px solid rgba(244, 63, 94, 0.3)",
            }}>
              4 Students Flagged
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
            Real-time AI telemetry analyzing sandbox syntax error ratios, recursion call-stack stalls, and topic inactivity to predict dropout or midterm failure risk before exams start.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", padding: 4, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["ALL", "HIGH", "MODERATE"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                background: filter === t ? "rgba(255,255,255,0.12)" : "transparent",
                color: filter === t ? "#FFF" : "#94A3B8",
                border: "none",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t === "ALL" ? "All Flagged (4)" : t === "HIGH" ? "High Risk (2)" : "Moderate Risk (2)"}
            </button>
          ))}
        </div>
      </div>

      {/* Students List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filteredStudents.map((stu) => (
          <div
            key={stu.id}
            style={{
              background: stu.riskLevel === "High Risk" ? "rgba(244, 63, 94, 0.04)" : "rgba(245, 158, 11, 0.04)",
              border: `1px solid ${stu.riskLevel === "High Risk" ? "rgba(244, 63, 94, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
              borderRadius: 16,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              transition: "all 0.2s",
            }}
          >
            {/* Top row: Name & Badges */}
            <div style={{ display: "flex", alignItems: "center", justifyItems: "space-between", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: stu.riskLevel === "High Risk" ? "rgba(244, 63, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  color: stu.riskLevel === "High Risk" ? "#F43F5E" : "#F59E0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                }}>
                  {stu.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 2px 0", color: "#F8FAFC" }}>
                    {stu.name} <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B", marginLeft: 6 }}>({stu.regNo} — {stu.section})</span>
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#94A3B8" }}>
                    <span>Struggling with: <strong style={{ color: "#E2E8F0" }}>{stu.conceptBlock}</strong></span>
                    <span>•</span>
                    <span>Status: <strong style={{ color: stu.inactivity.includes("Warning") ? "#F59E0B" : "#94A3B8" }}>{stu.inactivity}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "#94A3B8", background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                  ⚠️ {stu.errorRatio}
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: stu.riskLevel === "High Risk" ? "#F43F5E" : "#F59E0B",
                  background: stu.riskLevel === "High Risk" ? "rgba(244, 63, 94, 0.12)" : "rgba(245, 158, 11, 0.12)",
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: `1px solid ${stu.riskLevel === "High Risk" ? "rgba(244, 63, 94, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                }}>
                  {stu.riskScore}% Risk
                </span>
              </div>
            </div>

            {/* AI Diagnosis box */}
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 14,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: "#05DF72" }}>AI Telemetry Diagnosis: </strong>
                {stu.aiDiagnosis}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedStudentForPractice(stu)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#F8FAFC",
                  padding: "9px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              >
                📌 Assign Targeted Practice
              </button>

              <button
                onClick={() => openEmailModal(stu)}
                style={{
                  background: "linear-gradient(135deg, #05DF72, #03B85D)",
                  border: "none",
                  color: "#000",
                  padding: "9px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(5, 223, 114, 0.25)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                📧 Send AI Intervention Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Email Intervention Modal */}
      {selectedStudentForEmail && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 100000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20,
            width: "100%",
            maxWidth: 580,
            padding: 28,
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#F8FAFC" }}>
                📧 AI Supportive Intervention Email
              </h3>
              <button
                onClick={() => setSelectedStudentForEmail(null)}
                style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 16, fontSize: 13, color: "#94A3B8" }}>
              <div>To: <strong style={{ color: "#FFF" }}>{selectedStudentForEmail.name} ({selectedStudentForEmail.email})</strong></div>
              <div>Subject: <strong style={{ color: "#05DF72" }}>LPU CodeCanvas: Let&apos;s master {selectedStudentForEmail.conceptBlock} together!</strong></div>
            </div>

            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={10}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: 16,
                color: "#F8FAFC",
                fontSize: 13,
                lineHeight: 1.6,
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: 20,
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setSelectedStudentForEmail(null)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#94A3B8",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                style={{
                  background: "linear-gradient(135deg, #05DF72, #03B85D)",
                  border: "none",
                  color: "#000",
                  padding: "10px 22px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(5, 223, 114, 0.3)",
                }}
              >
                🚀 Dispatch Email & Log NAAC Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {selectedStudentForPractice && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 100000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20,
            width: "100%",
            maxWidth: 500,
            padding: 28,
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px 0", color: "#F8FAFC" }}>
              📌 Assign Remedial Visualizer Practice
            </h3>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 20px 0", lineHeight: 1.5 }}>
              You are assigning a customized algorithm visualizer exercise to <strong style={{ color: "#FFF" }}>{selectedStudentForPractice.name}</strong> to overcome their difficulties with <strong style={{ color: "#05DF72" }}>{selectedStudentForPractice.conceptBlock}</strong>.
            </p>

            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Assigned Module</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#05DF72" }}>{selectedStudentForPractice.recommendedChallenge}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Includes automated AI hints and visual memory step-through.</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setSelectedStudentForPractice(null)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#94A3B8",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignPractice(selectedStudentForPractice)}
                style={{
                  background: "linear-gradient(135deg, #05DF72, #03B85D)",
                  border: "none",
                  color: "#000",
                  padding: "10px 22px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(5, 223, 114, 0.3)",
                }}
              >
                ✅ Assign to Student Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
