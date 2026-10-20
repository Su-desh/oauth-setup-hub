<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — OAuth Setup Hub

Welcome to the **OAuth Setup Hub** codebase. This repository provides AI agent builders using **Composio** with real-time intelligence, structured guides, and autonomous web research to register, configure, and secure third-party provider OAuth applications.

---

## 1. Project Mission & Context

When developers build AI agents on Composio, they begin with **Composio-Managed OAuth** (instant, pre-configured, Composio-branded). When moving to production, developers must switch to their **own Provider OAuth App** to control branding, data scopes, and rate limits.

This transition is fraught with friction:
- **Approval Discrepancy:** GitHub takes ~15 minutes with no review, while Salesforce AppExchange requires 4–12 weeks of automated penetration testing and CASA audits for restricted Google scopes.
- **Hidden Prerequisites:** Verified domains in Google Search Console, YouTube demo videos, 10 active Slack workspace installs, etc.
- **Division of Responsibility:** Clarifying what an AI agent can execute vs. where the human developer must intervene.

---

## 2. Technical Architecture & Tech Stack

```
oauth-setup-hub/
├── app/
│   ├── layout.tsx              # Root layout with responsive header & Composio badge
│   ├── page.tsx                # Interactive library catalog (force-dynamic)
│   ├── generate/page.tsx       # Live investigation studio with real-time SSE stream
│   ├── guide/[id]/page.tsx     # Static (SSG) + dynamic fallback guide permalinks
│   └── api/
│       ├── generate/route.ts   # Edge/Node Server-Sent Events (SSE) agent pipeline
│       └── guides/route.ts     # JSON endpoint returning all library guides
├── components/
│   ├── GuideLibrary.tsx        # Client search, difficulty filters & review toggles ("use client")
│   ├── GuideCard.tsx           # Summary card view with badges & time estimates ("use client")
│   ├── GuideDetail.tsx         # Comprehensive guide view with evidence & blockers ("use client")
│   ├── GenerateForm.tsx        # SSE streaming client with real-time step ticker ("use client")
│   └── CopyLinkButton.tsx      # Permalink copy utility ("use client")
├── data/guides/                # Pre-researched, committed JSON guide dataset
├── lib/
│   ├── types.ts                # TypeScript interfaces (Guide, GuideStep, Evidence, etc.)
│   ├── agent.ts                # Autonomous research agent (OpenAI tools + Tavily)
│   ├── prompts.ts              # System prompts & JSON schema skeletons
│   ├── guides.ts               # Hybrid storage (data/guides + /tmp + in-memory fallback)
│   └── utils.ts                # Tailwind class merging & badge styling maps
└── README.md                   # Product decisions, rubric mapping & setup instructions
```

* **Framework:** Next.js 16 (App Router) with React 19 and Tailwind CSS v4.
* **LLM Engine:** OpenAI **`gpt-5.6-terra`** (Terra capability tier) with native function calling.
* **Search Engine:** Tavily Search API (`@tavily/core`).
* **Streaming Protocol:** HTTP Server-Sent Events (`text/event-stream`).

---

## 3. Agent Operating Rules & Invariants

When working in or extending this codebase, any agent must uphold these invariants:

### A. Model & Reasoning Configuration
* The primary model is **`gpt-5.6-terra`**.
* When calling `/v1/chat/completions` on `gpt-5.6-terra` with function tools, **always pass `reasoning_effort: 'none'`** to prevent API validation errors.
* OpenAI client requests must have a generous timeout (`timeout: 90000`) to prevent premature aborts on complex investigations.

### B. Tool Execution & Performance
* Tool definitions are defined in `lib/agent.ts`:
  1. `web_search`: Executes search queries via Tavily (`searchDepth: 'basic'`, `maxResults: 4`).
  2. `fetch_url`: Extracts clean markdown/text content from developer portals.
* **Parallel Execution:** When the model emits multiple tool calls in a turn, **always execute them concurrently with `Promise.all`**. Sequential execution introduces prohibitive latency (>30s) and degrades the streaming user experience.

### C. Data Integrity & Schema Sanitization
* All generated guides must match the `Guide` interface in `lib/types.ts`.
* Raw model outputs can occasionally vary in structure. The `sanitizeGuide()` pipeline in `lib/agent.ts` enforces:
  - Form fields must be strings (`fields: string[]`), converting any raw objects into readable labels.
  - `timeline.total` must always be calculated if omitted.
  - Evidence arrays must be normalized into the `{ sources, agent_navigated_urls, confidence, caveats, tested_notes }` object structure.
  - All common blockers must follow `{ blocker: string, how_to_resolve: string }`.

### D. Serverless & Filesystem Resiliency
* On local environments, guides are persisted to disk at `data/guides/[id].json`.
* On serverless runtimes (such as Vercel), the root filesystem is read-only.
* `lib/guides.ts` implements a **triple-layer fallback**:
  1. `memoryGuides` (in-memory Map for instant intra-instance availability).
  2. `data/guides/*.json` (pre-baked immutable guides).
  3. `/tmp/oauth-guides/*.json` (writable scratch space).
* Never assume synchronous writes to `process.cwd()` will succeed in production.

### E. Component Boundaries & Hydration
* Components containing interactive event handlers (`onClick`, `onChange`, `onError` on images) must be designated as Client Components via `"use client";` at the top of the file.
* Server Components (`app/page.tsx`, `app/guide/[id]/page.tsx`) must never pass inline arrow functions as props to Client Components.

---

## 4. Division of Responsibility Guidelines

Every guide generated must strictly adhere to the **Human vs. Agent division of responsibility**:

| Capability | Agent Can Do? | Notes |
|---|:---:|---|
| **Research Scopes & Limits** | ✅ Yes | Query docs, identify required scopes, verify rate limits |
| **Navigate Developer Portals** | ✅ Yes | Read portal structure, identify registration form inputs |
| **Draft Scope Justifications** | ✅ Yes | Write descriptions, justification text, and video scripts |
| **Recommend Minimal Scopes** | ✅ Yes | Help developer request only needed permissions to pass review |
| **Log into Developer Account** | ❌ No | Human developer must authenticate with credentials/2FA |
| **Verify Domain in Search Console**| ❌ No | Requires access to DNS records or hosting roots |
| **Submit Marketplace Application** | ❌ No | Requires legal acknowledgment, agreements, and human sign-off |
| **Pay Security Assessment Fees** | ❌ No | CASA audits ($75–$300+) and AppExchange fees ($2,550) require corporate billing |

---

## 5. Development & Verification Commands

```bash
# Run local dev server with Turbopack
npm run dev

# Run TypeScript typecheck without emitting
npm run typecheck

# Execute production Next.js build
npm run build

# Start production server
npm run start
```

---

## 6. Secrets & Environment Hygiene

* Secrets are stored in `.env.local` (`OPENAI_API_KEY`, `TAVILY_API_KEY`).
* **NEVER commit `.env.local`** or raw API keys to Git.
* `.gitignore` explicitly ignores `.env*.local` and includes an allowlist exception for `.env.local.example`.
