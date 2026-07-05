"use client";

import React, { useState, useEffect } from "react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
    timestamp: 0,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codecanvas_cookie_consent");
      if (!saved) {
        // Show after a slight delay for better UX
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      }
    } catch (e) {
      console.warn("Failed to read cookie preferences:", e);
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem("codecanvas_cookie_consent", JSON.stringify(prefs));
      setPreferences(prefs);
      setShowBanner(false);
      setShowModal(false);
      // Dispatch custom event so analytics scripts can listen
      window.dispatchEvent(new CustomEvent("cookie_consent_updated", { detail: prefs }));
    } catch (e) {
      console.error("Failed to save cookie preferences:", e);
      setShowBanner(false);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const handleRejectOptional = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      ...preferences,
      timestamp: Date.now(),
    });
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {showBanner && !showModal && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 48px)",
            maxWidth: 920,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(5, 223, 114, 0.1)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            color: "var(--text, #F8FAFC)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            animation: "slideUpCookie 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          role="dialog"
          aria-label="Cookie and Privacy Consent Banner"
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slideUpCookie {
              from { opacity: 0; transform: translate(-50%, 40px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
            @media (max-width: 768px) {
              .cookie-banner-flex {
                flex-direction: column !important;
                align-items: flex-start !important;
              }
              .cookie-buttons-flex {
                width: 100% !important;
                justify-content: stretch !important;
              }
              .cookie-btn {
                flex: 1 !important;
                text-align: center !important;
              }
            }
          `}} />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.01em" }}>
                DPDP Act 2023 & GDPR Compliance Notice
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: "rgba(5, 223, 114, 0.15)",
                color: "#05DF72",
                padding: "2px 8px",
                borderRadius: 99,
                border: "1px solid rgba(5, 223, 114, 0.3)",
              }}>
                Enterprise Secured
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.5 }}>
              We use essential cookies for secure institutional authentication and Razorpay payment processing. With your consent, we also use non-intrusive analytics to benchmark algorithm learning efficiency and platform latency. Read our <a href="/privacy" style={{ color: "#05DF72", textDecoration: "underline" }}>Privacy Policy</a>.
            </p>
          </div>

          <div className="cookie-buttons-flex" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#CBD5E1",
                padding: "10px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#FFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#CBD5E1"; }}
            >
              Customize
            </button>

            <button
              onClick={handleRejectOptional}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94A3B8",
                padding: "10px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#FFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.color = "#94A3B8"; }}
            >
              Reject Optional
            </button>

            <button
              onClick={handleAcceptAll}
              style={{
                background: "linear-gradient(135deg, #05DF72, #03B85D)",
                border: "none",
                color: "#000",
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(5, 223, 114, 0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(5, 223, 114, 0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(5, 223, 114, 0.3)"; }}
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "fadeInModal 0.2s ease-out",
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes fadeInModal {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}} />

          <div
            style={{
              background: "#0F172A",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
              color: "#F8FAFC",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>⚙️</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Privacy & Cookie Preferences</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  color: "#94A3B8",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, marginBottom: 24 }}>
              Manage your cookie settings below. We align our data processing with India's Digital Personal Data Protection (DPDP) Act 2023 and global GDPR standards. Granular options give your university full control over educational telemetry.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {/* Essential */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>Strictly Essential Cookies</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#05DF72", background: "rgba(5,223,114,0.1)", padding: "2px 6px", borderRadius: 4 }}>Always Active</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                    Required for student login authentication, Supabase RBAC tokens, and Razorpay institutional invoicing security. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  style={{ width: 18, height: 18, accentColor: "#05DF72", cursor: "not-allowed" }}
                />
              </div>

              {/* Analytics */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>Educational Analytics & Telemetry</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#38BDF8", background: "rgba(56,189,248,0.1)", padding: "2px 6px", borderRadius: 4 }}>Recommended</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                    Allows faculty to view aggregate completion rates, AI explanation latency, and algorithm complexity benchmarks in the Teacher Hub.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: "#05DF72", cursor: "pointer" }}
                />
              </div>

              {/* Marketing */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>Institutional Updates & Marketing</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>Optional</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                    Used solely for notifying university administrators about new NAAC export formats, Python visualizer templates, and platform webinars.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: "#05DF72", cursor: "pointer" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={handleRejectOptional}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#94A3B8",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reject Optional
              </button>
              <button
                onClick={handleSaveCustom}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#F8FAFC",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  background: "linear-gradient(135deg, #05DF72, #03B85D)",
                  border: "none",
                  color: "#000",
                  padding: "10px 22px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(5, 223, 114, 0.3)",
                }}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
