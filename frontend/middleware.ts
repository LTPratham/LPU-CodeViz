import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/auth",
  "/reset-password",
  "/",        // Landing page is public
];

// Pages where demo (mock_role) cookie is accepted as a bypass
const DEMO_ALLOWED_PATHS = [
  "/visualize",
  "/battleground",
  "/dashboard/student",
  "/dashboard/teacher",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect PKCE auth codes to the callback route
  const code = request.nextUrl.searchParams.get("code");
  if (
    code &&
    !pathname.startsWith("/auth/") &&
    !pathname.startsWith("/visualize")
  ) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  // Allow public paths through without any auth check
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Check for demo/tour cookie first — allow demo access to specific routes
  const mockRole = request.cookies.get("mock_role")?.value;
  const isDemoAllowed = DEMO_ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (mockRole && isDemoAllowed) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Real auth check — only if Supabase env vars are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Env vars not set — redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });

    // Enforce auth with a timeout to avoid Vercel 504
    const getUserPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>(
      (resolve) =>
        setTimeout(
          () => resolve({ data: { user: null }, error: new Error("timeout") }),
          1500
        )
    );

    const result = await Promise.race([getUserPromise, timeoutPromise]);
    const user = (result as any).data?.user;

    if (!user) {
      // Not authenticated — redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (err) {
    // On error, redirect to login rather than silently allowing access
    console.warn("Middleware auth check failed:", err);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
