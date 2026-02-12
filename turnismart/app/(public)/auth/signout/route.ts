import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Clears Supabase session and redirects. Use when redirecting unauthenticated users
 *  to ensure stale sessions (Supabase auth present but no users record) are cleared. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") ?? "/auth/login";

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
