"use client";
import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  glowColor?: string;
}

export default function GlowCard({ children, glowColor = "59, 130, 246" }: GlowCardProps) {
  return (
    <div
      className="glow-card"
      style={{
        padding: "24px",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = `rgba(${glowColor}, 0.5)`;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = `0 8px 32px rgba(${glowColor}, 0.1), 0 0 0 1px rgba(${glowColor}, 0.1)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "var(--border)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--glow-x", `${x}px`);
        el.style.setProperty("--glow-y", `${y}px`);
      }}
    >
      {/* Mouse-following glow spot */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(300px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(${glowColor}, 0.06), transparent 60%)`,
          opacity: 1,
          transition: "opacity 200ms ease",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
