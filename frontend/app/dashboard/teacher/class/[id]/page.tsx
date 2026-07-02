"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  Users, ClipboardList, ArrowLeft, Trash2, Download,
  Check, Copy, Clock, Award, ShieldAlert
} from "lucide-react";
import { getLevel, generateNaacCsv, type NaacRow, timeAgo } from "@/lib/dashboardUtils";

interface Classroom {
  id: string;
  name: string;
  course_code: string;
  invite_code: string;
  description: string;
}

interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
  xp: number;
  trace_count: number;
  last_active: string | null;
  enrolled_at: string;
}

interface Assignment {
  id: string;
  title: string;
  deadline: string;
  lang: string;
  algorithm: string;
  submission_count: number;
}

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadClassData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch classroom
    const { data: classObj } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", classId)
      .single();

    if (!classObj) {
      router.push("/dashboard/teacher");
      return;
    }
    setClassroom(classObj as Classroom);

    // Fetch enrolled students
    const { data: enrolls } = await supabase
      .from("enrollments")
      .select(`
        enrolled_at,
        student:profiles (
          id,
          full_name,
          email,
          xp,
          last_active
        )
      `)
      .eq("classroom_id", classId);

    const studentsList: Student[] = [];
    for (let e of (enrolls || [])) {
      if (e.student) {
        // Fetch trace count for this student
        const { count: tracesCount } = await supabase
          .from("trace_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", e.student.id);

        studentsList.push({
          id: e.student.id,
          full_name: e.student.full_name,
          email: e.student.email,
          xp: e.student.xp || 0,
          trace_count: tracesCount || 0,
          last_active: e.student.last_active,
          enrolled_at: e.enrolled_at,
        });
      }
    }
    setStudents(studentsList);

    // Fetch assignments
    const { data: assigns } = await supabase
      .from("assignments")
      .select("*")
      .eq("classroom_id", classId)
      .order("created_at", { ascending: false });

    const assignmentsList = (assigns || []) as Assignment[];
    for (let a of assignmentsList) {
      const { count } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("assignment_id", a.id);
      a.submission_count = count || 0;
    }
    setAssignments(assignmentsList);

    setLoading(false);
  }

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const copyCode = () => {
    if (!classroom) return;
    navigator.clipboard.writeText(classroom.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const removeStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the class?")) return;
    setRemovingId(studentId);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("classroom_id", classId)
      .eq("student_id", studentId);

    if (!error) {
      await loadClassData();
    }
    setRemovingId(null);
  };

  const handleExportCsv = () => {
    if (!classroom) return;
    const csvData: NaacRow[] = students.map((s) => ({
      name: s.full_name || "Coder",
      email: s.email || "",
      traceCount: s.trace_count,
      algorithmsLearned: `${s.trace_count > 0 ? "Array, Sort" : "None"}`,
      lastActive: s.last_active ? new Date(s.last_active).toLocaleDateString() : "Never",
      xp: s.xp,
    }));

    const csvContent = generateNaacCsv(csvData, classroom.name, classroom.course_code);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NAAC_Class_${classroom.course_code}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 12 }} />
        <span>Loading class details...</span>
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back button */}
      <Link href="/dashboard/teacher" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Class header */}
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 10, textTransform: "uppercase", background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid var(--primary-border)", padding: "3px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              {classroom.course_code}
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginTop: 12 }}>{classroom.name}</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, maxWidth: 600, lineHeight: 1.5 }}>{classroom.description || "No description provided."}</p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Invite Code:</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono)" }}>{classroom.invite_code}</span>
              <button
                onClick={copyCode}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}
              >
                {copiedCode ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </button>
            </div>

            <button onClick={handleExportCsv} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, border: "1px solid var(--border)" }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 }}>
        {/* Student Roster */}
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={16} color="var(--primary)" /> Student Roster ({students.length})
          </h2>

          {students.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 8 }}>
              No students enrolled yet. Share the invite code with your class!
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                  <th style={{ padding: "10px 14px", color: "var(--muted)" }}>Name</th>
                  <th style={{ padding: "10px 14px", color: "var(--muted)" }}>XP Rank</th>
                  <th style={{ padding: "10px 14px", color: "var(--muted)" }}>Traces Run</th>
                  <th style={{ padding: "10px 14px", color: "var(--muted)" }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const lvl = getLevel(s.xp);
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{s.full_name || "Coder"}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Joined {new Date(s.enrolled_at).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: "10px 14px", color: lvl.color, fontWeight: 600 }}>{lvl.emoji} {lvl.level}</td>
                      <td style={{ padding: "10px 14px", color: "var(--muted)" }}>{s.trace_count} traces</td>
                      <td style={{ padding: "10px 14px" }}>
                        <button
                          disabled={removingId === s.id}
                          onClick={() => removeStudent(s.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Assignments list */}
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <ClipboardList size={16} color="var(--primary)" /> Assignments
          </h2>

          {assignments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)", fontSize: 12, border: "1px dashed var(--border)", borderRadius: 8 }}>
              No assignments active for this classroom.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {assignments.map((a) => (
                <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--surface-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{a.title}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Category: {a.algorithm} · Lang: {a.lang.toUpperCase()}</div>
                    </div>
                    <Link href={`/dashboard/teacher/assignment/${a.id}`} style={{ fontSize: 11, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Review subs →</Link>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 11, color: "var(--muted)" }}>
                    <span>Deadline: {a.deadline ? new Date(a.deadline).toLocaleDateString() : "None"}</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{a.submission_count} submissions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
