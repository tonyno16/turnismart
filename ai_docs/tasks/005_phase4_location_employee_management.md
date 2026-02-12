# Task 005: Phase 4 - Location & Employee Management (CRUD)

---

## 1. Task Overview

### Task Title
**Title:** Location & Employee Management - Full CRUD with Contracts, Roles, Availability & Incompatibilities

### Goal Statement
**Goal:** Owner can fully manage locations with staffing requirements, and manage employee records with contracts, roles, availability, incompatibilities, and time-off. Complete CRUD operations for the two core entities of the application.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - CRUD pages with clearly defined fields and relationships.

---

## 4. Context & Problem Definition

### Problem Statement
After onboarding, the owner needs dedicated management pages to add/edit/remove locations and employees with all their associated data (contracts, roles, availability, incompatibilities, time-off). This data is essential for the scheduler in Phase 5.

### Success Criteria
- [x] Database tables: employees, employee_roles, employee_availability, employee_incompatibilities, employee_time_off created
- [x] Location list page with cards (name, address, hours, employees count, status)
- [x] Location detail page with editable info and staffing requirements grid
- [x] Employee list page with table, filters, search
- [x] Employee detail page with profile, contract, roles, availability grid, incompatibilities, time-off
- [x] All CRUD server actions working
- [x] Query helpers for complex employee data (getEmployeesByOrganization, getEmployeeDetail, getEmployeeWeeklyHours)

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/employees.ts`
- Fields: id, organization_id, user_id (nullable FK), first_name, last_name, email, phone, contract_type, weekly_hours, max_weekly_hours, hourly_rate, overtime_rate, holiday_rate, preferred_location_id, is_active, hired_at, notes, created_at, updated_at

#### `drizzle/schema/employee-roles.ts`
- Fields: id, employee_id, role_id, is_primary, created_at
- UNIQUE: (employee_id, role_id)

#### `drizzle/schema/employee-availability.ts`
- Fields: id, employee_id, day_of_week, shift_period, status (available/unavailable/preferred), created_at, updated_at
- UNIQUE: (employee_id, day_of_week, shift_period)

#### `drizzle/schema/employee-incompatibilities.ts`
- Fields: id, organization_id, employee_a_id, employee_b_id, reason, created_at
- UNIQUE: (employee_a_id, employee_b_id) with CHECK (a < b)

#### `drizzle/schema/employee-time-off.ts`
- Fields: id, employee_id, type (vacation/personal_leave/sick_leave/other), start_date, end_date, status (pending/approved/rejected), approved_by_user_id, notes, created_at

---

## 8. API & Backend Changes

### Server Actions
- [x] `app/actions/locations.ts`: createLocation, updateLocation, deleteLocation, updateStaffingRequirements
- [x] `app/actions/employees.ts`: createEmployee, updateEmployee, toggleEmployeeActive, updateEmployeeRoles, updateAvailability, createIncompatibility, removeIncompatibility, createTimeOff, approveTimeOff, rejectTimeOff

### Database Queries
- [x] `lib/employees.ts`: getEmployeesByOrganization(orgId, filters), getEmployeeDetail(employeeId), getEmployeeWeeklyHours(employeeId, weekStart)

---

## 9. Frontend Changes

### Location Pages
- [x] `app/(protected)/locations/page.tsx` - Location list with cards
- [x] `app/(protected)/locations/[id]/page.tsx` - Location detail with staffing grid

### Employee Pages
- [x] `app/(protected)/employees/page.tsx` - Employee list with table, filters, search
- [x] `app/(protected)/employees/[id]/page.tsx` - Employee detail with all sections

---

## 11. Implementation Plan

### Phase 1: Database Schema
- [x] **Task 1.1:** Create all employee-related schemas
- [x] **Task 1.2:** Generate + apply migration (with down migration)

### Phase 2: Location Management Pages
- [x] **Task 2.1:** Build location list page with cards
- [x] **Task 2.2:** Build location detail page with staffing grid
- [x] **Task 2.3:** Create location server actions

### Phase 3: Employee Management Pages
- [x] **Task 3.1:** Build employee list page with table, filters, search
- [x] **Task 3.2:** Build employee detail page (profile, contract, roles, availability, incompatibilities)
- [x] **Task 3.3:** Create employee server actions
- [x] **Task 3.4:** Create employee query helpers

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] Deleting a location with active employees assigned
- [ ] Incompatibility constraint: employee_a_id < employee_b_id
- [ ] Time-off approval with existing scheduled shifts
- [ ] Plan quota check on createLocation and createEmployee

---

*Phase 4 of 14 | Est. Effort: 3-4 days*
