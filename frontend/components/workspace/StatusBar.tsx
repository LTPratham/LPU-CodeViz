"use client";

interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  zoom: number;
  selectedCount: number;
}

export default function StatusBar({ nodeCount, edgeCount, zoom, selectedCount }: StatusBarProps) {
  return (
    <div className="statusbar">
      <div className="statusbar-item">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        <span>Nodes:</span>
        <span className="statusbar-value" id="statusbar-node-count">{nodeCount}</span>
      </div>

      <div className="statusbar-sep" />

      <div className="statusbar-item">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <span>Edges:</span>
        <span className="statusbar-value" id="statusbar-edge-count">{edgeCount}</span>
      </div>

      <div className="statusbar-sep" />

      <div className="statusbar-item">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Zoom:</span>
        <span className="statusbar-value" id="statusbar-zoom">{Math.round(zoom * 100)}%</span>
      </div>

      {selectedCount > 0 && (
        <>
          <div className="statusbar-sep" />
          <div className="statusbar-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span>Selected:</span>
            <span className="statusbar-value" style={{ color: "var(--primary)" }} id="statusbar-selected">
              {selectedCount}
            </span>
          </div>
        </>
      )}

      <div style={{ marginLeft: "auto" }} />

      <div className="statusbar-item" style={{ gap: 4 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--success)",
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Ready</span>
      </div>

      <div className="statusbar-sep" />

      <span style={{ fontSize: 11 }}>
        LPU CodeViz — Visual Workspace
      </span>
    </div>
  );
}
