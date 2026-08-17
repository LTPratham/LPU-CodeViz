"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown, BookOpen, LayoutDashboard, User, Sun, Moon } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  email: string | null;
}

interface Props {
  profile: Profile | null;
  userId: string;
}

export default function DashboardTopBar({ profile, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "U";

  const displayName = profile?.full_name ?? profile?.email ?? "User";
  const role = profile?.role ?? "student";

  return (
    <header
      style={{
        height: 60,
        background: "var(--surface-1)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        zIndex: 100,
        position: "sticky",
        top: 0,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
        }}
      >
        {mounted ? (
          <img 
            src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"} 
            alt="CodeCanvas Logo" 
            style={{ height: 26, width: "auto", objectFit: "contain" }} 
          />
        ) : (
          <img 
            src="/logo-dark.png" 
            alt="CodeCanvas Logo" 
            style={{ height: 26, width: "auto", objectFit: "contain" }} 
          />
        )}
      </Link>

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Link
          href={role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--muted)",
            textDecoration: "none",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          <LayoutDashboard size={14} />
          Dashboard
        </Link>
        <Link
          href="/visualize"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--muted)",
            textDecoration: "none",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          <BookOpen size={14} />
          Visualizer
        </Link>
        <Link
          href="/battleground"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            color: "#F59E0B",
            textDecoration: "none",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(245, 158, 11, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)";
          }}
        >
          ⚔️ Arena
        </Link>
        <button
          onClick={() => window.dispatchEvent(new Event("open-product-tour"))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--primary)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          ✨ Demo Tour
        </button>
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="btn-icon"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            borderRadius: "50%",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted)";
          }}
          title="Toggle theme"
        >
          {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
        </button>

        <LanguageSelector />
      </div>

      {/* Avatar dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 8,
            background: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text)",
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName.split(" ")[0]}
          </span>
          <ChevronDown size={13} color="var(--muted)" />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 200,
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
                zIndex: 200,
              }}
            >
              {/* User info */}
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {profile?.email ?? ""}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 6,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "var(--primary-dim)",
                    border: "1px solid var(--primary-border)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--primary)",
                    textTransform: "capitalize",
                  }}
                >
                  {role}
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "4px 0" }}>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    fontSize: 13,
                    color: "var(--muted)",
                    textDecoration: "none",
                    transition: "all 100ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-hover)";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--muted)";
                  }}
                >
                  <User size={14} />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    fontSize: 13,
                    color: "var(--danger)",
                    background: "transparent",
                    border: "none",
                    width: "100%",
                    cursor: "pointer",
                    transition: "all 100ms ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--danger-dim)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
