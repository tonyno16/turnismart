"""
Logica CP-SAT OR-Tools per scheduling settimanale.
Espone solve(data: dict) -> dict per uso da CLI (solver.py) e API (api.py).
"""
from datetime import datetime, timedelta

from ortools.sat.python import cp_model


def parse_time_minutes(t: str) -> int:
    """'HH:MM' -> minuti dalla mezzanotte"""
    parts = t.split(":")
    h = int(parts[0] or 0)
    m = int(parts[1]) if len(parts) > 1 else 0
    return h * 60 + m


def slot_duration_minutes(period: str, period_times: dict) -> int:
    """Durata in minuti per un periodo"""
    pt = period_times.get(period, {})
    start = parse_time_minutes(pt.get("start", "08:00"))
    end = parse_time_minutes(pt.get("end", "14:00"))
    if end <= start:
        end += 24 * 60
    return end - start


def can_employee_work_slot(emp: dict, slot: dict, week_dates: list[str]) -> bool:
    """True se il dipendente può lavorare nello slot"""
    if slot["roleId"] not in emp.get("roleIds", []):
        return False
    date = week_dates[slot["dayOfWeek"]]
    if date in emp.get("timeOffDates", []):
        return False
    if date in emp.get("exceptionDates", []):
        return False
    av = emp.get("availability", [])
    if not av:
        return True
    for a in av:
        if a["dayOfWeek"] == slot["dayOfWeek"] and a["period"] == slot["period"]:
            if a["status"] in ("unavailable",):
                return False
            if a["status"] in ("available", "preferred"):
                return True
            if a["status"] == "avoid":
                return True
    return True


def solve(data: dict) -> dict:
    """
    Risolve il problema di scheduling.
    Input: { weekStart, periodTimes, slots, employees, fixedAssignments? }
    Output: { status, shifts?, error?, infeasibleReason? }
    """
    week_start = data.get("weekStart", "")
    period_times = data.get("periodTimes", {
        "morning": {"start": "08:00", "end": "14:00"},
        "evening": {"start": "14:00", "end": "23:00"},
    })
    slots = [s for s in data.get("slots", []) if (s.get("required") or 0) > 0]
    employees = data.get("employees", [])
    fixed = data.get("fixedAssignments", [])

    try:
        ds = datetime.strptime(week_start, "%Y-%m-%d")
    except Exception:
        ds = datetime.now()
    week_dates = [(ds + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

    if not slots or not employees:
        return {"status": "error", "error": "Nessun slot o dipendente"}

    model = cp_model.CpModel()
    n_emp = len(employees)
    n_slot = len(slots)

    assign = {}
    for e in range(n_emp):
        for s in range(n_slot):
            slot = slots[s]
            emp = employees[e]
            if can_employee_work_slot(emp, slot, week_dates):
                assign[(e, s)] = model.new_bool_var(f"assign_{e}_{s}")

    for s in range(n_slot):
        req = slots[s].get("required", 1)
        model.add(sum(assign[(e, s)] for e in range(n_emp) if (e, s) in assign) == req)

    for e in range(n_emp):
        emp = employees[e]
        max_min = (emp.get("maxHours") or 40) * 60
        total = sum(
            assign[(e, s)] * slot_duration_minutes(slots[s].get("period", "morning"), period_times)
            for s in range(n_slot) if (e, s) in assign
        )
        model.add(total <= max_min)

    for e in range(n_emp):
        for day in range(7):
            day_slots = [s for s in range(n_slot) if slots[s]["dayOfWeek"] == day]
            model.add(sum(assign[(e, s)] for s in day_slots if (e, s) in assign) <= 1)

    for s in range(n_slot):
        for e1 in range(n_emp):
            inc = set(employees[e1].get("incompatibleWith", []))
            for e2 in range(n_emp):
                if e1 != e2 and employees[e2].get("id") in inc and (e1, s) in assign and (e2, s) in assign:
                    model.add(assign[(e1, s)] + assign[(e2, s)] <= 1)

    emp_id_to_idx = {emp["id"]: e for e, emp in enumerate(employees)}
    slot_key_to_idx = {}
    for s, slot in enumerate(slots):
        key = (slot["locationId"], slot["roleId"], slot["dayOfWeek"], slot["period"])
        slot_key_to_idx[key] = s

    for fa in fixed:
        e_idx = emp_id_to_idx.get(fa["employeeId"])
        key = (fa["locationId"], fa["roleId"], fa["dayOfWeek"], fa["period"])
        s_idx = slot_key_to_idx.get(key)
        if e_idx is not None and s_idx is not None and (e_idx, s_idx) in assign:
            model.add(assign[(e_idx, s_idx)] == 1)

    obj_vars = []
    obj_coeffs = []
    for e in range(n_emp):
        pref = employees[e].get("periodPreference")
        if not pref:
            continue
        for s in range(n_slot):
            if (e, s) not in assign:
                continue
            period = slots[s].get("period", "")
            if period == pref:
                obj_vars.append(assign[(e, s)])
                obj_coeffs.append(-1)
            elif period:
                obj_vars.append(assign[(e, s)])
                obj_coeffs.append(1)

    if obj_vars:
        model.minimize(sum(c * v for v, c in zip(obj_vars, obj_coeffs)))
    else:
        model.minimize(0)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
    solver.parameters.log_search_progress = False
    status = solver.solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        shifts = []
        for (e, s) in assign:
            if solver.value(assign[(e, s)]) == 1:
                slot = slots[s]
                shifts.append({
                    "employeeId": employees[e]["id"],
                    "locationId": slot["locationId"],
                    "roleId": slot["roleId"],
                    "dayOfWeek": slot["dayOfWeek"],
                    "period": slot["period"],
                })
        return {
            "status": "optimal" if status == cp_model.OPTIMAL else "feasible",
            "shifts": shifts,
        }
    if status == cp_model.INFEASIBLE:
        return {
            "status": "infeasible",
            "infeasibleReason": "Nessuna soluzione trovata. Verifica fabbisogni, disponibilità e vincoli.",
        }
    return {"status": "error", "error": f"Soluzione non trovata (status={status})"}
