# Task 001: Phase 0 - Project Setup

---

## 1. Task Overview

### Task Title
**Title:** Project Setup - Environment, Dependencies & Folder Structure

### Goal Statement
**Goal:** Prepare the complete development environment: scaffold Next.js 15 project, install all dependencies, configure external services (Supabase, Trigger.dev, Stripe, Twilio, Resend, OpenAI), and establish the folder structure. This phase MUST be completed before any other development work begins.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - This is a straightforward setup task with a single clear approach defined in the roadmap.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15 (App Router), React 19, TypeScript
- **Language:** TypeScript with strict mode
- **Database & ORM:** Supabase PostgreSQL via Drizzle ORM
- **UI & Styling:** Tailwind CSS v4
- **Authentication:** Supabase Auth (email/password + Google OAuth)
- **Background Jobs:** Trigger.dev v4
- **Payments:** Stripe (Checkout, Portal, Webhooks)
- **Notifications:** Twilio WhatsApp + Resend Email
- **AI:** OpenAI GPT-4 with function calling

### Current State
Empty project - no code exists yet. Only prep documents and roadmap are available.

---

## 4. Context & Problem Definition

### Problem Statement
The development environment must be fully configured before any feature development can begin. All external services need to be connected and verified.

### Success Criteria
- [x] Next.js 15 project scaffolded with App Router + TypeScript
- [x] All dependencies installed (Drizzle, Supabase, Trigger.dev, Stripe, DnD Kit, OpenAI, Twilio, Resend, utilities)
- [x] `.env.local` created with all required environment variables
- [ ] All external services configured and responding (manuale: Supabase, Trigger.dev, Stripe, Twilio, Resend)
- [x] Folder structure matches system architecture
- [x] Project builds and runs without errors

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- Next.js 15 project with App Router + TypeScript
- Tailwind CSS v4 configured
- Drizzle ORM + drizzle-kit + postgres driver installed
- Supabase client libraries installed and configured
- Trigger.dev SDK v4 + React hooks installed
- Stripe + Stripe.js installed
- DnD Kit (core + sortable + utilities) installed
- OpenAI, Twilio, Resend SDKs installed
- Utility libraries: date-fns, zod, lucide-react, sonner

### Non-Functional Requirements
- **Performance:** Fast dev server startup
- **Security:** All API keys in `.env.local`, never committed to git

---

## 7. Data & Database Changes

No database changes in this phase - schema creation starts in Phase 2.

---

## 8. API & Backend Changes

No API changes - this phase is purely setup.

### External Integrations
- **Supabase:** Project creation, Auth config, Database connection, Storage setup
- **Trigger.dev:** Project creation, SDK connection
- **Stripe:** Products and pricing setup (Starter €9.99, Pro €24.99, Business €49.99)
- **OpenAI:** API key configured
- **Twilio:** Account setup, WhatsApp Business API
- **Resend:** API key configured

---

## 9. Frontend Changes

No frontend components in this phase - only project scaffolding.

---

## 10. Code Changes Overview

**No existing code to modify** - this is a greenfield project setup.

---

## 11. Implementation Plan

### Phase 1: Project Initialization
**Goal:** Scaffold Next.js project with all core dependencies

- [x] **Task 1.1:** Create Next.js 15 project with App Router + TypeScript
- [x] **Task 1.2:** Install and configure Tailwind CSS v4
- [x] **Task 1.3:** Install Drizzle ORM + drizzle-kit + postgres driver
- [x] **Task 1.4:** Install @supabase/supabase-js + @supabase/ssr
- [x] **Task 1.5:** Install @trigger.dev/sdk v4 + @trigger.dev/react-hooks
- [x] **Task 1.6:** Install stripe + @stripe/stripe-js
- [x] **Task 1.7:** Install @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities
- [x] **Task 1.8:** Install openai, twilio, resend
- [x] **Task 1.9:** Install utility libs: date-fns, zod, lucide-react, sonner

### Phase 2: Environment Configuration
**Goal:** All external service connections verified and working

- [x] **Task 2.1:** Create `.env.local` with all required variables:
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - DATABASE_URL (Supabase PostgreSQL connection string)
  - TRIGGER_SECRET_KEY
  - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - OPENAI_API_KEY
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
  - RESEND_API_KEY
  - NEXT_PUBLIC_APP_URL
- [ ] **Task 2.2:** Configure Supabase project (Auth, Database, Storage) — da fare manualmente
- [ ] **Task 2.3:** Configure Trigger.dev project and connect — da fare manualmente
- [ ] **Task 2.4:** Configure Stripe products and pricing — da fare manualmente
- [ ] **Task 2.5:** Verify all env vars are set and services respond — dopo config servizi

### Phase 3: Folder Structure
**Goal:** Establish project organization matching system architecture

- [x] **Task 3.1:** Create folder structure:
  ```
  app/
    (public)/          # Landing, pricing, auth pages
    (protected)/       # All authenticated pages
      dashboard/
      schedule/
      locations/
      employees/
      reports/
      profile/
      my-schedule/     # Employee mobile view
      my-preferences/
      my-requests/
      accountant/      # Accountant portal
      admin/           # Super admin
    api/
      webhooks/        # Stripe, Trigger, WhatsApp
      ai/              # AI suggest endpoint
      cron/            # Monthly report cron
    actions/           # Server Actions
  components/
    ui/                # Shared UI components
    navigation/        # Sidebar, mobile nav
    schedule/          # Scheduler-specific
    employees/         # Employee-specific
    reports/           # Report-specific
  lib/                 # Server utilities
  trigger/             # Trigger.dev workflows
  drizzle/
    schema/            # All Drizzle table schemas
    migrations/        # Generated migrations
  ```
- [x] **Task 3.2:** Document any critical findings before proceeding to Phase 1

---

## 12. Task Completion Tracking

**Completato:** 11 Feb 2026

| Fase | Stato | Note |
|------|-------|------|
| Phase 1: Project Init | ✅ Done | Progetto in `turnismart/`, Next.js 16 (latest), tutte le dipendenze installate |
| Phase 2: Env Config | 🟡 Parziale | `.env.local` e `.env.example` creati. Config servizi (Supabase, Trigger.dev, Stripe, Twilio, Resend) da fare manualmente |
| Phase 3: Folder Structure | ✅ Done | Struttura completa creata, build OK |

**Note:** Il progetto è in `turnismart/` (nome npm-compatibile). Per avviare: `cd turnismart && npm run dev`

---

## 13. File Structure & Organization

### New Files to Create
All project files - greenfield setup.

### Dependencies to Add
```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "drizzle-orm": "latest",
    "postgres": "latest",
    "@trigger.dev/sdk": "^4",
    "@trigger.dev/react-hooks": "^4",
    "stripe": "latest",
    "@stripe/stripe-js": "latest",
    "@dnd-kit/core": "latest",
    "@dnd-kit/sortable": "latest",
    "@dnd-kit/utilities": "latest",
    "openai": "latest",
    "twilio": "latest",
    "resend": "latest",
    "date-fns": "latest",
    "zod": "latest",
    "lucide-react": "latest",
    "sonner": "latest"
  },
  "devDependencies": {
    "drizzle-kit": "latest",
    "typescript": "^5",
    "@types/node": "latest",
    "@types/react": "latest",
    "tailwindcss": "^4"
  }
}
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Env vars missing:** Validate all required env vars at startup
- [ ] **Service connection failures:** Each external service should be independently verified

### Security
- [x] `.env.local` in `.gitignore` (copre `.env*`)
- [x] No API keys committed to git (`.env.example` è template senza valori)

---

*Phase 0 of 14 | Est. Effort: 1 day*
