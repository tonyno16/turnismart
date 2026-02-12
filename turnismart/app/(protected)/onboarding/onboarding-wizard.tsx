"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Step1Sector } from "./steps/step1-sector";
import { Step2Location } from "./steps/step2-location";
import { Step3Staffing } from "./steps/step3-staffing";
import { Step4Employees } from "./steps/step4-employees";
import { Step5Summary } from "./steps/step5-summary";

const STEPS = 5;

export function OnboardingWizard({
  organizationId,
  sector,
  initialStep = 1,
}: {
  organizationId: string;
  sector: string | null;
  initialStep?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState<string | null>(null);

  const onNext = () => {
    setError(null);
    if (step < STEPS) setStep(step + 1);
    router.refresh();
  };

  const onBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-6 flex gap-2">
        {Array.from({ length: STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i + 1 <= step
                ? "bg-[hsl(var(--primary))]"
                : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {step === 1 && (
        <Step1Sector
          currentSector={sector}
          onComplete={() => onNext()}
          onError={setError}
        />
      )}
      {step === 2 && (
        <Step2Location onComplete={() => onNext()} onError={setError} />
      )}
      {step === 3 && (
        <Step3Staffing
          onComplete={() => onNext()}
          onBack={onBack}
          onError={setError}
        />
      )}
      {step === 4 && (
        <Step4Employees
          onComplete={() => onNext()}
          onBack={onBack}
          onError={setError}
        />
      )}
      {step === 5 && <Step5Summary onBack={onBack} />}
    </div>
  );
}
