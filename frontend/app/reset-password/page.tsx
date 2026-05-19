"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/visualize");
      }, 2000);
    }
  };

  if (hasSession === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", color: "var(--text-secondary)" }}>
        Loading...
      </div>
    );
  }

  if (hasSession === false) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--background)" }}>
        <div style={{ width: "100%", maxWidth: 400, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12, color: "#EF4444" }}>Access Denied</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            You do not have permission to access this page. Please use the password reset link sent to your email.
          </p>
          <button onClick={() => router.push("/login")} className="btn-primary">
            Go to Login
          </button>
        </div>
        <style>{`
          .btn-primary {
            width: 100%;
            padding: 12px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
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
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>
          Create new password
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
          Please enter your new password below to secure your account.
        </p>

        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 8, color: "var(--text-secondary)" }}>New Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              className="custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 8, color: "var(--text-secondary)" }}>Confirm Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              className="custom-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          {error && <div className="error-msg">{error}</div>}
          
          {success && (
            <div style={{ padding: 12, background: "rgba(34,197,94,0.1)", color: "#22C55E", borderRadius: 8, fontSize: 14 }}>
              Password updated successfully! Redirecting to Dashboard...
            </div>
          )}

          <button type="submit" disabled={loading || success} className="btn-primary" style={{ marginTop: 8 }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
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
      `}</style>
    </div>
  );
}
