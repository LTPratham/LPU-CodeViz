import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const role = searchParams.get("role");
  const next = searchParams.get("next") ?? "/visualize";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      const user = data.session.user;

      // Password recovery flow — bypass role check
      const amr = user?.app_metadata?.amr || [];
      const isRecovery =
        amr.includes("recovery") ||
        type === "recovery" ||
        next === "/reset-password";

      if (isRecovery) {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Check user's profile for existing role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      let activeRole = profile?.role;

      // If no role is set in the database, lock in the login preference
      if (!activeRole && (role === "student" || role === "teacher")) {
        activeRole = role;
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            role: role,
            full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
            avatar_url: user.user_metadata?.avatar_url ?? null,
            updated_at: new Date().toISOString()
          }, { onConflict: "id" });
      }

      // No profile or no role set → send to role selection fallback
      if (!activeRole) {
        return NextResponse.redirect(`${origin}/auth/role-select`);
      }

      // Route based on role
      if (activeRole === "teacher") {
        return NextResponse.redirect(`${origin}/dashboard/teacher`);
      }
      if (activeRole === "student") {
        return NextResponse.redirect(`${origin}/dashboard/student`);
      }

      // Fallback (admin or unknown role)
      return NextResponse.redirect(`${origin}/visualize`);
    }
  }

  // Auth failed — return to login with error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Invalid or expired link. Please try again.")}`
  );
}

