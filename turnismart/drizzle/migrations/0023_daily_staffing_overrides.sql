-- Per-day staffing overrides for monthly calendar view
CREATE TABLE IF NOT EXISTS daily_staffing_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_period TEXT NOT NULL CHECK (shift_period IN ('morning', 'evening')),
  required_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_staffing_loc_role_date_period_unique
    UNIQUE (location_id, role_id, date, shift_period)
);

CREATE INDEX IF NOT EXISTS idx_daily_staffing_location
  ON daily_staffing_overrides (location_id);
CREATE INDEX IF NOT EXISTS idx_daily_staffing_date_range
  ON daily_staffing_overrides (location_id, date);

-- Enable RLS (following established pattern)
ALTER TABLE daily_staffing_overrides ENABLE ROW LEVEL SECURITY;
