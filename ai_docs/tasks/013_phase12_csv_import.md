# Task 013: Phase 12 - CSV Import

---

## 1. Task Overview

### Task Title
**Title:** CSV Employee Import - Upload, Validate, Deduplicate & Batch Import

### Goal Statement
**Goal:** Owner imports employee lists from CSV (exported from management software or Excel). Validation, deduplication, and batch import run in background with progress tracking and detailed error reporting.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Workflow architecture defined in trigger_workflows_summary.md.

---

## 4. Context & Problem Definition

### Problem Statement
Owners migrating from other systems need to import employee lists efficiently. CSV files may have inconsistent data, duplicates, and invalid entries. The import must validate each row, detect duplicates, and provide clear feedback on what was imported, skipped, or failed.

### Success Criteria
- [x] Database table: import_jobs created
- [x] Supabase Storage bucket "imports" configured
- [x] CSV Import workflow (3 tasks): parse & validate → create records → finalize
- [x] Import modal with drop zone, preview, progress bar, results
- [x] Column auto-mapping
- [x] Duplicate detection (email/phone vs existing)
- [x] Error reporting with row number and reason

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/import-jobs.ts`
- Fields: id, organization_id, file_name, file_url, total_rows, status, progress_percentage, trigger_job_id, result_summary (JSONB), error_message, created_at, completed_at

---

## 8. API & Backend Changes

### Trigger.dev Workflows

#### `trigger/csv-import.ts` (3-task workflow)
1. **parse-and-validate-csv**: Download from Storage, parse with Papaparse, auto-map columns, validate per row, detect duplicates. Fail fast if >50% invalid
2. **create-employee-records**: Batch INSERT employees + employee_roles for valid rows, skip duplicates
3. **finalize-import**: Update job with result_summary, cleanup CSV from Storage

### Dependencies
- `papaparse` for CSV parsing

---

## 9. Frontend Changes

### Employee List Addition
- [x] Add "Import CSV" button to employee list page
- [x] `components/employees/csv-import-modal.tsx` - Upload, preview, progress, results

---

## 11. Implementation Plan

### Phase 1: Database & Storage
- [x] **Task 1.1:** Create import_jobs schema
- [x] **Task 1.2:** Generate + apply migration (with down migration)
- [x] **Task 1.3:** Create Supabase Storage bucket "imports" with RLS

### Phase 2: CSV Import Workflow
- [x] **Task 2.1:** Install papaparse
- [x] **Task 2.2:** Implement parse-and-validate-csv task
- [x] **Task 2.3:** Implement create-employee-records task
- [x] **Task 2.4:** Implement finalize-import task

### Phase 3: Import UI
- [x] **Task 3.1:** Build CSV import modal with drop zone
- [x] **Task 3.2:** Add preview with column mapping
- [x] **Task 3.3:** Add progress bar during import
- [x] **Task 3.4:** Add results display (imported/errors/duplicates)

---

## 12. Task Completion Tracking

**Status: ✅ Completato**

- Schema import_jobs + migration
- trigger/csv-import.ts: csvImportWorkflow + createEmployeeRecords + finalizeImport
- lib papaparse, auto-mapping colonne (nome/cognome/email/telefono/mansione/contratto/ore)
- uploadCsvAndCreateImportJob, getImportJobStatus server actions
- components/employees/csv-import-modal.tsx con drop zone, progress, risultati

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] CSV with wrong encoding (UTF-8 BOM, Windows-1252) → handle encoding detection
- [ ] Very large CSV (1000+ rows) → batch processing
- [ ] Columns in unexpected order → auto-mapping
- [ ] Missing required fields → row-level error

### Security
- [ ] Upload size limit
- [ ] CSV file cleaned up after 7 days
- [ ] No code execution from CSV content (sanitize)

---

*Phase 12 of 14 | Est. Effort: 1-2 days | Optional: Not blocking any other phase*
