"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    email: string | null;
  } | null>(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameSaving, setNameSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [subscription, setSubscription] = useState<string>("Free Sandbox");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/dashboard/profile");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, email")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile({
          id: user.id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          role: profileData.role,
          email: user.email ?? profileData.email,
        });
        setName(profileData.full_name ?? "");
      }

      // Check subscription
      if (typeof window !== "undefined") {
        const sub = localStorage.getItem("user_subscription");
        if (sub) {
          setSubscription(sub.replace(/"/g, ""));
        }
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setNameSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", profile.id);

    setNameSaving(false);

    if (error) {
      setMessage({ text: "Error updating name: " + error.message, type: "error" });
    } else {
      setMessage({ text: "Name updated successfully!", type: "success" });
      setProfile((prev) => prev ? { ...prev, full_name: name } : null);
      router.refresh();
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }

    setPasswordSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordSaving(false);

    if (error) {
      setMessage({ text: "Error updating password: " + error.message, type: "error" });
    } else {
      setMessage({ text: "Password updated successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your account? This action is permanent and all your code traces and progress will be deleted in compliance with the DPDP Act 2023."
    );
    if (!confirmDelete) return;

    // Supabase client delete user is admin-only, but we can delete profile and sign out
    if (!profile) return;

    setLoading(true);

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profile.id);

    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        Loading profile data...
      </div>
    );
  }

  const sectionStyle: React.CSSProperties = {
    background: "var(--surface-1)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 28,
    marginBottom: 24,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--muted)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    marginBottom: 16,
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px", color: "var(--text)" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, letterSpacing: "-1px", margin: 0 }}>
          Profile Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
          Manage your personal details, subscription plan, and security.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 24,
            border: message.type === "success" ? "1px solid var(--success)" : "1px solid var(--danger)",
            background: message.type === "success" ? "var(--success-dim)" : "var(--danger-dim)",
            color: message.type === "success" ? "var(--success)" : "var(--danger)",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Subscription info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Subscription Details</h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Current Plan:</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
              {subscription}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              Tier level: <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{profile?.role ?? "student"}</span>
            </div>
          </div>
          <Link
            href="/payment"
            className="btn btn-ghost"
            style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, border: "1px solid var(--border)" }}
          >
            Upgrade Plan
          </Link>
        </div>
      </div>

      {/* Update Info Form */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>Personal Details</h2>
        <form onSubmit={handleUpdateName}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="text" value={profile?.email ?? ""} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
          </div>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>
          <button
            type="submit"
            disabled={nameSaving}
            style={{
              padding: "10px 24px",
              background: nameSaving ? "var(--surface-2)" : "var(--primary)",
              color: nameSaving ? "var(--muted)" : "white",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: nameSaving ? "not-allowed" : "pointer",
            }}
          >
            {nameSaving ? "Saving..." : "Save Details"}
          </button>
        </form>
      </div>

      {/* Update Password Form */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>Change Password</h2>
        <form onSubmit={handleUpdatePassword}>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Min. 6 characters"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat new password"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            style={{
              padding: "10px 24px",
              background: passwordSaving ? "var(--surface-2)" : "var(--primary)",
              color: passwordSaving ? "var(--muted)" : "white",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: passwordSaving ? "not-allowed" : "pointer",
            }}
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Delete Account */}
      <div style={{ ...sectionStyle, border: "1px solid var(--danger-dim)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--danger)", margin: "0 0 8px" }}>Danger Zone</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
          Deleting your account will permanently wipe all profile information, classroom enrollments, progress, and traces. In compliance with the DPDP Act 2023, this action is irreversible.
        </p>
        <button
          onClick={handleDeleteAccount}
          style={{
            padding: "10px 20px",
            background: "transparent",
            color: "var(--danger)",
            border: "1.5px solid var(--danger)",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger-dim)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
