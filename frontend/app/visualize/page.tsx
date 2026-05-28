"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { Language, TraceStep, ExplainLine, PredictionChallenge } from "@/lib/types";
import { traceCode, explainCode } from "@/lib/api";
import { tryLocalExecution } from "@/lib/localExecution";
import { checkCache, saveToCache } from "@/lib/cacheService";
import { getDefaultSample } from "@/lib/sampleCodes";
import StepController from "@/components/StepController";
import ExplainSidebar from "@/components/ExplainSidebar";
import { createClient } from "@/utils/supabase/client";
import { signout } from "../login/actions";
import { generateChallenge, shuffleArray } from "@/lib/challenge";
import VisualizerErrorBoundary from "@/components/VisualizerErrorBoundary";
import { getSchoolConfig } from "@/lib/schools";


// Client-only components
const CodeEditor  = dynamic(() => import("@/components/CodeEditor"),  { ssr: false });
const VisualCanvas= dynamic(() => import("@/components/VisualCanvas"),{ ssr: false });
const TutorChat   = dynamic(() => import("@/components/TutorChat"),   { ssr: false });
const AlgorithmCatalog = dynamic(() => import("@/components/AlgorithmCatalog"), { ssr: false });

function detectLanguage(code: string, currentLang: Language): { detected: Language; reason: string } | null {
  const codeTrimmed = code.trim();
  if (!codeTrimmed) return null;

  const isPythonCode = 
    codeTrimmed.includes("def ") || 
    codeTrimmed.includes("elif ") || 
    codeTrimmed.includes("import pandas") ||
    codeTrimmed.includes("print_name") ||
    /^\s*#\s+/m.test(codeTrimmed) ||
    (codeTrimmed.includes("print(") && !codeTrimmed.includes("printf") && !codeTrimmed.includes("System.out"));

  const isCCppCode = 
    codeTrimmed.includes("#include") || 
    codeTrimmed.includes("void ") || 
    codeTrimmed.includes("int main") || 
    codeTrimmed.includes("printf(") || 
    codeTrimmed.includes("std::cout") ||
    codeTrimmed.includes("using namespace std");

  const isJavaCode = 
    codeTrimmed.includes("public static void main") ||
    codeTrimmed.includes("System.out.print") ||
    (codeTrimmed.includes("class Main") && codeTrimmed.includes("String[] args"));

  if (isPythonCode && currentLang !== "python") {
    return { detected: "python", reason: "Found Python-specific syntax (e.g. 'def', '#' comment, or 'print')" };
  }
  
  if (isCCppCode && currentLang !== "c" && currentLang !== "cpp") {
    return { detected: "c", reason: "Found C/C++ specific syntax (e.g. '#include', 'void', 'int main', or 'printf')" };
  }

  if (isJavaCode && currentLang !== "java") {
    return { detected: "java", reason: "Found Java-specific syntax (e.g. 'public static void main' or 'System.out.print')" };
  }

  return null;
}

function VisualizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const schoolParam = searchParams.get("school");
  const schoolConfig = getSchoolConfig(schoolParam);
  const activeColor = schoolConfig.primaryColor;


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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeChallenge, setActiveChallenge] = useState<PredictionChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [challengeState, setChallengeState] = useState<"unanswered" | "correct" | "incorrect">("unanswered");
  // Increments on every Visualize click — used as key on error boundary so it fully resets
  const [visualizeRunId, setVisualizeRunId] = useState(0);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIdx] ?? null;
  // Force to number — the API returns line as a string ("3") but Monaco needs an integer
  const currentLine = currentStep ? (Number(currentStep.line) || 0) : 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fetch user session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      const data = res?.data;
      if (data?.user) {
        setUserEmail(data.user.email || data.user.phone || "User");
      }
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("user_subscription");
    setUserEmail(null);
    try {
      await signout();
    } catch (e) {
      console.warn("Server-side signout redirect handled client-side:", e);
    }
    router.push("/login");
  }, [router]);

  const currentStepIdxRef = useRef(currentStepIdx);
  useEffect(() => {
    currentStepIdxRef.current = currentStepIdx;
  }, [currentStepIdx]);

  // Auto-play
  useEffect(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    if (!isPlaying || steps.length === 0) return;

    const interval = setInterval(() => {
      const prev = currentStepIdxRef.current;
      if (prev >= steps.length - 1) {
        setIsPlaying(false);
        return;
      }
      const current = steps[prev];
      const next = steps[prev + 1];
      if (isChallengeMode && current && next) {
        const challenge = generateChallenge(current, next);
        if (challenge) {
          challenge.options = shuffleArray(challenge.options);
          setActiveChallenge(challenge);
          setUserAnswer(null);
          setChallengeState("unanswered");
          setIsPlaying(false);
          return;
        }
      }
      setCurrentStepIdx(prev + 1);
    }, 700 / speed);

    playIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isPlaying, speed, steps, isChallengeMode]);

  // On mount: read from URL or default
  useEffect(() => {
    const urlLang = searchParams.get("lang") as Language | null;
    const urlCode = searchParams.get("code");
    
    if (urlLang && ["c", "cpp", "python", "sql", "java", "html"].includes(urlLang)) {
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

  const handleVisualize = useCallback(async (overrideCode?: string, overrideLang?: Language) => {
    let activeCode = typeof overrideCode === "string" ? overrideCode : code;
    let activeLang = typeof overrideLang === "string" ? overrideLang : language;
    if (!activeCode.trim()) return;

    // Auto-detect language tab mismatch
    const mismatch = detectLanguage(activeCode, activeLang);
    if (mismatch) {
      console.warn(`Language mismatch detected: expected ${activeLang}, detected ${mismatch.detected}. Auto-switching tab.`);
      setLanguage(mismatch.detected);
      activeLang = mismatch.detected;
    }
    // Increment run ID so error boundaries fully remount and reset
    setVisualizeRunId((id) => id + 1);
    setIsLoading(true);
    setError(null);
    setSteps([]);
    setExplanations([]);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setComparisons(0);
    setSwaps(0);
    setScore(0);
    setStreak(0);
    setActiveChallenge(null);
    setUserAnswer(null);
    setChallengeState("unanswered");

    // 1. Try client-side local execution FIRST — always fresh, no stale cache risk
    // Cache is only consulted when local execution cannot handle the code pattern.
    const localTrace = await tryLocalExecution(activeLang, activeCode);
    if (localTrace) {
      setSteps(localTrace.steps);
      setDataStructure(localTrace.dataStructure);
      let finalExplains: ExplainLine[] = [];
      try {
        const explainRes = await explainCode({ lang: activeLang, code: activeCode });
        finalExplains = explainRes;
        setExplanations(explainRes);
      } catch (err: unknown) {
        console.warn("Failed to fetch explanations from backend, using client-side fallback", err);
        const lines = activeCode.split("\n");
        finalExplains = lines.map((lineText, idx) => ({
          line: idx + 1,
          code: lineText,
          explain: lineText.trim() ? "Executed client-side." : "",
          concept: "Local Execution",
          category: "core",
          why: "This line is simulated locally in your browser. Use the cloud 'Visualize' option to fetch detailed AI concept breakdowns."
        }));
        setExplanations(finalExplains);
      }

      // Save fresh local result to cache (overwrites any stale entry)
      saveToCache(activeLang, activeCode, localTrace, finalExplains);
      setIsLoading(false);
      return;
    }

    // 2. Check Supabase cache — only reached when local execution can't handle the code
    try {
      const cached = await checkCache(activeLang, activeCode);
      if (cached) {
        setSteps(cached.trace_data.steps);
        setDataStructure(cached.trace_data.dataStructure);
        setExplanations(cached.explain_data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Visualizer cache check failed:", err);
    }

    // 3. Cloud LLM Backend execution
    try {
      const [traceRes, explainRes] = await Promise.all([
        traceCode({ lang: activeLang, code: activeCode }),
        explainCode({ lang: activeLang, code: activeCode }),
      ]);

      setSteps(traceRes.steps);
      setDataStructure(traceRes.dataStructure);
      setExplanations(explainRes);
      
      // Save cloud run to cache
      saveToCache(activeLang, activeCode, traceRes, explainRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg.includes("fetch") ? "Cannot connect to backend. Is the FastAPI server running? (localhost:8000)" : msg);
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);

  const handleCatalogSelect = useCallback((selectedCode: string, selectedLang: Language) => {
    setCode(selectedCode);
    setLanguage(selectedLang);
    setIsCatalogOpen(false);
    handleVisualize(selectedCode, selectedLang);
  }, [handleVisualize]);

  const handleGenerateCode = useCallback((generatedCode: string) => {
    setCode(generatedCode);
    setLanguage("python");
    handleVisualize(generatedCode, "python");
  }, [handleVisualize]);

  const handleToggleChallengeMode = () => {
    setIsChallengeMode((v) => {
      const newVal = !v;
      if (!newVal) {
        setActiveChallenge(null);
        setUserAnswer(null);
        setChallengeState("unanswered");
      }
      return newVal;
    });
  };

  const handleAnswerSelect = (opt: string) => {
    if (!activeChallenge || userAnswer !== null) return;
    setUserAnswer(opt);
    const isCorrect = opt === activeChallenge.correctAnswer;
    if (isCorrect) {
      setChallengeState("correct");
      const basePoints = 10;
      const currentStreak = streak + 1;
      setStreak(currentStreak);
      const bonus = currentStreak >= 2 ? Math.min(20, Math.floor(currentStreak / 2) * 5) : 0;
      setScore((s) => s + basePoints + bonus);
    } else {
      setChallengeState("incorrect");
      setStreak(0);
    }
  };

  const confirmAndProceed = () => {
    setActiveChallenge(null);
    setUserAnswer(null);
    setChallengeState("unanswered");
    setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const skipChallenge = () => {
    setActiveChallenge(null);
    setUserAnswer(null);
    setChallengeState("unanswered");
    setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const goFirst  = () => {
    setIsPlaying(false);
    setActiveChallenge(null);
    setUserAnswer(null);
    setChallengeState("unanswered");
    setCurrentStepIdx(0);
  };

  const goPrev   = () => {
    setIsPlaying(false);
    setActiveChallenge(null);
    setUserAnswer(null);
    setChallengeState("unanswered");
    setCurrentStepIdx((i) => Math.max(0, i - 1));
  };

  const goNext   = () => {
    setIsPlaying(false);
    const prev = currentStepIdx;
    if (prev >= steps.length - 1) return;
    const current = steps[prev];
    const next = steps[prev + 1];
    if (isChallengeMode && current && next) {
      const challenge = generateChallenge(current, next);
      if (challenge) {
        challenge.options = shuffleArray(challenge.options);
        setActiveChallenge(challenge);
        setUserAnswer(null);
        setChallengeState("unanswered");
        return;
      }
    }
    setCurrentStepIdx(prev + 1);
  };

  const goLast   = () => {
    setIsPlaying(false);
    setActiveChallenge(null);
    setUserAnswer(null);
    setChallengeState("unanswered");
    setCurrentStepIdx(steps.length - 1);
  };

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
            background: `linear-gradient(135deg, ${activeColor}, #9A4BFF)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "white",
            boxShadow: `0 0 10px ${activeColor}30`
          }}>◈</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: activeColor, display: "flex", alignItems: "center" }}>
            CodeCanvas
            <span style={{ 
              fontSize: 9, 
              background: `${activeColor}15`, 
              color: activeColor, 
              padding: "2px 6px", 
              borderRadius: 4, 
              marginLeft: 8, 
              border: `1px solid ${activeColor}30`,
              fontWeight: 700,
              letterSpacing: "0.5px"
            }}>LPU {schoolConfig.shortName}</span>
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
          {/* Algorithm Catalog Button */}
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="btn btn-ghost"
            style={{ padding: "6px 12px", fontSize: 12, height: "auto" }}
          >
            📚 Catalog
          </button>

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
                onClick={handleSignOut}
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
          position: "relative",
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
              key={visualizeRunId}
              step={currentStep}
              dataStructure={dataStructure}
              speed={speed}
              isLoading={isLoading}
              comparisons={comparisons}
              swaps={swaps}
              code={code}
              language={language}
              isLastStep={steps.length > 0 && currentStepIdx === steps.length - 1}
              steps={steps}
              currentStepIdx={currentStepIdx}
              onGenerateCode={handleGenerateCode}
            />
          </div>

          {/* Gamified Challenge Overlay */}
          {activeChallenge && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              zIndex: 50,
              animation: "fadeIn 0.25s ease-out",
            }}>
              <div style={{
                width: "100%",
                maxWidth: 440,
                background: "rgba(30, 41, 59, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                color: "#F8FAFC",
                animation: "scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🧠</span>
                    <span style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 12, color: "#F59E0B" }}>
                      Prediction Challenge
                    </span>
                  </div>
                  {streak > 0 && (
                    <span style={{
                      fontSize: 12,
                      background: "rgba(245, 158, 11, 0.2)",
                      color: "#F59E0B",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontWeight: 800,
                      animation: "pulse 1.5s infinite",
                      display: "flex",
                      alignItems: "center",
                      gap: 3
                    }}>
                      🔥 {streak} Streak
                    </span>
                  )}
                </div>

                {/* Question */}
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>
                  {activeChallenge.question}
                </div>

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeChallenge.options.map((opt) => {
                    const isSelected = userAnswer === opt;
                    const isCorrectAnswer = opt === activeChallenge.correctAnswer;
                    
                    let btnStyle: React.CSSProperties = {
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: "rgba(255, 255, 255, 0.04)",
                      color: "#E2E8F0",
                    };

                    if (userAnswer !== null) {
                      if (isCorrectAnswer) {
                        btnStyle.background = "rgba(16, 185, 129, 0.2)";
                        btnStyle.borderColor = "#10B981";
                        btnStyle.color = "#34D399";
                        btnStyle.fontWeight = 700;
                      } else if (isSelected) {
                        btnStyle.background = "rgba(239, 68, 68, 0.2)";
                        btnStyle.borderColor = "#EF4444";
                        btnStyle.color = "#F87171";
                      } else {
                        btnStyle.opacity = 0.5;
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerSelect(opt)}
                        disabled={userAnswer !== null}
                        style={btnStyle}
                        onMouseEnter={(e) => {
                          if (userAnswer === null) {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (userAnswer === null) {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                            e.currentTarget.style.transform = "translateX(0)";
                          }
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>{opt}</span>
                          {userAnswer !== null && isCorrectAnswer && <span>✓</span>}
                          {userAnswer !== null && isSelected && !isCorrectAnswer && <span>✕</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Answer feedback and details */}
                {userAnswer !== null && (
                  <div style={{
                    animation: "fadeIn 0.3s ease-out",
                    background: challengeState === "correct" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                    border: `1px solid ${challengeState === "correct" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                    borderRadius: 10,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 800, 
                      color: challengeState === "correct" ? "#34D399" : "#F87171",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}>
                      {challengeState === "correct" ? (
                        <>🎉 Correct! +10 Points {streak >= 2 && `(Streak Bonus: +${Math.min(20, Math.floor(streak / 2) * 5)} pts!)`}</>
                      ) : (
                        <>❌ Incorrect</>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.4 }}>
                      <strong>Action context:</strong> {activeChallenge.description}
                    </div>
                  </div>
                )}

                {/* Footer controls */}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {userAnswer === null ? (
                    <button
                      onClick={skipChallenge}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "transparent",
                        color: "#94A3B8",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#E2E8F0";
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#94A3B8";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Skip Challenge
                    </button>
                  ) : (
                    <button
                      onClick={confirmAndProceed}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                        color: "white",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px var(--primary-glow)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px var(--primary-glow)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px var(--primary-glow)";
                      }}
                    >
                      Show Execution & Proceed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
        isChallengeMode={isChallengeMode}
        onToggleChallengeMode={handleToggleChallengeMode}
        score={score}
      />

      {/* ── Algorithm Catalog Sliding Drawer ── */}
      <AlgorithmCatalog
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelect={handleCatalogSelect}
      />

      {/* ── Floating AI Tutor Chatbot ── */}
      {isChatOpen && (
        <div style={{
          position: "fixed",
          bottom: 142,
          right: 20,
          width: "calc(100vw - 40px)",
          maxWidth: 380,
          height: "calc(100vh - 220px)",
          maxHeight: 480,
          borderRadius: 16,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
          border: "1px solid var(--border)",
          background: "var(--card)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 1000,
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <TutorChat
            code={code}
            lang={language}
            currentStep={currentStep}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}

      {/* ── Chatbot Toggle Button ── */}
      <button
        onClick={() => setIsChatOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
          border: "none",
          color: "white",
          fontSize: 24,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px var(--primary-glow)",
          zIndex: 1001,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 24px var(--primary-glow)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px var(--primary-glow)";
        }}
        title="Toggle AI Tutor Chat"
        aria-label="Toggle AI Tutor Chat"
      >
        {isChatOpen ? "✕" : "💬"}
      </button>

      {/* Mobile responsive and animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(0.96);
          }
        }
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

