-- Add week_start_date: NULL = modello ricorrente, valorizzato = override per quella settimana (lunedì)
ALTER TABLE "staffing_requirements" ADD COLUMN IF NOT EXISTS "week_start_date" date;

-- Drop old unique constraint
ALTER TABLE "staffing_requirements" DROP CONSTRAINT IF EXISTS "staffing_loc_role_day_period_unique";

-- Partial unique: un solo modello per (location, role, day, period) quando week_start_date IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS "staffing_template_unique"
  ON "staffing_requirements" ("location_id", "role_id", "day_of_week", "shift_period")
  WHERE "week_start_date" IS NULL;

-- Unique: un solo override per (location, role, day, period, week) quando week_start_date IS NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS "staffing_override_unique"
  ON "staffing_requirements" ("location_id", "role_id", "day_of_week", "shift_period", "week_start_date")
  WHERE "week_start_date" IS NOT NULL;
