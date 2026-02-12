# Task 012: Phase 11 - Profile, Subscription & Settings

---

## 1. Task Overview

### Task Title
**Title:** Profile, Subscription (Stripe Portal) & Organization Settings

### Goal Statement
**Goal:** Owner manages organization profile, subscription (via Stripe Portal), and settings (work rules, notification preferences, report config). Usage tracking visible with progress bars per quota.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Stripe Portal approach (no custom billing UI) is already decided. Settings fields are clearly defined.

---

## 4. Context & Problem Definition

### Problem Statement
Owners need a profile page showing account info and subscription status (queried from Stripe API in real-time), usage stats with quota progress bars, and settings pages to configure work rules, notification channels, and report preferences.

### Success Criteria
- [ ] Database table: usage_tracking created
- [ ] Profile page with account info, subscription status (from Stripe API), usage stats
- [ ] "Gestisci Abbonamento" → Stripe Portal redirect
- [ ] Usage tracking helpers with quota checks
- [ ] Quota checks integrated into: createLocation, createEmployee, AI generation, report generation
- [ ] Settings hub with work rules and notification preferences pages
- [ ] Work rules: rest hours, max consecutive days, overtime threshold
- [ ] Notification settings: per-event channel toggles

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/usage-tracking.ts`
- Fields: id, organization_id, month, locations_count, employees_count, ai_generations_count, reports_generated_count, whatsapp_messages_sent, email_messages_sent, created_at, updated_at
- UNIQUE: (organization_id, month)

---

## 8. API & Backend Changes

### Database Queries
- [ ] `lib/usage.ts`:
  - getOrCreateMonthlyUsage(orgId)
  - incrementUsage(orgId, field)
  - checkQuota(orgId, resource) → query Stripe plan + compare with usage

### Integration Points
- [ ] Quota checks in: createLocation, createEmployee, AI generation, report generation
- [ ] Stripe API: query subscription status with stripe_customer_id
- [ ] Stripe Portal URL generation for "Gestisci Abbonamento"

---

## 9. Frontend Changes

### Profile Page
- [ ] `app/(protected)/profile/page.tsx` - Account, subscription, usage

### Settings Pages
- [ ] `app/(protected)/settings/page.tsx` - Settings hub
- [ ] `app/(protected)/settings/work-rules/page.tsx` - Work rules config
- [ ] `app/(protected)/settings/notifications/page.tsx` - Notification channel toggles

---

## 11. Implementation Plan

### Phase 1: Database & Usage Tracking
- [ ] **Task 1.1:** Create usage_tracking schema
- [ ] **Task 1.2:** Generate + apply migration (with down migration)
- [ ] **Task 1.3:** Create `lib/usage.ts` helpers
- [ ] **Task 1.4:** Integrate quota checks into existing server actions

### Phase 2: Profile Page
- [ ] **Task 2.1:** Build profile page with account card
- [ ] **Task 2.2:** Build subscription card (Stripe API query)
- [ ] **Task 2.3:** Build usage card with progress bars
- [ ] **Task 2.4:** Implement Stripe Portal redirect

### Phase 3: Settings Pages
- [ ] **Task 3.1:** Build settings hub
- [ ] **Task 3.2:** Build work rules page
- [ ] **Task 3.3:** Build notification settings page

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] Organization exceeds quota mid-month → graceful block with upgrade CTA
- [ ] Stripe API unavailable → show cached/default state
- [ ] No stripe_customer_id yet (trial) → show trial status

### Security
- [ ] Stripe API key server-side only
- [ ] Stripe Portal session creation server-side

---

*Phase 11 of 14 | Est. Effort: 2 days*
