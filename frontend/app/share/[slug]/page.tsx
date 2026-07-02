"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Clock, Eye, Sparkles, Code2, BookOpen } from "lucide-react";
import { timeAgo } from "@/lib/dashboardUtils";

// Dynamic canvas
const VisualCanvas = dynamic(() => import("@/components/VisualCanvas"), { ssr: false });
const StepController = dynamic(() => import("@/components/StepController"), { ssr: false });

interface SharedTrace {
  id: string;
  title: string;
  lang: string;
  code: string;
  steps_json: any[];
  data_structure: string;
  view_count: number;
  created_at: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function SharedTracePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [trace, setTrace] = useState<SharedTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function loadTrace() {
      // Fetch shared trace
      const { data, error } = await supabase
        .from("shared_traces")
        .select(`
          id,
          title,
          lang,
          code,
          steps_json,
          data_structure,
          view_count,
          created_at,
          user_id
        `)
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Fetch user profile if user_id exists
      let userProfile = null;
      if (data.user_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.user_id)
          .single();
        userProfile = prof;
      }

      setTrace({
        ...data,
        user: userProfile,
      } as any);

      // Increment view count in background (Client side increment)
      await supabase
        .from("shared_traces")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("slug", slug);

      setLoading(false);
    }

    if (slug) {
      loadTrace();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 12 }} />
        <span>Loading shared trace...</span>
      </div>
    );
  }

  if (!trace) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)", color: "var(--muted)", padding: 24, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Shared trace not found</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>The link is either incorrect or has been deleted.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 24, fontSize: 13 }}>
          Go to Home
        </Link>
      </div>
    );
  }

  const currentStep = trace.steps_json[currentStepIdx] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      {/* Navbar header */}
      <header style={{ height: 60, background: "var(--surface-1)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
              {"<>"}
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>CodeCanvas</span>
          </Link>
          <span style={{ height: 16, width: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{trace.title}</span>
        </div>

        <Link href="/visualize" className="btn btn-primary" style={{ fontSize: 13 }}>
          Try visualizer free →
        </Link>
      </header>

      {/* Main content grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "30% 45% 25%", overflow: "hidden" }}>
        {/* Left Side: Code block */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-1)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Shared Code</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Shared by {trace.user?.full_name ?? "Community Coder"} · {timeAgo(trace.created_at)}</div>
            </div>
            <span style={{ fontSize: 10, textTransform: "uppercase", background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid var(--primary-border)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
              {trace.lang}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "var(--surface-2)" }}>
            <pre style={{ margin: 0, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {trace.code.split("\n").map((line, idx) => {
                const isCurrent = currentStep && Number(currentStep.line) === idx + 1;
                return (
                  <div
                    key={idx}
                    style={{
                      background: isCurrent ? "rgba(59,130,246,0.15)" : "transparent",
                      borderLeft: `2px solid ${isCurrent ? "var(--primary)" : "transparent"}`,
                      paddingLeft: 8,
                      marginLeft: -10,
                    }}
                  >
                    <span style={{ color: "var(--muted)", marginRight: 12, userSelect: "none" }}>{idx + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        {/* Center: Visual Canvas */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "#0f172a", overflow: "hidden" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <VisualCanvas
              step={currentStep}
              dataStructure={trace.data_structure}
            />
          </div>

          <div style={{ height: 64, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 20px", background: "var(--surface-1)" }}>
            <StepController
              currentStep={currentStepIdx + 1}
              totalSteps={trace.steps_json.length}
              isPlaying={false}
              speed={1}
              onFirst={() => setCurrentStepIdx(0)}
              onPrev={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentStepIdx((i) => Math.min(trace.steps_json.length - 1, i + 1))}
              onLast={() => setCurrentStepIdx(trace.steps_json.length - 1)}
              onPlayPause={() => {}}
              onSpeedChange={() => {}}
            />
          </div>
        </div>

        {/* Right Side: Step Explanation detail */}
        <div style={{ padding: 20, background: "var(--surface-1)", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Trace Step Breakdown</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}>
              <Eye size={13} /> {trace.view_count || 1} views
            </div>
          </div>

          {currentStep ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--surface-2)" }}>
                <span style={{ fontSize: 10, textTransform: "uppercase", background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid var(--primary-border)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                  {currentStep.action}
                </span>
                <p style={{ fontSize: 13, color: "var(--text)", marginTop: 10, lineHeight: 1.5, margin: "10px 0 0" }}>
                  {currentStep.description}
                </p>
              </div>

              {/* Variables watch block */}
              {Object.keys(currentStep.variables || {}).length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Active Variables</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(currentStep.variables).map(([name, val]: any) => (
                      <div key={name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                        <span style={{ color: "var(--primary)" }}>{name}</span>: {String(val)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "var(--muted)", fontSize: 12 }}>No steps generated in this trace.</div>
          )}
        </div>
      </div>
    </div>
  );
}
