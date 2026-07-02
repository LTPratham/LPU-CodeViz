"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  title: string;
  description: string;
  target: string; // CSS selector hint (for positioning description)
  emoji: string;
}

const TOUR_STEPS: Step[] = [
  {
    emoji: "👋",
    title: "Welcome to CodeCanvas!",
    description:
      "You're about to see your code come alive. This 30-second tour shows you how to get the most out of CodeCanvas.",
    target: "center",
  },
  {
    emoji: "✏️",
    title: "Write or Pick Your Code",
    description:
      "On the left, you have a VS Code-style editor. Write any C, C++, Python, Java, or SQL code — or click 'Templates' to pick from 20+ curriculum-aligned examples.",
    target: "left",
  },
  {
    emoji: "▶️",
    title: "Hit Visualize",
    description:
      "Click the blue 'Visualize' button (or press Ctrl+Enter). Our AI engine will simulate your code execution step-by-step and animate the data structures.",
    target: "top",
  },
  {
    emoji: "🎬",
    title: "Step Through Your Code",
    description:
      "Use the step controls at the bottom: click Next/Previous, press Spacebar to play/pause, or drag the slider to jump to any step. Watch variables update in real-time.",
    target: "bottom",
  },
  {
    emoji: "🤖",
    title: "Ask the AI Tutor",
    description:
      "Confused about a step? Click 'AI Tutor' on the right panel and ask anything: 'Why did i become 2 here?' or 'What's the time complexity of this sort?'",
    target: "right",
  },
  {
    emoji: "🔗",
    title: "Share Your Visualization",
    description:
      "Once you run a trace, click 'Share' to get a permanent link you can send to your teacher or classmates. Your trace lives on the web forever.",
    target: "center",
  },
];

const STORAGE_KEY = "codecanvas_tour_done";

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Show tour after short delay for page to settle
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!visible) return null;

  const current = TOUR_STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              zIndex: 9000,
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Tour Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              position: "fixed",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 420,
              maxWidth: "calc(100vw - 32px)",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "28px 28px 24px",
              zIndex: 9001,
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.15)",
            }}
          >
            {/* Step counter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === step ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === step ? "var(--primary)" : "var(--border)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={dismiss}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: 18,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ fontSize: 36, marginBottom: 12 }}>{current.emoji}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
              {current.title}
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
              {current.description}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={dismiss}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: "8px 0",
                }}
              >
                Skip tour
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                {step > 0 && (
                  <button
                    onClick={prev}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "8px 16px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={next}
                  style={{
                    background: "var(--primary)",
                    border: "none",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "8px 20px",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  {step === TOUR_STEPS.length - 1 ? "Let's Go! 🚀" : "Next →"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
