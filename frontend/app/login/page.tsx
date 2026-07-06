"use client";

import { useState, useEffect } from "react";
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
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Auto-redirect if user came here during an interactive demo or tour so they never get stuck on login!
  useEffect(() => {
    const activeTour = sessionStorage.getItem("tour_scenario");
    if (activeTour) {
      document.cookie = `mock_role=${activeTour}; path=/; max-age=31536000`;
      localStorage.setItem("mock_role", activeTour);
      const targetUrl = activeTour === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
      window.location.href = targetUrl;
    }
  }, []);

  const handleInstantDemo = (role: "student" | "teacher") => {
    document.cookie = `mock_role=${role}; path=/; max-age=31536000`;
    localStorage.setItem("mock_role", role);
    window.location.href = role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSent(false);
    
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--bg)"
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 36,
          boxShadow: "0 8px 40px rgba(0,0,0,0.45)"
        }}
      >
        <Link href="/" style={{ 
          display: "inline-flex", alignItems: "center", gap: 6,
          marginBottom: 28, color: "var(--muted)", textDecoration: "none", fontSize: 13,
          transition: "color 0.2s"
        }}>
          ← Back to Home
        </Link>
        
        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--font-mono)"
          }}>C</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>CodeCanvas</span>
        </div>

        <h1 style={{ fontSize: 22, marginBottom: 6, color: "var(--text)", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {showForgotPassword
            ? "Reset your password"
            : (authMode === "email" 
                ? (isLogin ? "Welcome back" : "Create an account") 
                : "Sign in with Phone")}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 28, lineHeight: 1.6 }}>
          {showForgotPassword
            ? "Enter your email and we'll send you a reset link."
            : (authMode === "email" 
                ? "Use your university email to access your visualizations."
                : "We'll send a 6-digit secure code via SMS.")}
        </p>

        {/* Instant Demo Access — One-click bypass for testing and walkthroughs */}
        {!showForgotPassword && (
          <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px dashed rgba(59, 130, 246, 0.35)", borderRadius: 12, padding: "16px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              ✨ Instant Proctored Evaluation
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
              Evaluating CodeCanvas? Skip credential entry and jump straight into our live preview portals.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => handleInstantDemo("student")}
                style={{ flex: 1, padding: "9px 12px", background: "var(--primary)", color: "#FFF", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)" }}
              >
                🎓 Student Portal
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo("teacher")}
                style={{ flex: 1, padding: "9px 12px", background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                🏫 Faculty Portal
              </button>
            </div>
          </div>
        )}

        {/* Google OAuth Button — ABOVE the form */}
        {!showForgotPassword && (
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-google"
            >
              {/* Authentic Google G logo with 4 colored segments */}
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* OR Divider */}
            <div style={{ margin: "22px 0 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            </div>
          </>
        )}

        {/* Email / Phone Tabs */}
        {!showForgotPassword && (
          <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "rgba(0,0,0,0.3)", padding: 4, borderRadius: 10 }}>
            <button 
              onClick={() => { setAuthMode("email"); setError(null); }}
              style={{
                flex: 1, padding: "8px", borderRadius: 7, border: "none", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                background: authMode === "email" ? "var(--primary)" : "transparent",
                color: authMode === "email" ? "white" : "var(--muted)",
                transition: "all 0.2s", fontFamily: "var(--font-ui)"
              }}
            >Email</button>
            <button 
              onClick={() => { setAuthMode("phone"); setError(null); }}
              style={{
                flex: 1, padding: "8px", borderRadius: 7, border: "none", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                background: authMode === "phone" ? "var(--primary)" : "transparent",
                color: authMode === "phone" ? "white" : "var(--muted)",
                transition: "all 0.2s", fontFamily: "var(--font-ui)"
              }}
            >Phone</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showForgotPassword ? (
            <motion.form key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleForgotPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8, color: "var(--muted)", fontWeight: 500 }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="student@university.edu" 
                  className="custom-input"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              {resetSent && (
                <div style={{ padding: 12, background: "rgba(34,197,94,0.1)", color: "#22C55E", borderRadius: 8, fontSize: 14, border: "1px solid rgba(34,197,94,0.2)" }}>
                  ✓ Reset link sent! Check your email inbox.
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13 }}>
                <button type="button" onClick={() => { setShowForgotPassword(false); setError(null); }} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)" }}>
                  ← Back to Sign In
                </button>
              </div>
            </motion.form>
          ) : authMode === "email" ? (
            <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} action={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 7, color: "var(--muted)", fontWeight: 500 }}>Email Address</label>
                <input name="email" type="email" required placeholder="student@university.edu" className="custom-input" />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => { setShowForgotPassword(true); setError(null); }} 
                      style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12.5, fontWeight: 500, cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)" }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input name="password" type="password" required placeholder="••••••••" className="custom-input" />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 6 }}>
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </button>
              <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)" }}>
                  {isLogin ? "Sign up free" : "Log in"}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} action={handlePhoneSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!otpSent ? (
                <div>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 7, color: "var(--muted)", fontWeight: 500 }}>Mobile Number</label>
                  <input name="phone" type="tel" required placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="custom-input" />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 7, color: "var(--muted)", fontWeight: 500 }}>6-Digit OTP</label>
                  <input name="token" type="text" required placeholder="123456" maxLength={6} className="custom-input" style={{ letterSpacing: 6, textAlign: "center", fontSize: 20, fontFamily: "var(--font-mono)" }} />
                </div>
              )}
              {error && <div className="error-msg">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 6 }}>
                {loading ? "Sending..." : (!otpSent ? "Send SMS Code" : "Verify & Login")}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--muted)",
          marginTop: 20,
          lineHeight: 1.5,
        }}>
          By signing up or logging in, you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--primary)", textDecoration: "none" }}>Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--primary)", textDecoration: "none" }}>Privacy Policy</Link>.
        </p>

      </motion.div>

      <style>{`
        .custom-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text);
          font-size: 14px;
          font-family: var(--font-ui);
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .custom-input::placeholder {
          color: var(--muted-dim);
        }
        .custom-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-dim);
        }
        .error-msg {
          padding: 11px 13px;
          background: rgba(239, 68, 68, 0.08);
          color: #F87171;
          border-radius: 8px;
          font-size: 13.5px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .btn-primary {
          width: 100%;
          padding: 12px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          font-family: var(--font-ui);
          letter-spacing: 0.01em;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--primary-hover);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
        }
        .btn-primary:active:not(:disabled) {
          transform: scale(0.99);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-google {
          width: 100%;
          padding: 11px 16px;
          background: #ffffff;
          color: #3c4043;
          border: 1.5px solid #dadce0;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: 'Roboto', var(--font-ui), sans-serif;
          letter-spacing: 0.01em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .btn-google:hover:not(:disabled) {
          background: #f7f8ff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.14);
          border-color: #c0c5cf;
        }
        .btn-google:active:not(:disabled) {
          background: #eef0f8;
          transform: scale(0.99);
        }
        .btn-google:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
