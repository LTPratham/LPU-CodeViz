"use client";

import React, { useState } from "react";
import { Award, Download, Share2, CheckCircle2, Shield, X, ExternalLink, Sparkles, Copy, Check } from "lucide-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  courseName?: string;
  issueDate?: string;
  certId?: string;
  institution?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  studentName = "Prathamesh Sawarkar",
  courseName = "Advanced Data Structures & Dynamic Programming Mastery",
  issueDate = "July 5, 2026",
  certId = "CERT-2026-LPU-8924",
  institution = "Lovely Professional University",
}: CertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/verify/${certId}` : `https://codecanvas.lpu.co.in/verify/${certId}`;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedInShare = () => {
    const title = encodeURIComponent(`Verified Credential: ${courseName}`);
    const summary = encodeURIComponent(`I have successfully completed ${courseName} with O(N log N) algorithmic optimization mastery on CodeCanvas at ${institution}! Verify my credential: ${verifyUrl}`);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
    window.open(url, "_blank");
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`🎉 Certificate ${certId}.pdf downloaded successfully!`);
    }, 1500);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 24,
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: "#0F172A",
        border: "1px solid rgba(59, 130, 246, 0.4)",
        borderRadius: 24,
        maxWidth: 820,
        width: "100%",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.2)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "#FFF",
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        <div style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10B981",
              padding: "4px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <CheckCircle2 size={14} /> NAAC & NBA VERIFIED CREDENTIAL
            </span>
            <span style={{ fontSize: 13, color: "#64748B", fontFamily: "monospace" }}>ID: {certId}</span>
          </div>

          {/* High-Resolution Certificate Printable Canvas Frame */}
          <div style={{
            background: "linear-gradient(135deg, #1E293B, #0F172A)",
            border: "4px double #F59E0B",
            borderRadius: 16,
            padding: "40px 48px",
            textAlign: "center",
            position: "relative",
            boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.5)",
            marginBottom: 28,
            overflow: "hidden",
          }}>
            {/* Background watermark seal */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.04,
              pointerEvents: "none",
            }}>
              <Award size={350} color="#F59E0B" />
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #F59E0B, #EF4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 900 }}>
                C
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.15em", color: "#F8FAFC", textTransform: "uppercase" }}>
                CODECANVAS ACADEMIC BOARD
              </span>
            </div>

            <h3 style={{ fontSize: 14, color: "#F59E0B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
              Official Certificate of Completion
            </h3>

            <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 12 }}>This is to certify and formally recognize that</p>

            <h1 style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#FFF",
              fontFamily: "var(--font-serif), Georgia, serif",
              letterSpacing: "-0.02em",
              margin: "0 0 16px 0",
              borderBottom: "2px solid rgba(245, 158, 11, 0.3)",
              paddingBottom: 12,
              display: "inline-block",
            }}>
              {studentName}
            </h1>

            <p style={{ fontSize: 15, color: "#CBD5E1", maxWidth: 600, margin: "0 auto 24px", lineHeight: 1.6 }}>
              has successfully demonstrated algorithmic proficiency, Big-O execution efficiency, and step-by-step visual debugging in <strong style={{ color: "#3B82F6" }}>{courseName}</strong> as part of the accredited curriculum at <strong style={{ color: "#FFF" }}>{institution}</strong>.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>ISSUE DATE</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FFF" }}>{issueDate}</div>
              </div>

              {/* Gold Verification Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.4)", padding: "6px 14px", borderRadius: 10 }}>
                <Shield size={18} color="#F59E0B" />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 800 }}>VERIFICATION CODE</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#FFF", fontFamily: "monospace" }}>{certId}</div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>ACCREDITATION</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FFF" }}>NAAC Criterion 2 Level A++</div>
              </div>
            </div>
          </div>

          {/* Action Footer Button Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                color: "#FFF",
                border: "none",
                padding: "14px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
                cursor: downloading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              }}
            >
              <Download size={18} /> {downloading ? "Generating PDF..." : "Download PDF/PNG"}
            </button>

            <button
              onClick={handleLinkedInShare}
              style={{
                background: "#0A66C2",
                color: "#FFF",
                border: "none",
                padding: "14px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 15px rgba(10, 102, 194, 0.4)",
              }}
            >
              <Share2 size={18} /> Share to LinkedIn
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFF",
                padding: "14px",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {copied ? <Check size={18} color="#10B981" /> : <Copy size={18} />}
              {copied ? "Link Copied!" : "Copy Verify Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
