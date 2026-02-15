"use client";

import { useState, type ReactNode } from "react";

export function StaffingTabs({
  weeklyTab,
  monthlyTab,
}: {
  weeklyTab: ReactNode;
  monthlyTab: ReactNode;
}) {
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");

  return (
    <div>
      <div className="mt-3 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setTab("weekly")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "weekly"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Template settimanale
        </button>
        <button
          onClick={() => setTab("monthly")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "monthly"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Calendario mensile
        </button>
      </div>

      {tab === "weekly" ? weeklyTab : monthlyTab}
    </div>
  );
}
