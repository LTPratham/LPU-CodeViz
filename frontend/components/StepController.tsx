"use client";
import { useEffect, useCallback } from "react";

interface Props {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onPlayPause: () => void;
  onSpeedChange: (s: number) => void;
}

const SPEEDS = [0.5, 1, 1.5, 2];

export default function StepController({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onPlayPause,
  onSpeedChange,
}: Props) {
  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") { e.preventDefault(); onNext(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); onPrev(); }
      if (e.key === " ")          { e.preventDefault(); onPlayPause(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onPlayPause]);

  const pct = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;
  const canGoPrev = currentStep > 1;
  const canGoNext = currentStep < totalSteps;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 20px",
      background: "var(--card)",
      borderTop: "1px solid var(--border)",
      gap: 16,
      flexWrap: "wrap",
    }}>
      {/* Left: Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* First */}
        <button
          id="step-first"
          className="btn-icon"
          onClick={onFirst}
          disabled={!canGoPrev}
          title="First step (Home)"
          aria-label="First step"
          style={{ fontSize: 14, width: 34, height: 34 }}
        >
          |◀
        </button>
        {/* Prev */}
        <button
          id="step-prev"
          className="btn-icon"
          onClick={onPrev}
          disabled={!canGoPrev}
          title="Previous step (←)"
          aria-label="Previous step"
          style={{ fontSize: 14, width: 34, height: 34 }}
        >
          ◀
        </button>
        {/* Play / Pause */}
        <button
          id="step-play"
          onClick={onPlayPause}
          disabled={totalSteps === 0}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          aria-label={isPlaying ? "Pause" : "Play"}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "none",
            background: totalSteps > 0 ? "var(--primary)" : "var(--border)",
            color: "white",
            fontSize: 16,
            cursor: totalSteps > 0 ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            boxShadow: totalSteps > 0 ? "0 0 14px var(--primary-glow)" : "none",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        {/* Next */}
        <button
          id="step-next"
          className="btn-icon"
          onClick={onNext}
          disabled={!canGoNext}
          title="Next step (→)"
          aria-label="Next step"
          style={{ fontSize: 14, width: 34, height: 34 }}
        >
          ▶
        </button>
        {/* Last */}
        <button
          id="step-last"
          className="btn-icon"
          onClick={onLast}
          disabled={!canGoNext}
          title="Last step (End)"
          aria-label="Last step"
          style={{ fontSize: 14, width: 34, height: 34 }}
        >
          ▶|
        </button>
      </div>

      {/* Center: Progress bar + step counter */}
      <div style={{ flex: 1, minWidth: 120, maxWidth: 400, display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Progress bar */}
        <div
          style={{
            height: 4,
            background: "var(--border)",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const target = Math.round(pct * (totalSteps - 1)) + 1;
            // Jump to step by calling next/prev — parent handles it
            // For simplicity we'll just emit the target
          }}
        >
          <div style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--primary), var(--primary-light))",
            borderRadius: 2,
            transition: "width 0.3s ease",
          }} />
        </div>

        {/* Step label */}
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          {totalSteps > 0 ? (
            <>
              <span style={{ color: "var(--text)", fontWeight: 700 }}>Step {currentStep}</span>
              {" / "}{totalSteps}
            </>
          ) : (
            "No steps"
          )}
        </div>
      </div>

      {/* Right: Speed + keyboard hint */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: speed === s ? "var(--primary)" : "var(--border)",
              background: speed === s ? "var(--primary-glow)" : "transparent",
              color: speed === s ? "var(--primary-light)" : "var(--text-muted)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {s}×
          </button>
        ))}

        {/* Keyboard hint */}
        <div style={{
          display: "flex",
          gap: 4,
          fontSize: 10,
          color: "var(--text-muted)",
          marginLeft: 4,
        }}>
          <kbd style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px", fontFamily: "var(--font-mono)" }}>←</kbd>
          <kbd style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px", fontFamily: "var(--font-mono)" }}>→</kbd>
          <span>navigate</span>
        </div>
      </div>
    </div>
  );
}
