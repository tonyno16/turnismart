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
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
