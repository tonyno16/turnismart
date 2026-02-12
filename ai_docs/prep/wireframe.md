## Wireframe Reference Doc

### ASCII / Markdown Mock-ups

```text
CompetitorAI Landing Page  `/` (Public Layout)
+----------------------------------------------------------+
|  [Navbar: Logo + Login/Sign Up buttons]                 |
+----------------------------------------------------------+
|  [Hero: "Stop Flying Blind. Discover What Your          |
|   Competitors Are Really Doing" + Badge "AI-Powered     |
|   Competitive Intelligence"]                             |
|  [Feature highlights with icons]                         |
|  [CTA: "Start Your Competitive Analysis"]               |
|----------------------------------------------------------|
|  [Features Section + Problem Section + Demo Section]    |
|  [Pricing Section + FAQ Section + CTA Section]          |
+----------------------------------------------------------+
|  [Footer: Links + Legal]                                |
+----------------------------------------------------------+

Main Protected Layout (Full Height)
+----------------------------------------------------------+
| [Collapsible Sidebar]    |  [MobileHeaderContent]       |
| +-------------------+    |  +-------------------------+ |
| | Header:           |    |  | Main Content Area       | |
| | - CompetitorAI    |    |  | (Scrollable)            | |
| |   Logo + Brain    |    |  |                         | |
| | - Collapse Toggle |    |  |                         | |
| +-------------------+    |  |                         | |
| | Content:          |    |  |                         | |
| | • Chat            |    |  |                         | |
| | • History         |    |  |                         | |
| | • Profile         |    |  |                         | |
| | • Admin (if role) |    |  |                         | |
| +-------------------+    |  |                         | |
| | Footer:           |    |  |                         | |
| | - Usage Tracker   |    |  |                         | |
| | - Theme Switch    |    |  |                         | |
| | - Logout Button   |    |  |                         | |
| +-------------------+    |  +-------------------------+ |
+----------------------------------------------------------+

Chat Interface `/chat` (New Session)
+----------------------------------------------------------+
| [Sidebar]                |  [Main Chat Area]            |
|                          |                              |
|                          |  [WelcomeCard:               |
|                          |   - Brain icon with sparkles |
|                          |   - "Welcome to CompetitorAI"|
|                          |   - Example prompts:         |
|                          |     * "I'm launching a DTC   |
|                          |       skincare brand..."     |
|                          |     * "Help me understand    |
|                          |       fintech competition"]  |
|                          |                              |
|                          |  [Input area with Send btn]  |
+--------------------------+------------------------------+

Chat Session `/chat/[sessionId]` (Active Analysis)
+----------------------------------------------------------+
| [Sidebar]                |  [Session Interface]          |
|                          |                               |
|                          |  [Session messages with:      |
|                          |   - User questions            |
|                          |   - Agent responses           |
|                          |   - AgentMessageRenderer      |
|                          |   - Copy buttons]             |
|                          |                               |
|                          |  [Loading states when         |
|                          |   agents are running]         |
|                          |                               |
|                          |  [Input area with Send btn]   |
+--------------------------+-------------------------------+

History Page `/history`
+----------------------------------------------------------+
| [Sidebar]                |  [History Content]            |
|                          |                               |
|                          |  [Header: "Session History"] |
|                          |  [Separator line]             |
|                          |                               |
|                          |  [SessionTable with:          |
|                          |   - Today                     |
|                          |   - Yesterday                 |
|                          |   - This Week                 |
|                          |   - Older]                    |
|                          |                               |
|                          |  OR [Empty state:             |
|                          |   "No chat sessions yet"     |
|                          |   + "Start Chatting" button] |
+--------------------------+-------------------------------+

Profile Page `/profile`
+----------------------------------------------------------+
| [Sidebar]                |  [Profile Content]            |
|                          |                               |
|                          |  [ProfilePageClient:          |
|                          |   - Account settings          |
|                          |   - Subscription management   |
|                          |   - Billing information       |
|                          |   - Usage tracking]           |
|                          |                               |
+--------------------------+-------------------------------+

Auth Pages `/auth/login`, `/auth/sign-up` (No Sidebar)
+---------------------------------------------+
|  [Simple centered layout]                  |
|  [Logo at top]                             |
|  [Auth form with email/password]           |
|  [Social OAuth options]                    |
|  [Navigation links]                        |
+---------------------------------------------+

Legal Pages `/privacy`, `/terms`, `/cookies` (Public Layout)
+----------------------------------------------------------+
|  [Navbar: Logo + Navigation]                            |
+----------------------------------------------------------+
|  [Legal content with professional typography]           |
|  [Last updated information]                             |
+----------------------------------------------------------+
|  [Footer: Links + Legal]                                |
+----------------------------------------------------------+
```

### Navigation Flow Map

```
Landing → Sign Up → /chat ||
           ↘ Login → /chat

/chat → New Session (Welcome Card) → Business Consultation
        ↘ Existing Session [sessionId] → Analysis Results
        
/chat/[sessionId] → Competitive Analysis Interface
                   → Multi-Agent Pipeline Execution
                   → Report Generation

/chat → /history → Previous Analysis Sessions
                  → Session Details → Resume Analysis
                  
/chat → /profile → Account Settings
                 → Subscription Management → Billing Details
                 → Usage Tracking
                 
Protected Layout:
/chat || /history || /profile → Collapsible Sidebar Navigation
                              → Mobile Header (responsive)
                              → Theme Toggle
                              → Usage Tracker
                              → Logout

Auth Flow:
/auth/login ↔ /auth/sign-up
            → /auth/forgot-password
            → /auth/sign-up-success

Legal:
/ → /privacy || /terms || /cookies
```
