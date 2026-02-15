-- Performance indexes for scheduler page (5-14s → ~1-2s)

-- shifts: query più frequente = WHERE schedule_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_shifts_schedule_status ON shifts (schedule_id, status);

-- shifts: query per dipendente+data (validazione, turni settimanali)
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON shifts (employee_id, date);

-- shifts: query per organizzazione
CREATE INDEX IF NOT EXISTS idx_shifts_organization ON shifts (organization_id);

-- employee_roles: JOIN con employees filtrato per org_id
CREATE INDEX IF NOT EXISTS idx_employee_roles_employee ON employee_roles (employee_id);

-- staffing_requirements: filtrato per location_id (location ha già org filter)
CREATE INDEX IF NOT EXISTS idx_staffing_req_location ON staffing_requirements (location_id);
