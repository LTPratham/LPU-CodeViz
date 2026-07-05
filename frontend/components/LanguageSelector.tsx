"use client";

import React, { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { SupportedLang } from "@/lib/translations";

const LANGUAGES: { code: SupportedLang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
];

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<SupportedLang>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("codecanvas_lang") as SupportedLang) || "en";
    setCurrentLang(saved);
  }, []);

  const handleSelect = (code: SupportedLang) => {
    setCurrentLang(code);
    localStorage.setItem("codecanvas_lang", code);
    setIsOpen(false);
    window.dispatchEvent(new Event("languageChanged"));
  };

  const currentObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div style={{ position: "relative", display: "inline-block", zIndex: 50 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change Regional Language (NEP 2020 Support)"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <Globe size={14} color="var(--primary)" />
        <span>{currentObj.flag} {currentObj.native}</span>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          background: "#0F172A",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          borderRadius: 12,
          padding: 8,
          width: 170,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#64748B", padding: "4px 8px", textTransform: "uppercase" }}>
            NEP 2020 Languages
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isSelected ? "rgba(59, 130, 246, 0.2)" : "transparent",
                  border: "none",
                  color: isSelected ? "#3B82F6" : "#F8FAFC",
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isSelected ? 800 : 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s ease",
                }}
              >
                <span>{lang.flag} {lang.native} ({lang.label})</span>
                {isSelected && <Check size={14} color="#3B82F6" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
