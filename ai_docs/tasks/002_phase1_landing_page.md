# Task 002: Phase 1 - Landing Page & Branding

---

## 1. Task Overview

### Task Title
**Title:** Landing Page & Legal Pages - Marketing & Conversion

### Goal Statement
**Goal:** Build a professional Italian landing page that converts visitors into trial users. The visitor understands what the app does and can sign up. Includes legally-required pages for Italian SaaS (Privacy Policy, Terms, Refund Policy).

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not needed** - Landing page requirements are clearly defined in the roadmap with specific sections and content.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks:** Next.js 15 App Router, React 19
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React

### Current State
Project scaffolded in Phase 0. No pages exist yet.

---

## 4. Context & Problem Definition

### Problem Statement
Need a professional marketing landing page that communicates value in 5 seconds and drives trial signups. Also need legally required pages for Italian SaaS compliance (GDPR Privacy Policy, Terms of Service, Refund Policy).

### Success Criteria
- [x] Landing page with Hero, How It Works, Features, Pricing, FAQ, Footer sections
- [x] Clear CTA "Prova Gratis per 30 Giorni" prominently displayed
- [x] Pricing section with 3 plans (Starter €9.99, Pro €24.99, Business €49.99)
- [x] Privacy Policy page (GDPR-compliant)
- [x] Terms of Service page
- [x] Refund Policy page (14 giorni)
- [x] All pages responsive (mobile-first)
- [x] SEO meta tags and Open Graph configured

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- `app/(public)/page.tsx` - Complete landing page with:
  - Hero section: "Crea gli orari del personale in pochi minuti, non in ore" + CTA
  - "Come Funziona" section: 3 steps (Configura → Genera con AI → Pubblica)
  - Features grid: 6 cards (AI Scheduling, Multi-Sede, Report Auto, Drag & Drop, WhatsApp, Mobile)
  - Pricing section: 3 plans with feature comparison
  - FAQ accordion: 4-6 domande frequenti
  - Footer: Privacy, Termini, Contatti
- `app/(public)/privacy/page.tsx` - GDPR-compliant Privacy Policy
- `app/(public)/terms/page.tsx` - Terms of Service
- `app/(public)/refund/page.tsx` - Refund Policy (14 giorni)

### Non-Functional Requirements
- **Performance:** Fast initial load, no unnecessary JS
- **SEO:** Meta tags, Open Graph, structured data
- **Responsive:** Mobile-first design (320px+)
- **Accessibility:** WCAG AA, semantic HTML

---

## 7. Data & Database Changes

No database changes required for this phase.

---

## 8. API & Backend Changes

No API or backend changes required. All pages are static/SSG.

---

## 9. Frontend Changes

### New Components
- [x] `components/ui/pricing-card.tsx` - Reusable pricing plan card
- [x] `components/ui/feature-card.tsx` - Feature showcase card
- [x] `components/ui/faq-accordion.tsx` - FAQ accordion component

### New Pages
- [x] `app/(public)/page.tsx` - Landing page
- [x] `app/(public)/privacy/page.tsx` - Privacy Policy
- [x] `app/(public)/terms/page.tsx` - Terms of Service
- [x] `app/(public)/refund/page.tsx` - Refund Policy

---

## 10. Code Changes Overview

**No existing code to modify** - all new pages and components.

---

## 11. Implementation Plan

### Phase 1: Landing Page
**Goal:** Complete marketing landing page

- [x] **Task 1.1:** Build Hero section with headline and CTA
- [x] **Task 1.2:** Build "Come Funziona" 3-step section
- [x] **Task 1.3:** Build Features grid with 6 cards
- [x] **Task 1.4:** Build Pricing section with 3 plans and feature comparison
- [x] **Task 1.5:** Build FAQ accordion
- [x] **Task 1.6:** Build Footer with links

### Phase 2: Legal Pages
**Goal:** Italian SaaS legal compliance

- [x] **Task 2.1:** Build Privacy Policy page (GDPR-compliant)
- [x] **Task 2.2:** Build Terms of Service page
- [x] **Task 2.3:** Build Refund Policy page (14 giorni)

### Phase 3: SEO & Polish
**Goal:** Optimize for search and social sharing

- [x] **Task 3.1:** Add meta tags and Open Graph to all pages
- [x] **Task 3.2:** Responsive testing on all breakpoints
- [x] **Task 3.3:** Accessibility review

---

## 12. Task Completion Tracking

- **Completed:** Febbraio 2025
- **Deliverables:** Landing page (`app/(public)/page.tsx`) con Hero, Come Funziona, Features, Pricing, FAQ; layout pubblico con header/footer e SEO (metadata, Open Graph) in `app/(public)/layout.tsx`; componenti UI `pricing-card`, `feature-card`, `faq-accordion`; pagine legali `/privacy`, `/terms`, `/refund` (italiano, GDPR, 14 giorni rimborso).
- **Build:** Verificato con `npm run build` (Next.js 16).

---

## 13. File Structure & Organization

### New Files to Create
```
app/
  (public)/
    page.tsx                    # Landing page
    layout.tsx                  # Public layout
    privacy/
      page.tsx                  # Privacy Policy
    terms/
      page.tsx                  # Terms of Service
    refund/
      page.tsx                  # Refund Policy
components/
  ui/
    pricing-card.tsx
    feature-card.tsx
    faq-accordion.tsx
```

---

## 14. Potential Issues & Security Review

### Edge Cases
- [x] Pricing display with correct Euro formatting (€)
- [x] Italian language content accuracy
- [x] GDPR compliance in privacy policy

---

*Phase 1 of 14 | Est. Effort: 1 day*
