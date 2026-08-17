"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getSchoolConfig } from "../lib/schools";
import { Swords, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
// ─── Feature Data ────────────────────────────────────────────────────────────

const TRACER_FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "AI-Simulated Execution",
    desc: "Paste any C, C++, Python, Java, or SQL code. Our LLM-powered engine simulates memory line-by-line safety without server risks.",
    badge: "AI Powered",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "10+ Interactive Visualizers",
    desc: "Watch sorting bars swap, stacks pop, binary trees balance, and graph nodes light up dynamically as your code runs.",
    badge: "Canvas First",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Voice AI Tutor Sidebar",
    desc: "Stuck on a nested loop or pointer dereference? Click the floating AI tutor for explanations or trigger real voice guidance.",
    badge: "Smart Tutor",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: "LPU Syllabus Alignment",
    desc: "Includes pre-configured coding examples and visual challenges designed for CSE101, INT101, CSE205, and INT301 lab courses.",
    badge: "LPU Specific",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Select or Write Code",
    desc: "Choose from 20+ syllabus templates or write custom code in our VS Code-style editor with autocomplete.",
  },
  {
    step: "02",
    title: "Run Simulation",
    desc: "Hit 'Visualize' to generate trace states outlining line numbers, memory tables, and explanations.",
  },
  {
    step: "03",
    title: "Trace Line-by-Line",
    desc: "Click next or hit spacebar to step forward. Watch memory changes animate in real-time.",
  },
];

// ─── Social Proof Stats ──────────────────────────────────────────────────────

const STATS = [
  { value: "3,200+", label: "Students Trained" },
  { value: "12", label: "Algorithm Types" },
  { value: "94%", label: "Comprehension Rate" },
  { value: "✓", label: "Curriculum-Aligned" },
];

// ─── Institution Tiers ───────────────────────────────────────────────────────

const INST_TIERS = [
  {
    name: "Free Sandbox",
    price: "₹0",
    period: "/semester",
    sub: "Core visualizer access",
    badge: null as string | null,
    badgeColor: null as string | null,
    glowing: false,
    features: [
      "5 traces / day",
      "Standard visualizers",
      "Basic AI explanations",
    ],
    cta: "Start for Free",
    ctaStyle: "ghost" as "ghost" | "primary" | "success",
    href: "/visualize",
  },
  {
    name: "Pro Student",
    price: "₹299",
    period: "/semester",
    sub: "Unlimited traces & AI",
    badge: "POPULAR" as string | null,
    badgeColor: "var(--primary)" as string | null,
    glowing: false,
    features: [
      "Unlimited traces",
      "50 AI tutor queries / day",
      "Interactive graph builder",
      "Code sharing + permalinks",
      "Achievement certificates",
      "Access dashboard",
    ],
    cta: "Upgrade to Pro",
    ctaStyle: "primary" as "ghost" | "primary" | "success",
    href: "/payment?plan=pro",
  },
  {
    name: "Department License",
    price: "₹20,000",
    period: "/year",
    sub: "Whole department covered",
    badge: "BEST VALUE" as string | null,
    badgeColor: "var(--success)" as string | null,
    glowing: true,
    features: [
      "Everything in Pro for ALL students",
      "Teacher Dashboard + Assignment Builder",
      "Student Analytics & Progress Heatmap",
      "NAAC-Ready Engagement Report Export",
      "Custom school branding",
      "Dedicated email support",
      "GST invoice provided",
    ],
    cta: "Contact for Demo",
    ctaStyle: "success" as "ghost" | "primary" | "success",
    href: "mailto:codecanvas@lpu.in",
  },
];

// ─── FAQ Items ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Is my students' data secure?",
    a: "Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We use Supabase with row-level security and never share student data with third parties. Full DPDP Act 2023 compliance.",
  },
  {
    q: "Can I integrate CodeCanvas with Moodle or Google Classroom?",
    a: "LTI 1.3 integration is on our roadmap for Q3 2026. Currently, teachers can use shareable links and invite codes to connect classrooms. Google Classroom adapter is also planned.",
  },
  {
    q: "Does CodeCanvas help with NAAC accreditation?",
    a: "Yes! The Teacher Dashboard includes a dedicated NAAC Export tab that generates per-class engagement reports, student activity metrics, and outcome-based education data ready for SSR/AQAR documentation.",
  },
  {
    q: "What happens when the license expires?",
    a: "Students retain read-only access to their saved visualizations. Teachers can export all data before expiry. We provide a 30-day grace period for renewal. No data is deleted for 90 days after expiry.",
  },
  {
    q: "Which programming languages are supported?",
    a: "C, C++, Python, Java, and SQL. Each language has tailored visualizers — from pointer diagrams for C to DataFrame views for Python. We're adding JavaScript and Go support soon.",
  },
  {
    q: "Can we get a custom deployment for our university?",
    a: "Yes. Department License customers can request custom branding (logo, colors, domain) and we offer dedicated instance deployments for universities with 500+ students. Contact us for details.",
  },
  {
    q: "Is there a free trial for the Department License?",
    a: "We offer a 4-week pilot program for any department. Run it with one class, see the engagement data, then decide. No payment required until you're convinced.",
  },
  {
    q: "Do you provide GST invoices?",
    a: "Yes. All paid plans include GST-compliant invoices (18% GST). We support Purchase Order matching and TDS deduction for institutional procurement.",
  },
];

// ─── Testimonials Data ───────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "CodeCanvas transformed my CSE202 lab sessions. Students who previously struggled with pointer visualization now understand recursion intuitively after just one session. I\u2019ve never seen engagement like this.",
    name: "Prof. Rajan Sharma",
    role: "CSE Department, Lovely Professional University",
    initials: "RS",
    gradient: "linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)",
  },
  {
    quote: "As a student, I always struggled to understand how linked lists work in memory. CodeCanvas showed me the pointers moving step-by-step, and everything clicked. My DSA marks went from C to A in one semester.",
    name: "Ananya Mehta",
    role: "B.Tech CSE, 3rd Year Student",
    initials: "AM",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
  },
  {
    quote: "We evaluated 6 visualization tools before choosing CodeCanvas. The NAAC export feature alone justified the investment. Our accreditation documentation prep time dropped from 2 weeks to 2 days.",
    name: "Dr. Kavitha Nair",
    role: "Head of Department, CSE",
    initials: "KN",
    gradient: "linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)",
  },
];

// ─── Demo Contact Form Component ─────────────────────────────────────────────

function DemoContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    studentCount: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    fetch("/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => {
        setLoading(false);
        setSubmitted(true);
      })
      .catch(() => {
        setLoading(false);
        setSubmitted(true);
      });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--muted)",
    marginBottom: 6,
    display: "block",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };

  if (submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "56px 32px",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.12)",
            border: "1.5px solid var(--success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 26,
            color: "var(--success)",
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--success)",
            marginBottom: 10,
          }}
        >
          Demo Requested!
        </div>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          We&apos;ll reach out within 24 hours to your institutional email with a
          personalised CodeCanvas walkthrough.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "36px 32px",
        maxWidth: 680,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Row 1 — Name + Email */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div>
          <label style={labelStyle} htmlFor="cc-name">Full Name</label>
          <input
            id="cc-name"
            name="name"
            type="text"
            required
            placeholder="Dr. Rajan Sharma"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="cc-email">Institutional Email</label>
          <input
            id="cc-email"
            name="email"
            type="email"
            required
            placeholder="rajan@lpu.co.in"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 2 — Department + Student Count */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div>
          <label style={labelStyle} htmlFor="cc-dept">Department / College</label>
          <input
            id="cc-dept"
            name="department"
            type="text"
            required
            placeholder="Dept. of CSE, LPU"
            value={form.department}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="cc-count">Student Count</label>
          <select
            id="cc-count"
            name="studentCount"
            required
            value={form.studentCount}
            onChange={handleChange}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="" disabled>Select range…</option>
            <option value="<50">&lt;50 students</option>
            <option value="50-200">50 – 200 students</option>
            <option value="200-500">200 – 500 students</option>
            <option value="500+">500+ students</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label style={labelStyle} htmlFor="cc-message">Message (optional)</label>
        <textarea
          id="cc-message"
          name="message"
          rows={3}
          placeholder="Tell us about your course structure or specific needs…"
          value={form.message}
          onChange={handleChange}
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: 80,
          }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px 28px",
          background: loading ? "var(--surface-2)" : "var(--primary)",
          color: loading ? "var(--muted)" : "white",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.03em",
          transition: "opacity 0.15s",
          alignSelf: "flex-start",
        }}
      >
        {loading ? "Sending…" : "Request Demo →"}
      </button>
    </form>
  );
}

// ─── Interactive Algorithm Tracer Preview ───────────────────────────────────────

function MiniTracerPreview() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const steps = [
    {
      line: 3,
      explanation: "Starting inner sorting loop at j = 0. Comparing adjacent elements.",
      vars: { i: 0, j: 0, swapped: "False" },
      bars: [
        { value: 14, status: "default" },
        { value: 22, status: "default" },
        { value: 8, status: "default" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 4,
      explanation: "Comparing arr[j] (14) and arr[j+1] (22). Since 14 < 22, no swap is required.",
      vars: { i: 0, j: 0, swapped: "False" },
      bars: [
        { value: 14, status: "comparing" },
        { value: 22, status: "comparing" },
        { value: 8, status: "default" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 3,
      explanation: "Incrementing inner loop to index j = 1.",
      vars: { i: 0, j: 1, swapped: "False" },
      bars: [
        { value: 14, status: "default" },
        { value: 22, status: "default" },
        { value: 8, status: "default" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 4,
      explanation: "Comparing arr[1] (22) and arr[2] (8). Since 22 > 8, they must be swapped.",
      vars: { i: 0, j: 1, swapped: "False" },
      bars: [
        { value: 14, status: "default" },
        { value: 22, status: "comparing" },
        { value: 8, status: "comparing" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
    {
      line: 5,
      explanation: "Swapping arr[1] and arr[2]. Value 22 shifts right, and swapped is set to True.",
      vars: { i: 0, j: 1, swapped: "True" },
      bars: [
        { value: 14, status: "default" },
        { value: 8, status: "active" },
        { value: 22, status: "active" },
        { value: 31, status: "default" },
        { value: 19, status: "default" },
      ],
    },
  ];

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isAutoPlay, steps.length]);

  const currentStep = steps[stepIndex];

  return (
    <div
      style={{
        width: "100%",
        background: "var(--surface-0)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "var(--surface-1)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {["#EF4444", "#F59E0B", "#22C55E"].map((c) => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 11,
            color: "var(--text-muted)",
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          codecanvas.lpu.edu/visualize
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ background: "var(--surface-2)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--border)", fontWeight: 500 }}>
            Bubble Sort Demo ▾
          </div>
        </div>
      </div>

      {/* Editor & visualizer mock split */}
      <div style={{ display: "flex", height: 320, flexWrap: "wrap" }}>
        {/* Editor panel */}
        <div
          style={{
            flex: "1 1 240px",
            borderRight: "1px solid var(--border)",
            padding: "16px",
            fontFamily: "monospace",
            fontSize: 12,
            background: "var(--surface-0)",
            color: "var(--text-secondary)",
            overflow: "hidden",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: 10, marginBottom: 12, letterSpacing: "0.05em" }}>
            bubble_sort.py
          </div>
          {[
            "def bubbleSort(arr):",
            "    n = len(arr)",
            "    for i in range(n):",
            "        for j in range(0, n-i-1):",
            "            if arr[j] > arr[j+1]:",
            "                arr[j], arr[j+1] = arr[j+1], arr[j]",
          ].map((line, idx) => {
            const isCurrent = idx + 1 === currentStep.line;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  background: isCurrent ? "var(--primary-dim)" : "transparent",
                  color: isCurrent ? "var(--text)" : "var(--text-secondary)",
                  padding: "3px 6px",
                  borderRadius: 4,
                  borderLeft: isCurrent ? "3px solid var(--primary)" : "3px solid transparent",
                  transition: "all 150ms ease",
                }}
              >
                <span style={{ width: 20, color: "var(--muted-dim)", userSelect: "none" }}>{idx + 1}</span>
                <span style={{ whiteSpace: "pre" }}>{line}</span>
              </div>
            );
          })}
        </div>

        {/* Visualizer canvas */}
        <div
          style={{
            flex: "1.2 1 280px",
            background: "var(--surface-1)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: 180,
          }}
        >
          <div style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: 10, marginBottom: 12, letterSpacing: "0.05em", textAlign: "center" }}>
            Visual Canvas: Array
          </div>
          
          {/* Sorting bars */}
          <div style={{ display: "flex", alignContent: "flex-end", alignItems: "flex-end", gap: 12, flex: 1, justifyContent: "center", paddingBottom: 24 }}>
            {currentStep.bars.map((bar, idx) => {
              let barColor = "var(--surface-3)";
              if (bar.status === "comparing") barColor = "var(--primary)";
              if (bar.status === "active") barColor = "#22C55E";

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: bar.value * 4,
                      background: barColor,
                      borderRadius: "6px 6px 0 0",
                      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: bar.status !== "default" ? "0 4px 12px var(--primary-glow)" : "none",
                    }}
                  />
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", fontWeight: 600 }}>{bar.value}</span>
                </div>
              );
            })}
          </div>

          {/* Stepper control bar preview */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ fontWeight: 600 }}>Step {stepIndex + 1} / {steps.length}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={() => { setStepIndex((p) => (p - 1 + steps.length) % steps.length); setIsAutoPlay(false); }}
                style={{ background: "var(--surface-2)", padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}
              >Prev</button>
              <button 
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                style={{ background: isAutoPlay ? "var(--primary)" : "var(--surface-2)", padding: "4px 10px", borderRadius: 4, border: isAutoPlay ? "1px solid var(--primary)" : "1px solid var(--border)", color: isAutoPlay ? "#FFF" : "var(--text)", cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}
              >{isAutoPlay ? "Pause" : "Play"}</button>
              <button 
                onClick={() => { setStepIndex((p) => (p + 1) % steps.length); setIsAutoPlay(false); }}
                style={{ background: "var(--surface-2)", padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}
              >Next</button>
            </div>
          </div>
        </div>

        {/* AI Tutor Sidebar panel */}
        <div
          style={{
            flex: "1 1 220px",
            borderLeft: "1px solid var(--border)",
            background: "var(--surface-0)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: 10, marginBottom: 12, letterSpacing: "0.05em" }}>
            AI Tutor Explanation
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, flex: 1, fontWeight: 500 }}>
            {currentStep.explanation}
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
            <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.05em" }}>Variables Watch</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Object.entries(currentStep.vars).map(([name, val]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 11 }}>
                  <span style={{ color: "var(--text-muted)" }}>{name}</span>
                  <span style={{ color: "var(--text)", fontWeight: 700 }}>{val as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPageContent() {
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get("school");
  const schoolConfig = getSchoolConfig(schoolParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [studentCount, setStudentCount] = useState(300);

  const gradingHoursSaved = Math.round(studentCount * 3.5);
  const labPrepDaysSaved = Math.round(studentCount * 0.05 + 10);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {mounted ? (
            <img 
              src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"} 
              alt="CodeCanvas Logo" 
              style={{ height: 32, width: "auto", objectFit: "contain" }} 
            />
          ) : (
            <img 
              src="/logo-dark.png" 
              alt="CodeCanvas Logo" 
              style={{ height: 32, width: "auto", objectFit: "contain" }} 
            />
          )}
          <span
            style={{
              fontSize: 10,
              background: "var(--primary-dim)",
              color: "var(--primary)",
              padding: "2px 7px",
              borderRadius: 4,
              border: "1px solid var(--primary-border)",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            LPU
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="nav-desktop-links" style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#features" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }} onMouseOver={e => (e.currentTarget.style.color = "var(--text)")} onMouseOut={e => (e.currentTarget.style.color = "var(--muted)")}>Features</a>
          <Link href="/feedback" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }} onMouseOver={e => (e.currentTarget.style.color = "var(--text)")} onMouseOut={e => (e.currentTarget.style.color = "var(--muted)")}>Give Feedback</Link>
          <Link
            href="/battleground"
            style={{ fontSize: 13, color: "#F59E0B", textDecoration: "none", fontWeight: 700, padding: "5px 10px", background: "rgba(245, 158, 11, 0.1)", borderRadius: 6, border: "1px solid rgba(245, 158, 11, 0.3)" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Swords size={16} /> Battleground Arena</span>
          </Link>
          <Link
            href={`/visualize?school=${schoolConfig.id}`}
            className="btn btn-primary"
            style={{ fontSize: 13 }}
            id="nav-open-tracer"
          >
            Launch Visualizer
          </Link>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8,
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text)", cursor: "pointer", transition: "all 0.15s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "var(--surface-1)"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: "none",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "6px 8px",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            background: "var(--surface-1)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            zIndex: 999,
          }}
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, color: "var(--text)", textDecoration: "none", padding: "8px 0" }}>Features</a>
          <Link href="/feedback" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, color: "var(--text)", textDecoration: "none", padding: "8px 0" }}>Give Feedback</Link>
          <Link
            href="/battleground"
            style={{ fontSize: 14, color: "#F59E0B", textDecoration: "none", fontWeight: 700, padding: "8px 0" }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Swords size={16} /> Battleground Arena</span>
          </Link>
          <Link
            href={`/visualize?school=${schoolConfig.id}`}
            className="btn btn-primary"
            style={{ fontSize: 13, textAlign: "center", marginTop: 4 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Launch Visualizer
          </Link>
          {mounted && (
            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setMobileMenuOpen(false);
              }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "10px 0", marginTop: 8,
                background: "transparent", border: "1px solid var(--border)", borderRadius: 6,
                color: "var(--text)", cursor: "pointer", fontSize: 14
              }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              Toggle Theme
            </button>
          )}
        </div>
      )}

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, var(--primary-dim) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, width: "100%", textAlign: "center" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontSize: 12,
              color: "var(--muted)",
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--success)",
                display: "inline-block",
              }}
            />
            Curriculum Aligned for {schoolConfig.name} · LPU
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: "var(--text)",
              marginBottom: 20,
            }}
          >
            Visualize Your Code.
            <br />
            <span style={{ color: "var(--primary)" }}>Master Algorithms.</span>
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "var(--muted)",
              maxWidth: 580,
              margin: "0 auto 36px",
              lineHeight: 1.65,
            }}
          >
            Watch your variables change, stacks pop, and structures animate in real-time.
            An interactive sandbox with voice AI tutor explanations designed to make coding intuitive.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 56,
            }}
          >
            <Link
              href={`/visualize?school=${schoolConfig.id}`}
              style={{
                padding: "11px 28px",
                fontSize: 14,
                fontWeight: 600,
                color: "#FFF",
                background: "#C27803",
                borderRadius: 8,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#B45309";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#C27803";
                e.currentTarget.style.transform = "none";
              }}
              id="hero-cta-tracer"
            >
              Start Visualizing Free →
            </Link>
            <Link
              href="/battleground"
              style={{
                padding: "11px 28px",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                color: "#FFF",
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                borderRadius: 8,
                boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #F59E0B, #D97706)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #F59E0B, #D97706)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <Swords size={18} /> Enter Battleground Arena
            </Link>
          </div>

          {/* Product preview */}
          <MiniTracerPreview />
        </div>
      </section>

      {/* ── Trusted by Logo Bar ── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-1)",
          padding: "24px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Aligned with curriculum standards of leading technical institutions
        </span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "40px",
            opacity: 0.65,
          }}
        >
          {/* LPU Logo mockup */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>L</div>
            <span style={{ fontWeight: 800, fontSize: 13, color: "var(--text)", letterSpacing: "-0.5px" }}>Lovely Professional University</span>
          </div>
          {/* IIT Logo mockup */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "var(--bg)" }}>I</div>
            <span style={{ fontWeight: 800, fontSize: 13, color: "var(--text)", letterSpacing: "-0.5px" }}>Indian Institute of Technology</span>
          </div>
          {/* BITS Logo mockup */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>B</div>
            <span style={{ fontWeight: 800, fontSize: 13, color: "var(--text)", letterSpacing: "-0.5px" }}>BITS Pilani</span>
          </div>
          {/* DTU Logo mockup */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>D</div>
            <span style={{ fontWeight: 800, fontSize: 13, color: "var(--text)", letterSpacing: "-0.5px" }}>DTU Delhi</span>
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section
        style={{
          padding: "80px 24px",
          maxWidth: 900,
          margin: "0 auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 12 }}>
            How CodeCanvas Works
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            Go from syntax confusion to visual confidence in three steps.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
          }}
        >
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              style={{
                padding: "24px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--primary)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 12,
                  letterSpacing: "0.05em",
                }}
              >
                {step.step}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
                {step.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{
          padding: "80px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 12 }}>
            Purpose-Built for LPU Coding Learners
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            All the features you need to bridge the gap between code structure and mental models.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {TRACER_FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "24px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "var(--primary-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
                {f.title}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
                {f.desc}
              </p>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--muted)",
                  background: "var(--surface-2)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                }}
              >
                {f.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ── SECTION 1: Social Proof Bar ──
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(180deg, var(--surface-1) 0%, var(--bg) 100%)",
          padding: "40px 24px",
        }}
      >
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Trusted by students and faculty across leading institutions
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 0,
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center" }}>
              {/* Stat Pill */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "18px 40px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  minWidth: 160,
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--primary)",
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </span>
              </div>

              {/* Gradient divider between pills */}
              {i < STATS.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 40,
                    background: "linear-gradient(180deg, transparent 0%, var(--border) 50%, transparent 100%)",
                    margin: "0 14px",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>


      {/* ── CTA Banner ── */}
      <section
        style={{
          padding: "80px 24px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 3.5vw, 40px)",
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--text)",
          }}
        >
          Ready to see your code in motion?
        </h2>
        <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 32 }}>
          Launch the CodeCanvas algorithm sandbox and start simulating.
        </p>
        <Link
          href={`/visualize?school=${schoolConfig.id}`}
          className="btn btn-primary"
          style={{ padding: "12px 32px", fontSize: 15, fontWeight: 600 }}
          id="cta-bottom-visualizer"
        >
          Launch Visualizer →
        </Link>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          ── FAQ Section ──
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        style={{
          padding: "80px 24px",
          maxWidth: 800,
          margin: "0 auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            Everything you need to know before adopting CodeCanvas.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQ_ITEMS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: openFaqIndex === i ? "var(--surface-1)" : "transparent",
                border: "1px solid var(--border)",
                borderRadius: 10,
                overflow: "hidden",
                transition: "background 0.15s",
              }}
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.5 }}>
                  {faq.q}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="2"
                  style={{
                    flexShrink: 0,
                    transform: openFaqIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaqIndex === i && (
                <div
                  style={{
                    padding: "0 20px 18px",
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--surface-1)",
          padding: "60px 24px 32px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand Column */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>CodeCanvas</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, maxWidth: 220 }}>
              AI-powered algorithm visualization and learning platform built for Indian universities.
            </p>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="#features" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Features</a>
              <Link href={`/visualize?school=${schoolConfig.id}`} style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Visualizer</Link>
              <Link href="/login" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Sign In</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Resources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/feedback" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Give Feedback</Link>
              <Link href="/about" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>About Us</Link>
              <Link href="/integrations" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>LMS Integrations</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/terms" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Terms of Service</Link>
              <Link href="/privacy" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/refund-policy" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>Refund Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
            © 2026 CodeCanvas. Built by Prathamesh Sawarkar.
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ color: "var(--muted)", transition: "color 0.15s" }} onMouseOver={e => (e.currentTarget.style.color = "var(--text)")} onMouseOut={e => (e.currentTarget.style.color = "var(--muted)")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ color: "var(--muted)", transition: "color 0.15s" }} onMouseOver={e => (e.currentTarget.style.color = "var(--text)")} onMouseOut={e => (e.currentTarget.style.color = "var(--muted)")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: "var(--muted)", transition: "color 0.15s" }} onMouseOver={e => (e.currentTarget.style.color = "var(--text)")} onMouseOut={e => (e.currentTarget.style.color = "var(--muted)")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <LandingPageContent />
    </Suspense>
  );
}
