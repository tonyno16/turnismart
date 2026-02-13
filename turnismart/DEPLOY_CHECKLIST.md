# Checklist Pre-Produzione

Verifica questi punti prima del deploy in produzione.

---

## 1. Variabili d'ambiente

| Variabile | Controllo |
|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL progetto Supabase (produzione) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave service_role (mai esporre al client) |
| `DATABASE_URL` | Connection string PostgreSQL Supabase |
| `NEXT_PUBLIC_APP_URL` | URL pubblico dell'app (es. `https://app.turnismart.it`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chiave Stripe **live** |
| `STRIPE_SECRET_KEY` | Chiave Stripe **live** |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook Stripe (endpoint produzione) |
| `TRIGGER_SECRET_KEY` | Chiave Trigger.dev ambiente **production** |
| `OPENAI_API_KEY` | Chiave OpenAI (verifica limiti uso) |
| `TWILIO_ACCOUNT_SID` | Account Twilio |
| `TWILIO_AUTH_TOKEN` | Auth token Twilio |
| `TWILIO_WHATSAPP_FROM` | Numero WhatsApp Business (non sandbox in prod) |
| `RESEND_API_KEY` | API key Resend |
| `RESEND_FROM_EMAIL` | Email mittente verificata (dominio verificato in Resend) |
| `CRON_SECRET` | Stringa casuale per proteggere `/api/cron/monthly-report` |

- [ ] Nessuna chiave di **test** (Stripe test mode, Twilio sandbox) usata in produzione
- [ ] `NEXT_PUBLIC_*` contiene solo dati non sensibili (URL, chiavi pubbliche)
- [ ] Variabili configurate nella piattaforma di deploy (Vercel, ecc.)

---

## 2. Supabase

- [ ] Progetto Supabase per produzione (separato da dev)
- [ ] **Authentication → URL Configuration**: Site URL = `NEXT_PUBLIC_APP_URL`
- [ ] **Authentication → URL Configuration**: Redirect URLs contiene il dominio di produzione
- [ ] **Authentication → Providers**: Email abilitato, Google OAuth configurato con dominio prod
- [ ] **Storage**: bucket `reports`, `imports`, `avatars` creati
- [ ] **Database**: migrazioni applicate (`npm run db:migrate` con `DATABASE_URL` prod)
- [ ] **RLS**: policy verificare che non espongano dati cross-org

---

## 3. Stripe

- [ ] Account Stripe attivato (KYC completato per pagamenti reali)
- [ ] Prodotti e prezzi creati in **live mode**
- [ ] **Webhook** creato: URL `https://tuodominio.com/api/webhooks/stripe`
- [ ] Eventi webhook: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] `STRIPE_WEBHOOK_SECRET` = signing secret del webhook produzione
- [ ] Test checkout end-to-end in live mode

---

## 4. Trigger.dev

- [ ] Progetto Trigger.dev con ambiente **production**
- [ ] `TRIGGER_SECRET_KEY` = chiave ambiente production
- [ ] Workflow CSV import deployato e funzionante
- [ ] Webhook Trigger configurato su URL produzione (se usato)

---

## 5. Notifiche

- [ ] **Twilio**: numero WhatsApp Business approvato (no sandbox in prod)
- [ ] **Resend**: dominio verificato, `RESEND_FROM_EMAIL` configurato
- [ ] Test invio email e WhatsApp da ambiente produzione

---

## 6. Cron e job periodici

- [ ] `CRON_SECRET` impostato (stringa lunga e casuale)
- [ ] **Vercel Cron** (Pro) o servizio esterno (cron-job.org, Upstash, ecc.) configurato
- [ ] Endpoint chiamato: `GET https://tuodominio.com/api/cron/monthly-report`
- [ ] Header: `Authorization: Bearer <CRON_SECRET>`
- [ ] Frequenza: es. 1º del mese alle 00:05

---

## 7. Dominio e SSL

- [ ] Dominio puntato alla piattaforma di deploy
- [ ] SSL/HTTPS attivo
- [ ] Redirect HTTP → HTTPS (di solito automatico su Vercel)

---

## 8. Sicurezza

- [ ] Nessun segreto in repository (`.env.local` in `.gitignore`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` e `STRIPE_SECRET_KEY` mai esposti al client
- [ ] Rate limiting attivo su Supabase Auth (default)
- [ ] CORS e policy headers verificati se necessario

---

## 9. Verifica finale

- [ ] `npm run build` esegue senza errori
- [ ] Login/registrazione funziona
- [ ] Checkout Stripe (abbonamento) completa
- [ ] Invito utente e accettazione
- [ ] Generazione orario con AI (verifica quota OpenAI)
- [ ] Pubblicazione orario e notifiche
- [ ] Report PDF/Excel scaricabili

---

## Post-deploy

- [ ] Monitoraggio errori (es. Sentry) configurato
- [ ] Backup database Supabase attivo (plan Supabase)
- [ ] Documentare procedure di rollback e recovery
