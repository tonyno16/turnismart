-- RLS for location_role_shift_times
ALTER TABLE "location_role_shift_times" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "location_role_shift_times_select" ON "location_role_shift_times" FOR SELECT TO authenticated
  USING (
    location_id IN (SELECT id FROM public.locations WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
    AND role_id IN (SELECT id FROM public.roles WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
  );

CREATE POLICY "location_role_shift_times_insert" ON "location_role_shift_times" FOR INSERT TO authenticated
  WITH CHECK (
    location_id IN (SELECT id FROM public.locations WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
    AND role_id IN (SELECT id FROM public.roles WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
  );

CREATE POLICY "location_role_shift_times_update" ON "location_role_shift_times" FOR UPDATE TO authenticated
  USING (
    location_id IN (SELECT id FROM public.locations WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
    AND role_id IN (SELECT id FROM public.roles WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
  );

CREATE POLICY "location_role_shift_times_delete" ON "location_role_shift_times" FOR DELETE TO authenticated
  USING (
    location_id IN (SELECT id FROM public.locations WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
    AND role_id IN (SELECT id FROM public.roles WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL))
  );
