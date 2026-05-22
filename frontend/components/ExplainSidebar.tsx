"use client";
import { useState, useEffect, useRef } from "react";
import type { ExplainLine, TraceStep } from "@/lib/types";
import { Play, Pause, Square, Volume2 } from "lucide-react";

interface Props {
  explanations: ExplainLine[];
  currentStep: TraceStep | null;
  currentLine: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  core:      "#1D9E75",
  structure: "#3B82F6",
  io:        "#F59E0B",
  logic:     "#A78BFA",
  db:        "#F97316",
};

const CONCEPT_COLORS: Record<string, string> = {
  "Loop":        "#3B82F6",
  "Recursion":   "#A78BFA",
  "Comparison":  "#F59E0B",
  "Assignment":  "#22C55E",
  "Stack Push":  "#F97316",
  "Stack Pop":   "#EF4444",
  "Function":    "#1D9E75",
  "Condition":   "#F59E0B",
};

const renderSafeVal = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  return JSON.stringify(val);
};

export default function ExplainSidebar({ explanations, currentStep, currentLine }: Props) {
  const [expandedWhy, setExpandedWhy] = useState<number | null>(null);

  // Speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [showSpeechControls, setShowSpeechControls] = useState(true);

  const safeExplanations = Array.isArray(explanations) ? explanations : [];
  const currentExplain = safeExplanations.find((e) => e?.line === currentLine);
  const prevExplains = safeExplanations.filter((e) => e && e.line < currentLine).slice(-4).reverse();

  // Load voices dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const allVoices = synth.getVoices();
      const engVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith("en"));
      setVoices(engVoices.length > 0 ? engVoices : allVoices);
    };
    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }
    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  // Set default voice
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      const defaultVoice = voices.find(v => v.lang.toLowerCase().startsWith("en") && v.name.toLowerCase().includes("google"))
        || voices.find(v => v.lang.toLowerCase().startsWith("en"))
        || voices[0];
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      }
    }
  }, [voices, selectedVoice]);

  // Speech controls
  const speak = (text: any) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const textStr = renderSafeVal(text);
    if (!textStr) return;

    const cleanText = textStr.replace(/[`*#_]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speed;
    utterance.pitch = 1.0;

    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    setIsSpeaking(true);
    setIsPaused(false);
    synth.speak(utterance);
  };

  const togglePause = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      if (synth.paused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
    }
  };

  const stop = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Sync automatic play on line changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);

    if (autoPlay && currentExplain) {
      const timer = setTimeout(() => {
        speak(currentExplain.explain);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentLine, autoPlay]);

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--card)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Explanation</span>
        <button
          onClick={() => setShowSpeechControls(!showSpeechControls)}
          style={{
            background: "transparent",
            border: "none",
            color: showSpeechControls ? "var(--primary)" : "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 6,
            transition: "all 0.2s",
          }}
          title="Toggle AI Voice Tutor Controls"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* Voice Tutor Control Bar */}
      {showSpeechControls && (
        <div style={{
          background: "rgba(255,255,255,0.015)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {/* Row 1: Playback Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={isSpeaking ? togglePause : () => speak(currentExplain?.explain || "")}
                disabled={!currentExplain}
                className="speech-btn"
                title={isSpeaking ? (isPaused ? "Resume" : "Pause") : "Speak Explanation"}
                style={{
                  background: isSpeaking && !isPaused ? "var(--primary)" : "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: currentExplain ? "pointer" : "not-allowed",
                  color: isSpeaking && !isPaused ? "white" : "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
              >
                {isSpeaking && !isPaused ? <Pause size={14} /> : <Play size={14} />}
              </button>

              {isSpeaking && (
                <button
                  onClick={stop}
                  className="speech-btn"
                  title="Stop Speech"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#EF4444",
                    transition: "all 0.2s",
                  }}
                >
                  <Square size={14} />
                </button>
              )}

              {/* Sound Wave Animation */}
              {isSpeaking && !isPaused && (
                <div style={{ display: "flex", gap: 3, alignItems: "center", height: 12, marginLeft: 6 }}>
                  <div style={{ width: 2, height: 12, background: "var(--primary)", transformOrigin: "bottom", animation: "speech-wave 0.6s ease-in-out infinite alternate" }} />
                  <div style={{ width: 2, height: 8, background: "var(--primary)", transformOrigin: "bottom", animation: "speech-wave 0.6s ease-in-out infinite alternate 0.15s" }} />
                  <div style={{ width: 2, height: 14, background: "var(--primary)", transformOrigin: "bottom", animation: "speech-wave 0.6s ease-in-out infinite alternate 0.3s" }} />
                  <div style={{ width: 2, height: 10, background: "var(--primary)", transformOrigin: "bottom", animation: "speech-wave 0.6s ease-in-out infinite alternate 0.45s" }} />
                </div>
              )}
            </div>

            {/* Auto Read Toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                style={{
                  cursor: "pointer",
                  accentColor: "var(--primary)",
                  width: 14,
                  height: 14,
                }}
              />
              Auto-Read
            </label>
          </div>

          {/* Row 2: Settings (Speed and Voice selection) */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Speed slider */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", width: 28 }}>{speed}x</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: "var(--primary)",
                  height: 4,
                  borderRadius: 2,
                  cursor: "pointer",
                  background: "var(--border)",
                }}
              />
            </div>

            {/* Voice Select */}
            {voices.length > 0 && (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--text-secondary)",
                  fontSize: 10,
                  padding: "4px 6px",
                  outline: "none",
                  maxWidth: 120,
                  cursor: "pointer",
                }}
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name.replace(/Microsoft|Google|Apple/g, "").trim().substring(0, 15)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <style>{`
            @keyframes speech-wave {
              0% { transform: scaleY(0.3); }
              100% { transform: scaleY(1.2); }
            }
            .speech-btn:hover {
              background: rgba(255, 255, 255, 0.1) !important;
              transform: translateY(-1px);
            }
            .speech-btn:active {
              transform: translateY(0);
            }
          `}</style>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {/* Current explanation */}
        {currentExplain ? (
          <div style={{
            background: "rgba(29,158,117,0.08)",
            border: "1px solid rgba(29,158,117,0.3)",
            borderRadius: 10,
            padding: "14px",
            marginBottom: 16,
          }}>
            {/* Line number */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--primary)",
                background: "var(--primary-glow)",
                border: "1px solid var(--primary)",
                borderRadius: 4,
                padding: "2px 8px",
                fontFamily: "var(--font-mono)",
              }}>
                Line {currentExplain.line}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: CATEGORY_COLORS[String(currentExplain.category)] || "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {renderSafeVal(currentExplain.category)}
              </span>
            </div>

            {/* Code snippet */}
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--primary-light)",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 6,
              padding: "6px 10px",
              marginBottom: 10,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}>
              {renderSafeVal(currentExplain.code)}
            </div>

            {/* Explanation text */}
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>
              {renderSafeVal(currentExplain.explain)}
            </p>

            {/* Concept badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                background: `${CONCEPT_COLORS[String(currentExplain.concept)] || "#64748B"}20`,
                border: `1px solid ${CONCEPT_COLORS[String(currentExplain.concept)] || "#64748B"}40`,
                color: CONCEPT_COLORS[String(currentExplain.concept)] || "#94A3B8",
              }}>
                {renderSafeVal(currentExplain.concept)}
              </span>
            </div>

            {/* Step description from trace */}
            {currentStep && (
              <div style={{
                marginTop: 10,
                padding: "8px 10px",
                background: "rgba(245,158,11,0.08)",
                borderLeft: "3px solid #F59E0B",
                borderRadius: "0 6px 6px 0",
                fontSize: 12,
                color: "#F59E0B",
                lineHeight: 1.6,
              }}>
                {typeof currentStep.description === "string" ? currentStep.description : JSON.stringify(currentStep.description)}
              </div>
            )}

            {/* "Why does this work?" expandable */}
            <button
              onClick={() => setExpandedWhy(expandedWhy === currentExplain.line ? null : currentExplain.line)}
              style={{
                marginTop: 10,
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "5px 10px",
                fontSize: 11,
                color: "var(--text-muted)",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{expandedWhy === currentExplain.line ? "▼" : "▶"}</span>
              Why does this work?
            </button>
            {expandedWhy === currentExplain.line && (
              <div style={{
                marginTop: 6,
                padding: "12px",
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 6,
                fontSize: 12,
                color: "#E2E8F0",
                lineHeight: 1.7,
              }}>
                <div style={{ marginBottom: 8 }}>
                  This is a <strong style={{ color: "#60A5FA" }}>{renderSafeVal(currentExplain.concept)}</strong> operation.
                </div>
                <div style={{ color: "#94A3B8", fontSize: "11.5px", whiteSpace: "pre-line" }}>
                  {renderSafeVal(currentExplain.why) || (
                    <>
                      {currentExplain.category === "structure"
                        ? "Data structures help organize and manage data efficiently. "
                        : currentExplain.category === "logic"
                        ? "Control flow decides which code runs based on conditions. "
                        : currentExplain.category === "core"
                        ? "This is a fundamental programming operation. "
                        : ""}
                      Understanding this pattern is essential for your exams.
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "24px 12px",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            {safeExplanations.length > 0
              ? "Navigate to a step to see the explanation"
              : "Click Visualize to generate explanations"}
          </div>
        )}

        {/* Previous steps history */}
        {prevExplains.length > 0 && (
          <div>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              Previous Steps
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {prevExplains.map((e) => (
                <div key={e.line} style={{
                  padding: "8px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  opacity: 0.7,
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3, fontFamily: "var(--font-mono)" }}>
                    Line {e.line}
                    <span style={{ color: CATEGORY_COLORS[String(e.category)], marginLeft: 6 }}>{renderSafeVal(e.concept)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{renderSafeVal(e.explain)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

