import Link from "next/link";

export const metadata = {
  title: "404 Page Not Found — CodeCanvas",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text)",
    textAlign: "center",
    padding: "24px",
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: "var(--primary-dim)",
          border: "1px solid var(--primary-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary)",
          marginBottom: 32,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: "clamp(64px, 10vw, 96px)",
          fontWeight: 900,
          letterSpacing: "-4px",
          color: "var(--primary)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 700, marginTop: 16, marginBottom: 12 }}>
        Lost in Code?
      </h2>
      <p style={{ fontSize: 15, color: "var(--muted)", maxWidth: 440, margin: "0 auto 36px", lineHeight: 1.6 }}>
        The visual stack frame you requested does not exist or has been garbage collected. Let&apos;s guide you back.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600 }}>
          Go to Home
        </Link>
        <Link href="/visualize" className="btn btn-ghost" style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600, border: "1px solid var(--border)" }}>
          Launch Sandbox
        </Link>
      </div>
    </div>
  );
}
