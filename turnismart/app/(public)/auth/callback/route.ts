import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { createOrganization } from "@/lib/organizations";

const TRIAL_DAYS = 30;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=${error.message}`);
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.id))
        .limit(1);

      if (!existing) {
        const name =
          (authUser.user_metadata?.full_name as string) ||
          authUser.email?.split("@")[0] ||
          "La mia attività";
        const org = await createOrganization({
          name,
          email: authUser.email ?? undefined,
          trialDays: TRIAL_DAYS,
        });
        await db.insert(users).values({
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name ?? null,
          organization_id: org.id,
          role: "owner",
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
