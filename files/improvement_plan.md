# Piano Miglioramenti TurniSmart

Piano prioritizzato delle migliorie possibili, ordinate per impatto e sforzo.

**Task AI Docs:** Le implementazioni sono schedate in `ai_docs/tasks/`:
- `016_copy_staffing_replicate_week.md` - Copy fabbisogno, Replica settimana
- `017_scheduler_views_filters_alerts.md` - Vista dipendente/ruolo, Filtri, Alert straordinari
- `018_employee_preferences.md` - Giorni preferiti, Mattina/sera, Eccezioni
- `019_schedule_templates.md` - Template settimanale, Shift template
- `020_employee_bulk_actions.md` - Azioni bulk dipendenti
- `021_schedule_ux_enhancements.md` - Duplica turno, Note, Export PDF, Equità
- `022_employee_hourly_rate_per_role.md` - Paga oraria per mansione (employee_roles)

---

## Priorità 1 — Alto impatto, relativamente veloci

| # | Miglioria | Descrizione | Effort | Impatto |
|---|-----------|-------------|--------|---------|
| 1 | **Copy fabbisogno** | `copyStaffingFromLocation` / `copyStaffingFromShift`: copia fabbisogno da sede/settimana esistente | 1-2 gg | Alto: riduce setup, utile multi-sede |
| 2 | **Vista per dipendente** | Scheduler: toggle vista per "Locale" vs "Dipendente" (righe = dipendenti, colonne = giorni) | 2-3 gg | Alto: gestione turni per persona |
| 3 | **Responsive polish** | Test e aggiustamenti mobile/tablet su tutte le pagine principali | 1-2 gg | Alto: target spesso su mobile |
| 4 | **E2E onboarding** | Test E2E signup → onboarding → primo orario → pubblica | 1 gg | Alto: garantisce flusso critico |

---

## Priorità 2 — Scalabilità e robustezza

| # | Miglioria | Descrizione | Effort | Impatto |
|---|-----------|-------------|--------|---------|
| 5 | **Trigger: notifiche** | Spostare `lib/notifications` in workflow Trigger: retry, rate limit, progress | 2 gg | Medio-alto: invii più stabili |
| 6 | **Trigger: report mensile** | Spostare generazione report in workflow Trigger (già sync oggi) | 2 gg | Medio: non blocca la richiesta |
| 7 | **Virtualizzazione griglia** | Scheduler: virtualizzare righe se >20 dipendenti (react-window o similar) | 1-2 gg | Medio: performance con molti dip. |
| 8 | **PWA Service Worker** | Service worker per offline base, installabilità app su mobile | 1 gg | Medio: UX mobile |

---

## Priorità 3 — UX avanzata

| # | Miglioria | Descrizione | Effort | Impatto |
|---|-----------|-------------|--------|---------|
| 9 | **Vista per ruolo** | Scheduler: vista "Per ruolo" (Camerieri, Cuochi, ecc. per giorno) | 1-2 gg | Medio |
| 10 | **Template settimanali** | Salvataggio template orario riutilizzabile (es. "Settimana tipo") | 2-3 gg | Medio |
| 11 | **Bulk azioni dipendenti** | Selezione multipla: disattiva, cambia mansione, export CSV | 1 gg | Medio |
| 12 | **Filtri scheduler** | Filtra dipendenti per mansione, sede preferita, ore | 0.5 gg | Medio |

---

## Priorità 4 — Integrazioni e analisi

| # | Miglioria | Descrizione | Effort | Impatto |
|---|-----------|-------------|--------|---------|
| 13 | **Timbrature** | Tabella `time_entries` per ore effettive vs pianificate | 3-5 gg | Alto (per segmento specifico) |
| 14 | **Export software paghe** | Export compatibile con gestionale paghe italiano | 2-3 gg | Medio |
| 15 | **Analytics avanzati** | Grafici trend: costi, ore, assenteismo, equità turni | 3 gg | Medio |
| 16 | **Webhook delivery status** | Twilio/Resend webhook per aggiornare `notification.delivery_status` | 0.5 gg | Basso |

---

## Priorità 5 — Operativo e documentazione

| # | Miglioria | Descrizione | Effort | Impatto |
|---|-----------|-------------|--------|---------|
| 17 | **README setup** | Documentazione setup dev in README | 0.5 gg | Alto per onboarding dev |
| 18 | **Checklist deploy** | Checklist pre-produzione: env, Stripe, cron, domain | 0.5 gg | Alto |
| 19 | **Security audit** | Review RLS, rate limiting, input sanitization | 1 gg | Alto |
| 20 | **Monitoraggio errori** | Integrazione Sentry o similar per errori client/server | 0.5 gg | Medio |

---

## Quick wins (< 1 giorno ciascuno)

- Filtri scheduler (mansione, ore)
- Webhook delivery status
- README setup
- Checklist deploy
- Monitoraggio errori (Sentry)

---

## Riepilogo per roadmap

**Prossime 2 settimane suggerite:**
1. Copy fabbisogno (1-2 gg)
2. Vista per dipendente nello scheduler (2 gg)
3. Responsive polish (1 gg)
4. E2E onboarding (1 gg)
5. Virtualizzazione griglia se necessario

**Post-MVP / backlog:**
- Trigger workflows (notifiche, report)
- PWA service worker
- Template settimanali
- Timbrature
- Export paghe
- Analytics avanzati

---

*Ultimo aggiornamento: Feb 2025*
