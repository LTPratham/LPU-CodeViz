"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { Language, TraceStep, ExplainLine } from "@/lib/types";
import { traceCode, explainCode } from "@/lib/api";
import { getDefaultSample } from "@/lib/sampleCodes";
import StepController from "@/components/StepController";
import ExplainSidebar from "@/components/ExplainSidebar";
import { createClient } from "@/utils/supabase/client";
import { signout } from "../login/actions";

// Client-only components
const CodeEditor  = dynamic(() => import("@/components/CodeEditor"),  { ssr: false });
const VisualCanvas= dynamic(() => import("@/components/VisualCanvas"),{ ssr: false });
const TutorChat   = dynamic(() => import("@/components/TutorChat"),   { ssr: false });

function VisualizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const [language, setLanguage] = useState<Language>("c");
  const [code, setCode] = useState("");
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [explanations, setExplanations] = useState<ExplainLine[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [dataStructure, setDataStructure] = useState("array");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mobileTab, setMobileTab] = useState<"code" | "visual" | "explain">("code");
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIdx] ?? null;
  const currentLine = currentStep?.line ?? -1;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fetch user session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserEmail(data.user.email || data.user.phone || "User");
      }
    });
  }, []);

  // Auto-play
  useEffect(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    if (!isPlaying || steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 700 / speed);

    playIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  // On mount: read from URL or default
  useEffect(() => {
    const urlLang = searchParams.get("lang") as Language | null;
    const urlCode = searchParams.get("code");
    
    if (urlLang && ["c", "cpp", "python", "sql"].includes(urlLang)) {
      setLanguage(urlLang);
    }
    
    if (urlCode) {
      try {
        setCode(atob(decodeURIComponent(urlCode)));
      } catch (e) {
        console.error("Failed to decode code from URL", e);
      }
    } else if (!code) {
      setCode(getDefaultSample(urlLang || "c")?.code ?? "");
    }
  }, [searchParams]);

  // Track comparisons/swaps
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.action === "compare") setComparisons((c) => c + 1);
    if (currentStep.action === "swap")    setSwaps((s) => s + 1);
  }, [currentStepIdx]);

  const handleVisualize = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    setSteps([]);
    setExplanations([]);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setComparisons(0);
    setSwaps(0);

    try {
      const [traceRes, explainRes] = await Promise.all([
        traceCode({ lang: language, code }),
        explainCode({ lang: language, code }),
      ]);

      setSteps(traceRes.steps);
      setDataStructure(traceRes.dataStructure);
      setExplanations(explainRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg.includes("fetch") ? "Cannot connect to backend. Is the FastAPI server running? (localhost:8000)" : msg);
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);

  const goFirst  = () => { setIsPlaying(false); setCurrentStepIdx(0); };
  const goPrev   = () => { setIsPlaying(false); setCurrentStepIdx((i) => Math.max(0, i - 1)); };
  const goNext   = () => { setIsPlaying(false); setCurrentStepIdx((i) => Math.min(steps.length - 1, i + 1)); };
  const goLast   = () => { setIsPlaying(false); setCurrentStepIdx(steps.length - 1); };
  const playPause= () => {
    if (currentStepIdx >= steps.length - 1) setCurrentStepIdx(0);
    setIsPlaying((v) => !v);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      overflow: "hidden",
    }}>
      {/* ── Topbar ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        height: 52,
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        gap: 12,
        flexShrink: 0,
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none", color: "inherit"
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "white",
          }}>◈</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "var(--primary-light)" }}>
            LPU CodeViz
          </span>
        </Link>

        {/* Mobile tab switcher */}
        <div style={{
          display: "flex",
          gap: 4,
        }}
          className="mobile-tabs"
        >
          {(["code", "visual", "explain"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                background: mobileTab === tab ? "var(--primary)" : "transparent",
                color: mobileTab === tab ? "white" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {/* Share Button */}
          <button
            onClick={() => {
              const b64 = encodeURIComponent(btoa(code));
              const url = `${window.location.origin}/visualize?lang=${language}&code=${b64}`;
              navigator.clipboard.writeText(url);
              alert("URL copied to clipboard!");
            }}
            className="btn btn-ghost"
            style={{ padding: "6px 12px", fontSize: 12, height: "auto" }}
          >
            🔗 Share
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-icon"
            style={{ borderRadius: "50%", padding: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Toggle theme"
          >
            {mounted ? (theme === "dark" ? "☼" : "☾") : "☾"}
          </button>

          {/* User Profile / Sign Out */}
          {userEmail && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: "1px solid var(--border)" }}>
              <div style={{ 
                width: 24, height: 24, borderRadius: "50%", background: "var(--primary)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold"
              }} title={userEmail}>
                {userEmail.charAt(0) === "+" ? "U" : userEmail.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={() => signout()}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Error badge */}
        {error && (
          <div style={{
            fontSize: 12,
            color: "#FCA5A5",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 6,
            padding: "4px 10px",
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── Main 3-panel layout ── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "30% 45% 25%",
        gridTemplateRows: "1fr",
        overflow: "hidden",
        minHeight: 0,
      }}
        className="main-grid"
      >
        {/* LEFT — Code Editor */}
        <div style={{ gridColumn: 1, overflow: "hidden" }} className="panel-code">
          <CodeEditor
            code={code}
            language={language}
            currentLine={currentLine}
            onChange={setCode}
            onLanguageChange={setLanguage}
            onVisualize={handleVisualize}
            isLoading={isLoading}
          />
        </div>

        {/* CENTER — Visual Canvas */}
        <div style={{
          gridColumn: 2,
          borderLeft: "1px solid var(--border)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#111827",
        }}
          className="panel-visual"
        >
          {/* Canvas header */}
          <div className="panel-header">
            <span>Visual Canvas</span>
            {steps.length > 0 && (
              <span className="badge badge-green" style={{ marginLeft: "auto", fontSize: 10 }}>
                {steps.length} steps
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            <VisualCanvas
              step={currentStep}
              dataStructure={dataStructure}
              speed={speed}
              isLoading={isLoading}
              comparisons={comparisons}
              swaps={swaps}
            />
          </div>
        </div>

        {/* RIGHT — Explanation Sidebar */}
        <div style={{ gridColumn: 3, overflow: "hidden" }} className="panel-explain">
          <ExplainSidebar
            explanations={explanations}
            currentStep={currentStep}
            currentLine={currentLine}
          />
        </div>
      </div>

      {/* ── Step Controls ── */}
      <StepController
        currentStep={currentStepIdx + 1}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        speed={speed}
        onFirst={goFirst}
        onPrev={goPrev}
        onNext={goNext}
        onLast={goLast}
        onPlayPause={playPause}
        onSpeedChange={setSpeed}
      />

      {/* ── AI Tutor Chat ── */}
      <div style={{ height: 240, flexShrink: 0 }}>
        <TutorChat code={code} lang={language} currentStep={currentStep} />
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          .panel-code    { display: ${mobileTab === "code"    ? "block" : "none"} !important; grid-column: 1 !important; }
          .panel-visual  { display: ${mobileTab === "visual"  ? "flex"  : "none"} !important; grid-column: 1 !important; border: none !important; }
          .panel-explain { display: ${mobileTab === "explain" ? "block" : "none"} !important; grid-column: 1 !important; }
        }
        @media (min-width: 901px) {
          .mobile-tabs { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function VisualizePage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, color: "var(--text)" }}>Loading...</div>}>
      <VisualizeContent />
    </Suspense>
  );
}
