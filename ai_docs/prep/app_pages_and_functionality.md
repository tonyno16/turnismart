## App Pages & Functionality Blueprint

### App Summary  
**End Goal:** Help entrepreneurs and business owners achieve comprehensive competitive intelligence and market analysis to make informed strategic decisions
**Core Value Proposition:** Stop flying blind in the market by discovering what competitors are really doing - get comprehensive competitor analysis in minutes instead of expensive consultant fees
**Target Users:** Entrepreneurs, business owners, market researchers, and strategic decision makers
**Template Type:** adk-agent-saas

---

## 🌐 Universal SaaS Foundation

### Public Marketing Pages
- **Landing Page** — `/` 
  - Hero: "Stop Flying Blind. Discover What Your Competitors Are Really Doing"
  - Problem highlight: "Get comprehensive competitor analysis in minutes instead of expensive consultant fees"
  - Feature showcase: AI-powered competitive intelligence, market gap discovery, strategic insights
  - Pricing: Free (3 analyses) → Basic ($19.99/month, 25 analyses) → Pro ($49.99/month, unlimited)
  - CTA: "Start Your Competitive Analysis" driving to competitive intelligence chat interface

- **Legal Pages** — `/privacy`, `/terms`, `/cookies`
  - Privacy policy, Terms of service, Cookie policy
  - Essential for GDPR compliance and SaaS operations

### Authentication Flow
- **Login** — `/auth/login` (Email/password, OAuth options including GitHub, Google)
- **Sign Up** — `/auth/sign-up` (Account creation)  
- **Forgot Password** — `/auth/forgot-password` (Password reset flow)
- **Sign Up Success** — `/auth/sign-up-success` (Confirmation page)

---

## ⚡ Core Application Pages

### Competitive Intelligence Interface
- **Primary Analysis** — `/chat`
  - Interactive business consultation with guided questioning
  - Multi-agent competitive research pipeline (Planner → Researcher → Validator → Composer)
  - Real-time competitive analysis generation with progress indicators
  - Comprehensive competitor discovery (direct, indirect, emerging threats)
  - Strategic recommendations and market gap identification
  - Usage indicator showing tier limits and remaining analyses

- **Analysis Sessions** — `/chat/[[...sessionId]]`
  - Specific competitive analysis sessions with flexible routing
  - Restore any previous competitive analysis for reference
  - Continue or refine analysis with additional research

### Analysis Management
- **History** — `/history`
  - Complete competitive analysis sessions with business context and results
  - Restore any previous competitive analysis to review findings and recommendations
  - Export competitive intelligence reports as PDF with comprehensive business insights

### User Account  
- **Profile** — `/profile` (Consolidated Hub)
  - Account settings: name, email, business preferences
  - Subscription management: current tier, analysis usage tracking, upgrade/downgrade
  - Billing: payment methods, invoice history, competitive analysis usage analytics
  - Notification preferences for analysis completion and research updates
  - Tier-based competitive intelligence features clearly displayed

---

## 💰 Business Model Pages

### Billing & Subscription
- **Billing Management** — Integrated within `/profile`
  - Subscription management, payment methods
  - Usage tracking and tier limits (competitive analyses, reports, features)
  - Billing history and invoices
  - Stripe integration for subscription lifecycle management

### Tier-Based Feature Access
**Free Tier ($0/month)**
- 3 competitive analyses per month
- Basic competitor discovery and insights
- Community support

**Basic Tier ($19.99/month) - Most Popular**
- 25 competitive analyses per month
- Industry trend reports
- Email summaries of competitive insights
- Priority support

**Pro Tier ($49.99/month)**
- Unlimited competitive analyses
- Custom research parameters and deep analysis
- Advanced strategic recommendations
- Priority support and early feature access

---

## 📱 Navigation Structure  

### Main Sidebar (Responsive)
- **Analysis** - Primary interface for competitive intelligence research and consultation
- **History** - Previous competitive analysis sessions and reports
- **Profile** - Account settings, subscription management, billing, and business preferences

### Mobile Navigation  
- Collapsible sidebar with competitive analysis as default view
- Quick access to analysis progress and status indicators
- Swipe gestures for accessing history and profile
- Optimized for business users conducting competitive research on-the-go

---

## 🔧 Next.js App Router Structure

### Layout Groups
```
app/
├── (public)/          # Marketing and legal pages
├── (auth)/             # Authentication flow  
├── (protected)/        # Main authenticated app
└── api/                # Backend endpoints
```

### Complete Route Mapping
**🌐 Public Routes**
- `/` → Landing page with competitive intelligence value proposition
- `/privacy` → Privacy policy
- `/terms` → Terms of service  
- `/cookies` → Cookie policy

**🔐 Auth Routes**
- `/auth/login` → User login
- `/auth/sign-up` → User registration
- `/auth/forgot-password` → Password reset
- `/auth/sign-up-success` → Registration confirmation

**🛡️ Protected Routes**  
- `/chat` → Default competitive analysis interface
- `/chat/[[...sessionId]]` → Specific analysis sessions with dynamic routing
- `/history` → Previous competitive analysis sessions and reports
- `/profile` → Consolidated account, billing, and subscription management

**🔧 API Routes**
- `/api/run/route.ts` → Competitive analysis execution with multi-agent pipeline
- `/api/sessions/route.ts` → Analysis session management and history
- `/api/webhooks/stripe/route.ts` → Subscription and billing webhooks

---

## 🎯 MVP Functionality Summary

This blueprint delivers your core value proposition: **Stop flying blind in the market by discovering what competitors are really doing - comprehensive competitive analysis in minutes**

**Phase 1 (Launch Ready):**
- Universal SaaS foundation (auth, legal, responsive design)
- Interactive business consultation with guided competitive analysis questioning
- Multi-agent competitive research pipeline (Planner → Researcher → Validator → Composer)
- Comprehensive competitor discovery including direct, indirect, and emerging threats
- Strategic recommendations and market gap identification with PDF export
- Tier-based subscription system with analysis limits and Stripe integration

**Phase 2 (Growth Features):**  
- Advanced industry-specific analysis templates
- Competitive intelligence alerts and monitoring
- API access for competitive analysis integration
- Visual competitive positioning maps and trend analysis

> **Next Step:** Ready for wireframe design with this concrete blueprint
