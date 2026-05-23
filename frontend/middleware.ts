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

  // Only run Supabase session refresh if env vars are configured.
  // If they are missing (e.g. Vercel preview without secrets), skip auth
  // entirely so the app still works in demo/offline mode.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
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

      // Refresh session silently — ignore the result.
      // We do NOT redirect to /login if unauthenticated; the visualizer
      // is publicly accessible and auth is optional.
      await supabase.auth.getUser();
    } catch (err) {
      // Never crash the middleware — just continue without auth.
      console.warn("Middleware: Supabase session refresh failed:", err);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
