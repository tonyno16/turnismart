# Task Review Checklist (adk-agent-saas)

> **Note:** This checklist is tailored for the **adk-agent-saas** template - a monorepo with Next.js frontend (`apps/web/`) and Python ADK agents (`apps/competitor-analysis-agent/`). All frontend paths are prefixed with `apps/web/`.

Use this checklist to verify implementation quality before marking a task complete. Run through each section systematically.

---

## 1. Type Safety (TypeScript)

### 1.1 No `any` Types
```bash
# Search for any types in changed files
grep -r "any" --include="*.ts" --include="*.tsx" <changed-files>
```

**Check for:**
- [ ] No explicit `any` type annotations
- [ ] No implicit `any` from missing types
- [ ] Proper generics used where needed

### 1.2 Explicit Return Types
```typescript
// ❌ Bad
async function getUser(id: string) {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
}

// ✅ Good
async function getUser(id: string): Promise<User | undefined> {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
}
```

**Check for:**
- [ ] All functions have explicit return types
- [ ] Async functions return `Promise<T>`
- [ ] Void functions explicitly return `void` or `Promise<void>`

### 1.3 No Type Assertions Without Justification
```typescript
// ❌ Bad - hiding potential issues
const user = data as User;

// ✅ Good - validate first
if (isUser(data)) {
  const user = data;
}
```

---

## 2. Type Safety (Python/ADK Agents)

### 2.1 No `Any` Type
```python
# ❌ Bad - using Any
from typing import Any
def process_data(data: Any) -> Any:
    ...

# ✅ Good - use specific types from ADK libraries
from google.adk.agents import Agent
from google.adk.sessions import Session

def process_data(data: dict[str, str]) -> AgentResponse:
    ...
```

**Check for:**
- [ ] No `Any` imports from `typing`
- [ ] Use specific types from ADK libraries (`Agent`, `Session`, etc.)
- [ ] Use `object` or protocol types for truly generic cases

### 2.2 Explicit Return Type Annotations
```python
# ❌ Bad - missing return type
def get_agent_config():
    return {"name": "competitor-analysis"}

async def run_analysis(query):
    pass

# ✅ Good - explicit return types (including -> None)
def get_agent_config() -> dict[str, str]:
    return {"name": "competitor-analysis"}

async def run_analysis(query: str) -> None:
    pass
```

**Check for:**
- [ ] All functions have explicit return type annotations
- [ ] Use `-> None` for functions that don't return a value
- [ ] Async functions properly typed with return type

### 2.3 Modern Python Type Syntax
```python
# ❌ Bad - legacy syntax
from typing import Dict, List, Optional, Union

def process(items: List[str], config: Optional[Dict[str, int]]) -> Union[str, None]:
    ...

# ✅ Good - modern syntax (Python 3.10+)
def process(items: list[str], config: dict[str, int] | None) -> str | None:
    ...
```

**Check for:**
- [ ] Use `dict[K, V]` not `Dict[K, V]`
- [ ] Use `list[T]` not `List[T]`
- [ ] Use `str | None` not `Optional[str]`
- [ ] Use `X | Y` not `Union[X, Y]`

---

## 3. ADK Agent Patterns

### 3.1 Agent Export Structure
```python
# ❌ Bad - missing root_agent export
agent = Agent(name="my-agent")

# ✅ Good - export root_agent variable (required by ADK)
from google.adk.agents import Agent

root_agent = Agent(
    name="competitor-analysis",
    model="gemini-2.0-flash",
    # ...
)
```

**Check for:**
- [ ] Agent module exports `root_agent` variable
- [ ] Agent has required configuration (name, model)

### 3.2 Session State Management
```python
# ✅ Use output_key for session state persistence
root_agent = Agent(
    name="competitor-analysis",
    output_key="analysis_result",  # Persists to session state
    # ...
)

# Access in subsequent calls via session.state["analysis_result"]
```

**Check for:**
- [ ] Use `output_key` for persisting agent outputs
- [ ] Access previous state via `session.state[key]`

### 3.3 Centralized Configuration
```python
# ❌ Bad - scattered os.getenv() calls
import os
api_key = os.getenv("GOOGLE_API_KEY")

# ✅ Good - use centralized config
from config import settings

api_key = settings.google_api_key
```

**Check for:**
- [ ] Use centralized config module over direct `os.getenv()`
- [ ] Secrets loaded from config, not hardcoded

---

## 4. Drizzle ORM

### 4.1 Type-Safe Operators (No Raw SQL)
```typescript
// ❌ Bad - SQL injection risk
sql`${column} = ANY(${array})`;
where: sql`user_id = ${userId}`;

// ✅ Good - Type-safe operators
import { eq, inArray, and, or, isNull, like, between } from 'drizzle-orm';
where: eq(users.id, userId);
where: inArray(posts.status, ['draft', 'published']);
```

**Available operators:** `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `inArray`, `notInArray`, `and`, `or`, `isNull`, `isNotNull`, `like`, `ilike`, `between`

### 4.2 Proper Transaction Usage
```typescript
// ✅ Good - atomic operations
await db.transaction(async (tx) => {
  await tx.insert(orders).values(orderData);
  await tx.update(inventory).set({ quantity: sql`quantity - 1` });
});
```

### 4.3 Select Only Needed Columns
```typescript
// ❌ Bad - fetching everything
const users = await db.select().from(usersTable);

// ✅ Good - specific columns
const users = await db.select({
  id: usersTable.id,
  email: usersTable.email,
}).from(usersTable);
```

---

## 5. Next.js 15 Patterns

### 5.1 Async Params/SearchParams
```typescript
// ✅ Server Components - await the promises
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { query } = await searchParams;
}

// ✅ Client Components - use React's use() hook
'use client';
import { use } from 'react';

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
}
```

### 5.2 revalidatePath with Dynamic Routes
```typescript
// Static paths - type parameter optional
revalidatePath('/dashboard');

// ❌ Bad - dynamic route missing type parameter
revalidatePath('/agents/[agentId]');

// ✅ Good - dynamic routes MUST include type parameter
revalidatePath('/agents/[agentId]', 'page');
revalidatePath('/api/agents', 'layout');
```

### 5.3 No Async Client Components
```typescript
// ❌ Bad - async client component
'use client';
export default async function Component() { // ERROR
  const data = await fetchData();
}

// ✅ Good - use hooks for data fetching
'use client';
import { useEffect, useState } from 'react';

export default function Component() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData().then(setData);
  }, []);
}
```

---

## 6. Server/Client Separation

### 6.1 File Naming Convention (apps/web/)
```
apps/web/lib/
├── storage-client.ts    # Client-safe: constants, types, pure functions
├── storage.ts           # Server-only: DB access, can re-export from -client
├── auth-client.ts       # Client-safe auth utilities
└── auth.ts              # Server-only auth (createClient, etc.)
```

### 6.2 No Mixed Imports
```typescript
// ❌ Bad - mixed concerns in one file
// apps/web/lib/utils.ts
import { createClient } from '@/lib/supabase/server';  // Server-only
export const MAX_SIZE = 10 * 1024 * 1024;              // Client-safe

// ✅ Good - separate files
// apps/web/lib/utils-client.ts
export const MAX_SIZE = 10 * 1024 * 1024;

// apps/web/lib/utils.ts
import { createClient } from '@/lib/supabase/server';
export { MAX_SIZE } from './utils-client';
```

### 6.3 Server-Only Imports Check
```typescript
// These imports are SERVER-ONLY - never import in 'use client' files:
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/drizzle';
import { headers, cookies } from 'next/headers';
```

---

## 7. Security

### 7.1 Authentication on Protected Routes
```typescript
// ✅ Every protected API route must check auth
export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... rest of handler
}
```

### 7.2 Public Routes Configuration
Public routes are configured in `apps/web/lib/supabase/middleware.ts`:

```typescript
// apps/web/lib/supabase/middleware.ts
const publicRoutes = ["/", "/cookies", "/privacy", "/terms"];
const publicPatterns = ["/auth"];

const isPublicRoute =
  publicRoutes.includes(request.nextUrl.pathname) ||
  publicPatterns.some((pattern) =>
    request.nextUrl.pathname.startsWith(pattern)
  );
```

**When adding new public routes:**
- [ ] Add exact paths to `publicRoutes` array
- [ ] Add prefix patterns to `publicPatterns` array
- [ ] Webhooks are auto-skipped: `/api/webhooks/*`

### 7.3 Input Validation
```typescript
// ✅ Validate all user input
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const result = CreatePostSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  // Use result.data - it's typed!
}
```

### 7.4 No Secrets in Client Code
```typescript
// ❌ Bad - exposing secrets
const apiKey = process.env.STRIPE_SECRET_KEY; // In client component

// ✅ Good - only NEXT_PUBLIC_ vars in client
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
```

---

## 8. Error Handling

### 8.1 Consistent Error Responses
```typescript
// ✅ Standard error response format
return Response.json(
  { error: 'Resource not found' },
  { status: 404 }
);

// ✅ With details for validation errors
return Response.json(
  { error: 'Validation failed', details: result.error.issues },
  { status: 400 }
);
```

### 8.2 Try-Catch for External Calls
```typescript
// ✅ Wrap external API calls
try {
  const response = await stripe.customers.create({ email });
  return Response.json({ customerId: response.id });
} catch (error) {
  console.error('Stripe error:', error);
  return Response.json(
    { error: 'Payment service unavailable' },
    { status: 503 }
  );
}
```

### 8.3 Database Error Handling
```typescript
// ✅ Handle database errors gracefully
try {
  await db.insert(users).values(userData);
} catch (error) {
  if (error.code === '23505') { // Unique violation
    return Response.json({ error: 'Email already exists' }, { status: 409 });
  }
  console.error('Database error:', error);
  return Response.json({ error: 'Database error' }, { status: 500 });
}
```

---

## 9. Server Actions

### 9.1 Proper Server Action Structure
```typescript
// ✅ Server action with auth check (in apps/web/app/actions/)
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;

  // Validate input
  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters' };
  }

  // Perform action
  await db.update(profiles)
    .set({ name, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  revalidatePath('/profile', 'page');
  return {};
}
```

### 9.2 Return Types for Actions
```typescript
// ✅ Define clear return types
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createPost(data: CreatePostInput): Promise<ActionResult<{ id: string }>> {
  // ...
  return { success: true, data: { id: post.id } };
}
```

---

## 10. Code Quality

### 10.1 No TODO/FIXME in Production Code
```bash
# Check for leftover TODOs
grep -r "TODO\|FIXME\|XXX\|HACK" --include="*.ts" --include="*.tsx" --include="*.py" <changed-files>
```

### 10.2 No Console Statements (Except Error Logging)
```typescript
// ❌ Bad - debug logging
console.log('user:', user);

// ✅ OK - error logging
console.error('Failed to process payment:', error);
```

### 10.3 No Commented-Out Code
```typescript
// ❌ Bad - dead code
// const oldImplementation = () => { ... };

// ✅ Good - remove it entirely, git has history
```

### 10.4 Consistent Naming
- **Files:** kebab-case (`user-profile.tsx`)
- **Components:** PascalCase (`UserProfile`)
- **Functions:** camelCase (`getUserProfile`)
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces:** PascalCase (`UserProfile`, `CreateUserInput`)
- **Python:** snake_case for functions/variables (`get_agent_config`)

---

## 11. Testing Checklist

### 11.1 Manual Testing
- [ ] Happy path works as expected
- [ ] Error states handled gracefully
- [ ] Loading states display correctly
- [ ] Auth redirects work properly
- [ ] ADK agent responds correctly

### 11.2 Edge Cases
- [ ] Empty states handled
- [ ] Invalid input rejected
- [ ] Unauthorized access blocked
- [ ] Network errors handled
- [ ] Agent timeouts handled

### 11.3 Type Checking
```bash
# TypeScript (run from apps/web/)
npm run typecheck
# or
npx tsc --noEmit

# Python (run from apps/competitor-analysis-agent/)
mypy .
# or
pyright .
```

---

## 12. Final Verification

Before marking complete, verify:

**TypeScript (apps/web/):**
- [ ] `npm run typecheck` passes (or `npx tsc --noEmit`)
- [ ] `npm run lint` passes
- [ ] No `any` types introduced
- [ ] All functions have explicit return types
- [ ] Server/client separation maintained
- [ ] Auth checks on all protected routes
- [ ] Input validation on all user input
- [ ] Error handling is consistent
- [ ] No debug console.logs left behind
- [ ] revalidatePath includes type parameter for dynamic routes

**Python (apps/competitor-analysis-agent/):**
- [ ] No `Any` types introduced
- [ ] All functions have explicit return type annotations (including `-> None`)
- [ ] Modern type syntax used (`dict`, `list`, `|` for unions)
- [ ] Agent exports `root_agent` variable
- [ ] Uses centralized config over `os.getenv()`

---

## Quick Reference: Common Mistakes

| Mistake | Fix |
|---------|-----|
| `any` type (TS) | Use specific type or generic |
| `Any` type (Python) | Use specific ADK types or `object` |
| Missing return type | Add explicit `: ReturnType` or `-> Type` |
| Raw SQL in Drizzle | Use `eq`, `inArray`, etc. |
| Async client component | Use `useEffect` + `useState` |
| Missing auth check | Add `getUser()` check first |
| `revalidatePath('/path/[id]')` | `revalidatePath('/path/[id]', 'page')` |
| Server import in client | Create `-client.ts` file |
| `console.log` debugging | Remove or change to `console.error` |
| `Optional[str]` (Python) | Use `str \| None` |
| `Dict[str, int]` (Python) | Use `dict[str, int]` |
| Missing `root_agent` | Export agent as `root_agent` variable |
| Scattered `os.getenv()` | Use centralized config module |
