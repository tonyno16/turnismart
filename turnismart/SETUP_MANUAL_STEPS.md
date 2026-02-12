# Step-by-Step: Configurazione Servizi Esterni

Guida per completare la configurazione manuale di Supabase, Trigger.dev, Stripe, Twilio e Resend.

---

## 1. Supabase

### 1.1 Crea il progetto
1. Vai su [supabase.com](https://supabase.com) → **Sign in** / Registrati
2. **New project** → nome (es. `turnismart-dev`)
3. Scegli password DB e regione (es. `Frankfurt` per EU)
4. Clicca **Create new project** e attendi il provisioning (~2 min)

### 1.2 Prendi le variabili
1. **Settings** (ingranaggio) → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (tenere segreto)

### 1.3 Database URL
1. **Settings** → **Database**
2. In **Connection string** scegli **URI**
3. Copia l’URI e sostituisci `[YOUR-PASSWORD]` con la password del DB → `DATABASE_URL`

### 1.4 Auth

#### Email (obbligatorio)
1. **Authentication** → **Providers**
2. Attiva **Email** (email/password) – già attivo di default

#### Google OAuth (per "Continua con Google")
1. **Google Cloud Console** → [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un progetto (es. `turnismart-auth`) oppure usa uno esistente
3. **APIs & Services** → **OAuth consent screen** → Configura (External, compila nome app e email)
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
5. Tipo: **Web application** | Nome: `TurniSmart Auth`
6. **Authorized JavaScript origins:** `http://localhost:3000` (aggiungi il tuo dominio in produzione)
7. **Authorized redirect URIs:** copia da Supabase → **Authentication** → **Providers** → **Google** → abilita il provider e copia il **Callback URL** (es. `https://xxxx.supabase.co/auth/v1/callback`)
8. Copia **Client ID** e **Client Secret** nel provider Google di Supabase
9. Clicca **Save** in Supabase

**Risoluzione problemi OAuth:**
- `redirect_uri_mismatch` → L’URI di redirect in Google deve coincidere esattamente con quello di Supabase
- `unauthorized_client` → Verifica Client ID e Secret in Supabase, controlla che il consent screen sia configurato

### 1.5 Storage
1. **Opzione A** (consigliato): `cd turnismart && npm run setup:storage` crea i bucket reports, imports, avatars
2. **Opzione B**: Storage → New bucket → Crea manualmente `reports` (pubblico), `imports`, `avatars`
3. Per `reports`: rendi il bucket pubblico per le letture, oppure usa signed URLs (l’app usa `getPublicUrl` per i download)

### 1.6 Email (Resend)

Per le notifiche email (orario pubblicato, sostituzioni), configura:
- `RESEND_API_KEY` – da [resend.com](https://resend.com) → API Keys
- `RESEND_FROM_EMAIL` (opzionale) – es. `TurniSmart <noreply@tuodominio.com>`
  - Sul piano gratuito puoi usare temporaneamente `onboarding@resend.dev` per i test
  - Per produzione verifica il dominio in Resend Dashboard → Domains

---

## 2. Trigger.dev

### 2.1 Crea il progetto
1. Vai su [trigger.dev](https://trigger.dev) → **Sign in** / Registrati
2. **Create project** → nome (es. `turnismart`)
3. Scegli **Next.js** come framework

### 2.2 Prendi la Secret Key
1. **Project Settings** → **Environments** → **Development**
2. Copia **Secret Key** → `TRIGGER_SECRET_KEY`
3. (Opzionale) Crea anche un ambiente **Production** per il deploy

### 2.3 Installa CLI (opzionale, per sviluppo)
```bash
npm install -g @trigger.dev/cli
trigger login
```

---

## 3. Stripe

### 3.1 Account
1. Vai su [stripe.com](https://stripe.com) → **Sign in** / Registrati
2. Attiva l’account (KYC se serve per pagamenti reali)
3. Per test puoi restare in **Test mode** (toggle in alto a destra)

### 3.2 Prendi le chiavi
1. **Developers** → **API keys**
2. Copia:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### 3.3 Prodotti e prezzi
1. **Products** → **Add product**
2. Aggiungi:
   - **Starter** – €9.99/mese (piano base)
   - **Pro** – €24.99/mese (piano medio)
   - **Business** – €49.99/mese (piano alto)
3. Per ogni prodotto: **Add price** → Recurring → Monthly

### 3.4 Webhook (dopo aver avviato l’app)
1. **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://tuo-dominio.com/api/webhooks/stripe` (per local: usa Stripe CLI)
3. Eventi: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copia **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 4. Twilio (WhatsApp)

### 4.1 Account
1. Vai su [twilio.com](https://twilio.com) → **Sign up**
2. Completa la registrazione e verifica il numero di telefono

### 4.2 Credenziali
1. **Console** → **Account** → **API keys & tokens**
2. Copia **Account SID** → `TWILIO_ACCOUNT_SID`
3. Copia **Auth Token** → `TWILIO_AUTH_TOKEN`

### 4.3 WhatsApp Sandbox (per test)
1. **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Segui le istruzioni per collegare il tuo numero al Sandbox
3. Il numero sandbox (es. `+14155238886`) → `TWILIO_WHATSAPP_FROM`

### 4.4 WhatsApp Business API (produzione)
- Richiede approvazione Meta (1–7 giorni)
- Configura un numero Twilio come canale WhatsApp
- Crea e invia template per approvazione

---

## 5. Resend

### 5.1 Account
1. Vai su [resend.com](https://resend.com) → **Sign up**

### 5.2 API Key
1. **API Keys** → **Create API Key**
2. Copia la chiave → `RESEND_API_KEY`

### 5.3 Dominio (per produzione)
1. **Domains** → **Add domain**
2. Inserisci i record DNS forniti per verificare il dominio
3. Per test puoi usare `onboarding@resend.dev` come mittente

---

## 6. Riepilogo variabili per `.env.local`

Dopo ogni servizio, aggiungi o aggiorna le variabili in `turnismart/.env.local`:

| Variabile | Servizio |
|-----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `DATABASE_URL` | Supabase |
| `TRIGGER_SECRET_KEY` | Trigger.dev |
| `STRIPE_SECRET_KEY` | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `OPENAI_API_KEY` | OpenAI (platform.openai.com) |
| `TWILIO_ACCOUNT_SID` | Twilio |
| `TWILIO_AUTH_TOKEN` | Twilio |
| `TWILIO_WHATSAPP_FROM` | Twilio |
| `RESEND_API_KEY` | Resend |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (o il tuo dominio) |
| `CRON_SECRET` | (opzionale) Segreto per proteggere l'endpoint `/api/cron/monthly-report` |

### 6.1 Vercel – CRON_SECRET (per report automatici)
1. **Vercel** → tuo progetto → **Settings** → **Environment Variables**
2. Aggiungi `CRON_SECRET` (es. stringa casuale) per Production
3. In **Cron Jobs** (Vercel Pro) oppure tramite external cron (cron-job.org), configura una chiamata GET a `https://tuodominio.com/api/cron/monthly-report` con header `Authorization: Bearer <CRON_SECRET>`

---

## 7. Verifica

1. Controlla che tutte le variabili siano in `.env.local`
2. Riavvia il dev server: `npm run dev`
3. Le connessioni ai servizi saranno validate dalle implementazioni in Phase 1

---

## Ordine consigliato

1. **Supabase** (base auth + DB)
2. **Stripe** (per checkout / abbonamenti)
3. **Trigger.dev** (job in background)
4. **OpenAI** (API key da platform.openai.com)
5. **Resend** (email)
6. **Twilio** (WhatsApp, anche più avanti)

---

## 8. Security Checklist (Phase 14)

### Auth
- **Supabase Auth** gestisce rate limiting (sign-up, login, reset password)
- **Middleware** reindirizza utenti non autenticati
- **API routes** `/api/*` esclusi dal middleware; `/api/auth/login` è pubblico (necessario per login)

### Database
- **RLS** attivo su organizations, users, invitations, accountant_clients (migrations 0001, 0003, 0010, 0011)
- **Drizzle** usa connessione diretta; l’autorizzazione avviene a livello applicativo (requireUser, getCurrentUser)

### Webhook
- **Stripe** e **Trigger** verificano le firme (webhook secrets)

### Produzione
- Proteggere `/api/cron/monthly-report` con `CRON_SECRET`
- Nessuna chiave sensibile in `NEXT_PUBLIC_*`

