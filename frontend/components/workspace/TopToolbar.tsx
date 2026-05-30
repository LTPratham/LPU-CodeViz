"use client";
import { useState } from "react";
import Link from "next/link";

interface TopToolbarProps {
  leftPanelOpen: boolean;
  onToggleLeft: () => void;
  rightPanelOpen: boolean;
  onToggleRight: () => void;
  onResetLayout: () => void;
  onAutoLayout: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  onSearchFocus?: () => void;
}

const REPOS = [
  "LPU-CodeViz (current)",
  "CSE205 — Data Structures",
  "INT301 — Algorithm Lab",
];

export default function TopToolbar({
  leftPanelOpen,
  onToggleLeft,
  rightPanelOpen,
  onToggleRight,
  onResetLayout,
  onAutoLayout,
  searchQuery,
  onSearch,
  onSearchFocus,
}: TopToolbarProps) {
  const [selectedRepo, setSelectedRepo] = useState(REPOS[0]);
  const [repoOpen, setRepoOpen] = useState(false);

  return (
    <div className="toolbar">
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          marginRight: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#3B82F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
          </svg>
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text)",
            letterSpacing: "-0.3px",
          }}
        >
          CodeViz
        </span>
      </Link>

      <div className="toolbar-divider" />

      {/* Repository Selector */}
      <div style={{ position: "relative" }}>
        <button
          className="btn-toolbar"
          onClick={() => setRepoOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text)",
            padding: "5px 10px",
            borderRadius: 6,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            cursor: "pointer",
          }}
          id="toolbar-repo-selector"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedRepo}
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {repoOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              minWidth: 240,
              zIndex: 200,
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {REPOS.map((r) => (
              <button
                key={r}
                onClick={() => { setSelectedRepo(r); setRepoOpen(false); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 14px",
                  background: r === selectedRepo ? "var(--primary-dim)" : "transparent",
                  color: r === selectedRepo ? "var(--primary)" : "var(--muted)",
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "0 10px",
          height: 30,
          minWidth: 220,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted-dim)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={onSearchFocus}
          placeholder="Search files… (Ctrl+F)"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text)",
            fontSize: 13,
            width: "100%",
          }}
          id="toolbar-search"
        />
        {searchQuery && (
          <button
            onClick={() => onSearch("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-dim)", padding: 0, lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Layout Controls */}
      <div className="toolbar-group">
        <button
          className="btn-toolbar"
          onClick={onAutoLayout}
          title="Auto layout"
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}
          id="toolbar-auto-layout"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Auto Layout
        </button>
        <button
          className="btn-toolbar"
          onClick={onResetLayout}
          title="Reset view"
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}
          id="toolbar-reset-view"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset View
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Panel Toggles */}
      <div className="toolbar-group">
        <button
          className={`btn-icon ${leftPanelOpen ? "active" : ""}`}
          onClick={onToggleLeft}
          title="Toggle left panel"
          id="toolbar-toggle-left"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
        <button
          className={`btn-icon ${rightPanelOpen ? "active" : ""}`}
          onClick={onToggleRight}
          title="Toggle right panel"
          id="toolbar-toggle-right"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
      </div>

      <div style={{ marginLeft: "auto" }} />

      {/* Export */}
      <button
        className="btn-ghost"
        style={{ fontSize: 12, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}
        id="toolbar-export"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>

      <div className="toolbar-divider" />

      {/* User Avatar */}
      <div
        title="Prathamesh Sawarkar"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--primary)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          flexShrink: 0,
        }}
        id="toolbar-user-avatar"
      >
        P
      </div>
    </div>
  );
}
