"use client";

import { useActionState } from "react";
import { acceptInvite } from "@/app/actions/auth";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(
    (_prev: { error?: string }, formData: FormData) => acceptInvite(token, formData),
    {} as { error?: string }
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      <div>
        <label
          htmlFor="fullName"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nome e cognome
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Password (min. 8 caratteri) *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        Crea account e accetta invito
      </button>
    </form>
  );
}
