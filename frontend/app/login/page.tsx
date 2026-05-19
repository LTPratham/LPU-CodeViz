"use client";

import { useState } from "react";
import { login, signup, sendOtp, verifyPhoneOtp } from "./actions";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  async function handleEmailSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    let result;
    if (isLogin) {
      result = await login(formData);
    } else {
      result = await signup(formData);
    }
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  async function handlePhoneSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    if (!otpSent) {
      const result = await sendOtp(formData);
      if (result?.error) setError(result.error);
      else setOtpSent(true);
    } else {
      // Need to inject phone into the form data for verification
      formData.set("phone", phone);
      const result = await verifyPhoneOtp(formData);
      if (result?.error) setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--background)"
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}
      >
        <Link href="/" style={{ 
          display: "inline-block", marginBottom: 24, color: "var(--text-muted)", textDecoration: "none", fontSize: 14
        }}>
          ← Back to Home
        </Link>
        
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>
          {authMode === "email" 
            ? (isLogin ? "Welcome back" : "Create an account") 
            : "Sign in with Phone"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
          {authMode === "email" 
            ? "Use your university email to securely access your visualizations."
            : "We will send you a 6-digit secure code via SMS."}
        </p>

        {/* Custom Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 10 }}>
          <button 
            onClick={() => { setAuthMode("email"); setError(null); }}
            style={{
              flex: 1, padding: "8px", borderRadius: 6, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: authMode === "email" ? "var(--primary)" : "transparent",
              color: authMode === "email" ? "white" : "var(--text-secondary)",
              transition: "all 0.2s"
            }}
          >Email</button>
          <button 
            onClick={() => { setAuthMode("phone"); setError(null); }}
            style={{
              flex: 1, padding: "8px", borderRadius: 6, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: authMode === "phone" ? "var(--primary)" : "transparent",
              color: authMode === "phone" ? "white" : "var(--text-secondary)",
              transition: "all 0.2s"
            }}
          >Phone</button>
        </div>

        <AnimatePresence mode="wait">
          {authMode === "email" ? (
            <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} action={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 8, color: "var(--text-secondary)" }}>Email Address</label>
                <input name="email" type="email" required placeholder="student@lpu.in" className="custom-input" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 8, color: "var(--text-secondary)" }}>Password</label>
                <input name="password" type="password" required placeholder="••••••••" className="custom-input" />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
              </button>
              <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} action={handlePhoneSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!otpSent ? (
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 8, color: "var(--text-secondary)" }}>Mobile Number</label>
                  <input name="phone" type="tel" required placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="custom-input" />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 8, color: "var(--text-secondary)" }}>6-Digit OTP</label>
                  <input name="token" type="text" required placeholder="123456" maxLength={6} className="custom-input" style={{ letterSpacing: 4, textAlign: "center", fontSize: 18 }} />
                </div>
              )}
              {error && <div className="error-msg">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
                {loading ? "Sending..." : (!otpSent ? "Send SMS Code" : "Verify & Login")}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading} 
          className="btn-google" 
          style={{ marginTop: 24 }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 20, height: 20 }} />
          Sign in with Google
        </button>

      </motion.div>

      <style>{`
        .custom-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--text-primary);
          font-size: 14px;
        }
        .custom-input:focus {
          outline: 2px solid var(--primary);
        }
        .error-msg {
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          border-radius: 8px;
          font-size: 14px;
        }
        .btn-primary {
          width: 100%;
          padding: 12px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-google {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .btn-google:hover:not(:disabled) {
          background: var(--card-hover, rgba(0,0,0,0.05));
        }
        .btn-google:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
