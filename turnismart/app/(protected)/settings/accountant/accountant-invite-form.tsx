"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteAccountant } from "@/app/actions/accountant";

export function AccountantInviteForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await inviteAccountant(email);
      if (result.ok) {
        setMessage({ type: "success", text: result.message });
        setEmail("");
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="mb-3 font-semibold text-zinc-900 dark:text-white">
        Invita commercialista
      </h2>
      <div className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@commercialista.it"
          required
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Invio..." : "Invia invito"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-sm ${
            message.type === "success"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
