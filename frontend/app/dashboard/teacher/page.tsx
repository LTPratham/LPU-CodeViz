"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BookOpen, ClipboardList, BarChart2, Download,
  Plus, Copy, Check, Calendar, ChevronRight, GraduationCap,
  Sparkles, Award, Trash2, AlertTriangle
} from "lucide-react";
import { getLevel, generateNaacCsv, type NaacRow, timeAgo } from "@/lib/dashboardUtils";
import AtRiskRadar from "@/components/AtRiskRadar";


interface Classroom {
  id: string;
  name: string;
  course_code: string;
  invite_code: string;
  description: string;
  created_at: string;
  student_count?: number;
}

interface Assignment {
  id: string;
  classroom_id: string;
  title: string;
  description: string;
  algorithm: string;
  lang: string;
  deadline: string;
  classroom_name?: string;
  submission_count?: number;
}

interface StudentAnalytics {
  id: string;
  full_name: string | null;
  email: string | null;
  xp: number;
  trace_count: number;
  last_active: string | null;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "atrisk" | "classes" | "assignments" | "analytics" | "naac">("overview");
  
  // Data States
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Class Form State
  const [newClassName, setNewClassName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [classSubmitting, setClassSubmitting] = useState(false);

  // New Assignment Form State
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignDesc, setNewAssignDesc] = useState("");
  const [newAssignAlgo, setNewAssignAlgo] = useState("sorting");
  const [newAssignLang, setNewAssignLang] = useState("python");
  const [newAssignDeadline, setNewAssignDeadline] = useState("");
  const [newAssignClassId, setNewAssignClassId] = useState("");
  const [newAssignCode, setNewAssignCode] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Fetch Data
  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // 1. Fetch Classrooms
    const { data: classes } = await supabase
      .from("classrooms")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    const classesList = (classes || []) as Classroom[];

    // Fetch student counts for each class
    for (let c of classesList) {
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("classroom_id", c.id);
      c.student_count = count || 0;
    }
    setClassrooms(classesList);

    if (classesList.length > 0) {
      const classIds = classesList.map((c) => c.id);

      // 2. Fetch Assignments
      const { data: assigns } = await supabase
        .from("assignments")
        .select("*")
        .in("classroom_id", classIds)
        .order("created_at", { ascending: false });

      const assignmentsList = (assigns || []) as Assignment[];
      
      // Fetch submissions count for each assignment
      let totalSubs = 0;
      for (let a of assignmentsList) {
        const { count } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("assignment_id", a.id);
        a.submission_count = count || 0;
        totalSubs += count || 0;
        a.classroom_name = classesList.find((c) => c.id === a.classroom_id)?.name ?? "Class";
      }
      setAssignments(assignmentsList);
      setSubmissionsCount(totalSubs);

      // 3. Fetch Enrolled Students & their Analytics
      const { data: enrolledStudents } = await supabase
        .from("enrollments")
        .select(`
          student:profiles (
            id,
            full_name,
            email,
            xp,
            last_active
          )
        `)
        .in("classroom_id", classIds);

      const uniqueStudentsMap = new Map<string, any>();
      (enrolledStudents || []).forEach((e: any) => {
        if (e.student) {
          uniqueStudentsMap.set(e.student.id, e.student);
        }
      });

      const studentList: StudentAnalytics[] = [];
      for (let s of uniqueStudentsMap.values()) {
        // Fetch student trace count
        const { count: traceCount } = await supabase
          .from("trace_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", s.id);

        studentList.push({
          id: s.id,
          full_name: s.full_name,
          email: s.email,
          xp: s.xp || 0,
          trace_count: traceCount || 0,
          last_active: s.last_active,
        });
      }
      setStudents(studentList);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newCourseCode.trim()) return;

    setClassSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("classrooms")
        .insert({
          teacher_id: user.id,
          name: newClassName,
          course_code: newCourseCode,
          description: newClassDesc,
          school_id: "cse",
        });

      if (!error) {
        setNewClassName("");
        setNewCourseCode("");
        setNewClassDesc("");
        setShowClassModal(false);
        await loadData();
      }
    }
    setClassSubmitting(false);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle.trim() || !newAssignClassId) return;

    setAssignSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("assignments")
      .insert({
        classroom_id: newAssignClassId,
        title: newAssignTitle,
        description: newAssignDesc,
        algorithm: newAssignAlgo,
        lang: newAssignLang,
        deadline: newAssignDeadline ? new Date(newAssignDeadline).toISOString() : null,
        sample_code: newAssignCode || null,
        max_xp: 50,
      });

    if (!error) {
      setNewAssignTitle("");
      setNewAssignDesc("");
      setNewAssignDeadline("");
      setNewAssignCode("");
      setShowAssignModal(false);
      await loadData();
    }
    setAssignSubmitting(false);
  };

  const handleExportNaac = (classId: string) => {
    const targetClass = classrooms.find((c) => c.id === classId);
    if (!targetClass) return;

    // Filter students enrolled in this class
    const supabase = createClient();
    supabase
      .from("enrollments")
      .select("student_id")
      .eq("classroom_id", classId)
      .then(({ data: enrolls }: any) => {
        const studentIds = new Set((enrolls || []).map((e: any) => e.student_id));
        const classStudents = students.filter((s) => studentIds.has(s.id));

        const csvData: NaacRow[] = classStudents.map((s) => ({
          name: s.full_name || "Coder",
          email: s.email || "",
          traceCount: s.trace_count,
          algorithmsLearned: `${s.trace_count > 0 ? "Array, Sort" : "None"}`,
          lastActive: s.last_active ? new Date(s.last_active).toLocaleDateString() : "Never",
          xp: s.xp,
        }));

        const csvContent = generateNaacCsv(csvData, targetClass.name, targetClass.course_code);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `NAAC_Report_${targetClass.course_code}_${targetClass.name.replace(/\s+/g, "_")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 12 }} />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  // Calculate Overview Stats
  const totalStudents = students.length;
  const activeClasses = classrooms.length;
  const totalAssignments = assignments.length;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: "var(--surface-1)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "24px 16px", gap: 6, flexShrink: 0 }}>
        {[
          { id: "overview", label: "Overview", Icon: BookOpen },
          { id: "atrisk", label: "At-Risk Radar", Icon: AlertTriangle, badge: "4" },
          { id: "classes", label: "My Classes", Icon: Users },
          { id: "assignments", label: "Assignments", Icon: ClipboardList },
          { id: "analytics", label: "Student Roster", Icon: BarChart2 },
          { id: "naac", label: "NAAC Export", Icon: Download },
        ].map((tab) => {
          const ActiveIcon = tab.Icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 8,
                background: isActive ? "var(--primary-dim)" : "transparent",
                border: "none",
                color: isActive ? "var(--primary)" : "var(--muted)",
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ActiveIcon size={16} />
                {tab.label}
              </div>
              {"badge" in tab && tab.badge && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: isActive ? "#F43F5E" : "rgba(244, 63, 94, 0.2)",
                  color: isActive ? "#FFF" : "#F43F5E",
                  padding: "2px 6px",
                  borderRadius: 99,
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Faculty Control Center</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Overview of your classes, curriculum coverage, and student activity metrics.</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowClassModal(true)} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, border: "1px solid var(--border)" }}>
                  <Plus size={14} /> New Class
                </button>
                <button onClick={() => setShowAssignModal(true)} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Plus size={14} /> Create Assignment
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
              {[
                { label: "Total Students Enrolled", val: totalStudents, icon: Users, color: "#3B82F6" },
                { label: "Active Classrooms", val: activeClasses, icon: GraduationCap, color: "#10B981" },
                { label: "Assignments Active", val: totalAssignments, icon: ClipboardList, color: "#F59E0B" },
                { label: "Total Submissions", val: submissionsCount, icon: Award, color: "#8B5CF6" },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div key={i} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>{stat.label}</span>
                      <StatIcon size={18} color={stat.color} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginTop: 8 }}>{stat.val}</div>
                  </div>
                );
              })}
            </div>

            {/* AI At-Risk Radar Banner */}
            <div
              onClick={() => setActiveTab("atrisk")}
              style={{
                background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(15, 23, 42, 0.8))",
                border: "1px solid rgba(244, 63, 94, 0.35)",
                borderRadius: 16,
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 32,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F43F5E"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(244, 63, 94, 0.2)",
                  color: "#F43F5E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#F8FAFC" }}>
                      AI At-Risk Student Radar Active
                    </h3>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: "#F43F5E",
                      color: "#FFF",
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}>
                      4 Struggling Students Detected
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#CBD5E1", margin: "4px 0 0 0" }}>
                    AI telemetry flagged Aarav Sharma (Recursion call stack stall) & 3 others. Click here to inspect AI diagnoses and dispatch automated interventions →
                  </p>
                </div>
              </div>
              <ChevronRight size={20} color="#F43F5E" />
            </div>

            {/* Recent activity layout */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 }}>
              <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Classrooms Status</h2>
                {classrooms.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 8 }}>
                    No classes created. Get started by clicking "New Class".
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {classrooms.map((c) => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Course: {c.course_code} · Code: {c.invite_code}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.student_count} students</span>
                          <Link href={`/dashboard/teacher/class/${c.id}`} style={{ color: "var(--primary)", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>Manage →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Recent Assignments</h2>
                {assignments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 12, border: "1px dashed var(--border)", borderRadius: 8 }}>
                    No assignments active.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {assignments.slice(0, 4).map((a) => (
                      <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--surface-2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{a.title}</div>
                            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{a.classroom_name}</div>
                          </div>
                          <Link href={`/dashboard/teacher/assignment/${a.id}`} style={{ fontSize: 11, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>View subs →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AT-RISK RADAR TAB */}
        {activeTab === "atrisk" && (
          <AtRiskRadar />
        )}

        {/* MY CLASSES TAB */}
        {activeTab === "classes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>My Classrooms</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Manage class lists, generate codes, and track algorithm templates per subject.</p>
              </div>
              <button onClick={() => setShowClassModal(true)} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <Plus size={14} /> Create Class
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {classrooms.map((c) => (
                <div key={c.id} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <span style={{ fontSize: 10, textTransform: "uppercase", background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid var(--primary-border)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {c.course_code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(c.invite_code)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                      >
                        {copiedCode === c.invite_code ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        {c.invite_code}
                      </button>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginTop: 12 }}>{c.name}</h3>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>{c.description || "No description provided."}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{c.student_count} Enrolled</span>
                    <Link href={`/dashboard/teacher/class/${c.id}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Manage Class →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === "assignments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Active Assignments</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Add challenges, set deadlines, and grade step-by-step algorithm trace reviews.</p>
              </div>
              <button onClick={() => setShowAssignModal(true)} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <Plus size={14} /> Create Assignment
              </button>
            </div>

            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              {assignments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)", fontSize: 13 }}>
                  No active assignments. Start one now to give students homework challenges.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Title</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Class</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Algorithm Type</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Deadline</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Submissions</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text)" }}>{a.title}</td>
                        <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{a.classroom_name}</td>
                        <td style={{ padding: "14px 20px", textTransform: "capitalize", color: "var(--muted)" }}>{a.algorithm}</td>
                        <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{a.deadline ? new Date(a.deadline).toLocaleDateString() : "No deadline"}</td>
                        <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text)" }}>{a.submission_count} submissions</td>
                        <td style={{ padding: "14px 20px" }}>
                          <Link href={`/dashboard/teacher/assignment/${a.id}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>View & Grade →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* STUDENT ROSTER TAB */}
        {activeTab === "analytics" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>Student Roster</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>Consolidated performance metric report for all enrolled students.</p>

            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              {students.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)", fontSize: 13 }}>
                  No students currently enrolled in your classes.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Student Name</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Email</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Total XP</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Rank Level</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Visual Traces</th>
                      <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600 }}>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const lvl = getLevel(s.xp);
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text)" }}>{s.full_name || "Coder"}</td>
                          <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{s.email}</td>
                          <td style={{ padding: "14px 20px", color: "var(--text)", fontWeight: 600 }}>{s.xp} XP</td>
                          <td style={{ padding: "14px 20px", color: lvl.color, fontWeight: 600 }}>{lvl.emoji} {lvl.level}</td>
                          <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{s.trace_count} traces</td>
                          <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{s.last_active ? timeAgo(s.last_active) : "Never"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* NAAC EXPORT TAB */}
        {activeTab === "naac" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>NAAC Accreditation Reports</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>Export student activity data logs formatted for university quality audit criteria.</p>

            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 600 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Download Class Engagement Report (CSV)</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
                This creates an Excel-compatible spreadsheet containing enrollment counts, individual student trace details, total active learning time blocks, and performance ranks. Ready to hand over to NAAC / UGC criteria reviewers.
              </p>

              {classrooms.length === 0 ? (
                <div style={{ color: "var(--danger)", fontSize: 13 }}>Please create a classroom first to export reports.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {classrooms.map((c) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-2)" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>Code: {c.course_code}</div>
                      </div>
                      <button
                        onClick={() => handleExportNaac(c.id)}
                        className="btn btn-primary"
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }}
                      >
                        <Download size={13} /> Export CSV
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* CREATE CLASS MODAL */}
      {showClassModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => setShowClassModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} />
          <form onSubmit={handleCreateClass} style={{ position: "relative", zIndex: 1001, width: 440, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>Create New Classroom</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Classroom Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE202 - Section A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE202"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Description</label>
                <textarea
                  placeholder="Course outline or teacher details..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  style={{ width: "100%", height: 80, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13, resize: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "end", gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowClassModal(false)} className="btn btn-ghost" style={{ fontSize: 13 }}>Cancel</button>
              <button type="submit" disabled={classSubmitting} className="btn btn-primary" style={{ fontSize: 13 }}>
                {classSubmitting ? "Creating..." : "Create Class"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => setShowAssignModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} />
          <form onSubmit={handleCreateAssignment} style={{ position: "relative", zIndex: 1001, width: 480, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>Create Assignment Challenge</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Select Classroom</label>
                <select
                  required
                  value={newAssignClassId}
                  onChange={(e) => setNewAssignClassId(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                >
                  <option value="">-- Choose Class --</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Bubble Sort & Trace swaps"
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Language</label>
                  <select
                    value={newAssignLang}
                    onChange={(e) => setNewAssignLang(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                  >
                    <option value="python">Python</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="sql">SQL / Database</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Structure Type</label>
                  <select
                    value={newAssignAlgo}
                    onChange={(e) => setNewAssignAlgo(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                  >
                    <option value="sorting">Sorting</option>
                    <option value="array">Arrays</option>
                    <option value="stack">Stack</option>
                    <option value="queue">Queue</option>
                    <option value="linkedlist">Linked List</option>
                    <option value="binarytree">Tree</option>
                    <option value="graph">Graph</option>
                    <option value="recursion">Recursion</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Deadline Date & Time</label>
                <input
                  type="datetime-local"
                  value={newAssignDeadline}
                  onChange={(e) => setNewAssignDeadline(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Starter Sample Code</label>
                <textarea
                  placeholder="# Write template code here for the students..."
                  value={newAssignCode}
                  onChange={(e) => setNewAssignCode(e.target.value)}
                  style={{ width: "100%", height: 100, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-mono)", resize: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "end", gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-ghost" style={{ fontSize: 13 }}>Cancel</button>
              <button type="submit" disabled={assignSubmitting} className="btn btn-primary" style={{ fontSize: 13 }}>
                {assignSubmitting ? "Publishing..." : "Publish Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
