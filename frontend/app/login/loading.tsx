export default function LoginLoading() {
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
  };

  const skeletonPulse: React.CSSProperties = {
    background: "var(--surface-1)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    animation: "pulse 1.5s infinite ease-in-out",
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...skeletonPulse, width: 400, height: 480, padding: 36 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 48, height: 48, borderRadius: 10 }} />
        </div>
        <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 180, height: 24, margin: "0 auto 8px" }} />
        <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 220, height: 14, margin: "0 auto 36px" }} />

        <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: "100%", height: 38, marginBottom: 16 }} />
        <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: "100%", height: 38, marginBottom: 24 }} />

        <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: "100%", height: 42, borderRadius: 8 }} />
      </div>
    </div>
  );
}
