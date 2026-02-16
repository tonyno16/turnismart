import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectPath } from "@/lib/url";

const publicPaths = ["/", "/privacy", "/terms", "/refund", "/auth"];
const authPaths = ["/auth/login", "/auth/sign-up", "/auth/forgot-password", "/auth/verify-email"];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.some((p) => pathname === p)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname === "/manifest.json") return true; // PWA manifest - must be public
  return false;
}

function isAuthPath(pathname: string): boolean {
  return authPaths.some((p) => pathname.startsWith(p)) || pathname.startsWith("/auth/invite/");
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return new NextResponse(
      "Configuration error: Supabase env vars missing. Check Vercel Environment Variables.",
      { status: 503, headers: { "Content-Type": "text/plain" } }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let user: { id: string } | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {
    console.error("[middleware] Supabase auth.getUser failed:", e);
  }

  const pathname = request.nextUrl.pathname;

  // Redirect /login -> /auth/login (common shorthand)
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (!user) {
    if (!isPublicPath(pathname)) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (isAuthPath(pathname) && !pathname.startsWith("/auth/invite/")) {
    const redirectTo = sanitizeRedirectPath(request.nextUrl.searchParams.get("redirectTo"));
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
