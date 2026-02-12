import { redirect } from "next/navigation";
import { requireOrganization } from "@/lib/auth";
import { getOnboardingData } from "@/app/actions/onboarding";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  let org;
  try {
    const result = await requireOrganization();
    org = result.organization;
  } catch {
    redirect("/dashboard");
  }

  if (org.onboarding_completed) {
    redirect("/dashboard");
  }

  let onboardingData;
  try {
    onboardingData = await getOnboardingData();
  } catch {
    onboardingData = { location: null, roles: [] };
  }

  const hasRoles = (onboardingData?.roles?.length ?? 0) > 0;
  const hasLocation = !!onboardingData?.location;
  const initialStep = !hasRoles ? 1 : !hasLocation ? 2 : 3;

  return (
    <div className="min-h-screen bg-zinc-50 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
          Configura la tua attività
        </h1>
        <p className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
          Completiamo l&apos;onboarding in pochi minuti
        </p>
        <OnboardingWizard
          organizationId={org.id}
          sector={org.sector}
          initialStep={initialStep}
        />
      </div>
    </div>
  );
}
