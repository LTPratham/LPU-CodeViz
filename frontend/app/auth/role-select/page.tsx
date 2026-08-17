"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { ChevronRight, GraduationCap, MonitorPlay, BookOpen, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";

type Role = "student" | "teacher";

interface RoleCard {
  role: Role;
  title: string;
  subtitle: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  gradient: string;
  glowColor: string;
  perks: string[];
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: "student",
    title: "I'm a Student",
    subtitle: "Learn visually",
    description: "Step through algorithms, earn XP, track your progress, and master data structures at your own pace.",
    Icon: GraduationCap,
    gradient: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
    glowColor: "rgba(59, 130, 246, 0.35)",
    perks: ["Visual trace debugger", "XP & achievements", "Assignment submissions", "Progress tracking"],
  },
  {
    role: "teacher",
    title: "I'm a Teacher",
    subtitle: "Teach effectively",
    description: "Create assignments, monitor class progress, export NAAC reports, and manage your students with ease.",
    Icon: BookOpen,
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    glowColor: "rgba(16, 185, 129, 0.35)",
    perks: ["Class management", "Assignment builder", "NAAC report export", "Student analytics"],
  },
];

export default function RoleSelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On mount — check if user is authed and role already set
  useEffect(() => {
    const checkProfile = async () => {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      // Pre-fill name from OAuth metadata
      const metaName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";
      if (metaName) setFullName(metaName);

      // Check existing profile role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role) {
        // Role already set — redirect to correct dashboard
        const dest =
          profile.role === "teacher"
            ? "/dashboard/teacher"
            : profile.role === "student"
            ? "/dashboard/student"
            : "/visualize";
        router.replace(dest);
        return;
      }

      setChecking(false);
    };

    checkProfile();
  }, [router]);

  const handleConfirm = async () => {
    if (!fullName.trim()) {
      setNameError("Please enter your full name.");
      return;
    }
    if (fullName.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    if (!selectedRole) return;

    setLoading(true);
    setError(null);
    setNameError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName.trim(),
          role: selectedRole,
          email: user.email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    router.push(selectedRole === "teacher" ? "/dashboard/teacher" : "/dashboard/student");
  };

  // ── Loading / checking state ──
  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)" }}>C</span>
        </div>
        <Loader2 size={20} style={{ color: "var(--muted)", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      background: "var(--bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 720, position: "relative" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            marginBottom: 24, padding: "6px 14px 6px 10px",
            background: "var(--surface-1)", border: "1px solid var(--border)",
            borderRadius: 999,
          }}>
            {mounted ? (
              <img 
                src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"} 
                alt="CodeCanvas Logo" 
                style={{ height: 20, width: "auto", objectFit: "contain" }} 
              />
            ) : (
              <img 
                src="/logo-dark.png" 
                alt="CodeCanvas Logo" 
                style={{ height: 20, width: "auto", objectFit: "contain" }} 
              />
            )}
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 800,
            color: "var(--text)", letterSpacing: "-0.03em",
            lineHeight: 1.15, marginBottom: 12,
          }}>
            Welcome! Let&apos;s get you set up.
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
            Tell us who you are — we&apos;ll personalise your experience accordingly.
          </p>
        </div>

        {/* Full name input */}
        <div style={{ marginBottom: 36, maxWidth: 400, margin: "0 auto 36px" }}>
          <label style={{
            display: "block", fontSize: 13, fontWeight: 600,
            color: "var(--muted)", marginBottom: 8, letterSpacing: "0.03em", textTransform: "uppercase"
          }}>
            Your Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setNameError(null); }}
            placeholder="e.g. Priya Sharma"
            style={{
              width: "100%", padding: "13px 16px",
              border: `1.5px solid ${nameError ? "var(--danger)" : fullName.trim().length >= 2 ? "var(--success)" : "var(--border)"}`,
              borderRadius: 10, background: "var(--surface-2)",
              color: "var(--text)", fontSize: 15,
              fontFamily: "var(--font-ui)", outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: fullName.trim().length >= 2
                ? "0 0 0 3px rgba(34,197,94,0.1)"
                : nameError
                ? "0 0 0 3px rgba(239,68,68,0.1)"
                : "none",
              boxSizing: "border-box",
            }}
          />
          {nameError && (
            <p style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6 }}>{nameError}</p>
          )}
        </div>

        {/* Role cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 36,
        }}>
          {ROLE_CARDS.map(({ role, title, subtitle, description, Icon, gradient, glowColor, perks }) => {
            const isSelected = selectedRole === role;
            const isHovered = hoveredRole === role;

            return (
              <motion.button
                key={role}
                onClick={() => setSelectedRole(role)}
                onMouseEnter={() => setHoveredRole(role)}
                onMouseLeave={() => setHoveredRole(null)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  all: "unset",
                  display: "flex",
                  flexDirection: "column",
                  padding: 28,
                  borderRadius: 16,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  border: `2px solid ${isSelected ? "transparent" : isHovered ? "rgba(255,255,255,0.1)" : "var(--border)"}`,
                  background: isSelected
                    ? "var(--surface-2)"
                    : isHovered
                    ? "var(--surface-1)"
                    : "var(--surface-1)",
                  boxShadow: isSelected
                    ? `0 0 0 2px transparent, 0 8px 32px ${glowColor}, inset 0 0 0 2px transparent`
                    : isHovered
                    ? `0 4px 20px rgba(0,0,0,0.3)`
                    : "none",
                  transition: "background 0.2s, box-shadow 0.2s",
                  textAlign: "left",
                }}
              >
                {/* Gradient border via pseudo-like wrapper */}
                {(isSelected || isHovered) && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 16,
                    padding: 2,
                    background: isSelected ? gradient : "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    pointerEvents: "none",
                  }} />
                )}

                {/* Glow blob */}
                {isSelected && (
                  <div style={{
                    position: "absolute", top: -20, right: -20,
                    width: 120, height: 120, borderRadius: "50%",
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: isSelected ? gradient : "var(--surface-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                  transition: "background 0.25s",
                  boxShadow: isSelected ? `0 6px 20px ${glowColor}` : "none",
                }}>
                  <Icon size={26} strokeWidth={1.75} />
                </div>

                {/* Text */}
                <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                    {title}
                  </span>
                  {isSelected && (
                    <CheckCircle2 size={18} style={{ color: "#22C55E", flexShrink: 0 }} />
                  )}
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {subtitle}
                </p>
                <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.65, marginBottom: 20 }}>
                  {description}
                </p>

                {/* Perks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {perks.map((perk) => (
                    <div key={perk} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                        background: isSelected ? gradient : "var(--muted-dim)",
                      }} />
                      <span style={{ fontSize: 12.5, color: isSelected ? "var(--muted)" : "var(--muted-dim)" }}>
                        {perk}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: "11px 14px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, color: "#F87171",
                fontSize: 13.5, marginBottom: 20,
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <motion.button
            onClick={handleConfirm}
            disabled={!selectedRole || loading}
            whileHover={selectedRole && !loading ? { scale: 1.02 } : {}}
            whileTap={selectedRole && !loading ? { scale: 0.98 } : {}}
            style={{
              padding: "14px 40px",
              borderRadius: 10,
              border: "none",
              background: selectedRole
                ? ROLE_CARDS.find((c) => c.role === selectedRole)!.gradient
                : "var(--surface-2)",
              color: selectedRole ? "#fff" : "var(--muted-dim)",
              fontWeight: 700,
              fontSize: 15,
              cursor: selectedRole && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "background 0.25s, box-shadow 0.25s",
              boxShadow: selectedRole
                ? `0 6px 24px ${ROLE_CARDS.find((c) => c.role === selectedRole)!.glowColor}`
                : "none",
              fontFamily: "var(--font-ui)",
              letterSpacing: "0.01em",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Setting up your account…
              </>
            ) : (
              <>
                Continue as {selectedRole ? (selectedRole === "student" ? "Student" : "Teacher") : "…"}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--muted-dim)", marginTop: 20, lineHeight: 1.6 }}>
          You can update your profile at any time from settings.
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
