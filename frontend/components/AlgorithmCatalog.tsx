"use client";
import { useState, useRef, useEffect } from "react";
import type { Language, SampleCode } from "@/lib/types";
import { sampleCodes } from "@/lib/sampleCodes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string, lang: Language) => void;
}

const CATEGORIES = [
  "Language Basics & OOP",
  "Arrays & Sorting",
  "Algorithms & Recursion",
  "Linear Data Structures",
  "Non-Linear Data Structures",
  "Databases (SQL)",
  "Web Elements (HTML)",
];

const getCategory = (sample: SampleCode): string => {
  const topic = sample.topic.toLowerCase();
  const lang = sample.lang;

  if (lang === "sql") return "Databases (SQL)";
  if (lang === "html") return "Web Elements (HTML)";
  if (topic.includes("sorting") || sample.id.includes("sort")) return "Arrays & Sorting";
  if (
    topic.includes("recursion") ||
    topic.includes("searching") ||
    sample.id.includes("search") ||
    sample.id.includes("fibonacci") ||
    sample.id.includes("factorial")
  ) {
    return "Algorithms & Recursion";
  }
  if (topic.includes("stack") || topic.includes("queue") || topic.includes("linked list")) {
    return "Linear Data Structures";
  }
  if (topic.includes("bst") || sample.id.includes("tree")) return "Non-Linear Data Structures";
  return "Language Basics & OOP";
};

const getLangBadgeStyle = (lang: Language) => {
  switch (lang) {
    case "c":
      return { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA", label: "C" };
    case "cpp":
      return { bg: "rgba(139, 92, 246, 0.15)", text: "#A78BFA", label: "C++" };
    case "python":
      return { bg: "rgba(245, 158, 11, 0.15)", text: "#FBBF24", label: "Python" };
    case "java":
      return { bg: "rgba(239, 68, 68, 0.15)", text: "#F87171", label: "Java" };
    case "sql":
      return { bg: "rgba(16, 185, 129, 0.15)", text: "#34D399", label: "SQL" };
    case "html":
      return { bg: "rgba(249, 115, 22, 0.15)", text: "#FB923C", label: "HTML" };
    default:
      return { bg: "rgba(107, 114, 128, 0.15)", text: "#9CA3AF", label: (lang as string).toUpperCase() };
  }
};

export default function AlgorithmCatalog({ isOpen, onClose, onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Arrays & Sorting": true,
    "Linear Data Structures": true,
    "Algorithms & Recursion": true,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  if (!isOpen) return null;

  // Filter samples based on search query
  const query = searchQuery.toLowerCase().trim();
  const filteredSamples = sampleCodes.filter((s) => {
    if (!query) return true;
    return (
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.topic.toLowerCase().includes(query) ||
      s.lang.toLowerCase().includes(query)
    );
  });

  // Group samples
  const grouped: Record<string, SampleCode[]> = {};
  CATEGORIES.forEach((cat) => {
    grouped[cat] = [];
  });

  filteredSamples.forEach((s) => {
    const cat = getCategory(s);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  return (
    <>
      {/* ── Overlay Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 2000,
          animation: "fadeIn 0.25s ease-out",
        }}
      />

      {/* ── Catalog Drawer ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "calc(100vw - 40px)",
          maxWidth: 420,
          background: "rgba(17, 24, 39, 0.85)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border)",
          boxShadow: "10px 0 30px rgba(0, 0, 0, 0.5)",
          zIndex: 2001,
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text)" }}>
              Algorithm Catalog
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Boilerplate templates & standard CS code
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
              e.currentTarget.style.color = "#F87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text)";
            }}
            title="Close Drawer"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                fontSize: 14,
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search algorithms, concepts, languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Catalog Accordion List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {filteredSamples.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
              No matching algorithms found for "{searchQuery}"
            </div>
          ) : (
            CATEGORIES.map((cat) => {
              const list = grouped[cat] || [];
              if (list.length === 0) return null;

              const isExpanded = !!expandedCategories[cat];

              return (
                <div key={cat} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: 12 }}>
                  {/* Category Trigger */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "8px 0",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "var(--text)",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {cat}
                      <span
                        style={{
                          fontSize: 10,
                          background: "rgba(255,255,255,0.08)",
                          padding: "2px 8px",
                          borderRadius: 20,
                          color: "var(--text-muted)",
                          fontWeight: 500,
                        }}
                      >
                        {list.length}
                      </span>
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Category Contents */}
                  {isExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                      {list.map((sample) => {
                        const badge = getLangBadgeStyle(sample.lang);
                        return (
                          <div
                            key={sample.id}
                            onClick={() => onSelect(sample.code, sample.lang)}
                            style={{
                              padding: "12px 16px",
                              borderRadius: 10,
                              background: "rgba(255, 255, 255, 0.02)",
                              border: "1px solid var(--border)",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              textAlign: "left",
                            }}
                            className="catalog-card"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.borderColor = "var(--primary)";
                              e.currentTarget.style.background = "var(--card-hover)";
                              e.currentTarget.style.boxShadow = "0 4px 12px var(--primary-glow)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "none";
                              e.currentTarget.style.borderColor = "var(--border)";
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: 13,
                                  color: "var(--text)",
                                }}
                              >
                                {sample.title}
                              </span>
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 800,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: badge.bg,
                                  color: badge.text,
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {badge.label}
                              </span>
                            </div>
                            {sample.description && (
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "var(--text-muted)",
                                  margin: "6px 0 0",
                                  lineHeight: 1.4,
                                }}
                              >
                                {sample.description}
                              </p>
                            )}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 8,
                              }}
                            >
                              {(() => {
                                const topic = sample.topic.toUpperCase();
                                let bg = "var(--primary-glow)";
                                let text = "var(--primary-light)";
                                if (topic.includes("CSE101")) {
                                  bg = "rgba(249, 115, 22, 0.15)";
                                  text = "#FB923C"; // Orange for C/CSE101
                                } else if (topic.includes("CSE202") || topic.includes("CSE205")) {
                                  bg = "rgba(59, 130, 246, 0.15)";
                                  text = "#60A5FA"; // Blue for DSA/CSE205
                                } else if (topic.includes("INT108")) {
                                  bg = "rgba(234, 179, 8, 0.15)";
                                  text = "#FACC15"; // Yellow for Python/INT108
                                } else if (topic.includes("INT306") || topic.includes("CSE310")) {
                                  bg = "rgba(16, 185, 129, 0.15)";
                                  text = "#34D399"; // Green for DBMS/CSE310
                                } else if (topic.includes("CSE380")) {
                                  bg = "rgba(239, 68, 68, 0.15)";
                                  text = "#F87171"; // Red for Java
                                }
                                return (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      color: text,
                                      background: bg,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      border: `1px solid ${text}33`,
                                    }}
                                  >
                                    {topic}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Style block for animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translate3d(-100%, 0, 0); }
            to { transform: translate3d(0, 0, 0); }
          }
        `}</style>
      </div>
    </>
  );
}
