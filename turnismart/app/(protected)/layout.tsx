import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser, getSupabaseUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizations";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import type { UserRole } from "@/drizzle/schema";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.includes("/onboarding");

  const user = await getCurrentUser();
  if (!user) {
    const authUser = await getSupabaseUser();
    const loginUrl =
      "/auth/login" + (pathname ? "?redirectTo=" + encodeURIComponent(pathname) : "");
    // Stale session (Supabase auth present but no users record): clear via signout so middleware can redirect next time
    if (authUser) {
      redirect("/auth/signout?redirectTo=" + encodeURIComponent(loginUrl));
    }
    redirect(loginUrl);
  }

  if (user.organization_id && !isOnboarding) {
    const org = await getOrganization(user.organization_id);
    if (org && !org.onboarding_completed) {
      redirect("/onboarding");
    }
  }

  if (isOnboarding) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar userRole={user.role as UserRole} />
        <main className="flex-1 min-w-0 pt-14 pl-0 lg:pt-0 lg:pl-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar userRole={user.role as UserRole} />
      <main className="flex-1 min-w-0 pt-14 pl-0 lg:pt-0 lg:pl-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
