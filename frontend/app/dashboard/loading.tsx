export default function DashboardLoading() {
  const containerStyle: React.CSSProperties = {
    padding: "32px 24px",
    maxWidth: 1200,
    margin: "0 auto",
    color: "var(--text)",
  };

  const skeletonPulse: React.CSSProperties = {
    background: "var(--surface-1)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    animation: "pulse 1.5s infinite ease-in-out",
  };

  return (
    <div style={containerStyle}>
      {/* Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ ...skeletonPulse, width: 220, height: 28, marginBottom: 8 }} />
          <div style={{ ...skeletonPulse, width: 140, height: 16 }} />
        </div>
        <div style={{ ...skeletonPulse, width: 120, height: 36, borderRadius: 6 }} />
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ ...skeletonPulse, height: 100, padding: 20 }}>
            <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 100, height: 14, marginBottom: 12 }} />
            <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 60, height: 24 }} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
        {/* Left Big Card */}
        <div style={{ ...skeletonPulse, height: 320, padding: 24 }}>
          <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 150, height: 18, marginBottom: 20 }} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 36, height: 36, borderRadius: "50%" }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: "70%", height: 14, marginBottom: 6 }} />
                <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: "40%", height: 10 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Big Card */}
        <div style={{ ...skeletonPulse, height: 320, padding: 24 }}>
          <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 120, height: 18, marginBottom: 20 }} />
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 56, height: 56, borderRadius: "50%" }} />
                <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: 40, height: 12 }} />
              </div>
            ))}
          </div>
          <div style={{ ...skeletonPulse, background: "var(--surface-2)", width: "100%", height: 100 }} />
        </div>
      </div>
    </div>
  );
}
