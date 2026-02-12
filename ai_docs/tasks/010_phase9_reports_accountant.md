# Task 010: Phase 9 - Monthly Report Generation & Accountant Portal

---

## 1. Task Overview

### Task Title
**Title:** Monthly Reports (PDF/CSV/Excel) & Accountant Portal with Auto-Generation

### Goal Statement
**Goal:** Owner generates monthly reports of hours/costs in PDF/CSV/Excel. Accountant accesses a dedicated portal, sees clients, and downloads reports. Reports can be auto-generated on the 1st of each month.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Report format and workflow defined in trigger_workflows_summary.md.

---

## 4. Context & Problem Definition

### Problem Statement
Italian businesses need monthly hour/cost reports for their accountant. The system must aggregate shift data, calculate ordinary/overtime/holiday/sick hours per employee, generate files in 3 formats, and provide a dedicated portal for accountants to download reports for all their clients.

### Success Criteria
- [ ] Database tables: reports, report_generation_jobs, italian_holidays created
- [ ] Italian holidays seeded (2025-2030)
- [ ] Supabase Storage bucket "reports" configured with RLS
- [ ] Report generation workflow (4 tasks): aggregate → generate files → save metadata → notify accountant
- [ ] PDF + CSV + Excel generation working
- [ ] Owner report list page with generation and download
- [ ] Owner report detail page with preview
- [ ] Accountant dashboard with client list and report downloads
- [ ] Accountant invitation flow
- [ ] Vercel Cron for auto monthly report generation

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/reports.ts`
- Fields: id, organization_id, month, status (draft/ready/sent_to_accountant), pdf_url, csv_url, excel_url, summary (JSONB), details_by_employee (JSONB), details_by_location (JSONB), sent_to_accountant_at, created_by_user_id, created_at
- UNIQUE: (organization_id, month)

#### `drizzle/schema/report-generation-jobs.ts`
- Fields: id, organization_id, report_id, month, status, progress_percentage, trigger_job_id, error_message, created_at, completed_at

#### `drizzle/schema/italian-holidays.ts`
- Fields: id, date (UNIQUE), name, year
- Seed: Italian holidays 2025-2030 (Capodanno, Epifania, Pasqua, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, 1 Novembre, 8 Dicembre, Natale, S. Stefano)

---

## 8. API & Backend Changes

### Trigger.dev Workflows

#### `trigger/monthly-report.ts` (4-task workflow)
1. **aggregate-monthly-data**: Query shifts + time-off + holidays, calculate per-employee hours (ordinary, overtime, holiday, sick, vacation), per-location stats
2. **generate-report-files**: Parallel PDF + CSV + Excel generation, upload to Supabase Storage
3. **save-report-metadata**: Create/update reports record with URLs and summaries
4. **notify-accountant**: If connected, trigger notification dispatch (fire-and-forget)

### Server Actions
- [ ] `app/actions/accountant.ts`: inviteAccountant, revokeAccountant

### API Routes
- [ ] `app/api/cron/monthly-report/route.ts` - Vercel Cron (1st of month at 6:00)

### Dependencies
- `@react-pdf/renderer` for PDF generation
- `exceljs` for Excel generation
- `csv-stringify` for CSV generation

---

## 9. Frontend Changes

### Owner Pages
- [ ] `app/(protected)/reports/page.tsx` - Report list with generation and download
- [ ] `app/(protected)/reports/[id]/page.tsx` - Report preview with detail tables

### Accountant Portal
- [ ] `app/(protected)/accountant/page.tsx` - Client dashboard
- [ ] `app/(protected)/accountant/[clientId]/[month]/page.tsx` - Client report detail

### Settings
- [ ] `app/(protected)/settings/accountant/page.tsx` - Accountant invitation management

---

## 11. Implementation Plan

### Phase 1: Database & Storage
- [ ] **Task 1.1:** Create reports, report_generation_jobs, italian_holidays schemas
- [ ] **Task 1.2:** Generate + apply migration (with down migration)
- [ ] **Task 1.3:** Seed Italian holidays 2025-2030
- [ ] **Task 1.4:** Create Supabase Storage bucket "reports" with RLS

### Phase 2: Report Generation Workflow
- [ ] **Task 2.1:** Install @react-pdf/renderer, exceljs, csv-stringify
- [ ] **Task 2.2:** Implement aggregate-monthly-data task
- [ ] **Task 2.3:** Implement generate-report-files task (PDF + CSV + Excel)
- [ ] **Task 2.4:** Implement save-report-metadata task
- [ ] **Task 2.5:** Implement notify-accountant task

### Phase 3: Owner Report Pages
- [ ] **Task 3.1:** Build report list page
- [ ] **Task 3.2:** Build report detail/preview page

### Phase 4: Accountant Portal
- [ ] **Task 4.1:** Build accountant dashboard
- [ ] **Task 4.2:** Build client report detail page
- [ ] **Task 4.3:** Build accountant invitation flow
- [ ] **Task 4.4:** Create accountant server actions

### Phase 5: Auto Monthly Report
- [ ] **Task 5.1:** Create Vercel Cron endpoint
- [ ] **Task 5.2:** Configure cron in vercel.json

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] Month with no shifts → empty report
- [ ] Easter date calculation (variable each year)
- [ ] Overtime calculation across week boundaries
- [ ] Accountant with multiple clients downloading all reports

### Security
- [ ] Report Storage RLS: owner reads own org, accountant reads client orgs
- [ ] Service role only for Trigger.dev uploads

---

*Phase 9 of 14 | Est. Effort: 3-4 days | Dependencies: Phase 5-7 (Scheduling data)*
