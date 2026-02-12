"use client";

import { useState, useTransition, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { format, addWeeks, addDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { createShift, deleteShift, publishSchedule } from "@/app/actions/shifts";
import { ReplicateWeekModal } from "@/components/schedule/replicate-week-modal";
import { EmployeeSidebar } from "@/components/schedule/employee-sidebar";
import { ConflictPopup } from "@/components/schedule/conflict-popup";
import { AIGenerationModal } from "@/components/schedule/ai-generation-modal";
import { SickLeavePopup } from "@/components/schedule/sick-leave-popup";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const PERIODS = [
  { id: "morning", label: "M" },
  { id: "evening", label: "S" },
];

type Shift = {
  id: string;
  location_id: string;
  location_name: string;
  employee_id: string;
  employee_name: string;
  role_id: string;
  role_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
};

type Location = { id: string; name: string };
type Employee = { id: string; first_name: string; last_name: string; weekly_hours: number };
type Role = { id: string; name: string };
type Schedule = { id: string; status: string; week_start_date: string };
type CoverageSlot = {
  locationId: string;
  locationName: string;
  roleId: string;
  roleName: string;
  dayOfWeek: number;
  shiftPeriod: string;
  required: number;
  assigned: number;
};

export function SchedulerClient({
  schedule,
  shifts,
  locations,
  employees,
  roles,
  coverage,
  stats,
  weekStart,
}: {
  schedule: Schedule;
  shifts: Shift[];
  locations: Location[];
  employees: Employee[];
  roles: Role[];
  coverage: CoverageSlot[];
  stats: { totalShifts: number; totalHours: number; employeesScheduled: number };
  weekStart: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [conflict, setConflict] = useState<{
    message: string;
    locationId: string;
    roleId: string;
    date: string;
    period: string;
    employeeId: string;
  } | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showReplicateModal, setShowReplicateModal] = useState(false);
  const [sickLeaveShift, setSickLeaveShift] = useState<Shift | null>(null);

  const view = "location";

  // Pre-index shifts by cell key for O(1) lookup
  const shiftIndex = useMemo(() => {
    const index = new Map<string, Shift[]>();
    for (const s of shifts) {
      if (s.status !== "active") continue;
      const period = s.start_time >= "14:00" ? "evening" : "morning";
      const key = `${s.location_id}:${s.role_id}:${s.date}:${period}`;
      const arr = index.get(key);
      if (arr) arr.push(s);
      else index.set(key, [s]);
    }
    return index;
  }, [shifts]);

  // Pre-index coverage by cell key for O(1) lookup
  const coverageIndex = useMemo(() => {
    const index = new Map<string, CoverageSlot>();
    for (const c of coverage) {
      const key = `${c.locationId}:${c.roleId}:${c.dayOfWeek}:${c.shiftPeriod}`;
      index.set(key, c);
    }
    return index;
  }, [coverage]);

  const navigateWeek = (delta: number) => {
    const d = addWeeks(parseISO(weekStart), delta);
    const nextWeek = format(d, "yyyy-MM-dd");
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", nextWeek);
    router.push(`/schedule?${params.toString()}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    const emp = employees.find((e) => e.id === id);
    if (emp) setActiveEmployee(emp);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveEmployee(null);
    const employeeId = String(event.active.id);
    const over = event.over;
    if (!over) return;
    const dropData = String(over.id);
    if (!dropData.startsWith("cell:")) return;
    const [, locationId, roleId, dayStr, period] = dropData.split(":");
    const d = parseISO(weekStart);
    const cellDate = addDays(d, parseInt(dayStr, 10));
    const dateStr = format(cellDate, "yyyy-MM-dd");

    startTransition(async () => {
      const result = await createShift(
        schedule.id,
        locationId,
        roleId,
        dateStr,
        period,
        employeeId,
        false
      );
      if (result.ok) {
        router.refresh();
      } else {
        setConflict({
          message: result.conflict.message,
          locationId,
          roleId,
          date: dateStr,
          period,
          employeeId,
        });
      }
    });
  };

  const handleAssignAnyway = () => {
    if (!conflict) return;
    startTransition(async () => {
      const result = await createShift(
        schedule.id,
        conflict.locationId,
        conflict.roleId,
        conflict.date,
        conflict.period,
        conflict.employeeId,
        true
      );
      setConflict(null);
      if (result.ok) router.refresh();
    });
  };

  const getShiftsInCell = useCallback(
    (locationId: string, roleId: string, day: number, period: string) => {
      const d = parseISO(weekStart);
      const cellDate = addDays(d, day);
      const dateStr = format(cellDate, "yyyy-MM-dd");
      const key = `${locationId}:${roleId}:${dateStr}:${period}`;
      return shiftIndex.get(key) ?? [];
    },
    [weekStart, shiftIndex]
  );

  const handleDeleteShift = useCallback(
    (shiftId: string) => {
      startTransition(async () => {
        await deleteShift(shiftId);
        router.refresh();
      });
    },
    [router, startTransition]
  );

  const handleFindSubstitute = useCallback(
    (s: Shift) => setSickLeaveShift(s),
    []
  );

  const isEmpty = locations.length === 0 || employees.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Programmazione
        </h1>
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            {locations.length === 0
              ? "Aggiungi almeno una sede e un ruolo con fabbisogno per creare gli orari."
              : "Aggiungi almeno un dipendente attivo per programmare i turni."}
          </p>
          <Link
            href={locations.length === 0 ? "/locations/new" : "/employees/new"}
            className="mt-4 inline-block text-[hsl(var(--primary))] hover:underline"
          >
            {locations.length === 0 ? "Aggiungi sede" : "Aggiungi dipendente"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Programmazione
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateWeek(-1)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
              >
                ←
              </button>
              <span className="min-w-[180px] text-center font-medium">
                {format(parseISO(weekStart), "d MMM yyyy", { locale: it })} –{" "}
                {format(addDays(parseISO(weekStart), 6), "d MMM yyyy", { locale: it })}
              </span>
              <button
                onClick={() => navigateWeek(1)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
              >
                →
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowReplicateModal(true)}
              disabled={pending}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Replica settimana prec.
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 rounded-lg border border-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z" />
              </svg>
              Genera con AI
            </button>
            <div className="text-sm text-zinc-500">
              {stats.totalShifts} turni · {stats.totalHours}h · {stats.employeesScheduled} dipendenti
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                schedule.status === "published"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {schedule.status === "draft"
                ? "Bozza"
                : schedule.status === "published"
                ? "Pubblicato"
                : "Modificato"}
            </span>
            <button
              onClick={() => {
                startTransition(async () => {
                  try {
                    await publishSchedule(schedule.id);
                    toast.success("Orario pubblicato");
                    router.refresh();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Errore");
                  }
                });
              }}
              disabled={pending}
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Pubblica
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-1 overflow-auto">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex-1 overflow-auto">
              <div className="min-w-[800px]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="sticky left-0 z-10 bg-zinc-50 p-2 text-left dark:bg-zinc-900">
                        Sede / Ruolo
                      </th>
                      {DAY_LABELS.flatMap((_, day) =>
                        PERIODS.map((p, pi) => (
                          <th
                            key={`${day}-${p.id}`}
                            className="p-1 text-center text-xs text-zinc-500"
                          >
                            {pi === 1 ? day + 1 : ""} {p.label}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((loc) =>
                      roles.map((role) => (
                        <tr
                          key={`${loc.id}-${role.id}`}
                          className="border-b border-zinc-100 dark:border-zinc-800"
                        >
                          <td className="sticky left-0 z-10 bg-white p-2 dark:bg-zinc-900">
                            <span className="font-medium">{loc.name}</span>
                            <span className="text-zinc-500"> / {role.name}</span>
                          </td>
                          {Array.from({ length: 7 }, (_, day) =>
                            PERIODS.map((period) => {
                              const shiftsHere = getShiftsInCell(
                                loc.id,
                                role.id,
                                day,
                                period.id
                              );
                              const covKey = `${loc.id}:${role.id}:${day}:${period.id}`;
                              const cov = coverageIndex.get(covKey);
                              const assigned = shiftsHere.length;
                              const required = cov?.required ?? 0;
                              return (
                                <ShiftCell
                                  key={`${loc.id}-${role.id}-${day}-${period.id}`}
                                  locationId={loc.id}
                                  roleId={role.id}
                                  day={day}
                                  period={period.id}
                                  shifts={shiftsHere}
                                  assigned={assigned}
                                  required={required}
                                  onDelete={handleDeleteShift}
                                  onFindSubstitute={handleFindSubstitute}
                                />
                              );
                            })
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-56 shrink-0 border-l border-zinc-200 pl-4 dark:border-zinc-800">
              <EmployeeSidebar employees={employees} shifts={shifts} weekStart={weekStart} />
            </div>

            <DragOverlay>
              {activeEmployee ? (
                <div className="rounded-lg border-2 border-[hsl(var(--primary))] bg-white px-3 py-2 shadow-lg dark:bg-zinc-800">
                  {activeEmployee.first_name} {activeEmployee.last_name}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {showAIModal && (
        <AIGenerationModal
          weekStart={weekStart}
          onClose={() => setShowAIModal(false)}
        />
      )}
      {showReplicateModal && (
        <ReplicateWeekModal
          scheduleId={schedule.id}
          weekStart={weekStart}
          onClose={() => setShowReplicateModal(false)}
        />
      )}
      {sickLeaveShift && (
        <SickLeavePopup
          shiftId={sickLeaveShift.id}
          shiftInfo={{
            date: sickLeaveShift.date,
            locationName: sickLeaveShift.location_name,
            roleName: sickLeaveShift.role_name,
            employeeName: sickLeaveShift.employee_name,
          }}
          onClose={() => setSickLeaveShift(null)}
        />
      )}
      {conflict && (
        <ConflictPopup
          message={conflict.message}
          onAssignAnyway={handleAssignAnyway}
          onCancel={() => setConflict(null)}
          pending={pending}
        />
      )}
    </div>
  );
}

const ShiftCell = memo(function ShiftCell({
  locationId,
  roleId,
  day,
  period,
  shifts,
  assigned,
  required,
  onDelete,
  onFindSubstitute,
}: {
  locationId: string;
  roleId: string;
  day: number;
  period: string;
  shifts: Shift[];
  assigned: number;
  required: number;
  onDelete: (id: string) => void;
  onFindSubstitute: (shift: Shift) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell:${locationId}:${roleId}:${day}:${period}`,
  });

  return (
    <td
      ref={setNodeRef}
      className={`min-w-[80px] border-l border-zinc-100 p-1 align-top dark:border-zinc-800 ${
        isOver ? "bg-[hsl(var(--primary))]/20" : ""
      } ${required > 0 && assigned < required ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
    >
      <div className="min-h-[44px] space-y-1">
        {shifts.map((s) => (
          <div
            key={s.id}
            className="group flex items-center justify-between gap-1 rounded bg-[hsl(var(--primary))]/15 px-2 py-1 text-xs"
          >
            <span className="truncate">{s.employee_name}</span>
            <div className="flex opacity-0 group-hover:opacity-100">
              <button
                onClick={() => onFindSubstitute(s)}
                className="rounded p-0.5 hover:bg-[hsl(var(--primary))]/30"
                title="Trova sostituto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(s.id)}
                className="rounded p-0.5 hover:bg-red-500/30"
                title="Rimuovi"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {required > 0 && (
          <div className="text-[10px] text-zinc-400">
            {assigned}/{required}
          </div>
        )}
      </div>
    </td>
  );
});
