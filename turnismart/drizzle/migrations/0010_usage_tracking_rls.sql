-- RLS for usage_tracking: org members can select/insert/update their org's usage
ALTER TABLE "usage_tracking" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_tracking_select_org" ON "usage_tracking" FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "usage_tracking_insert_org" ON "usage_tracking" FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));

CREATE POLICY "usage_tracking_update_org" ON "usage_tracking" FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid() AND organization_id IS NOT NULL));
