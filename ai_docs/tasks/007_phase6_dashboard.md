# Task 007: Phase 6 - Dashboard & Overview

---

## 1. Task Overview

### Task Title
**Title:** Dashboard - KPI Overview, Weekly Coverage & Quick Actions

### Goal Statement
**Goal:** Owner has a dashboard showing the health status of all locations with alerts, KPIs, and quick actions. Quick overview without entering the scheduler.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Dashboard components and data sources are clearly defined.

---

## 4. Context & Problem Definition

### Problem Statement
After the scheduler is built, the owner needs a high-level view of the current week: how many employees are active, which shifts are uncovered, weekly cost estimates, and pending alerts (requests, sick leave). Quick actions to generate/publish schedules and reports.

### Success Criteria
- [x] Dashboard page with KPI cards (active employees, uncovered shifts, planned hours, estimated cost)
- [x] Weekly overview grid: locations x days with traffic light (green/yellow/red/empty)
- [x] Notifications/alerts section (pending requests, sick leave, employees without shifts)
- [x] Quick actions: Settimana prossima, Pubblica programmazione, Report mensile
- [x] Dashboard query helpers working

---

## 7. Data & Database Changes

No new database tables required. Dashboard reads from existing tables (schedules, shifts, employees, locations, shift_requests).

---

## 8. API & Backend Changes

### Database Queries
- [ ] `lib/dashboard.ts`:
  - getDashboardStats(orgId) - aggregated KPIs
  - getWeekOverview(orgId, weekStart) - coverage status per location/day
  - getPendingAlerts(orgId) - pending requests, sick leave, uncovered

---

## 9. Frontend Changes

### New Pages
- [ ] `app/(protected)/dashboard/page.tsx` - Main dashboard

### Dashboard Components
- [ ] KPI cards row
- [ ] Weekly coverage grid (location x day traffic light)
- [ ] Alerts/notifications list
- [ ] Quick actions buttons

---

## 11. Implementation Plan

### Phase 1: Query Helpers
- [ ] **Task 1.1:** Create `lib/dashboard.ts` with all query functions

### Phase 2: Dashboard UI
- [ ] **Task 2.1:** Build KPI cards section
- [ ] **Task 2.2:** Build weekly coverage grid with traffic lights
- [ ] **Task 2.3:** Build alerts/notifications section
- [ ] **Task 2.4:** Build quick actions section
- [ ] **Task 2.5:** Assemble dashboard page

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] Dashboard with no data (first week, no schedules yet) - show empty states
- [ ] Performance with many locations (aggregation queries)
- [ ] Real-time data freshness

---

*Phase 6 of 14 | Est. Effort: 1-2 days*
