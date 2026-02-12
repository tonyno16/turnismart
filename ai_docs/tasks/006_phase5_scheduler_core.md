# Task 006: Phase 5 - Scheduler Core (Drag & Drop)

---

## 1. Task Overview

### Task Title
**Title:** Scheduler Core - Weekly Grid with Drag & Drop, 3 Views & Real-Time Validation

### Goal Statement
**Goal:** Owner sees the weekly schedule grid, can assign shifts by dragging employees onto the grid, and manages shifts manually with real-time conflict validation. All without AI - pure manual scheduling with DnD Kit.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - DnD Kit is already chosen in the stack. Grid views and validation rules are clearly defined.

---

## 4. Context & Problem Definition

### Problem Statement
The scheduler is the core feature of the app. Owners need an interactive weekly grid to assign shifts to employees across locations, with three different views (by location, by employee, by role), drag & drop, and real-time validation of constraints (overlaps, max hours, rest periods, incompatibilities, availability, time-off).

### Success Criteria
- [x] Database tables: schedules, shifts, shift_requests created
- [ ] Navigation sidebar (role-based) and mobile bottom nav (deferred)
- [x] Scheduler page with week navigation
- [x] Schedule grid with shift cells (by location view)
- [x] Employee sidebar (draggable, shows hours bar)
- [x] DnD Kit integration (drag employee → drop on grid cell → create shift)
- [x] Complete shift validation (overlap, max hours, rest period, incompatibility, availability, time-off)
- [x] Conflict popup with "Assign Anyway" / "Cancel"
- [x] Shift CRUD server actions (create, delete, cancel, publish)
- [x] Schedule query helpers (getWeekSchedule, getEmployeeWeekShifts, getStaffingCoverage, getWeekStats)
- [x] Staffing coverage (assigned vs required per cell)

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/schedules.ts`
- Fields: id, organization_id, week_start_date, status (draft/published/modified_after_publish), published_at, published_by_user_id, notes, created_at, updated_at
- UNIQUE: (organization_id, week_start_date)

#### `drizzle/schema/shifts.ts`
- Fields: id, schedule_id, organization_id, location_id, employee_id, role_id, date, start_time, end_time, break_minutes, is_auto_generated, status (active/cancelled/sick_leave), cancelled_reason, created_at, updated_at
- Indexes: schedule_id, employee_id, location_id, (employee_id, date), organization_id

#### `drizzle/schema/shift-requests.ts`
- Fields: id, organization_id, employee_id, type (shift_swap/vacation/personal_leave/sick_leave), status, shift_id, swap_with_employee_id, start_date, end_date, reason, reviewed_by_user_id, reviewed_at, review_notes, created_at

---

## 8. API & Backend Changes

### Server Actions
- [ ] `app/actions/shifts.ts`:
  - createShift (with server-side validation)
  - updateShift, deleteShift, cancelShift
  - bulkCreateShifts (rapid assignment)
  - publishSchedule (change status + trigger notifications in Phase 8)
  - markSickLeave(shiftId)

### Database Queries
- [ ] `lib/schedules.ts`: getWeekSchedule(), getEmployeeWeekShifts(), getStaffingCoverage(), getWeekStats()
- [ ] `lib/schedule-validation.ts`: checkOverlap(), checkMaxWeeklyHours(), checkMinRestPeriod(), checkIncompatibility(), checkAvailability(), checkTimeOff()

---

## 9. Frontend Changes

### Navigation
- [ ] `components/navigation/sidebar.tsx` - Role-based sidebar
- [ ] `components/navigation/mobile-nav.tsx` - Bottom tab bar for mobile

### Scheduler Components
- [ ] `app/(protected)/schedule/page.tsx` - Scheduler page with toolbar
- [ ] `components/schedule/schedule-grid.tsx` - Main grid (3 views)
- [ ] `components/schedule/shift-cell.tsx` - Individual shift cell
- [ ] `components/schedule/employee-sidebar.tsx` - Draggable employee list
- [ ] `components/schedule/conflict-popup.tsx` - Conflict warning popup

### DnD Kit Integration
- [ ] DndContext wrapper for scheduler
- [ ] Draggable on employee cards
- [ ] Droppable on empty grid cells
- [ ] onDragEnd handler: create shift

---

## 11. Implementation Plan

### Phase 1: Database Schema
- [ ] **Task 1.1:** Create schedules, shifts, shift_requests schemas
- [ ] **Task 1.2:** Generate + apply migration (with down migration)

### Phase 2: Navigation
- [ ] **Task 2.1:** Build role-based sidebar
- [ ] **Task 2.2:** Build mobile bottom nav

### Phase 3: Scheduler Grid
- [ ] **Task 3.1:** Build scheduler page with toolbar (week nav, views, filters)
- [ ] **Task 3.2:** Build schedule grid with 3 views
- [ ] **Task 3.3:** Build shift cell component
- [ ] **Task 3.4:** Build employee sidebar
- [ ] **Task 3.5:** Build staffing coverage bar

### Phase 4: Drag & Drop
- [ ] **Task 4.1:** Implement DnD Kit context and handlers
- [ ] **Task 4.2:** Make employee cards draggable
- [ ] **Task 4.3:** Make grid cells droppable
- [ ] **Task 4.4:** Implement onDragEnd shift creation

### Phase 5: Validation
- [ ] **Task 5.1:** Create schedule-validation.ts with all checks
- [ ] **Task 5.2:** Build conflict popup component
- [ ] **Task 5.3:** Integrate validation into shift creation flow

### Phase 6: Server Actions & Queries
- [ ] **Task 6.1:** Create shift CRUD server actions
- [ ] **Task 6.2:** Create schedule query helpers

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] Drag & drop on mobile (touch events)
- [ ] Grid performance with 20+ employees
- [ ] Timezone handling for shift times
- [ ] Week boundary shifts (Sunday night → Monday morning)
- [ ] Published schedule modifications

---

*Phase 5 of 14 | Est. Effort: 4-5 days*
