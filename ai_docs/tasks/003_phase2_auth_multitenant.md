# Task 003: Phase 2 - Authentication & Multi-Tenant Foundation

---

## 1. Task Overview

### Task Title
**Title:** Authentication & Multi-Tenant Foundation - Signup, Login, Organization Creation & RLS

### Goal Statement
**Goal:** Users can sign up, log in, and create their own organization. Multi-tenant system working with complete data isolation via Row Level Security. This is the foundation everything else builds on.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Architecture is clearly defined: Supabase Auth + Drizzle ORM + RLS, organization-centric multi-tenancy.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Database:** Supabase PostgreSQL via Drizzle ORM
- **Multi-tenancy:** Organization-centric with RLS
- **Middleware:** Next.js middleware for route protection

### Current State
Landing page complete from Phase 1. No auth or database tables exist yet.

---

## 4. Context & Problem Definition

### Problem Statement
Need complete authentication flow (signup/login/reset/verify) with automatic organization creation on signup. Multi-tenant data isolation via RLS must be established from day 1. Invitation system for employees and accountants.

### Success Criteria
- [x] Database tables: organizations, users, invitations, accountant_clients created with proper constraints
- [x] RLS enabled on all tables with organization_id policies
- [x] Supabase Auth configured (email/password + Google OAuth)
- [x] Server & client Supabase clients created
- [x] Middleware: public routes, protected routes, role-based routing
- [x] Auth pages: sign-up, login, forgot-password, verify-email, invite accept
- [x] On signup: auto-create user + organization (role=owner) + 30-day trial
- [x] On invite accept: link user to existing organization
- [x] getCurrentUser(), getCurrentOrganization(), requireRole() helpers

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Data loss acceptable** - aggressive schema changes allowed

---

## 6. Technical Requirements

### Functional Requirements
- User registration with email + password + full name
- Login with email/password + Google OAuth
- Password reset flow
- Email verification
- Invitation acceptance (employee/accountant)
- Auto-create organization on signup with sector selection
- 30-day trial period on new organizations

### Non-Functional Requirements
- **Security:** RLS on all tables, proper auth checks, CSRF protection
- **Performance:** Fast auth checks in middleware

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/organizations.ts`
- Fields: id, name, slug, sector, logo_url, phone, email, stripe_customer_id, trial_ends_at, onboarding_completed, created_at, updated_at
- UNIQUE: slug, stripe_customer_id

#### `drizzle/schema/users.ts`
- Fields: id (match Supabase Auth), organization_id (FK nullable), email, full_name, phone, avatar_url, role (owner/manager/employee/accountant/admin), is_active, created_at, updated_at
- UNIQUE: email

#### `drizzle/schema/invitations.ts`
- Fields: id, organization_id, invited_by_user_id, email, phone, role, token (UNIQUE), status, expires_at, accepted_at, created_at

#### `drizzle/schema/accountant-clients.ts`
- Fields: id, accountant_user_id, organization_id, status, invited_at, accepted_at
- UNIQUE: (accountant_user_id, organization_id)

### Data Migration Plan
- [x] Run `drizzle-kit generate` to create migration
- [x] Create down migration following drizzle_down_migration.md template
- [ ] Run `drizzle-kit migrate` to apply (richiede DATABASE_URL in .env.local)
- [x] Enable RLS on all tables with organization_id policies (migration 0001_enable_rls.sql)

---

## 8. API & Backend Changes

### Server Actions
- [x] `app/actions/auth.ts`:
  - signup: create user + create organization (role=owner) + set trial_ends_at = 30 days
  - login: authenticate user
  - inviteAccept: create user + link to existing organization with invited role

### Database Queries
- [x] `lib/auth.ts`: getCurrentUser(), getCurrentOrganization(), requireRole()
- [x] `lib/organizations.ts`: getOrganization(), updateOrganization()

---

## 9. Frontend Changes

### New Pages
- [x] `app/(public)/auth/sign-up/page.tsx` - Registration (email + password + full name)
- [x] `app/(public)/auth/login/page.tsx` - Login (email + password + Google OAuth)
- [x] `app/(public)/auth/forgot-password/page.tsx` - Password reset
- [x] `app/(public)/auth/verify-email/page.tsx` - Email confirmation
- [x] `app/(public)/auth/invite/[token]/page.tsx` - Accept invitation
- [x] `app/(public)/auth/reset-password/page.tsx` - Set new password (link email)
- [x] `app/(public)/auth/callback/route.ts` - OAuth callback (crea org+user se nuovo)

### New Components
- [x] Auth form components (AuthForm, AcceptInviteForm, ResetPasswordForm)

---

## 10. Code Changes Overview

**No existing code to modify** - all new schemas, pages, and server logic.

---

## 11. Implementation Plan

### Phase 1: Database Schema
**Goal:** Create foundational tables

- [x] **Task 1.1:** Create `drizzle/schema/organizations.ts`
- [x] **Task 1.2:** Create `drizzle/schema/users.ts`
- [x] **Task 1.3:** Create `drizzle/schema/invitations.ts`
- [x] **Task 1.4:** Create `drizzle/schema/accountant-clients.ts`
- [x] **Task 1.5:** Generate migration + create down migration
- [ ] **Task 1.6:** Apply migration (eseguire con DATABASE_URL impostata)
- [x] **Task 1.7:** Enable RLS on all tables (0001_enable_rls.sql)

### Phase 2: Supabase Auth Configuration
**Goal:** Auth providers configured and working

- [x] **Task 2.1:** Configure Supabase Auth: email/password + Google OAuth
- [x] **Task 2.2:** Create `lib/supabase/server.ts` - Server-side client
- [x] **Task 2.3:** Create `lib/supabase/client.ts` - Client-side client
- [x] **Task 2.4:** Create `middleware.ts` - Auth check + role guard + org isolation

### Phase 3: Auth Pages
**Goal:** Complete signup/login flow

- [x] **Task 3.1:** Build sign-up page
- [x] **Task 3.2:** Build login page
- [x] **Task 3.3:** Build forgot-password page
- [x] **Task 3.4:** Build verify-email page
- [x] **Task 3.5:** Build invite accept page
- [x] **Task 3.6:** Create auth server actions

### Phase 4: Organization Setup
**Goal:** Auto-create organization on signup

- [x] **Task 4.1:** Implement auto-create organization on signup
- [x] **Task 4.2:** Create `lib/auth.ts` helpers
- [x] **Task 4.3:** Create `lib/organizations.ts` helpers

---

## 12. Task Completion Tracking

- **Completed:** Febbraio 2025
- **Deliverables:** Schema Drizzle (organizations, users, invitations, accountant_clients), migrazione 0000 + down, RLS 0001_enable_rls.sql; Supabase server/client/service; middleware per route pubbliche/protette e redirect post-login; auth actions (signUp, login, signInWithGoogle, forgotPassword, acceptInvite); pagine auth (sign-up, login, forgot-password, verify-email, invite/[token], reset-password, callback); lib/auth (getCurrentUser, getCurrentOrganization, requireUser, requireRole, requireOrganization); lib/organizations; layout admin con requireRole(["admin"]).
- **Nota:** Eseguire `npx drizzle-kit migrate` con DATABASE_URL in .env.local per applicare le migrazioni al DB.

---

## 13. File Structure & Organization

### New Files to Create
```
drizzle/
  schema/
    organizations.ts
    users.ts
    invitations.ts
    accountant-clients.ts
lib/
  supabase/
    server.ts
    client.ts
  auth.ts
  organizations.ts
app/
  actions/
    auth.ts
  (public)/
    auth/
      sign-up/page.tsx
      login/page.tsx
      forgot-password/page.tsx
      verify-email/page.tsx
      invite/[token]/page.tsx
middleware.ts
```

---

## 14. Potential Issues & Security Review

### Security
- [x] RLS policies must isolate data by organization_id
- [x] Middleware must protect all non-public routes
- [x] Admin routes restricted to admin role only (layout admin)
- [x] Invitation tokens must be cryptographically random and expire
- [x] Password requirements enforcement (min 8 caratteri)

### Edge Cases
- [x] User tries to sign up with existing email (messaggio "email già registrata")
- [x] Expired invitation token (pagina "Invito scaduto")
- [x] Google OAuth user without organization (callback crea org+user se mancante)

---

*Phase 2 of 14 | Est. Effort: 2-3 days*
