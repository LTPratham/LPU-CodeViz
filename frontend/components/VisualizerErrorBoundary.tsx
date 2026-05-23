"use client";
import React from "react";

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * VisualizerErrorBoundary
 * Wraps any visualizer subtree and catches render-time exceptions.
 * When a crash is caught, it renders a graceful "Something went wrong" panel
 * instead of propagating up to the Next.js root error boundary ("This page couldn't load").
 */
export default class VisualizerErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for debugging without crashing the page
    console.error("[VisualizerErrorBoundary] Caught render error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              border: "2px solid rgba(239,68,68,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            ⚠
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "#FCA5A5", fontSize: 14, marginBottom: 6 }}>
              {this.props.fallbackMessage ?? "Visualization encountered an error"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.5 }}>
              The AI returned unexpected data for this step. Try stepping to the next step or re-visualizing.
            </p>
            {this.state.error && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "#64748B",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  maxWidth: 360,
                  wordBreak: "break-all",
                }}
              >
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              marginTop: 8,
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.4)",
              background: "rgba(239,68,68,0.08)",
              color: "#FCA5A5",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
