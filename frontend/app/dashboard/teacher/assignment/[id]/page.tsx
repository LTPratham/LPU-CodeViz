"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, Award, Calendar, ChevronDown, ChevronUp, Check,
  Edit2, Eye, ShieldCheck, Cpu
} from "lucide-react";
import { timeAgo } from "@/lib/dashboardUtils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  algorithm: string;
  lang: string;
  deadline: string;
  classroom: {
    name: string;
    course_code: string;
  };
}

interface Submission {
  id: string;
  student_id: string;
  code: string;
  steps_json: any[];
  explanation: string;
  ai_grade: number | null;
  ai_feedback: string | null;
  teacher_grade: number | null;
  submitted_at: string;
  student: {
    full_name: string | null;
    email: string | null;
  };
}

export default function AssignmentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  
  // Grade form state
  const [editingGradeSubId, setEditingGradeSubId] = useState<string | null>(null);
  const [inputGrade, setInputGrade] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch assignment details
    const { data: assignObj } = await supabase
      .from("assignments")
      .select(`
        *,
        classroom:classrooms (
          name,
          course_code
        )
      `)
      .eq("id", assignmentId)
      .single();

    if (!assignObj) {
      router.push("/dashboard/teacher");
      return;
    }
    setAssignment(assignObj as any);

    // Fetch submissions
    const { data: subsList } = await supabase
      .from("submissions")
      .select(`
        id,
        student_id,
        code,
        steps_json,
        explanation,
        ai_grade,
        ai_feedback,
        teacher_grade,
        submitted_at,
        student:profiles!submissions_student_id_fkey (
          full_name,
          email
        )
      `)
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });

    setSubmissions((subsList || []) as any);
    setLoading(false);
  }

  useEffect(() => {
    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  const handleSaveGrade = async (subId: string) => {
    const gradeNum = parseInt(inputGrade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
      alert("Please enter a valid grade between 0 and 10.");
      return;
    }

    setSavingGrade(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("submissions")
      .update({
        teacher_grade: gradeNum,
      })
      .eq("id", subId);

    if (!error) {
      setEditingGradeSubId(null);
      await loadData();
    }
    setSavingGrade(false);
  };

  const handleExportCsv = () => {
    if (!assignment) return;
    const lines = [];
    lines.push(`CodeCanvas Assignment Submissions Report`);
    lines.push(`Classroom: ${assignment.classroom.name} (${assignment.classroom.course_code})`);
    lines.push(`Assignment: ${assignment.title}`);
    lines.push("");
    lines.push("S.No.,Student Name,Email,Submitted At,AI Grade,Teacher Grade,Final Grade");
    
    submissions.forEach((s, idx) => {
      const finalGrade = s.teacher_grade !== null ? s.teacher_grade : (s.ai_grade !== null ? s.ai_grade : "N/A");
      lines.push([
        idx + 1,
        s.student?.full_name || "Coder",
        s.student?.email || "",
        new Date(s.submitted_at).toLocaleString(),
        s.ai_grade !== null ? s.ai_grade : "N/A",
        s.teacher_grade !== null ? s.teacher_grade : "N/A",
        finalGrade
      ].join(","));
    });

    const csvContent = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Submissions_${assignment.title.replace(/\s+/g, "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 12 }} />
        <span>Loading submissions...</span>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back button */}
      <Link href="/dashboard/teacher" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Assignment Header */}
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>
              {assignment.classroom.name} ({assignment.classroom.course_code})
            </span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginTop: 8 }}>{assignment.title}</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>{assignment.description}</p>
          </div>

          <button onClick={handleExportCsv} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, border: "1px solid var(--border)" }}>
            <Download size={14} /> Export Submissions
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
        Student Submissions ({submissions.length})
      </h2>

      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)", fontSize: 13, background: "var(--surface-1)", border: "1px dashed var(--border)", borderRadius: 12 }}>
          No student submissions received yet for this assignment.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {submissions.map((s) => {
            const isExpanded = expandedSubId === s.id;
            const finalGrade = s.teacher_grade !== null ? s.teacher_grade : s.ai_grade;

            return (
              <div key={s.id} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: isExpanded ? "var(--surface-2)" : "transparent", transition: "background 0.2s" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{s.student?.full_name || "Coder"}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.student?.email} · {timeAgo(s.submitted_at)}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Grade:</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: finalGrade !== null ? "var(--primary)" : "var(--muted)" }}>
                        {finalGrade !== null ? `${finalGrade}/10` : "Not graded"}
                      </span>
                      {s.teacher_grade !== null && (
                        <span title="Teacher Override Graded" style={{ color: "var(--success)", display: "flex" }}>
                          <ShieldCheck size={14} />
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedSubId(isExpanded ? null : s.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                      {isExpanded ? "Collapse" : "View"}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      style={{ overflow: "hidden", borderTop: "1px solid var(--border)" }}
                    >
                      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Student Code block */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Student Submission Code</div>
                          <pre style={{ margin: 0, padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, overflowX: "auto", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                            {s.code}
                          </pre>
                        </div>

                        {/* Explanation & AI Feedback */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div style={{ background: "var(--surface-2)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Student Explanation</div>
                            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>{s.explanation || "No explanation provided."}</p>
                          </div>

                          <div style={{ background: "var(--surface-2)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4 }}>
                              <Cpu size={12} color="var(--primary)" /> AI Assistant Feedback
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>{s.ai_feedback || "No AI feedback generated."}</p>
                          </div>
                        </div>

                        {/* Grading Action panel */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            AI recommended grade: <strong style={{ color: "var(--text)" }}>{s.ai_grade !== null ? `${s.ai_grade}/10` : "N/A"}</strong>
                          </div>

                          {editingGradeSubId === s.id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                placeholder="0-10"
                                value={inputGrade}
                                onChange={(e) => setInputGrade(e.target.value)}
                                style={{ width: 70, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                              />
                              <button
                                onClick={() => handleSaveGrade(s.id)}
                                disabled={savingGrade}
                                className="btn btn-primary"
                                style={{ padding: "6px 12px", fontSize: 12 }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingGradeSubId(null)}
                                className="btn btn-ghost"
                                style={{ padding: "6px 12px", fontSize: 12 }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingGradeSubId(s.id);
                                setInputGrade(s.teacher_grade !== null ? String(s.teacher_grade) : "");
                              }}
                              className="btn btn-ghost"
                              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, border: "1px solid var(--border)" }}
                            >
                              <Edit2 size={12} /> Override Grade
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
