# Task 009: Phase 8 - Notification System (WhatsApp + Email)

---

## 1. Task Overview

### Task Title
**Title:** Notification System - WhatsApp & Email Batch Dispatch with Retry & Fallback

### Goal Statement
**Goal:** When the schedule is published, employees automatically receive WhatsApp/Email with their shifts. Notifications also for shift changes, sick leave, and reports. Multi-channel with retry and fallback.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Channels (Twilio WhatsApp + Resend) and workflow architecture defined in trigger_workflows_summary.md.

---

## 4. Context & Problem Definition

### Problem Statement
After publishing a schedule, employees need to be notified on their preferred channel (WhatsApp or Email). The system must handle batch sending with rate limiting, retries, and fallback (WhatsApp fail → Email). All notifications must be logged for tracking.

### Success Criteria
- [ ] Database tables: notifications, notification_jobs created
- [ ] Notification Dispatch workflow (3 tasks): prepare → send batch → finalize
- [ ] Twilio WhatsApp templates configured and submitted for Meta approval
- [ ] Resend email templates (React Email) for all events
- [ ] publishSchedule triggers automatic notifications
- [ ] Sick leave assignment triggers notifications
- [ ] WhatsApp webhook for delivery status
- [ ] Stripe webhook for payment events (minimal)
- [ ] Rate limiting: 50 WhatsApp/sec, 10 Email/sec
- [ ] Retry: 3 attempts with backoff, fallback WhatsApp → Email

---

## 7. Data & Database Changes

### Database Schema Changes

#### `drizzle/schema/notifications.ts`
- Fields: id, organization_id, recipient_user_id, recipient_employee_id, channel (whatsapp/email/in_app), event_type, subject, body, delivery_status (pending/sent/delivered/failed), external_id, sent_at, created_at

#### `drizzle/schema/notification-jobs.ts`
- Fields: id, organization_id, event_type, recipient_count, status, progress_percentage, trigger_job_id, result_summary (JSONB), error_message, created_at, completed_at

---

## 8. API & Backend Changes

### Trigger.dev Workflows

#### `trigger/notification-dispatch.ts` (3-task workflow)
1. **prepare-notifications**: Query recipients, generate personalized messages from templates
2. **send-notifications-batch**: Parallel WhatsApp + Email with rate limiting, retry 3x, fallback
3. **finalize-notification-job**: Count sent/failed/pending, update job status

### Template Events
- schedule_published, shift_changed, shift_assigned, sick_leave_replacement, request_approved, request_rejected, report_ready, invitation, trial_expiring

### API Routes (Webhooks)
- [ ] `app/api/webhooks/whatsapp/route.ts` - Twilio delivery status callback
- [ ] `app/api/webhooks/stripe/route.ts` - invoice.payment_succeeded, customer.subscription.deleted

### Helpers
- [ ] `lib/twilio.ts` - Twilio client helper
- [ ] `lib/resend.ts` - Resend client helper

### Integration Updates
- [ ] Update publishSchedule: trigger notification dispatch
- [ ] Update sick leave assign: trigger notification dispatch

---

## 9. Frontend Changes

### Email Templates (React Email)
- [ ] `schedule-published.tsx` - Weekly schedule table
- [ ] `shift-changed.tsx` - Shift change notification
- [ ] `report-ready.tsx` - Report with download link
- [ ] `invitation.tsx` - Employee/accountant invitation

---

## 11. Implementation Plan

### Phase 1: Database Schema
- [ ] **Task 1.1:** Create notifications and notification_jobs schemas
- [ ] **Task 1.2:** Generate + apply migration (with down migration)

### Phase 2: Twilio & Resend Setup
- [ ] **Task 2.1:** Create `lib/twilio.ts` helper
- [ ] **Task 2.2:** Configure WhatsApp templates in Twilio Console
- [ ] **Task 2.3:** Create `lib/resend.ts` helper
- [ ] **Task 2.4:** Create React Email templates

### Phase 3: Notification Workflow
- [ ] **Task 3.1:** Implement prepare-notifications task
- [ ] **Task 3.2:** Implement send-notifications-batch task (rate limiting + retry + fallback)
- [ ] **Task 3.3:** Implement finalize-notification-job task

### Phase 4: Integration & Webhooks
- [ ] **Task 4.1:** Update publishSchedule to trigger notifications
- [ ] **Task 4.2:** Update sick leave assign to trigger notifications
- [ ] **Task 4.3:** Create WhatsApp webhook endpoint
- [ ] **Task 4.4:** Create Stripe webhook endpoint (minimal)

---

## 12. Task Completion Tracking

_(To be updated during implementation)_

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] WhatsApp template not yet approved by Meta → fallback to Email only
- [ ] Employee without phone number → Email only
- [ ] Employee without email → WhatsApp only
- [ ] Both channels fail → log as failed, alert owner
- [ ] Rate limit exceeded → queue and retry

### Security
- [ ] Webhook signature verification (Twilio, Stripe)
- [ ] Stripe webhook secret validation

---

*Phase 8 of 14 | Est. Effort: 3-4 days | Dependencies: Phase 7 (AI Scheduling)*
