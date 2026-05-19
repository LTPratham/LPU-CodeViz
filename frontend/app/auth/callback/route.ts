import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/visualize";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      const amr = data.session.user?.app_metadata?.amr || [];
      const isRecovery = amr.includes("recovery");
      const redirectUrl = isRecovery ? "/reset-password" : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Invalid%20or%20expired%20link`);
}

