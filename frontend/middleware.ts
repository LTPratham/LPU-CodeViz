import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Redirect PKCE auth codes to the callback route
  // We exclude "/visualize" because it uses "code" as a query parameter for sharing code snippets.
  const code = request.nextUrl.searchParams.get("code");
  if (
    code &&
    !request.nextUrl.pathname.startsWith("/auth/") &&
    !request.nextUrl.pathname.startsWith("/visualize")
  ) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Check if user even has a Supabase auth cookie before making an external API call over network.
  // This prevents Vercel 504 MIDDLEWARE_INVOCATION_TIMEOUT when users visit without auth or in demo mode.
  const hasSupabaseCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && hasSupabaseCookie) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({ name, value, ...options });
              response = NextResponse.next({ request: { headers: request.headers } });
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({ name, value: "", ...options });
              response = NextResponse.next({ request: { headers: request.headers } });
              response.cookies.set({ name, value: "", ...options });
            },
          },
        }
      );

      // Refresh session with a strict 1500ms timeout to prevent Vercel Gateway Timeout (504)
      const getUserPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase auth timeout in middleware")), 1500)
      );

      await Promise.race([getUserPromise, timeoutPromise]);
    } catch (err) {
      // Never crash or hang the middleware — just continue gracefully.
      console.warn("Middleware: Supabase session refresh skipped/timed out:", err);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
