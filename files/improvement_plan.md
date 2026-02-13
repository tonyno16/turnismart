# Piano Miglioramenti TurniSmart

Piano prioritizzato delle migliorie possibili, ordinate per impatto e sforzo.

**Task AI Docs:** Le implementazioni sono schedate in `ai_docs/tasks/`:
- `016_copy_staffing_replicate_week.md` - Copy fabbisogno, Replica settimana ✅
- `017_scheduler_views_filters_alerts.md` - Vista dipendente/ruolo, Filtri, Alert straordinari ✅
- `018_employee_preferences.md` - Giorni preferiti, Mattina/sera, Eccezioni ✅
- `019_schedule_templates.md` - Template settimanale, Shift template ✅
- `020_employee_bulk_actions.md` - Azioni bulk dipendenti ✅
- `021_schedule_ux_enhancements.md` - Duplica turno, Note, Export PDF, Equità ✅
- `022_employee_hourly_rate_per_role.md` - Paga oraria per mansione (employee_roles) ✅
- `023_responsive_polish.md` - Toolbar wrap, dropdown Azioni, sidebar collassabile, touch scroll ✅
- `024_e2e_onboarding_flow.md` - Test E2E onboarding → schedule → pubblica ✅

---

## Priorità 1 — Alto impatto, relativamente veloci

| # | Miglioria | Descrizione | Effort | Impatto |
|---|-----------|-------------|--------|---------|
| 1 | ~~Copy fabbisogno~~ | Fatto (016) | - | - |
| 2 | ~~Vista per dipendente~~ | Fatto (017) | - | - |
| 3 | ~~Responsive polish~~ | Fatto (023) | - | - |
| 4 | ~~E2E onboarding~~ | Fatto (024) | - | - |

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
| 9 | ~~Vista per ruolo~~ | Fatto (017) | - | - |
| 10 | ~~Template settimanali~~ | Fatto (019) | - | - |
| 11 | ~~Bulk azioni dipendenti~~ | Fatto (020) | - | - |
| 12 | ~~Filtri scheduler~~ | Fatto (017) | - | - |

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
| 19 | ~~**Security audit**~~ | Fatto (026): SECURITY_REVIEW, Stripe webhook, Zod, cron | - | - |
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

**Priorità attuali (task 016-025 completati):**
1. ~~Security review~~ – Fatto (026)
2. Verifica integrazioni (Stripe, Trigger, notifiche) – 0.5 gg
3. ~~README setup + checklist deploy~~ – Fatto (025)
4. Virtualizzazione griglia (>20 dipendenti) – opzionale

**Post-MVP / backlog:**
- Trigger workflows (notifiche, report)
- PWA service worker
- Template settimanali
- Timbrature
- Export paghe
- Analytics avanzati

---

*Ultimo aggiornamento: Feb 2025*
