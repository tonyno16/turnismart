import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** POST /api/auth/login - Route Handler ensures cookies are set correctly (Server Actions may fail). */
export async function POST(request: Request) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  const baseUrl = new URL(request.url).origin;

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent("Email e password sono obbligatori.")}`, baseUrl),
      303
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.message.includes("Invalid login") ? "Email o password non corretti." : error.message;
    const loginUrl = new URL("/auth/login", baseUrl);
    loginUrl.searchParams.set("error", msg);
    if (redirectTo && redirectTo !== "/dashboard") {
      loginUrl.searchParams.set("redirectTo", redirectTo);
    }
    return NextResponse.redirect(loginUrl, 303);
  }

  return NextResponse.redirect(new URL(redirectTo, baseUrl), 303);
}
