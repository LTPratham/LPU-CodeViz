"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level error boundary for /visualize.
 * Replaces the generic Next.js "This page couldn't load" error screen
 * with a branded, user-friendly recovery UI.
 */
export default function VisualizeError({ error, reset }: Props) {
  useEffect(() => {
    // Log error details without crashing
    console.error("[VisualizeError] Route error boundary caught:", error);
  }, [error]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #0F172A)",
        gap: 24,
        padding: 32,
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.1)",
          border: "2px solid rgba(239,68,68,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
        }}
      >
        ⚠
      </div>

      {/* Heading */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#FCA5A5",
            marginBottom: 10,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Visualizer hit a snag
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#94A3B8",
            maxWidth: 400,
            lineHeight: 1.6,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          The AI returned unexpected data and one of the visualizer components
          crashed. Click <strong>Try Again</strong> to reload — your code is
          still safe.
        </p>
        {error?.message && (
          <p
            style={{
              marginTop: 12,
              fontSize: 12,
              fontFamily: "monospace",
              color: "#64748B",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              padding: "8px 14px",
              display: "inline-block",
              maxWidth: 480,
              wordBreak: "break-all",
            }}
          >
            {error.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #1D9E75, #24C28F)",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
            boxShadow: "0 4px 16px rgba(29,158,117,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(29,158,117,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(29,158,117,0.3)";
          }}
        >
          🔄 Try Again
        </button>
        <a
          href="/visualize"
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "#94A3B8",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            transition: "all 0.2s",
          }}
        >
          ↩ Reload Page
        </a>
      </div>
    </div>
  );
}
