# TurniSmart - Checklist Verifica Integrazioni

**Data:** Feb 2025  
**Esclude:** Stripe (credenziali da configurare)

---

## 1. Trigger.dev – CSV Import

**Stato:** Implementato e configurato

- [x] `trigger/csv-import.ts` – 3 task: parse → createEmployeeRecords → finalizeImport
- [x] `trigger.config.ts` – project ID, retries, dirs
- [x] Workflow: download da Supabase Storage, parse Papaparse, validazione, dedup, batch insert
- [x] Error handling: fail-fast se >50% righe invalide, update import_jobs in caso di errore

**Da fare manuale:**
- [ ] Deploy workflow: `npx trigger.dev deploy` (richiede `TRIGGER_SECRET_KEY`)
- [ ] Test end-to-end: upload CSV da UI Dipendenti → verificare completamento

---

## 2. Notifiche (Twilio + Resend)

**Stato:** Implementato

### Codice
- [x] `lib/twilio.ts` – sendWhatsApp, normalizePhoneForWhatsApp, isWhatsAppConfigured
- [x] `lib/resend.ts` – sendEmail, isResendConfigured
- [x] `lib/notifications.ts` – dispatchSchedulePublishedNotifications, dispatchSickLeaveReplacementNotification
- [x] Template email HTML (schedule_published, sick_leave_replacement)

### Integrazione
- [x] `publishSchedule` → dispatchSchedulePublishedNotifications (Email + WhatsApp per canali attivi)
- [x] Assegna sostituto malattia → dispatchSickLeaveReplacementNotification

### Webhook
- [x] `app/api/webhooks/whatsapp/route.ts` – validazione firma Twilio, update delivery_status su notifications
- [ ] Configurare URL webhook su Twilio Console: `https://tuodominio.com/api/webhooks/whatsapp`

**Variabili ambiente richieste:**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (opzionale, default onboarding@resend.dev)

**Da fare manuale:**
- [ ] Verificare invio WhatsApp con numero di test
- [ ] Verificare invio Email (Resend)
- [ ] Configurare webhook WhatsApp su Twilio per status delivery

---

## 3. Database – Tabelle

**Stato:** 28 tabelle definite nello schema

| # | Tabella | File schema |
|---|---------|-------------|
| 1 | organizations | organizations.ts |
| 2 | users | users.ts |
| 3 | invitations | invitations.ts |
| 4 | accountant_clients | accountant-clients.ts |
| 5 | locations | locations.ts |
| 6 | roles | roles.ts |
| 7 | organization_settings | organization-settings.ts |
| 8 | staffing_requirements | staffing-requirements.ts |
| 9 | location_role_shift_times | location-role-shift-times.ts |
| 10 | role_shift_times | role-shift-times.ts |
| 11 | employees | employees.ts |
| 12 | employee_roles | employee-roles.ts |
| 13 | employee_availability | employee-availability.ts |
| 14 | employee_availability_exceptions | employee-availability-exceptions.ts |
| 15 | employee_incompatibilities | employee-incompatibilities.ts |
| 16 | employee_time_off | employee-time-off.ts |
| 17 | schedules | schedules.ts |
| 18 | shifts | shifts.ts |
| 19 | shift_requests | shift-requests.ts |
| 20 | import_jobs | import-jobs.ts |
| 21 | schedule_generation_jobs | schedule-generation-jobs.ts |
| 22 | notification_jobs | notification-jobs.ts |
| 23 | notifications | notifications.ts |
| 24 | reports | reports.ts |
| 25 | report_generation_jobs | report-generation-jobs.ts |
| 26 | italian_holidays | italian-holidays.ts |
| 27 | schedule_templates | schedule-templates.ts |
| 28 | usage_tracking | usage-tracking.ts |

**Da fare manuale:**
- [ ] `npm run db:migrate` – applica migrazioni su DB
- [ ] `npm run db:seed` – seed festività italiane (se non già fatto)
- [ ] Verificare RLS policies su Supabase

---

## 4. Workflow Trigger.dev (design vs implementazione)

| Workflow | Design | Implementazione |
|----------|--------|-----------------|
| CSV Import | 3 task | 1 workflow Trigger |
| AI Schedule | 4 task | Sync in lib/ai-schedule.ts |
| Notifications | 3 task | Sync in lib/notifications.ts |
| Monthly Report | 4 task | Sync in app/actions/reports.ts |
| Conflict Resolution | 2 task | Sync in lib/substitute-suggestions.ts |
| Accountant Invite | 2 task | Sync in app/actions/accountant.ts |

**Nota:** Solo CSV Import usa Trigger.dev per background jobs. Gli altri workflow sono implementati in sync per semplificazione (come da roadmap).

---

## 5. Riepilogo – Cosa verificare

1. **Trigger.dev:** deploy + test CSV import
2. **Twilio/Resend:** invio notifiche + webhook WhatsApp
3. **DB:** migrazioni applicate, seed festività
4. **Stripe:** (da fare quando hai credenziali) checkout, portal, webhook
