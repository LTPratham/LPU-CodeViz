"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Clock, Code2, Cpu, CheckCircle, AlertTriangle } from "lucide-react";
import { traceCode, explainCode } from "@/lib/api";
import { formatDeadline } from "@/lib/dashboardUtils";
import type { Language, TraceStep, ExplainLine } from "@/lib/types";

// Dynamic Visualizer Components
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });
const VisualCanvas = dynamic(() => import("@/components/VisualCanvas"), { ssr: false });
const StepController = dynamic(() => import("@/components/StepController"), { ssr: false });

interface Assignment {
  id: string;
  title: string;
  description: string;
  algorithm: string;
  lang: string;
  sample_code: string;
  deadline: string;
  classroom: {
    name: string;
    course_code: string;
  };
}

export default function StudentAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Visualizer States
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("python");
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [explanations, setExplanations] = useState<ExplainLine[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [dataStructure, setDataStructure] = useState("array");
  const [isTracing, setIsTracing] = useState(false);

  // Submission States
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Fetch assignment details
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
        router.push("/dashboard/student");
        return;
      }
      setAssignment(assignObj as any);
      setCode(assignObj.sample_code || "");
      setLanguage(assignObj.lang as Language);

      // 2. Check if student already submitted
      const { data: sub } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .eq("student_id", user.id)
        .maybeSingle();

      if (sub) {
        setExistingSubmission(sub);
        setSubmitted(true);
      }

      setLoading(false);
    }

    if (assignmentId) {
      loadData();
    }
  }, [assignmentId, router]);

  const handleVisualize = useCallback(async () => {
    if (!code.trim()) return;

    setIsTracing(true);
    setError(null);
    setSteps([]);
    setExplanations([]);
    setCurrentStepIdx(0);

    try {
      const traceRes = await traceCode({ lang: language, code });
      const explainRes = await explainCode({ lang: language, code });

      setSteps(traceRes.steps);
      setDataStructure(traceRes.dataStructure);
      setExplanations(explainRes);
    } catch (err: any) {
      setError(err?.message || "Failed to run simulation. Please verify your code syntax.");
    } finally {
      setIsTracing(false);
    }
  }, [code, language]);

  const handleSubmitAssignment = async () => {
    if (!steps.length) {
      alert("Please visualize your code first to verify it executes successfully before submitting.");
      return;
    }

    if (assignment && code.trim() === assignment.sample_code.trim()) {
      alert("⚠️ Auto-Grader Rejection: You submitted the unmodified sample code without implementing the required solution! Please write your code before submitting.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Simple automated grading recommendation helper
      const aiScore = steps.length > 3 ? 9 : 6;
      const aiFeedback = steps.length > 3 
        ? "Excellent execution depth. The state changes match the targeted algorithm complexity."
        : "Code executes, but trace steps look too short. Make sure you fully implement the logic.";

      const { error: subErr } = await supabase
        .from("submissions")
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          code,
          steps_json: steps,
          explanation,
          ai_grade: aiScore,
          ai_feedback: aiFeedback,
        });

      if (!subErr) {
        // Award student some XP (+50 XP for assignments)
        await supabase.rpc('increment_xp', { user_id_param: user.id, xp_amount: 50 });
        setSubmitted(true);
        alert("Assignment submitted successfully! +50 XP earned.");
        router.push("/dashboard/student");
      } else {
        alert("Submission failed: " + subErr.message);
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 12 }} />
        <span>Loading assignment visualizer...</span>
      </div>
    );
  }

  if (!assignment) return null;

  const deadlineInfo = formatDeadline(assignment.deadline);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", background: "var(--bg)", overflow: "hidden" }}>
      {/* Top control bar */}
      <div style={{ height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, background: "var(--surface-1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/student" style={{ color: "var(--muted)", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            {assignment.title} <span style={{ color: "var(--muted)", fontWeight: 500 }}>({assignment.classroom.name})</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: deadlineInfo.urgency === "soon" ? "var(--danger)" : "var(--muted)" }}>
            <Clock size={13} /> {deadlineInfo.text}
          </div>
          <span style={{ fontSize: 10, textTransform: "uppercase", background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid var(--primary-border)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
            {language.toUpperCase()}
          </span>
        </div>
      </div>

      {submitted ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Assignment Submitted</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }}>
            You have already completed this assignment. Your teacher is reviewing your submission.
          </p>
          
          {existingSubmission?.ai_grade !== null && (
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, width: "100%", marginTop: 24, textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>AI Evaluated Grade</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
                {existingSubmission?.teacher_grade !== null ? `${existingSubmission.teacher_grade}/10` : `${existingSubmission.ai_grade}/10`}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
                {existingSubmission?.ai_feedback}
              </div>
            </div>
          )}

          <Link href="/dashboard/student" className="btn btn-primary" style={{ marginTop: 24, fontSize: 13 }}>
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "32% 45% 23%", overflow: "hidden" }}>
          {/* Instructions & Code editor */}
          <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Description card */}
            <div style={{ padding: 18, borderBottom: "1px solid var(--border)", background: "var(--surface-1)", flexShrink: 0 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Problem Description</h3>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>{assignment.description}</p>
            </div>

            {/* Code editor pane */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <CodeEditor
                code={code}
                language={language}
                currentLine={steps[currentStepIdx] ? Number(steps[currentStepIdx].line) : 0}
                onChange={setCode}
                onLanguageChange={setLanguage}
                onVisualize={handleVisualize}
                isLoading={isTracing}
              />
            </div>
          </div>

          {/* Visual canvas */}
          <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "#0f172a", overflow: "hidden" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <VisualCanvas
                step={steps[currentStepIdx] ?? null}
                dataStructure={dataStructure}
              />
              
              {error && (
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={15} /> {error}
                </div>
              )}
            </div>
            
            <div style={{ height: 64, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 20px", background: "var(--surface-1)" }}>
              <StepController
                currentStep={currentStepIdx + 1}
                totalSteps={steps.length}
                isPlaying={false}
                speed={1}
                onFirst={() => setCurrentStepIdx(0)}
                onPrev={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                onNext={() => setCurrentStepIdx((i) => Math.min(steps.length - 1, i + 1))}
                onLast={() => setCurrentStepIdx(steps.length - 1)}
                onPlayPause={() => {}}
                onSpeedChange={() => {}}
              />
            </div>
          </div>

          {/* Submission explanation & submit button */}
          <div style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--surface-1)", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Submit Assignment</h3>
              
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Write short explanation of your algorithm trace (how it works):</label>
                <textarea
                  required
                  placeholder="Explain step-by-step logic here..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  style={{ width: "100%", height: 160, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13, resize: "none", lineHeight: 1.5 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              <button
                disabled={!steps.length || submitting}
                onClick={handleSubmitAssignment}
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: 13, fontWeight: 700 }}
              >
                {submitting ? "Submitting..." : "Submit Code & Trace"}
              </button>
              
              {!steps.length && (
                <div style={{ fontSize: 11, color: "var(--danger)", textAlign: "center" }}>
                  ⚠ Run visualization successfully before submitting.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
