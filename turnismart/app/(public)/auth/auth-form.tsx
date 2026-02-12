"use client";

import { useActionState } from "react";

type Field = {
  name: string;
  type: string;
  label: string;
  required?: boolean;
};

type HiddenField = { name: string; value: string };

export function AuthForm({
  action,
  submitLabel,
  fields,
  hiddenFields,
  successMessage,
}: {
  action: (prev: { error?: string; ok?: boolean }, formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  submitLabel: string;
  fields: Field[];
  hiddenFields?: HiddenField[];
  successMessage?: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {hiddenFields?.map((f) => (
        <input key={f.name} type="hidden" name={f.name} value={f.value} />
      ))}
      {state?.ok && successMessage && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {successMessage}
        </p>
      )}
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      {fields.map((f) => (
        <div key={f.name}>
          <label
            htmlFor={f.name}
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {f.label}
            {f.required && " *"}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            required={f.required}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
            autoComplete={f.name === "email" ? "email" : f.name === "password" ? "current-password" : undefined}
          />
        </div>
      ))}
      <button
        type="submit"
        className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        {submitLabel}
      </button>
    </form>
  );
}
