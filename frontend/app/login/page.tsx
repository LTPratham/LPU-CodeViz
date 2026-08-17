"use client";

import { useState, useEffect } from "react";
import { login, signup } from "./actions";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Briefcase } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [rolePreference, setRolePreference] = useState<"student" | "teacher">("student");
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    // Clear mock cookies/storage to ensure real sign-in
    document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("mock_role");
    sessionStorage.removeItem("tour_scenario");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&role=${rolePreference}`,
        queryParams: { access_type: 'offline', prompt: 'select_account' }
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  async function handleEmailSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    // Clear mock cookies/storage to ensure real sign-in
    document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("mock_role");
    sessionStorage.removeItem("tour_scenario");

    // Add role preference to action data if sign up
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    let result;
    if (isLogin) {
      result = await login(formData);
    } else {
      // Pass role preference to signup action
      result = await signup(formData, rolePreference);
    }
    if (result?.error) setError(result.error);
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
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          {mounted ? (
            <img 
              src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"} 
              alt="CodeCanvas Logo" 
              style={{ height: 28, width: "auto", objectFit: "contain" }} 
            />
          ) : (
            <img 
              src="/logo-dark.png" 
              alt="CodeCanvas Logo" 
              style={{ height: 28, width: "auto", objectFit: "contain" }} 
            />
          )}
        </Link>

        <h1 style={{ fontSize: 22, marginBottom: 6, color: "var(--text)", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {showForgotPassword
            ? "Reset your password"
            : (isLogin ? "Welcome back" : "Create an account")}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 24, lineHeight: 1.6 }}>
          {showForgotPassword
            ? "Enter your email and we'll send you a reset link."
            : "Select your role and sign in with your email or Google account."}
        </p>

        {/* ── Role Preference Selector ── */}
        {!showForgotPassword && (
          <div style={{
            display: "flex",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}>
            <button
              type="button"
              onClick={() => setRolePreference("student")}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: rolePreference === "student" ? "var(--primary)" : "transparent",
                color: rolePreference === "student" ? "#000" : "var(--muted)",
                transition: "all 0.15s ease",
              }}
            >
              <GraduationCap size={16} /> Student Portal
            </button>
            <button
              type="button"
              onClick={() => setRolePreference("teacher")}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: rolePreference === "teacher" ? "var(--primary)" : "transparent",
                color: rolePreference === "teacher" ? "#000" : "var(--muted)",
                transition: "all 0.15s ease",
              }}
            >
              <Briefcase size={16} /> Faculty Hub
            </button>
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
              Continue with Google as {rolePreference === "student" ? "Student" : "Faculty"}
            </button>

            {/* OR Divider */}
            <div style={{ margin: "22px 0 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            </div>
          </>
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
          ) : (
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
                {loading ? "Please wait..." : (isLogin ? `Sign In as ${rolePreference === "student" ? "Student" : "Faculty"}` : "Create Account")}
              </button>
              <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "var(--font-ui)" }}>
                  {isLogin ? "Sign up free" : "Log in"}
                </button>
              </div>
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
