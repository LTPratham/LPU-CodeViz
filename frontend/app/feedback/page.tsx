"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, CheckCircle2, ArrowLeft } from "lucide-react";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show the success state.
    // In the future, we can wire this up to Supabase.
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "20px 40px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--text)" }}>
          <ArrowLeft size={18} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Back to CodeCanvas</span>
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center"
          style={{
            maxWidth: 1000,
            width: "100%",
          }}
        >
          
          {/* Left Column: QR Code Display */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: 40,
            backgroundColor: "var(--surface-1)",
            borderRadius: 24,
            border: "1px solid var(--border)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>
              Scan to Give Feedback
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: 30, fontSize: 15, lineHeight: 1.5 }}>
              Open your phone's camera and point it at the QR code below to access this form on your mobile device.
            </p>
            <div style={{
              background: "#fff",
              padding: 20,
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}>
              <Image
                src="/qr.jpeg"
                alt="Feedback QR Code"
                width={250}
                height={250}
                style={{ objectFit: "contain", borderRadius: 8 }}
              />
            </div>
            <p style={{ marginTop: 24, fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              codecanvas.dev/feedback
            </p>
          </div>

          {/* Right Column: The Form */}
          <div style={{ padding: "0 20px" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: "50%", background: "var(--success-dim)", 
                  color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", 
                  margin: "0 auto 24px" 
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
                  Thank you!
                </h3>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
                  Your feedback helps us make CodeCanvas better for every student at LPU.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    marginTop: 32,
                    padding: "10px 24px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Submit another response
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: "var(--text)", letterSpacing: "-0.02em" }}>
                    How was your experience?
                  </h1>
                  <p style={{ color: "var(--muted)", fontSize: 15 }}>
                    We'd love to hear your thoughts on CodeCanvas.
                  </p>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none" }}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Role</label>
                    <select
                      style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", appearance: "none" }}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Faculty / Teacher</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Registration No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 12200000"
                      style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Section</label>
                    <input
                      type="text"
                      placeholder="e.g. K22"
                      style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Email / Contact</label>
                    <input
                      type="text"
                      placeholder="john@example.com"
                      style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Overall Rating</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        style={{
                          flex: 1, padding: "12px 0", borderRadius: 8,
                          border: `1px solid ${rating === num ? "var(--primary)" : "var(--border)"}`,
                          background: rating === num ? "var(--primary-dim)" : "var(--bg)",
                          color: rating === num ? "var(--primary)" : "var(--text)",
                          fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>What are the features you like the most?</label>
                  <textarea
                    placeholder="Tell us what you loved..."
                    rows={2}
                    style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>What are the features you would love to change?</label>
                  <textarea
                    placeholder="Tell us what we should add or improve..."
                    rows={2}
                    style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>How do we compare to other IDEs or systems you use right now?</label>
                  <textarea
                    placeholder="Are there features better in other tools?"
                    rows={2}
                    style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Any other feedback?</label>
                  <textarea
                    placeholder="Final thoughts..."
                    rows={2}
                    style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 8,
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                  }}
                >
                  Submit Feedback <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
