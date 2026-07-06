"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HelpCircle, ArrowRight, ArrowLeft, X, Play, RotateCcw } from "lucide-react";

interface TourStep {
  url: string;
  selector: string;
  title: string;
  text: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  actionBefore?: () => void;
  actionAfter?: (router: any) => void;
}

const STUDENT_TOUR: TourStep[] = [
  {
    url: "/",
    selector: "#pricing-pro-cta, a[href*='/visualize']",
    title: "CodeCanvas Sandbox",
    text: "Welcome to the CodeCanvas interactive walkthrough! Let's start the Student Tour by entering the algorithm visualizer sandbox.",
    position: "bottom",
    actionAfter: (router) => {
      router.push("/visualize");
    }
  },
  {
    url: "/visualize",
    selector: ".panel-code",
    title: "Interactive Code Editor",
    text: "Here, students can write programs in Python, C, C++, Java, or SQL. Let's switch language templates.",
    position: "right",
    actionBefore: () => {
      // Clear localStorage onboarding tour done key so it doesn't conflict
      localStorage.setItem("codecanvas_tour_done", "1");
    }
  },
  {
    url: "/visualize",
    selector: "#lang-tab-python",
    title: "Language Framework Selectors",
    text: "Select a language template (like Python or C). CodeCanvas pre-loads standard visualizer templates automatically.",
    position: "bottom"
  },
  {
    url: "/visualize",
    selector: "#visualize-btn",
    title: "AI Trace Compilation",
    text: "Clicking 'Visualize' compiles the code locally or triggers the AI cloud compiler to compute execution steps.",
    position: "top",
    actionAfter: () => {
      // Simulate clicking visualize button
      const btn = document.getElementById("visualize-btn");
      if (btn) (btn as HTMLButtonElement).click();
    }
  },
  {
    url: "/visualize",
    selector: ".panel-visual",
    title: "3D Visual Elements Canvas",
    text: "Watch data structures (like arrays, stacks, pointers, or binary trees) render dynamically as elements execute.",
    position: "left"
  },
  {
    url: "/visualize",
    selector: "#step-next",
    title: "Step Controller Navigation",
    text: "Step through trace indices, play/pause auto-runs, or adjust animation speed using the playback bar.",
    position: "top"
  },
  {
    url: "/visualize",
    selector: ".panel-explain",
    title: "AI Tutor chat & Concepts",
    text: "Confused about variables? Review step explanations or chat directly with the AI tutor for pointer tracing guidance.",
    position: "left"
  },
  {
    url: "/visualize",
    selector: "a[href*='/dashboard']",
    title: "Student Dashboard Nav",
    text: "Now, let's explore how CodeCanvas tracks progress and gamifies learning. Let's go to the Student Hub.",
    position: "bottom",
    actionAfter: (router) => {
      // Set cookie to student and redirect
      document.cookie = "mock_role=student; path=/";
      router.push("/dashboard/student");
    }
  },
  {
    url: "/dashboard/student",
    selector: "h1",
    title: "Student Learning Dashboard",
    text: "Welcome to the Student Hub! It aggregates student telemetry, daily practice tracks, and levels.",
    position: "bottom"
  },
  {
    url: "/dashboard/student",
    selector: "div[style*='Target']",
    title: "Syllabus Coverage Goals",
    text: "These progress gauges represent student mastery levels across essential subjects like Lists, Sorting, Graphs, and Trees.",
    position: "top"
  },
  {
    url: "/dashboard/student",
    selector: "div[style*='Award']",
    title: "Badges & Credentials",
    text: "Earn credentials like 'Centurion' or 'SQL Wizard' as you complete traces. Student walkthrough complete!",
    position: "top"
  }
];

const TEACHER_TOUR: TourStep[] = [
  {
    url: "/",
    selector: "a[href*='/login']",
    title: "Faculty Control Portal Tour",
    text: "Welcome! Let's explore how CodeCanvas assists university departments (like LPU CSE) in managing visual labs and NAAC grading audits.",
    position: "bottom",
    actionAfter: (router) => {
      document.cookie = "mock_role=teacher; path=/";
      router.push("/dashboard/teacher");
    }
  },
  {
    url: "/dashboard/teacher",
    selector: "h1",
    title: "Faculty Control Dashboard",
    text: "This is the Teacher Hub. Faculty can monitor student enrollment, average scores, and assignment submissions.",
    position: "bottom"
  },
  {
    url: "/dashboard/teacher",
    selector: "button:nth-child(5)", // NAAC Export tab in sidebar
    title: "NAAC Accreditation Tab",
    text: "Quality audit compliance (NAAC/UGC) is critical for colleges. Let's look at the report exporter.",
    position: "right",
    actionAfter: () => {
      // Click the NAAC tab programmatically
      const buttons = Array.from(document.querySelectorAll("aside button"));
      const naacBtn = buttons.find(b => b.textContent?.includes("NAAC Export"));
      if (naacBtn) (naacBtn as HTMLButtonElement).click();
    }
  },
  {
    url: "/dashboard/teacher",
    selector: "button:contains('Export CSV'), main button",
    title: "Single-Click Data Exporter",
    text: "Generate audit-ready spreadsheets containing trace counts, active sessions, and grading marks for course reports.",
    position: "left"
  },
  {
    url: "/dashboard/teacher",
    selector: "button:nth-child(2)", // My Classes tab
    title: "Active Classroom Lists",
    text: "Let's head back to class folders.",
    position: "right",
    actionAfter: () => {
      const buttons = Array.from(document.querySelectorAll("aside button"));
      const classesBtn = buttons.find(b => b.textContent?.includes("My Classes"));
      if (classesBtn) (classesBtn as HTMLButtonElement).click();
    }
  },
  {
    url: "/dashboard/teacher",
    selector: "div[style*='invite_code'], button[style*='Copy']",
    title: "Batch Class Enrollments",
    text: "Invite codes allow students to self-enroll. Let's open a class detail dashboard.",
    position: "bottom",
    actionAfter: (router) => {
      router.push("/dashboard/teacher/class/class-1");
    }
  },
  {
    url: "/dashboard/teacher/class/class-1",
    selector: "table",
    title: "Student Activity Roster",
    text: "View live rosters, trace counts, and last activity timestamps. Remove students with a single click if needed.",
    position: "top"
  },
  {
    url: "/dashboard/teacher/class/class-1",
    selector: "div[style*='ClipboardList']",
    title: "Course Lab Assignments",
    text: "Publish challenges prefilled with algorithm code templates. Let's open the assignment grading dashboard.",
    position: "left",
    actionAfter: (router) => {
      router.push("/dashboard/teacher/assignment/assign-1");
    }
  },
  {
    url: "/dashboard/teacher/assignment/assign-1",
    selector: "table",
    title: "AI Assisted Lab Review",
    text: "CodeCanvas automatically evaluates and AI-grades students' step logs. Teachers can read explanation feedback and override grades. Tour complete!",
    position: "top"
  }
];

export default function ProductTour() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeScenario, setActiveScenario] = useState<"student" | "teacher" | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState<boolean>(false);

  // Sync state from sessionStorage and check first-visit status
  useEffect(() => {
    const sc = sessionStorage.getItem("tour_scenario");
    const st = sessionStorage.getItem("tour_step");
    if (sc && st) {
      setActiveScenario(sc as any);
      setStepIndex(parseInt(st, 10));
    }
    const seen = localStorage.getItem("has_seen_tour_prompt");
    if (seen === "true" && !sc) {
      setHasSeenPrompt(true);
    }

    const handleOpenTour = () => {
      setHasSeenPrompt(false);
      setShowDropdown(true);
    };
    window.addEventListener("open-product-tour", handleOpenTour);
    return () => window.removeEventListener("open-product-tour", handleOpenTour);
  }, []);

  const steps = activeScenario === "student" ? STUDENT_TOUR : activeScenario === "teacher" ? TEACHER_TOUR : [];
  const currentStep = steps[stepIndex] ?? null;

  // Track the highlighted element's bounding rect
  useEffect(() => {
    if (!currentStep) {
      setBox(null);
      return;
    }

    // Verify if we are on the correct page for this step, if not, redirect
    if (pathname !== currentStep.url) {
      return;
    }

    const updateBoundingBox = () => {
      let el: Element | null = null;
      
      // Support matching text content (like button:contains('NAAC'))
      if (currentStep.selector.includes(":contains")) {
        const text = currentStep.selector.split("'")[1] || currentStep.selector.split('"')[1] || "";
        const tags = Array.from(document.querySelectorAll("button, a, span, th, td"));
        el = tags.find(t => t.textContent?.includes(text)) || null;
      } else {
        el = document.querySelector(currentStep.selector);
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        setBox({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        // Scroll into view if needed
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // Retry a few times if rendering is delayed
        setBox(null);
      }
    };

    updateBoundingBox();
    
    // Listen for resize/scroll
    window.addEventListener("resize", updateBoundingBox);
    window.addEventListener("scroll", updateBoundingBox);

    // Timeout fallback for slower dynamic loads
    const t = setTimeout(updateBoundingBox, 500);

    return () => {
      window.removeEventListener("resize", updateBoundingBox);
      window.removeEventListener("scroll", updateBoundingBox);
      clearTimeout(t);
    };
  }, [currentStep, pathname]);

  const handleStart = (scenario: "student" | "teacher") => {
    sessionStorage.setItem("tour_scenario", scenario);
    sessionStorage.setItem("tour_step", "0");
    localStorage.setItem("has_seen_tour_prompt", "true");
    setHasSeenPrompt(true);

    // Automatically grant demo session access so unauthenticated visitors never get stuck on login during the demo!
    document.cookie = `mock_role=${scenario}; path=/; max-age=31536000`;
    localStorage.setItem("mock_role", scenario);

    setActiveScenario(scenario);
    setStepIndex(0);
    setShowDropdown(false);

    const firstStep = scenario === "student" ? STUDENT_TOUR[0] : TEACHER_TOUR[0];
    if (pathname !== firstStep.url) {
      router.push(firstStep.url);
    }
  };

  const handleNext = () => {
    if (!activeScenario || stepIndex >= steps.length - 1) {
      handleEnd();
      return;
    }

    const step = steps[stepIndex];
    if (step.actionAfter) {
      step.actionAfter(router);
    }

    const nextIdx = stepIndex + 1;
    sessionStorage.setItem("tour_step", String(nextIdx));
    setStepIndex(nextIdx);

    const nextStep = steps[nextIdx];
    if (nextStep && nextStep.actionBefore) {
      nextStep.actionBefore();
    }
    if (nextStep && pathname !== nextStep.url) {
      router.push(nextStep.url);
    }
  };

  const handleBack = () => {
    if (stepIndex <= 0) return;
    const prevIdx = stepIndex - 1;
    sessionStorage.setItem("tour_step", String(prevIdx));
    setStepIndex(prevIdx);

    const prevStep = steps[prevIdx];
    if (prevStep && pathname !== prevStep.url) {
      router.push(prevStep.url);
    }
  };

  const handleEnd = () => {
    sessionStorage.removeItem("tour_scenario");
    sessionStorage.removeItem("tour_step");
    localStorage.setItem("has_seen_tour_prompt", "true");
    setHasSeenPrompt(true);
    setActiveScenario(null);
    setStepIndex(-1);
    setBox(null);
  };

  return (
    <>
      {/* Floating Tour Button — Only visible on first visit or when tour is active */}
      {(!hasSeenPrompt || activeScenario) && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "end", gap: 10 }}>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 8px",
              boxShadow: "var(--shadow-lg), 0 0 20px rgba(59,130,246,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 200,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", padding: "4px 12px 8px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
              Interactive Tours
            </div>
            <button
              onClick={() => handleStart("student")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 8,
                background: "transparent",
                border: "none",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              🎓 Student Portal Walkthrough
            </button>
            <button
              onClick={() => handleStart("teacher")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 8,
                background: "transparent",
                border: "none",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              🏫 Faculty Control Walkthrough
            </button>
          </motion.div>
        )}

        <button
          onClick={() => {
            if (activeScenario) {
              handleEnd();
            } else {
              setShowDropdown(!showDropdown);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 999,
            background: activeScenario ? "var(--danger)" : "var(--primary)",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: activeScenario ? "0 4px 14px rgba(239,68,68,0.3)" : "0 4px 14px rgba(59,130,246,0.3)",
            transition: "all 0.2s ease",
          }}
        >
          {activeScenario ? (
            <>
              <X size={15} /> Exit Tour ({stepIndex + 1}/{steps.length})
            </>
          ) : (
            <>
              <Sparkles size={15} /> Live Guided Tour
            </>
          )}
        </button>
      </div>
      )}

      {/* Tour Spotlight Overlay */}
      {currentStep && box && (
        <>
          {/* Spotlight mask */}
          <div
            style={{
              position: "absolute",
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              zIndex: 99990,
              pointerEvents: "none",
              borderRadius: 6,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 15px var(--primary)",
              outline: "2px solid var(--primary)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* Balloon dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              position: "absolute",
              top: currentStep.position === "bottom" ? box.top + box.height + 12 : currentStep.position === "top" ? box.top - 180 : box.top,
              left: currentStep.position === "right" ? box.left + box.width + 16 : currentStep.position === "left" ? box.left - 340 : box.left + (box.width - 320) / 2,
              width: 320,
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
              zIndex: 99995,
              boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>
                {currentStep.title}
              </div>
              <button
                onClick={handleEnd}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }}
              >
                <X size={14} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
              {currentStep.text}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
                Step {stepIndex + 1} of {steps.length}
              </span>
              
              <div style={{ display: "flex", gap: 8 }}>
                {stepIndex > 0 && (
                  <button
                    onClick={handleBack}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    background: "var(--primary)",
                    border: "none",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {stepIndex === steps.length - 1 ? "Finish" : "Next"} <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
