-- RLS for role_shift_times
ALTER TABLE "role_shift_times" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_shift_times_select" ON "role_shift_times" FOR SELECT TO authenticated
  USING (role_id IN (SELECT id FROM public.roles WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));

CREATE POLICY "role_shift_times_insert" ON "role_shift_times" FOR INSERT TO authenticated
  WITH CHECK (role_id IN (SELECT id FROM public.roles WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));

CREATE POLICY "role_shift_times_update" ON "role_shift_times" FOR UPDATE TO authenticated
  USING (role_id IN (SELECT id FROM public.roles WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL)));
