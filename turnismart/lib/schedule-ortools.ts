import { spawn } from "child_process";
import path from "path";
import type { SchedulingConstraint } from "./ai-schedule";
import type { GeneratedShift } from "./ai-schedule";

export type OrtoolsResult =
  | { status: "optimal" | "feasible"; shifts: GeneratedShift[] }
  | { status: "infeasible"; infeasibleReason: string }
  | { status: "error"; error: string };

export type OrtoolsInput = {
  weekStart: string;
  periodTimes: Record<string, { start: string; end: string }>;
  slots: Array<{
    locationId: string;
    roleId: string;
    dayOfWeek: number;
    period: string;
    required: number;
  }>;
  employees: Array<{
    id: string;
    roleIds: string[];
    maxHours: number;
    availability: Array<{ dayOfWeek: number; period: string; status: string }>;
    timeOffDates: string[];
    exceptionDates: string[];
    incompatibleWith: string[];
    periodPreference?: string | null;
  }>;
  fixedAssignments?: GeneratedShift[];
};

function buildOrtoolsInput(
  constraints: SchedulingConstraint,
  weekStart: string,
  periodTimes: Record<string, { start: string; end: string }>,
  fixedAssignments: GeneratedShift[] = []
): OrtoolsInput {
  const slots: OrtoolsInput["slots"] = [];
  for (const loc of constraints.locations) {
    for (const r of loc.requirements) {
      if ((r.required ?? 0) > 0) {
        slots.push({
          locationId: loc.id,
          roleId: r.roleId,
          dayOfWeek: r.dayOfWeek,
          period: r.period,
          required: r.required,
        });
      }
    }
  }

  const employees = constraints.employees.map((e) => ({
    id: e.id,
    roleIds: e.roleIds,
    maxHours: e.maxHours ?? e.weeklyHours ?? 40,
    availability: e.availability,
    timeOffDates: e.timeOffDates ?? [],
    exceptionDates: e.exceptionDates ?? [],
    incompatibleWith: e.incompatibleWith ?? [],
    periodPreference: e.periodPreference ?? null,
  }));

  return {
    weekStart,
    periodTimes,
    slots,
    employees,
    fixedAssignments: fixedAssignments.length > 0 ? fixedAssignments : undefined,
  };
}

/** Esegue il solver OR-Tools (Python) e ritorna il risultato. */
export async function generateScheduleWithORTools(options: {
  constraints: SchedulingConstraint;
  weekStart: string;
  periodTimes: Record<string, { start: string; end: string }>;
  fixedAssignments?: GeneratedShift[];
}): Promise<OrtoolsResult> {
  const input = buildOrtoolsInput(
    options.constraints,
    options.weekStart,
    options.periodTimes,
    options.fixedAssignments ?? []
  );

  let serviceUrl = process.env.ORTOOLS_SERVICE_URL?.trim();
  if (serviceUrl) {
    if (!serviceUrl.startsWith("http://") && !serviceUrl.startsWith("https://")) {
      serviceUrl = `https://${serviceUrl}`;
    }
    const url = `${serviceUrl.replace(/\/$/, "")}/solve`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const text = await res.text();
      let result: { status?: string; shifts?: GeneratedShift[]; error?: string; infeasibleReason?: string; detail?: string | { msg?: string }[] };
      try {
        result = JSON.parse(text) as typeof result;
      } catch {
        return {
          status: "error",
          error: res.ok
            ? "Risposta non valida dal solver"
            : `Solver non raggiungibile (${res.status}): ${text.slice(0, 150) || res.statusText}`,
        };
      }

      if (!res.ok) {
        const detailMsg =
          typeof result.detail === "string"
            ? result.detail
            : Array.isArray(result.detail)
              ? (result.detail[0] as { msg?: string } | undefined)?.msg
              : undefined;
        const msg = detailMsg || result.error || res.statusText || `Errore HTTP ${res.status}`;
        return { status: "error", error: msg };
      }

      if (result.status === "optimal" || result.status === "feasible") {
        return { status: result.status as "optimal" | "feasible", shifts: result.shifts ?? [] };
      }
      if (result.status === "infeasible") {
        return { status: "infeasible", infeasibleReason: result.infeasibleReason ?? "Problema infattibile" };
      }
      return {
        status: "error",
        error: result.error || (typeof result.detail === "string" ? result.detail : undefined) || "Errore sconosciuto dal solver",
      };
    } catch (e) {
      clearTimeout(timeout);
      const msg = e instanceof Error ? e.message : "Chiamata al solver fallita";
      return { status: "error", error: msg };
    }
  }

  const scriptDir = path.join(process.cwd(), "scripts", "ortools-schedule");
  const scriptPath = path.join(scriptDir, "solver.py");
  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  return new Promise((resolve) => {
    const proc = spawn(pythonCmd, [scriptPath], {
      cwd: scriptDir,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("error", (err) => {
      resolve({
        status: "error",
        error: `Python non disponibile o ortools non installato: ${err.message}. Esegui: pip install -r scripts/ortools-schedule/requirements.txt`,
      });
    });

    proc.on("close", (code) => {
      if (code !== 0 && !stdout) {
        resolve({
          status: "error",
          error: stderr || `Processo Python terminato con codice ${code}`,
        });
        return;
      }

      try {
        const result = JSON.parse(stdout.trim()) as {
          status: string;
          shifts?: GeneratedShift[];
          error?: string;
          infeasibleReason?: string;
        };

        if (result.status === "optimal" || result.status === "feasible") {
          resolve({
            status: result.status as "optimal" | "feasible",
            shifts: result.shifts ?? [],
          });
        } else if (result.status === "infeasible") {
          resolve({
            status: "infeasible",
            infeasibleReason: result.infeasibleReason ?? "Problema infattibile",
          });
        } else {
          resolve({
            status: "error",
            error: result.error ?? "Errore sconosciuto dal solver",
          });
        }
      } catch {
        resolve({
          status: "error",
          error: `Output non valido dal solver: ${stdout.slice(0, 200)}`,
        });
      }
    });

    proc.stdin.write(JSON.stringify(input), "utf8");
    proc.stdin.end();
  });
}
