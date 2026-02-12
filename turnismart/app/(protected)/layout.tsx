import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizations";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.includes("/onboarding");

  const user = await getCurrentUser();
  if (!user) return null;

  if (user.organization_id && !isOnboarding) {
    const org = await getOrganization(user.organization_id);
    if (org && !org.onboarding_completed) {
      redirect("/onboarding");
    }
  }

  return <>{children}</>;
}
