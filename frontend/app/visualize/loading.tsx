export default function VisualizeLoading() {
  const containerStyle: React.CSSProperties = {
    height: "calc(100vh - 60px)",
    display: "flex",
    background: "var(--bg)",
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
      {/* Code Editor Panel Skeleton */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ ...skeletonPulse, width: 140, height: 28 }} />
          <div style={{ ...skeletonPulse, width: 90, height: 28 }} />
        </div>
        <div style={{ ...skeletonPulse, flex: 1 }} />
      </div>

      {/* Visual Canvas Panel Skeleton */}
      <div style={{ flex: 1.2, display: "flex", flexDirection: "column", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ ...skeletonPulse, width: 180, height: 28 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ ...skeletonPulse, width: 80, height: 28 }} />
            <div style={{ ...skeletonPulse, width: 80, height: 28 }} />
          </div>
        </div>
        <div style={{ ...skeletonPulse, flex: 1 }} />
      </div>
    </div>
  );
}
