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
import { createShift, deleteShift, publishSchedule, updateShiftNotes, duplicateShift } from "@/app/actions/shifts";
import { ReplicateWeekModal } from "@/components/schedule/replicate-week-modal";
import { SaveTemplateModal } from "@/components/schedule/save-template-modal";
import { ApplyTemplateModal } from "@/components/schedule/apply-template-modal";
import { ExportPdfModal } from "@/components/schedule/export-pdf-modal";
import { EmployeeSidebar } from "@/components/schedule/employee-sidebar";
import { SchedulerFilters, type SchedulerFiltersState } from "@/components/schedule/scheduler-filters";
import { ConflictPopup } from "@/components/schedule/conflict-popup";
import { AIGenerationModal } from "@/components/schedule/ai-generation-modal";
import { SickLeavePopup } from "@/components/schedule/sick-leave-popup";
import { ShiftCard } from "@/components/schedule/shift-card";

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
  notes?: string | null;
};

type Location = { id: string; name: string };
type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  weekly_hours: number;
  preferred_location_id: string | null;
};
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
  employeeRoleIds,
}: {
  schedule: Schedule;
  shifts: Shift[];
  locations: Location[];
  employees: Employee[];
  roles: Role[];
  coverage: CoverageSlot[];
  stats: { totalShifts: number; totalHours: number; employeesScheduled: number };
  weekStart: string;
  employeeRoleIds: Record<string, string[]>;
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
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showApplyTemplateModal, setShowApplyTemplateModal] = useState(false);
  const [showExportPdfModal, setShowExportPdfModal] = useState(false);
  const [sickLeaveShift, setSickLeaveShift] = useState<Shift | null>(null);
  const [filters, setFilters] = useState<SchedulerFiltersState>({
    roleId: "",
    preferredLocationId: "",
    onlyUncovered: false,
  });
  const [viewMode, setViewMode] = useState<"location" | "employee" | "role">("location");

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (filters.roleId) {
      const roleIds = employeeRoleIds[filters.roleId] ? [filters.roleId] : [];
      const withRole = new Set(
        Object.entries(employeeRoleIds)
          .filter(([, ids]) => ids.includes(filters.roleId))
          .map(([eid]) => eid)
      );
      list = list.filter((e) => withRole.has(e.id));
    }
    if (filters.preferredLocationId) {
      list = list.filter((e) => e.preferred_location_id === filters.preferredLocationId);
    }
    return list;
  }, [employees, filters.roleId, filters.preferredLocationId, employeeRoleIds]);

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
    const emp = filteredEmployees.find((e) => e.id === id);
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

  const filteredLocationRoleRows = useMemo(() => {
    if (!filters.onlyUncovered) {
      return locations.flatMap((loc) =>
        roles.map((role) => ({ locationId: loc.id, locationName: loc.name, roleId: role.id, roleName: role.name }))
      );
    }
    return locations.flatMap((loc) =>
      roles
        .map((role) => {
          let hasUncovered = false;
          for (let day = 0; day < 7; day++) {
            const d = parseISO(weekStart);
            const cellDate = addDays(d, day);
            const dateStr = format(cellDate, "yyyy-MM-dd");
            for (const period of ["morning", "evening"]) {
              const covKey = `${loc.id}:${role.id}:${day}:${period}`;
              const cov = coverageIndex.get(covKey);
              const required = cov?.required ?? 0;
              if (required > 0) {
                const key = `${loc.id}:${role.id}:${dateStr}:${period}`;
                const shiftsHere = shiftIndex.get(key) ?? [];
                if (shiftsHere.length < required) hasUncovered = true;
              }
            }
          }
          return { locationId: loc.id, locationName: loc.name, roleId: role.id, roleName: role.name, hasUncovered };
        })
        .filter((r) => r.hasUncovered)
        .map(({ hasUncovered: _, ...r }) => r)
    );
  }, [locations, roles, filters.onlyUncovered, coverageIndex, shiftIndex, weekStart]);

  const shiftsByEmployeeSlot = useMemo(() => {
    const index = new Map<string, Shift>();
    for (const s of shifts) {
      if (s.status !== "active") continue;
      const period = s.start_time >= "14:00" ? "evening" : "morning";
      const key = `${s.employee_id}:${s.date}:${period}`;
      index.set(key, s);
    }
    return index;
  }, [shifts]);

  const employeesByRole = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const role of roles) {
      const emps = filteredEmployees.filter(
        (e) => (employeeRoleIds[e.id] ?? []).includes(role.id)
      );
      if (emps.length > 0) map.set(role.id, emps);
    }
    return map;
  }, [filteredEmployees, roles, employeeRoleIds]);

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

  const handleUpdateNotes = useCallback(
    (shiftId: string, notes: string | null) => {
      startTransition(async () => {
        const result = await updateShiftNotes(shiftId, notes);
        if (result.ok) router.refresh();
      });
    },
    [router, startTransition]
  );

  const handleDuplicateShift = useCallback(
    (shiftId: string, targetDate: string) => {
      startTransition(async () => {
        const result = await duplicateShift(shiftId, targetDate);
        if (result.ok) {
          router.refresh();
        } else {
          toast.error(result.error);
        }
      });
    },
    [router, startTransition]
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
              <span className="text-xs text-zinc-500">Vista:</span>
              <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
                {(
                  [
                    ["location", "Per sede"],
                    ["employee", "Per dipendente"],
                    ["role", "Per ruolo"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-xs font-medium ${
                      viewMode === mode
                        ? "bg-[hsl(var(--primary))] text-white"
                        : "bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    } ${mode === "location" ? "rounded-l-md" : ""} ${mode === "role" ? "rounded-r-md" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <SchedulerFilters
              roles={roles}
              locations={locations}
              filters={filters}
              onChange={setFilters}
            />
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
              onClick={() => setShowSaveTemplateModal(true)}
              disabled={pending}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Salva template
            </button>
            <button
              onClick={() => setShowApplyTemplateModal(true)}
              disabled={pending}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Applica template
            </button>
            <button
              onClick={() => setShowExportPdfModal(true)}
              disabled={pending}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Esporta PDF
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
                        {viewMode === "location"
                          ? "Sede / Ruolo"
                          : viewMode === "employee"
                          ? "Dipendente"
                          : "Ruolo / Dipendente"}
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
                    {viewMode === "location" && (
                      <>
                        {filteredLocationRoleRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={15}
                              className="py-8 text-center text-sm text-zinc-500"
                            >
                              {filters.onlyUncovered
                                ? "Nessuna cella scoperta"
                                : "Nessun fabbisogno configurato"}
                            </td>
                          </tr>
                        ) : (
                          filteredLocationRoleRows.map(
                            ({
                              locationId: locId,
                              locationName: locName,
                              roleId: roleIdR,
                              roleName: roleNameR,
                            }) => (
                              <tr
                                key={`${locId}-${roleIdR}`}
                                className="border-b border-zinc-100 dark:border-zinc-800"
                              >
                                <td className="sticky left-0 z-10 bg-white p-2 dark:bg-zinc-900">
                                  <span className="font-medium">{locName}</span>
                                  <span className="text-zinc-500">
                                    {" "}
                                    / {roleNameR}
                                  </span>
                                </td>
                                {Array.from({ length: 7 }, (_, day) =>
                                  PERIODS.map((period) => {
                                    const shiftsHere = getShiftsInCell(
                                      locId,
                                      roleIdR,
                                      day,
                                      period.id
                                    );
                                    const covKey = `${locId}:${roleIdR}:${day}:${period.id}`;
                                    const cov = coverageIndex.get(covKey);
                                    const assigned = shiftsHere.length;
                                    const required = cov?.required ?? 0;
                                    return (
                                      <ShiftCell
                                        key={`${locId}-${roleIdR}-${day}-${period.id}`}
                                        locationId={locId}
                                        roleId={roleIdR}
                                        day={day}
                                        period={period.id}
                                        shifts={shiftsHere}
                                        assigned={assigned}
                                        required={required}
                                        weekStart={weekStart}
                                        onDelete={handleDeleteShift}
                                        onFindSubstitute={handleFindSubstitute}
                                        onUpdateNotes={handleUpdateNotes}
                                        onDuplicate={handleDuplicateShift}
                                      />
                                    );
                                  })
                                )}
                              </tr>
                            )
                          )
                        )}
                      </>
                    )}
                    {viewMode === "employee" &&
                      (filteredEmployees.length === 0 ? (
                        <tr>
                          <td
                            colSpan={15}
                            className="py-8 text-center text-sm text-zinc-500"
                          >
                            Nessun dipendente per i filtri selezionati
                          </td>
                        </tr>
                      ) : (
                        <>
                          {filteredEmployees.map((emp) => {
                            const empHours = (
                              shifts
                                .filter(
                                  (s) =>
                                    s.employee_id === emp.id &&
                                    s.status === "active"
                                )
                                .reduce((acc, s) => {
                                  const [sh, sm] = s.start_time
                                    .split(":")
                                    .map(Number);
                                  const [eh, em] = s.end_time
                                    .split(":")
                                    .map(Number);
                                  return acc + (eh * 60 + em - sh * 60 - sm);
                                }, 0) / 60
                            ).toFixed(1);
                            return (
                              <tr
                                key={emp.id}
                                className="border-b border-zinc-100 dark:border-zinc-800"
                              >
                                <td className="sticky left-0 z-10 bg-white p-2 dark:bg-zinc-900">
                                  <div className="font-medium">
                                    {emp.first_name} {emp.last_name}
                                  </div>
                                  <div className="text-xs text-zinc-500">
                                    {empHours}h
                                  </div>
                                </td>
                                {Array.from({ length: 7 }, (_, day) =>
                                  PERIODS.map((period) => {
                                    const d = addDays(parseISO(weekStart), day);
                                    const dateStr = format(d, "yyyy-MM-dd");
                                    const key = `${emp.id}:${dateStr}:${period.id}`;
                                    const shift =
                                      shiftsByEmployeeSlot.get(key);
                                    return (
                                      <td
                                        key={`${emp.id}-${day}-${period.id}`}
                                        className="min-w-[80px] border-l border-zinc-100 p-1 align-top dark:border-zinc-800"
                                      >
                                        {shift ? (
                                          <div className="group flex items-center justify-between gap-1 rounded bg-[hsl(var(--primary))]/15 px-2 py-1 text-xs">
                                            <span className="truncate">
                                              {shift.location_name} ·{" "}
                                              {shift.role_name}
                                            </span>
                                            <span className="text-zinc-500">
                                              {shift.start_time.slice(0, 5)}-
                                              {shift.end_time.slice(0, 5)}
                                            </span>
                                          </div>
                                        ) : null}
                                      </td>
                                    );
                                  })
                                )}
                              </tr>
                            );
                          })}
                        </>
                      ))}
                    {viewMode === "role" &&
                      (employeesByRole.size === 0 ? (
                        <tr>
                          <td
                            colSpan={15}
                            className="py-8 text-center text-sm text-zinc-500"
                          >
                            Nessun dipendente con mansioni assegnate
                          </td>
                        </tr>
                      ) : (
                        Array.from(employeesByRole.entries()).flatMap(
                        ([roleId, emps]) => {
                          const role = roles.find((r) => r.id === roleId);
                          return [
                            <tr
                              key={`role-${roleId}`}
                              className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
                            >
                              <td
                                colSpan={15}
                                className="sticky left-0 p-2 font-semibold text-zinc-700 dark:text-zinc-300"
                              >
                                {role?.name ?? ""}
                              </td>
                            </tr>,
                            ...emps.map((emp) => (
                              <tr
                                key={`${roleId}-${emp.id}`}
                                className="border-b border-zinc-100 dark:border-zinc-800"
                              >
                                <td className="sticky left-0 z-10 bg-white pl-6 p-2 dark:bg-zinc-900">
                                  <div className="font-medium">
                                    {emp.first_name} {emp.last_name}
                                  </div>
                                </td>
                                {Array.from({ length: 7 }, (_, day) =>
                                  PERIODS.map((period) => {
                                    const d = addDays(parseISO(weekStart), day);
                                    const dateStr = format(d, "yyyy-MM-dd");
                                    const key = `${emp.id}:${dateStr}:${period.id}`;
                                    const shift = shiftsByEmployeeSlot.get(key);
                                    return (
                                      <td
                                        key={`${emp.id}-${day}-${period.id}`}
                                        className="min-w-[80px] border-l border-zinc-100 p-1 align-top dark:border-zinc-800"
                                      >
                                        {shift ? (
                                          <div className="group flex items-center justify-between gap-1 rounded bg-[hsl(var(--primary))]/15 px-2 py-1 text-xs">
                                            <span className="truncate">
                                              {shift.location_name}
                                            </span>
                                            <span className="text-zinc-500">
                                              {shift.start_time.slice(0, 5)}-
                                              {shift.end_time.slice(0, 5)}
                                            </span>
                                          </div>
                                        ) : null}
                                      </td>
                                    );
                                  })
                                )}
                              </tr>
                            )),
                          ];
                        }
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-56 shrink-0 border-l border-zinc-200 pl-4 dark:border-zinc-800">
              {viewMode !== "location" && (
                <p className="mb-2 text-xs text-amber-600 dark:text-amber-500">
                  Vista sola lettura. Passa a &quot;Per sede&quot; per assegnare.
                </p>
              )}
              <EmployeeSidebar employees={filteredEmployees} shifts={shifts} weekStart={weekStart} />
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
      {showSaveTemplateModal && (
        <SaveTemplateModal
          scheduleId={schedule.id}
          onClose={() => setShowSaveTemplateModal(false)}
        />
      )}
      {showApplyTemplateModal && (
        <ApplyTemplateModal
          weekStart={weekStart}
          onClose={() => setShowApplyTemplateModal(false)}
        />
      )}
      {showExportPdfModal && (
        <ExportPdfModal
          scheduleId={schedule.id}
          onClose={() => setShowExportPdfModal(false)}
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
  weekStart,
  onDelete,
  onFindSubstitute,
  onUpdateNotes,
  onDuplicate,
}: {
  locationId: string;
  roleId: string;
  day: number;
  period: string;
  shifts: Shift[];
  assigned: number;
  required: number;
  weekStart: string;
  onDelete: (id: string) => void;
  onFindSubstitute: (shift: Shift) => void;
  onUpdateNotes: (id: string, notes: string | null) => void;
  onDuplicate: (shiftId: string, targetDate: string) => void;
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
          <ShiftCard
            key={s.id}
            shift={s}
            weekStart={weekStart}
            onDelete={onDelete}
            onFindSubstitute={onFindSubstitute}
            onUpdateNotes={onUpdateNotes}
            onDuplicate={onDuplicate}
          />
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
