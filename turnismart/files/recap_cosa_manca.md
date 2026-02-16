# TurniSmart – Recap: cosa manca

**Ultimo aggiornamento:** Feb 2025

---

## Riepilogo

| Categoria | Stato | Note |
|-----------|-------|------|
| **Stripe** | ⏳ In attesa credenziali | Ultima integrazione da verificare |
| **Trigger.dev** | 🔧 Da verificare | Deploy + test CSV import |
| **Notifiche** | 🔧 Da verificare | Test invio + webhook Twilio |
| **Database** | 🔧 Da verificare | Migrazioni + seed |
| **Middleware** | ⚠️ Warning | Next.js 16 depreca "middleware" → usare "proxy" |

---

## 1. Stripe (ultimo step, quando hai credenziali)

- [ ] Ottenere chiavi da Stripe Dashboard
- [ ] Aggiungere a `.env.local`:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Creare prodotti/prezzi (Trial, Pro, Business) in Stripe
- [ ] Configurare webhook: `https://tuodominio.com/api/webhooks/stripe`
- [ ] Test: checkout → portal → webhook

---

## 2. Trigger.dev – CSV Import

**Codice:** ✅ Implementato

**Deploy (su Windows il deploy locale fallisce per path con spazi – usare GitHub Actions):**
- [ ] Creare Personal Access Token su [cloud.trigger.dev/account/tokens](https://cloud.trigger.dev/account/tokens)
- [ ] Aggiungere secret `TRIGGER_ACCESS_TOKEN` in GitHub → Settings → Secrets and variables → Actions
- [ ] Push su `main` (o avviare manualmente workflow "Deploy Trigger.dev") → deploy automatico
- [ ] In Vercel/local: impostare `TRIGGER_SECRET_KEY` (chiave prod da dashboard Trigger.dev)
- [ ] Test: upload CSV da pagina Dipendenti → verificare completamento

---

## 3. Notifiche (Twilio + Resend)

**Codice:** ✅ Implementato

- [ ] Impostare variabili ambiente:  
  `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `RESEND_API_KEY`
- [ ] Configurare webhook Twilio:  
  `https://tuodominio.com/api/webhooks/whatsapp`  
  (per aggiornare delivery status)
- [ ] Verificare invio WhatsApp con numero di test
- [ ] Verificare invio Email (Resend)

---

## 4. Database

- [ ] `npm run db:migrate` – applicare migrazioni
- [ ] `npm run db:seed` – seed festività italiane (se non già fatto)
- [ ] Controllare RLS policies su Supabase
- [ ] `npm run setup:storage` – bucket imports/reports (se non fatto)

---

## 5. Deploy & configurazione produzione

- [ ] Variabili ambiente su Vercel
- [ ] `CRON_SECRET` per `/api/cron/monthly-report`
- [ ] Vercel Cron (Pro) o servizio esterno per report mensile
- [ ] Dominio personalizzato
- [ ] Email Resend con dominio verificato (anziché onboarding@resend.dev)

---

## 6. Opzionale (migliorie future)

| Item | Descrizione |
|------|-------------|
| Turbopack | Tailwind attualmente richiede webpack; si può riprovare Turbopack quando risolto |
| `trigger/notification-dispatch.ts` | Notifiche in background invece che sync (scalabilità) |
| Template WhatsApp Meta | Approvazione template per messaggi outbound |
| Proxy vs Middleware | Next.js 16: migrare da `middleware.ts` a convenzione "proxy" |
| Verifica 24 tabelle | 28 tabelle nello schema; controllare indici e RLS |

---

## Da fare per priorità

1. **Stripe** – quando disponibili le credenziali
2. **Trigger.dev** – deploy e test CSV
3. **Notifiche** – test invio e webhook
4. **DB** – migrazioni e seed (se non già ok)
5. **Deploy** – variabili ambiente e cron in produzione
