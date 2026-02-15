-- Performance indexes for schedule page and shift queries
-- getWeekSchedule, getStaffingCoverage, getEmployeeWeekShifts filter by schedule_id + status
CREATE INDEX IF NOT EXISTS "shifts_schedule_status_idx"
  ON "shifts" ("schedule_id", "status");

-- getEmployeeWeekShifts, checkOverlap filter by employee_id + date + status
CREATE INDEX IF NOT EXISTS "shifts_employee_date_status_idx"
  ON "shifts" ("employee_id", "date", "status");

-- getStaffingCoverage groups by location_id, role_id, date - composite helps
CREATE INDEX IF NOT EXISTS "shifts_schedule_location_role_date_idx"
  ON "shifts" ("schedule_id", "location_id", "role_id", "date")
  WHERE "status" = 'active';
