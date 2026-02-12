# Task 011: Phase 10 - Employee Mobile Experience

---

## 1. Task Overview

### Task Title
**Title:** Employee Mobile Experience - Schedule View, Preferences & Shift Requests

### Goal Statement
**Goal:** Employees use the app from their phone to view their shifts, manage availability preferences, and submit shift change/time-off requests. Mobile-first design optimized for touch interaction.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Mobile-first pages with clearly defined features.

---

## 4. Context & Problem Definition

### Problem Statement
Employees need a simple mobile interface to: (1) view their weekly/monthly shifts with details, (2) manage their availability preferences and incompatibilities, (3) request shift swaps, vacation, personal leave, or report sick leave. Managers/owners need a page to approve/reject these requests.

### Success Criteria
- [ ] My Schedule page: weekly/monthly view with shift cards, hours tracking
- [ ] My Preferences page: availability grid, preferred/excluded locations, incompatibilities
- [ ] My Requests page: list with status, new request form (swap/vacation/leave/sick)
- [ ] Manager Request Approval page: pending requests list with approve/reject
- [ ] All pages mobile-first with touch gestures (swipe)
- [ ] Bottom tab navigation for employee role

---

## 7. Data & Database Changes

No new database tables required. Uses existing: shifts, employee_availability, employee_incompatibilities, shift_requests, employee_time_off.

---

## 8. API & Backend Changes

### Server Actions
- [ ] Request submission creates shift_request + notification to owner/manager
- [ ] Approve shift swap updates shift assignments + notification
- [ ] Approve time-off creates employee_time_off record + notification

---

## 9. Frontend Changes

### Employee Pages (Mobile-First)
- [ ] `app/(protected)/my-schedule/page.tsx` - Weekly/monthly shift view with cards
- [ ] `app/(protected)/my-preferences/page.tsx` - Availability grid + preferences
- [ ] `app/(protected)/my-requests/page.tsx` - Request list + new request form

### Manager Pages
- [ ] `app/(protected)/requests/page.tsx` - Request approval page

---

## 11. Implementation Plan

### Phase 1: Employee Schedule View
- [ ] **Task 1.1:** Build My Schedule page (weekly/monthly cards)
- [ ] **Task 1.2:** Add shift detail cards (location, time, role, colleagues)
- [ ] **Task 1.3:** Add hours tracking footer
- [ ] **Task 1.4:** Implement week navigation with swipe gesture

### Phase 2: Employee Preferences
- [ ] **Task 2.1:** Build My Preferences page
- [ ] **Task 2.2:** Build availability grid (day x shift period toggles)
- [ ] **Task 2.3:** Add preferred/excluded location selectors
- [ ] **Task 2.4:** Add incompatibility management

### Phase 3: Shift Requests
- [ ] **Task 3.1:** Build My Requests page with status list
- [ ] **Task 3.2:** Build new request modal (type, shift, dates, colleague, reason)
- [ ] **Task 3.3:** Create request submission server actions

### Phase 4: Manager Approval
- [ ] **Task 4.1:** Build request approval page
- [ ] **Task 4.2:** Implement approve/reject actions with notifications

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] Employee tries to request swap for a past shift
- [ ] Overlapping time-off requests
- [ ] Request approval when schedule already published → auto-update shifts
- [ ] Employee role can only see own data (RLS)

---

*Phase 10 of 14 | Est. Effort: 2-3 days | Dependencies: Phase 5 (Scheduling data)*
