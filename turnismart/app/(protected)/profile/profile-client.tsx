"use client";

import { useTransition } from "react";
import { redirectToStripePortal } from "@/app/actions/profile";

export function ProfileStripeButton() {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await redirectToStripePortal();
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Apertura..." : "Gestisci abbonamento"}
    </button>
  );
}
