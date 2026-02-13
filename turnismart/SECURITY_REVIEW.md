# Security Review

Documento di revisione sicurezza per TurniSmart. Ultimo aggiornamento: Feb 2025.

---

## 1. Autenticazione e Autorizzazione

### Auth
- **Supabase Auth**: gestione login, signup, OAuth, password reset
- **Middleware**: protegge route non pubbliche, redirect a `/auth/login` per utenti non autenticati
- **requireUser / requireOrganization**: tutte le Server Actions e pagine protette verificano l'utente e la sua org

### App-level authorization
- **Drizzle** usa connessione diretta a Postgres (DATABASE_URL)
- Ogni query è scoped da `organization_id` ottenuto da `requireOrganization()`
- Nessun accesso cross-org: i dati sono sempre filtrati per l'org dell'utente corrente

---

## 2. Row Level Security (RLS)

RLS è abilitato su Supabase per le tabelle principali. Le policy usano `auth.uid()` e `organization_id` da `public.users`.

**Nota:** Drizzle si connette con le credenziali del connection string (non con contesto Supabase auth). Le RLS policy si applicano quando si usa il client Supabase (es. Realtime, Storage). L'app usa Drizzle per la maggior parte delle query → l'autorizzazione è applicata a livello applicativo con `requireOrganization()`.

**Tabelle con RLS:** organizations, users, invitations, accountant_clients, locations, roles, staffing_requirements, organization_settings, employees, employee_roles, import_jobs, usage_records (vedi migrazioni 0001, 0003, 0010, 0011).

---

## 3. API Routes e Webhook

| Route | Protezione | Note |
|-------|-----------|------|
| `/api/auth/login` | Pubblico | Necessario per login |
| `/api/webhooks/stripe` | Firma Stripe | Verifica `Stripe-Signature` con webhook secret |
| `/api/webhooks/trigger` | Firma Trigger | Verifica firma Trigger.dev |
| `/api/webhooks/whatsapp` | (Twilio) | Verificare firma Twilio in produzione |
| `/api/cron/monthly-report` | Bearer CRON_SECRET | Richiede header `Authorization: Bearer <CRON_SECRET>` |
| `/api/ai/suggest` | (stub) | Da proteggere con requireUser se implementato |

---

## 4. Input Validation

- **Zod**: usato dove definito (verificare copertura)
- **FormData**: validazione manuale negli actions; considerare Zod per input complessi
- **JSON.parse**: in `completeStep4` e simili → validare con schema prima dell'uso

### Raccomandazioni
- Validare tutti gli input user-controlled (FormData, JSON body) con Zod
- Limiti su stringhe (max length) per evitare overflow
- Sanitizzazione HTML se si renderizza user input (attualmente non sembra necessario)

---

## 5. Rate Limiting

- **Supabase Auth**: rate limiting nativo su sign-up, login, reset password
- **API routes**: nessun rate limiting applicativo
- **Raccomandazione**: per produzione, considerare Vercel Rate Limit o Upstash Redis per `/api/ai/suggest`, login attempts, ecc.

---

## 6. Segreti e Variabili

- Nessuna chiave sensibile in `NEXT_PUBLIC_*`
- `.env.local` in `.gitignore`
- Webhook secrets (Stripe, Trigger) verificano l'origine delle richieste
- `SUPABASE_SERVICE_ROLE_KEY` usata solo server-side (mai esposta al client)

---

## 7. Checklist Pre-Produzione

Vedi [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) per la checklist completa.

### Punti critici
- [ ] `CRON_SECRET` impostato e usato da cron esterno
- [ ] Webhook Stripe con verifica firma attiva
- [ ] Stripe in live mode (no chiavi test)
- [ ] Twilio: numero WhatsApp Business (no sandbox) in produzione
