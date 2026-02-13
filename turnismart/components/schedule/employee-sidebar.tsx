"use client";

import { memo, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { shiftMinutesInWeek } from "@/lib/schedule-utils";

type Employee = { id: string; first_name: string; last_name: string; weekly_hours: number };
type Role = { id: string; name: string };
type Shift = {
  employee_id: string;
  start_time: string;
  end_time: string;
  date: string;
  status?: string;
};

type EquityBadge = "ok" | "low" | "high" | null;

const EmployeeCard = memo(function EmployeeCard({
  employee,
  roleNames,
  weekMinutes,
  weeklyHours,
  shiftCount,
  equityBadge,
}: {
  employee: Employee;
  roleNames: string;
  weekMinutes: number;
  weeklyHours: number;
  shiftCount: number;
  equityBadge: EquityBadge;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: employee.id,
  });

  const hours = weekMinutes / 60;
  const hoursStr = hours.toFixed(1);
  const pct = weeklyHours > 0 ? Math.min(100, (hours / weeklyHours) * 100) : 0;
  const isOvertime = weeklyHours > 0 && hours > weeklyHours;

  const equityLabel =
    equityBadge === "low"
      ? "Pochi turni"
      : equityBadge === "high"
        ? "Molti turni"
        : null;

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
      title={
        isOvertime
          ? `${hoursStr}h su ${weeklyHours} contrattuali (straordinario)`
          : equityBadge
            ? `${shiftCount} turni`
            : undefined
      }
    >
      <div className="flex min-w-0 flex-1 items-start justify-between gap-1">
        <div className="min-w-0">
          <div className="font-medium">
            {employee.first_name} {employee.last_name}
          </div>
          {roleNames && (
            <div className="mt-0.5 text-xs text-zinc-500">{roleNames}</div>
          )}
        </div>
        {isOvertime && (
          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
            Straordinario
          </span>
        )}
        {!isOvertime && equityLabel && (
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
              equityBadge === "low"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
            }`}
          >
            {equityLabel}
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
  roles,
  employeeRoleIds,
}: {
  employees: Employee[];
  shifts: Shift[];
  weekStart: string;
  roles?: Role[];
  employeeRoleIds?: Record<string, string[]>;
}) {
  const empMinutes = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of shifts) {
      if (s.employee_id && s.status === "active") {
        const mins = shiftMinutesInWeek(s.date, s.start_time, s.end_time, weekStart);
        map.set(s.employee_id, (map.get(s.employee_id) ?? 0) + mins);
      }
    }
    return map;
  }, [shifts, weekStart]);

  const { empShiftCounts, equityByEmp } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of shifts) {
      if (s.employee_id && s.status === "active") {
        counts.set(s.employee_id, (counts.get(s.employee_id) ?? 0) + 1);
      }
    }
    const totalShifts = [...counts.values()].reduce((a, b) => a + b, 0);
    const activeCount = employees.length;
    const avg = activeCount > 0 ? totalShifts / activeCount : 0;
    const equity = new Map<string, EquityBadge>();
    if (totalShifts > 0 && avg > 0) {
      for (const emp of employees) {
        const c = counts.get(emp.id) ?? 0;
        const ratio = c / avg;
        if (ratio < 0.8) equity.set(emp.id, "low");
        else if (ratio > 1.2) equity.set(emp.id, "high");
        else equity.set(emp.id, "ok");
      }
    }
    return {
      empShiftCounts: counts,
      equityByEmp: equity,
    };
  }, [shifts, employees]);

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
          employees.map((emp) => {
            const roleNames =
              roles && employeeRoleIds
                ? (employeeRoleIds[emp.id] ?? [])
                    .map((rid) => roles.find((r) => r.id === rid)?.name)
                    .filter(Boolean)
                    .join(", ") || ""
                : "";
            return (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                roleNames={roleNames}
                weekMinutes={empMinutes.get(emp.id) ?? 0}
                weeklyHours={emp.weekly_hours}
                shiftCount={empShiftCounts.get(emp.id) ?? 0}
                equityBadge={equityByEmp.get(emp.id) ?? null}
              />
            );
          })
        )}
      </div>
    </div>
  );
});
