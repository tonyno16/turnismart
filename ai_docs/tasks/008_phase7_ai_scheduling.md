# Task 008: Phase 7 - AI Schedule Generation & Conflict Resolution

---

## 1. Task Overview

### Task Title
**Title:** AI Schedule Generation - GPT-4 Optimization + Conflict Resolution + Sick Leave Substitutes

### Goal Statement
**Goal:** Owner generates the weekly schedule with one click using AI. The AI optimizes considering all constraints. When an employee is sick, the system automatically suggests the 5 best substitutes ranked by score.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Stack (OpenAI GPT-4 + Trigger.dev) and workflow architecture are clearly defined in trigger_workflows_summary.md.

---

## 4. Context & Problem Definition

### Problem Statement
Manual scheduling is time-consuming. The AI should handle the complex optimization of matching employees to shifts considering all constraints (availability, hours, rest, incompatibilities, fairness). When sick leave occurs, finding the best substitute quickly is critical for operations.

### Success Criteria
- [ ] Database table: schedule_generation_jobs created
- [ ] Trigger.dev configured with trigger.config.ts
- [ ] AI Schedule Generation workflow (4 tasks): collect constraints → optimize with GPT-4 → validate → save
- [ ] "Genera con AI" button enabled in scheduler
- [ ] AI generation modal (select locations, mode, options)
- [ ] Real-time progress overlay (0-100% with step display)
- [ ] AI drag & drop suggestions endpoint
- [ ] Conflict Resolution workflow (2 tasks): find substitutes → prepare suggestions
- [ ] Sick leave popup with top 5 substitutes ranked

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/schedule-generation-jobs.ts`
- Fields: id, organization_id, schedule_id, week_start_date, location_ids (text[]), mode (full/fill_gaps/single_location), options (JSONB), status (pending/collecting/optimizing/validating/completed/failed/cancelled), progress_percentage, current_step, trigger_job_id, result_summary (JSONB), error_message, created_at, completed_at

---

## 8. API & Backend Changes

### Trigger.dev Workflows

#### `trigger/ai-schedule-generation.ts` (4-task workflow)
1. **collect-scheduling-constraints**: Query all data (locations, staffing, employees, availability, incompatibilities, time-off, previous shifts)
2. **optimize-schedule**: GPT-4 function calling (parallelize if >3 locations), retry 3x
3. **validate-schedule**: Check all conflicts, auto-resolve with GPT-4 feedback loop (max 3 attempts), graceful degradation
4. **save-schedule-results**: Create/update schedule + bulk INSERT shifts + calculate summary + update usage tracking

#### `trigger/conflict-resolution.ts` (2-task workflow)
1. **find-best-substitutes**: Query employees with matching role, availability, no overlaps, within hours, no incompatibilities. Rank by: hours remaining, preferred location, fairness, cost
2. **prepare-substitute-suggestions**: Format top 5 with score (0-100)

### API Routes
- [ ] `app/api/ai/suggest/route.ts` - POST endpoint for drag & drop AI suggestions (<2s response)

---

## 9. Frontend Changes

### Scheduler Additions
- [ ] Enable "Genera con AI" button in scheduler toolbar
- [ ] `components/schedule/ai-generation-modal.tsx` - Configuration modal
- [ ] `components/schedule/ai-progress-overlay.tsx` - Real-time progress with useRealtimeRunWithStreams
- [ ] `components/schedule/ai-suggest-popup.tsx` - DnD conflict suggestions
- [ ] `components/schedule/sick-leave-popup.tsx` - Top 5 substitutes with scores

---

## 11. Implementation Plan

### Phase 1: Database & Trigger.dev Setup
- [ ] **Task 1.1:** Create schedule_generation_jobs schema
- [ ] **Task 1.2:** Generate + apply migration (with down migration)
- [ ] **Task 1.3:** Configure trigger.config.ts

### Phase 2: AI Schedule Generation Workflow
- [ ] **Task 2.1:** Implement collect-scheduling-constraints task
- [ ] **Task 2.2:** Implement optimize-schedule task (GPT-4 function calling)
- [ ] **Task 2.3:** Implement validate-schedule task (conflict check + auto-resolve)
- [ ] **Task 2.4:** Implement save-schedule-results task

### Phase 3: AI Generation UI
- [ ] **Task 3.1:** Build AI generation modal
- [ ] **Task 3.2:** Build AI progress overlay with real-time updates
- [ ] **Task 3.3:** Enable "Genera con AI" button

### Phase 4: AI Drag & Drop Suggestions
- [ ] **Task 4.1:** Create /api/ai/suggest endpoint
- [ ] **Task 4.2:** Build AI suggest popup

### Phase 5: Conflict Resolution
- [ ] **Task 5.1:** Implement find-best-substitutes task
- [ ] **Task 5.2:** Implement prepare-substitute-suggestions task
- [ ] **Task 5.3:** Build sick leave popup with substitute ranking

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] GPT-4 API timeout/failure → retry with backoff
- [ ] GPT-4 returns invalid schedule format → validation catches it
- [ ] No valid substitutes for sick leave → "Leave Uncovered" option
- [ ] More than 3 locations → parallel GPT-4 calls
- [ ] Graceful degradation: partial schedule + uncovered list
- [ ] Usage quota check before AI generation

### Security
- [ ] OpenAI API key secured server-side only
- [ ] Rate limiting on /api/ai/suggest endpoint

---

*Phase 7 of 14 | Est. Effort: 4-5 days | Dependencies: Phase 5 (Scheduler Core)*
