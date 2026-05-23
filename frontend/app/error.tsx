"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global app-level error boundary.
 * Catches any unhandled errors that bypass route-level boundaries.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError] App-level error caught:", error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#0F172A",
          color: "#E2E8F0",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
          textAlign: "center",
          padding: 32,
        }}
      >
        <div style={{ fontSize: 40 }}>⚠</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#FCA5A5", marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#94A3B8", maxWidth: 380, lineHeight: 1.6, fontSize: 14 }}>
          An unexpected error occurred. Click below to try recovering.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #1D9E75, #24C28F)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <a
            href="/visualize"
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#94A3B8",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Go to Visualizer
          </a>
        </div>
      </body>
    </html>
  );
}
