## 🚀 System Architecture Blueprint

### High-Level Architecture
```text
[Frontend – Next.js (React + Tailwind CSS)]
                  ↓↑ REST APIs + Polling
[Supabase – Auth | PostgreSQL | Blob Storage]
                  ↓↑ Research Coordination
[ADK Root Agent – Multi-Agent Coordinator]
    ├── Planner Agent (Research Planning)
    ├── Researcher Agent (Web Search)
    ├── Critic Agent (Quality Assessment)
    ├── Composer Agent (Report Generation)
    └── Canvas Editor Agent (Document Editing)
                  ↓↑ Search Integration
[Google Search API – Built into ADK]
                  ↓↑ Cloud Deployment
[Google Cloud Agent Engine – Auto-scaling]
```

### Application Structure
```
adk-agent-saas/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── app/               # Next.js 13+ app router
│   │   │   ├── (protected)/
│   │   │   │   └── chat/      # Unified interface with three modes
│   │   │   └── ...
│   │   ├── components/        # React components
│   │   │   ├── chat/         # Chat interface components
│   │   │   ├── research/     # Research workflow components
│   │   │   ├── canvas/       # Canvas editing components
│   │   │   └── shared/       # Shared state components
│   │   ├── lib/               # Utilities, Supabase client
│   │   └── ...
│   └── research-agent/        # ADK Python agent
│       ├── agent.py           # Root agent coordinator
│       ├── agents/            # Specialized agent implementations
│       │   ├── planner.py     # Research planning agent
│       │   ├── researcher.py  # Web search agent
│       │   ├── critic.py      # Quality assessment agent
│       │   ├── composer.py    # Report generation agent
│       │   └── canvas_editor.py # Document editing agent
│       ├── pyproject.toml     # Dependencies (UV-managed)
│       └── ...
```

### Technology Stack

#### Frontend (Web App)
- **Framework:** Next.js 13+ with App Router
- **Styling:** Tailwind CSS + Shadcn/ui components
- **State Management:** React hooks + Context (shared chat/canvas state)
- **Real-time:** Polling-based progress updates (no WebSockets)
- **Auth:** Supabase Auth with social providers

#### Backend Services
- **Database:** Supabase PostgreSQL with optimized queries
- **Authentication:** Supabase Auth (email, Google, GitHub)
- **File Storage:** Supabase Blob Storage for documents
- **Agent Service:** Google ADK (Python) deployed to Agent Engine

#### AI & Integrations
- **Agent Framework:** Google Agent Development Kit (ADK)
- **Model Provider:** Gemini 2.5 Pro (single model for all agents)
- **Search Integration:** Google Search API (built into ADK)
- **Multi-Agent:** Root agent coordinates 5 specialized agents

#### Deployment & Infrastructure
- **Web App:** Vercel (Next.js)
- **Agent Service:** Google Cloud Agent Engine
- **Database:** Supabase Cloud
- **Document Storage:** Supabase Blob Storage

### Unified Interface with Three Modes

#### Single Page Architecture
```
Unified Chat Interface
├── Chat Mode (Default)
│   ├── Regular conversation flow
│   ├── Deep research trigger button
│   └── Canvas trigger button
├── Research Mode (Overlay/Sidebar)
│   ├── Research plan approval
│   ├── Progress tracking
│   └── Results integration
└── Canvas Mode (Side-by-side)
    ├── Document editing panel
    ├── Version control
    └── AI collaboration
```

#### 1. Chat Mode (Regular AI Assistant)
```
User Input → Chat API → Root Agent → Gemini 2.5 Pro → Response
     ↓           ↓          ↓            ↓              ↓
  Chat UI     Next.js     ADK Agent    AI Model      Database
  State       API Route   Processing   Generation    Storage
```

#### 2. Deep Research Mode (Triggered from Chat)
```
Research Trigger → Planner Agent → Plan Approval → Research Pipeline
        ↓               ↓              ↓               ↓
    Chat UI          Plan Gen.      User Review    Auto Research
    + Research       (Gemini)       (Same Page)    (Multi-Agent)
    Overlay             ↓              ↓               ↓
        ↓           Plan Storage   Approval        Findings
    Same Page       (Supabase)     Update         Storage
```

#### 3. Canvas Mode (Side-by-side with Chat)
```
Canvas Trigger → Canvas Editor Agent → Document Creation → Version Control
      ↓                ↓                     ↓                ↓
  Chat UI +        Document Gen.        Blob Storage      Version
  Canvas Panel     (Gemini)             (Supabase)        Tracking
      ↓                ↓                     ↓                ↓
  Shared State     Document            Document           Database
  Management       Updates             Retrieval          Updates
```

### Multi-Agent Architecture

#### Root Agent (Coordinator)
- **Role:** Receives all requests and delegates to specialized agents
- **Functions:** 
  - Route chat requests to appropriate agents
  - Coordinate multi-step research workflows
  - Manage agent communication and handoffs
  - Handle error recovery and fallbacks

#### Specialized Agents
```
Planner Agent:
├── Creates research plans from user requests
├── Generates structured research goals
└── Handles plan revision based on user feedback

Researcher Agent:
├── Executes web searches using Google Search API
├── Extracts relevant information from sources
└── Stores findings with source citations

Critic Agent:
├── Evaluates research quality and completeness
├── Identifies gaps in research findings
└── Provides feedback for additional searches

Composer Agent:
├── Synthesizes research findings into reports
├── Generates proper citations and references
└── Creates structured, comprehensive outputs

Canvas Editor Agent:
├── Creates and edits documents based on requests
├── Handles document versioning and updates
└── Manages collaborative editing workflows
```

### Data Flow Architecture

#### Research Workflow Pipeline
```
1. User Request → Root Agent → Planner Agent
2. Research Plan → Database → Frontend (User Approval)
3. Plan Approved → Researcher Agent → Search Loop
4. Search Results → Critic Agent → Quality Check
5. Quality Pass → Composer Agent → Final Report
6. Report Ready → Frontend Notification → User Review
```

#### Canvas Collaboration Flow
```
1. Canvas Request → Root Agent → Canvas Editor Agent
2. Document Creation → Blob Storage → Database Metadata
3. User Edits → Frontend State → API Updates
4. AI Suggestions → Canvas Editor Agent → Document Updates
5. Version Control → Database → Blob Storage Sync
```

#### Progress Tracking (Polling-Based)
```
Frontend Polling → API Endpoint → Database Status Check
     ↓                ↓                  ↓
  Every 2-3s      Research Session    Current Phase
  HTTP Request    Status Query        (planning, researching, etc.)
     ↓                ↓                  ↓
  UI Updates      JSON Response       Progress Display
```

### Shared State Management

#### Chat + Canvas Integration
- **Shared Context:** Research results accessible in canvas
- **State Synchronization:** React Context for cross-component state
- **Navigation:** Seamless switching between chat and canvas modes
- **Document References:** Research findings linkable in documents

#### Frontend State Architecture
```
App Level State:
├── Current Conversation (chat messages)
├── Active Research Session (if any)
├── Open Documents (canvas state)
└── User Preferences (model settings, etc.)

Component Level State:
├── Chat Interface (message input, history)
├── Research Interface (plan approval, progress)
└── Canvas Interface (document editing, versions)
```

### Document Storage Strategy

#### Supabase Blob Storage
- **Document Content:** Stored as blobs for efficient retrieval
- **Metadata:** Document info in PostgreSQL (title, type, versions)
- **Citations:** Embedded in documents with source references
- **Version Control:** Separate blob per version with diff tracking

#### Citation Management
- **Source References:** Store original URL and access timestamp
- **Citation Format:** Website name and URL for user reference
- **Example:** "According to OpenAI's documentation (https://openai.com/docs)"

### Performance Considerations

#### Research Session Management
- **Long-running Sessions:** Tracked in database with status updates
- **User Disconnections:** Sessions continue running, resumable on reconnect
- **Progress Indicators:** Polling-based updates every 2-3 seconds
- **Timeout Handling:** Configurable research session timeouts

#### Document Collaboration
- **Version Control:** Simple version numbering without complex diffs
- **Conflict Resolution:** Last-write-wins with version history
- **Performance:** Lazy loading for large documents
- **Caching:** Frontend caching for frequently accessed documents

### Security & Scalability

#### Authentication & Authorization
- **Supabase Auth** with Row-Level Security
- **API key management** for Google Search API
- **User data isolation** across all services
- **Agent access control** via service authentication

#### Auto-scaling Strategy
- **Agent Engine:** Auto-scales based on research request volume
- **Database:** Supabase connection pooling for concurrent users
- **Blob Storage:** Auto-scaling for document storage needs
- **Frontend:** Vercel edge functions for API routes

### Technical Implementation Notes

#### ADK Agent Deployment
- **Single Project:** All agents deployed as one cohesive service
- **Root Agent Pattern:** Central coordinator delegates to specialists
- **Model Consistency:** Gemini 2.5 Pro across all agent functions
- **Error Handling:** Graceful degradation and retry logic

#### Frontend Architecture Updates
- **Existing Chat Interface:** Extend with research/canvas triggers
- **New Components:** Research workflow and canvas editing components
- **State Management:** Implement shared state between chat and canvas
- **Navigation:** Seamless mode switching within same interface

This architecture provides a robust foundation for ChatGPT-competing research and canvas functionality while maintaining simplicity and scalability for MVP development.
