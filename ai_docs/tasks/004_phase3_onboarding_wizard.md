# Task 004: Phase 3 - Onboarding Wizard & Core Data Setup

---

## 1. Task Overview

### Task Title
**Title:** Onboarding Wizard - 5-Step Guided Setup for New Organizations

### Goal Statement
**Goal:** New business owner completes initial setup in 10 minutes: business type, locations, roles, staffing requirements, first employees. At the end, the app is ready to create the first schedule.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Clear 5-step wizard defined in the roadmap with specific fields and flows.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks:** Next.js 15, React 19, Tailwind CSS v4
- **Database:** Supabase PostgreSQL via Drizzle ORM
- **Auth:** Supabase Auth (from Phase 2)

### Current State
Auth system and multi-tenant foundation complete from Phase 2. New users can sign up and create organizations, but no location/role/employee data structures exist yet.

---

## 4. Context & Problem Definition

### Problem Statement
After signup, new owners need a guided flow to configure their business: type of business, locations, roles, staffing needs, and initial employees. Without this, the scheduling features cannot work. The wizard must pre-populate suggested roles based on business sector.

### Success Criteria
- [x] Database tables: locations, roles, staffing_requirements, organization_settings created (+ employees, employee_roles)
- [x] 5-step onboarding wizard functional
- [x] Sector-based role suggestions (ristorante, bar, hotel, RSA, retail)
- [x] On completion: organization.onboarding_completed = true, redirect to dashboard
- [x] If onboarding not completed, always redirect to /onboarding

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- Step 1: Business type selection → pre-populate suggested roles
- Step 2: First location (name, address, opening hours)
- Step 3: Staffing requirements grid (role x day x shift period)
- Step 4: First employees (quick form: name, phone, role, weekly hours)
- Step 5: Summary + "Start creating schedules!"
- Redirect logic: if onboarding_completed = false → redirect to /onboarding

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/locations.ts`
- Fields: id, organization_id, name, address, phone, opening_hours (JSONB), is_active, sort_order, created_at, updated_at

#### `drizzle/schema/roles.ts`
- Fields: id, organization_id, name, color, icon, is_active, sort_order, created_at
- UNIQUE: (organization_id, name)

#### `drizzle/schema/staffing-requirements.ts`
- Fields: id, location_id, role_id, day_of_week (0-6), shift_period (morning/afternoon/evening), required_count, created_at, updated_at
- UNIQUE: (location_id, role_id, day_of_week, shift_period)

#### `drizzle/schema/organization-settings.ts`
- Fields: id, organization_id (UNIQUE), work_rules (JSONB), report_settings (JSONB), notification_settings (JSONB), created_at, updated_at
- Default work_rules: { min_rest_between_shifts_hours: 11, max_consecutive_days: 6, overtime_threshold_hours: 40 }

---

## 8. API & Backend Changes

### Server Actions
- [ ] `app/actions/onboarding.ts`:
  - completeStep1: set organization.sector + create default roles per sector
  - completeStep2: create location + opening_hours
  - completeStep3: create staffing_requirements records
  - completeStep4: create employees + employee_roles
  - completeStep5: set organization.onboarding_completed = true → redirect to dashboard

### Seed Data per Sector
- Ristorante: Cameriere, Cuoco, Lavapiatti, Barista, Maitre
- Bar: Barista, Cameriere
- Hotel: Receptionist, Housekeeping, Portiere, Cameriere
- RSA: Operatore OSS, Infermiere, Medico, Ausiliario
- Retail: Cassiere, Commesso, Magazziniere

---

## 9. Frontend Changes

### New Pages
- [ ] `app/(protected)/onboarding/page.tsx` - Multi-step wizard

### New Components
- [ ] Wizard step components for each of the 5 steps
- [ ] Staffing requirements grid component
- [ ] Role selector with color/icon picker

---

## 11. Implementation Plan

### Phase 1: Database Schema
**Goal:** Create location, role, staffing tables

- [x] **Task 1.1:** Create `drizzle/schema/locations.ts`
- [x] **Task 1.2:** Create `drizzle/schema/roles.ts`
- [x] **Task 1.3:** Create `drizzle/schema/staffing-requirements.ts`
- [x] **Task 1.4:** Create `drizzle/schema/organization-settings.ts`
- [x] **Task 1.5:** Generate + apply migration (0002 + 0003 RLS, con down migration)

### Phase 2: Onboarding Wizard
**Goal:** Build 5-step wizard UI

- [x] **Task 2.1:** Build wizard container with step navigation
- [x] **Task 2.2:** Step 1: Business type selector with role suggestions
- [x] **Task 2.3:** Step 2: Location form
- [x] **Task 2.4:** Step 3: Staffing requirements grid
- [x] **Task 2.5:** Step 4: Employee quick-add form
- [x] **Task 2.6:** Step 5: Summary and confirmation

### Phase 3: Server Actions & Logic
**Goal:** Backend logic for each wizard step

- [x] **Task 3.1:** Create onboarding server actions (all 5 steps)
- [x] **Task 3.2:** Create seed data for sector-based role suggestions
- [x] **Task 3.3:** Implement redirect logic (onboarding not completed → /onboarding)

---

## 12. Task Completion Tracking

- **Completed:** Febbraio 2025
- **Deliverables:** Schema Drizzle (locations, roles, staffing_requirements, organization_settings, employees, employee_roles); migrazioni 0002 + 0003 RLS; onboarding wizard 5 step in `app/(protected)/onboarding/`; step1-sector (settore + ruoli predefiniti), step2-location, step3-staffing (griglia ruolo x giorno x fascia), step4-employees (quick-add), step5-summary; server actions in `app/actions/onboarding.ts`; seed ruoli per settore in `lib/onboarding/sector-roles.ts`; redirect in protected layout (x-pathname da middleware).

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] User refreshes during wizard - state should persist
- [ ] User skips steps - validation should prevent
- [ ] Opening hours format validation (JSONB)
- [ ] Duplicate role names within organization

---

*Phase 3 of 14 | Est. Effort: 2-3 days*
