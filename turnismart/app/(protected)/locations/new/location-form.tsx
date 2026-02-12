"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type LocationFormProps = {
  action: (formData: FormData) => Promise<unknown>;
  initialData?: { name?: string; address?: string; phone?: string };
};

export function LocationForm({
  action,
  initialData,
}: LocationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      router.push("/locations");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nome *
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={initialData?.name}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Indirizzo
        </label>
        <input
          name="address"
          type="text"
          defaultValue={initialData?.address}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Telefono
        </label>
        <input
          name="phone"
          type="tel"
          defaultValue={initialData?.phone}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva"}
      </button>
    </form>
  );
}
