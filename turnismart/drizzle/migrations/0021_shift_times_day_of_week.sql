-- Add day_of_week to role_shift_times (0-6=specific day, 7=all days)
ALTER TABLE "role_shift_times" ADD COLUMN IF NOT EXISTS "day_of_week" smallint DEFAULT 7 NOT NULL;
DROP INDEX IF EXISTS "role_shift_times_role_period_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "role_shift_times_role_period_day_unique" ON "role_shift_times" USING btree ("role_id","shift_period","day_of_week");

-- Add day_of_week to location_role_shift_times
ALTER TABLE "location_role_shift_times" ADD COLUMN IF NOT EXISTS "day_of_week" smallint DEFAULT 7 NOT NULL;
DROP INDEX IF EXISTS "loc_role_shift_times_loc_role_period_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "loc_role_shift_times_loc_role_period_day_unique" ON "location_role_shift_times" USING btree ("location_id","role_id","shift_period","day_of_week");
