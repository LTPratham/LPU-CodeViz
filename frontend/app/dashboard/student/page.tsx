"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  Flame, Zap, Trophy, Clock, BookOpen, Target, GraduationCap,
  ExternalLink, Award, Sparkles, BookMarked, Code2
} from "lucide-react";
import {
  getLevel,
  timeAgo,
  ACHIEVEMENTS,
  formatDeadline,
  type UserStats,
} from "@/lib/dashboardUtils";
import CertificateModal from "@/components/CertificateModal";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  email: string | null;
  xp: number;
  streak_days: number;
}

interface TraceEntry {
  id: string;
  lang: string;
  data_structure: string;
  created_at: string;
  code: string;
  step_count: number;
}

interface StudentProgress {
  algorithm_type: string;
  trace_count: number;
  last_traced_at: string;
}

interface Classroom {
  id: string;
  name: string;
  course_code: string;
  teacher: {
    full_name: string | null;
  };
}

interface Assignment {
  id: string;
  title: string;
  deadline: string;
  lang: string;
  classroom: {
    name: string;
  };
  hasSubmitted?: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [traces, setTraces] = useState<TraceEntry[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, email, xp, streak_days")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile(prof as Profile);
      }

      // Fetch Recent Traces
      const { data: traceHistory } = await supabase
        .from("trace_history")
        .select("id, lang, data_structure, created_at, code, step_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setTraces((traceHistory || []) as TraceEntry[]);

      // Fetch Progress
      const { data: prog } = await supabase
        .from("student_progress")
        .select("algorithm_type, trace_count, last_traced_at")
        .eq("user_id", user.id);

      setProgress((prog || []) as StudentProgress[]);

      // Fetch Enrollments + Classrooms
      const { data: enrolls } = await supabase
        .from("enrollments")
        .select(`
          classroom:classrooms (
            id,
            name,
            course_code,
            teacher:profiles!classrooms_teacher_id_fkey (
              full_name
            )
          )
        `)
        .eq("student_id", user.id);

      const enrolledClasses = (enrolls || []).map((e: any) => e.classroom).filter(Boolean);
      setClassrooms(enrolledClasses);

      if (enrolledClasses.length > 0) {
        const classIds = enrolledClasses.map((c: any) => c.id);

        // Fetch Assignments for enrolled classes
        const { data: assignList } = await supabase
          .from("assignments")
          .select(`
            id,
            title,
            deadline,
            lang,
            classroom:classrooms (
              name
            )
          `)
          .in("classroom_id", classIds);

        // Fetch student's submissions to filter out done ones
        const { data: subs } = await supabase
          .from("submissions")
          .select("assignment_id")
          .eq("student_id", user.id);

        const submittedIds = new Set((subs || []).map((s: any) => s.assignment_id));
        const filteredAssignments = (assignList || []).map((a: any) => ({
          ...a,
          hasSubmitted: submittedIds.has(a.id),
        }));

        setAssignments(filteredAssignments);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 12 }} />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  // Stats calculation
  const totalTraces = progress.reduce((acc, p) => acc + p.trace_count, 0);
  const categoriesLearned = progress.filter((p) => p.trace_count > 0).map((p) => p.algorithm_type);

  const stats: UserStats = {
    traceCount: totalTraces,
    streakDays: profile?.streak_days ?? 0,
    algorithmTypes: categoriesLearned,
    submissionCount: assignments.filter(a => a.hasSubmitted).length,
    sortingCount: progress.find(p => p.algorithm_type === "sorting" || p.algorithm_type === "array")?.trace_count ?? 0,
    treeCount: progress.find(p => p.algorithm_type === "binarytree")?.trace_count ?? 0,
    graphCount: progress.find(p => p.algorithm_type === "graph")?.trace_count ?? 0,
    sqlCount: progress.find(p => p.algorithm_type === "sqltable")?.trace_count ?? 0,
  };

  const xpLevel = getLevel(profile?.xp ?? 0);
  const pendingAssignments = assignments.filter((a) => !a.hasSubmitted);

  // Categories for Circular Progress Rings
  const CATEGORIES = [
    { key: "sorting", label: "Sorting & Arrays", color: "#00F2FE", desc: "Bubble, Quick, Insertion" },
    { key: "stack", label: "Stacks & Queues", color: "#3B82F6", desc: "LIFO / FIFO state flows" },
    { key: "linkedlist", label: "Linked Lists", color: "#F59E0B", desc: "Node pointer connections" },
    { key: "binarytree", label: "Trees", color: "#22C55E", desc: "BST nodes & traversals" },
    { key: "graph", label: "Graphs", color: "#8B5CF6", desc: "DFS, BFS & Paths" },
    { key: "recursion", label: "Recursion Stack", color: "#EF4444", desc: "Dynamic call stack frames" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Welcome back, {profile?.full_name?.split(" ")[0] ?? "Coder"}!
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
            Continue visualizing structures and mastering programming patterns.
          </p>
        </div>

        <Link href="/visualize" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Code2 size={15} /> Launch Sandbox
        </Link>
      </motion.div>

      {/* Algorithm Combat Arena Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 8px 24px rgba(245, 158, 11, 0.1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            ⚔️
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>CodeCanvas Proctored Combat Arena</span>
              <span style={{ fontSize: 10, background: "#F59E0B", color: "#000", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>LIVE LPU-8821</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
              Enter the algorithm battleground! Hunt bugs under time pressure, pass hidden edge cases, and climb the university ELO leaderboard.
            </p>
          </div>
        </div>
        <Link
          href="/battleground/play?pin=LPU-8821"
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#FFF",
            textDecoration: "none",
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 14,
            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🚀 Enter Battle Arena →
        </Link>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        {/* Left main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Total Traces Run</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{totalTraces}</div>
              </div>
            </div>

            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Flame size={20} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Daily Streak</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>
                  {profile?.streak_days ?? 0} { (profile?.streak_days ?? 0) === 1 ? "day" : "days" }
                </div>
              </div>
            </div>

            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                <Trophy size={20} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>XP Earned</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{profile?.xp ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Algorithm category progress */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={16} color="var(--primary)" /> Algorithm Topic Coverage
            </h2>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>
              Trace at least one algorithm in each core category to balance your learning coverage.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {CATEGORIES.map((cat) => {
                const count = progress.find((p) => p.algorithm_type === cat.key)?.trace_count ?? 0;
                const isCompleted = count > 0;

                return (
                  <div key={cat.key} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12, background: "var(--surface-2)", transition: "all 0.2s ease" }}>
                    <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="40" height="40" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="16" fill="none"
                          stroke={cat.color} strokeWidth="3"
                          strokeDasharray={isCompleted ? "100 100" : "0 100"}
                          transform="rotate(-90 18 18)"
                          style={{ transition: "stroke-dasharray 0.5s ease" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", fontSize: 10, fontWeight: 800, color: isCompleted ? cat.color : "var(--muted)" }}>
                        {count}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{cat.label}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{cat.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent traces list */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} color="var(--primary)" /> Recent Visualizations
            </h2>

            {traces.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 8 }}>
                No recent traces. Launch the visualizer and write some code to get started!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {traces.map((trace) => (
                  <div
                    key={trace.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 12,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid var(--primary-border)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {trace.lang}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                          {trace.data_structure.toUpperCase()} Analysis
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          {trace.step_count} execution steps · {timeAgo(trace.created_at)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/visualize?lang=${trace.lang}&code=${encodeURIComponent(btoa(trace.code))}`}
                      style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}
                    >
                      Re-open <ExternalLink size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side widgets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* XP progress card */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>{xpLevel.emoji}</div>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Level Rank
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: xpLevel.color }}>
                  {xpLevel.level}
                </div>
              </div>
            </div>

            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", position: "relative", marginBottom: 12 }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: xpLevel.color, width: `${xpLevel.progress}%`, borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)" }}>
              <span>{profile?.xp} XP</span>
              <span>Next tier: {xpLevel.nextXP} XP</span>
            </div>
          </div>

          {/* Pending assignments */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <BookMarked size={16} color="var(--primary)" /> Assignments
            </h2>

            {pendingAssignments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--muted)", fontSize: 12, border: "1px dashed var(--border)", borderRadius: 8 }}>
                All clear! No pending assignments.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendingAssignments.map((a) => {
                  const deadlineInfo = formatDeadline(a.deadline);
                  const isSoon = deadlineInfo.urgency === "soon";

                  return (
                    <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, background: "var(--surface-2)" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{a.title}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{a.classroom.name}</div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isSoon ? "var(--danger)" : "var(--muted)" }}>
                          {deadlineInfo.text}
                        </span>

                        <Link
                          href={`/assignment/${a.id}`}
                          style={{ fontSize: 11, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
                        >
                          Solve →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enrolled Classes */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <GraduationCap size={16} color="var(--primary)" /> Enrolled Classes
            </h2>

            {classrooms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--muted)", fontSize: 12, border: "1px dashed var(--border)", borderRadius: 8 }}>
                You are not enrolled in any classes yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {classrooms.map((c) => (
                  <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, background: "var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{c.course_code} · {c.teacher?.full_name ?? "Faculty"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements badge grid */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <Award size={16} color="var(--primary)" /> Achievements
            </h2>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>
              Earn badges by tracing code and completing assignments.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {Object.entries(ACHIEVEMENTS).map(([key, item]) => {
                const earned = item.check(stats);
                return (
                  <div
                    key={key}
                    title={`${item.label}: ${item.description}`}
                    style={{
                      height: 56,
                      background: earned ? "var(--surface-2)" : "rgba(255,255,255,0.01)",
                      border: `1px solid ${earned ? item.color : "var(--border)"}`,
                      borderRadius: 8,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      opacity: earned ? 1 : 0.25,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{item.icon}</div>
                    {earned && (
                      <div style={{ position: "absolute", right: 2, bottom: 2, width: 4, height: 4, borderRadius: "50%", background: item.color }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Certificate Trigger Banner */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>🎓 Verified Credential Unlocked</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Share your NAAC-verified completion certificate to LinkedIn.</div>
              </div>
              <button
                onClick={() => setShowCertModal(true)}
                style={{
                  background: "var(--primary)",
                  color: "#000",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 0 15px rgba(5, 223, 114, 0.3)",
                }}
              >
                Claim Certificate & Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        studentName={profile?.full_name || "Prathamesh Sawarkar"}
        courseName="Data Structures & Dynamic Programming Mastery"
      />
    </div>
  );
}
