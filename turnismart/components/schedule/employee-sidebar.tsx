"use client";

import { memo, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";

type Employee = { id: string; first_name: string; last_name: string; weekly_hours: number };
type Shift = {
  employee_id: string;
  start_time: string;
  end_time: string;
  date: string;
  status?: string;
};

function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

const EmployeeCard = memo(function EmployeeCard({
  employee,
  weekMinutes,
  weeklyHours,
}: {
  employee: Employee;
  weekMinutes: number;
  weeklyHours: number;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: employee.id,
  });

  const hours = weekMinutes / 60;
  const hoursStr = hours.toFixed(1);
  const pct = weeklyHours > 0 ? Math.min(100, (hours / weeklyHours) * 100) : 0;
  const isOvertime = weeklyHours > 0 && hours > weeklyHours;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-lg border p-2 text-sm ${
        isDragging
          ? "opacity-50"
          : "border-zinc-200 bg-white hover:border-[hsl(var(--primary))]/50 dark:border-zinc-700 dark:bg-zinc-800"
      } ${isOvertime ? "border-red-400/60 dark:border-red-500/40" : ""}`}
      title={isOvertime ? `${hoursStr}h su ${weeklyHours} contrattuali (straordinario)` : undefined}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium">
          {employee.first_name} {employee.last_name}
        </span>
        {isOvertime && (
          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
            Straordinario
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className={`h-full ${
              pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <span className={`text-xs ${isOvertime ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`}>
          {hoursStr}h
        </span>
      </div>
    </div>
  );
});

export const EmployeeSidebar = memo(function EmployeeSidebar({
  employees,
  shifts,
  weekStart,
}: {
  employees: Employee[];
  shifts: Shift[];
  weekStart: string;
}) {
  const empMinutes = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of shifts) {
      if (s.employee_id && s.status === "active") {
        const mins = parseTimeMinutes(s.end_time) - parseTimeMinutes(s.start_time);
        map.set(s.employee_id, (map.get(s.employee_id) ?? 0) + mins);
      }
    }
    return map;
  }, [shifts]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Dipendenti
      </h3>
      <p className="text-xs text-zinc-500">
        Trascina su una cella per assegnare
      </p>
      <div className="mt-2 space-y-2">
        {employees.length === 0 ? (
          <p className="text-xs text-zinc-500">Nessun risultato per i filtri selezionati</p>
        ) : (
          employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              weekMinutes={empMinutes.get(emp.id) ?? 0}
              weeklyHours={emp.weekly_hours}
            />
          ))
        )}
      </div>
    </div>
  );
});
