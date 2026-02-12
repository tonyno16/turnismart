"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNotificationSettings } from "@/app/actions/settings";
import type { NotificationEventType } from "@/drizzle/schema";

const CHANNELS = ["whatsapp", "email"] as const; // in_app always on

type Props = {
  events: NotificationEventType[];
  eventLabels: Record<NotificationEventType, string>;
  channelLabels: Record<string, string>;
  initialValues: Record<string, boolean>;
};

export function NotificationSettingsForm({
  events,
  eventLabels,
  channelLabels,
  initialValues,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    const v: Record<string, boolean> = {};
    for (const ev of events) {
      for (const ch of CHANNELS) {
        const key = `${ev}_${ch}`;
        v[key] = initialValues[key] ?? (ch === "email");
      }
    }
    return v;
  });

  const handleToggle = (key: string) => {
    setValues((v) => ({ ...v, [key]: !v[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateNotificationSettings(values);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="p-2 text-left font-medium">Evento</th>
              {CHANNELS.map((ch) => (
                <th key={ch} className="p-2 text-center">
                  {channelLabels[ch]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="p-2 font-medium">{eventLabels[ev]}</td>
                {CHANNELS.map((ch) => {
                  const key = `${ev}_${ch}`;
                  const checked = values[key] ?? false;
                  return (
                    <td key={ch} className="p-2 text-center">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggle(key)}
                          className="rounded border-zinc-300 dark:border-zinc-600"
                        />
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva preferenze"}
      </button>
    </form>
  );
}
