# OAuth Setup Hub

> Agent-researched OAuth setup guides for AI agent builders using Composio.

**Live demo:** [Deploy URL — add after Vercel deploy]  
**Submission for:** Composio APM Integrations Take-home

---

## What it does

When you build an AI agent with Composio, you start with Composio's managed OAuth (zero setup, Composio's branding). When you ship to production, you need **your own OAuth app** with the provider — your company name on the consent screen, your scopes, your rate limits.

That transition is opaque. OAuth setup complexity varies wildly: GitHub takes 15 minutes, Google can take 4 weeks, Salesforce AppExchange can take 3 months. Developers piece together docs, email providers, and discover blockers late.

**OAuth Setup Hub** solves this with:

1. **Guide library** — pre-researched, agent-verified setup guides for 6 apps across the full difficulty spectrum
2. **Live generation** — submit any app name or URL, watch an agent investigate in real time, get a shareable guide
3. **Evidence layer** — every claim is tagged with source, confidence level, and what the agent tested vs. inferred

---

## Setup

### Prerequisites
- Node.js 18+
- OpenAI API key (`gpt-5.6-terra`)
- Tavily API key (free tier: [tavily.com](https://tavily.com))

### Install

```bash
git clone <your-repo-url>
cd oauth-setup-hub
npm install
```

### Environment

```bash
cp .env.local.example .env.local
# Edit .env.local and add your keys:
# OPENAI_API_KEY=sk-...
# TAVILY_API_KEY=tvly-...
```

### Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### Deploy to Vercel

```bash
npx vercel
# Set OPENAI_API_KEY and TAVILY_API_KEY in Vercel environment variables
```

---

## Key product decisions

### Why a web app (not a CLI or doc site)?
Guides need to be **shareable** — a developer should be able to send a link to their PM, co-founder, or provider contact. A URL beats a terminal session.

### Why these 6 apps?
Selected to span the full difficulty spectrum:

| App | Difficulty | Why included |
|---|---|---|
| GitHub | Easy | The "easy" baseline — instant, no review |
| Notion | Medium | Light review process, internal vs. public distinction |
| Slack | Hard | 10-workspace requirement, strict scope audit |
| Google (Gmail) | Hard | OAuth verification, CASA audit for restricted scopes |
| Twitter/X | Complex | Unpredictable approval, paid tiers, policy volatility |
| Salesforce | Complex | Enterprise security review, 4-12 week wait |

### Why SSE streaming for live generation?
The assignment asked for "watch the agent generate live." SSE is the simplest implementation for Next.js — no WebSocket server needed, works on Vercel's edge runtime.

### Evidence & confidence layer
A key design choice: every guide has a `confidence` rating (High / Medium / Low) and a `tested_notes` field explaining what the agent actually did (navigated, read docs, cross-referenced) vs. what it inferred. This is how a developer knows whether to trust a claim.

### Agent capabilities section
Every guide explicitly states what the agent can and can't do:
- Can: Research requirements
- Can: Navigate and read developer portals
- Cannot: Fill forms (requires your account)
- Cannot: Submit approval requests

### Composio context on every guide
Each guide has a `composio_context` explaining exactly when and why a Composio developer would transition from managed OAuth to their own app. The guides aren't generic OAuth docs — they're written for this specific transition moment.

---

## Agent pipeline

```
User submits: "Linear" or "https://linear.app"
       |
1. POST /api/generate (SSE stream opens)
       |
2. Agent loop (OpenAI gpt-5.6-terra + tools):
   |- web_search: "[app] OAuth setup developer documentation"
   |- web_search: "[app] OAuth approval review requirements"
   |- fetch_url: developer portal page
   \- ... (up to 10 tool calls)
       |
3. Agent produces structured Guide JSON
       |
4. Guide saved to data/guides/ (auto-added to library)
       |
5. Rendered as full guide page
```

Tools available to the agent:
- `web_search` — Tavily search with advanced depth
- `fetch_url` — Tavily extract + fallback plain fetch

---

## What was tested

| App | What agent did | Confidence |
|---|---|---|
| GitHub | Navigated docs.github.com, confirmed form fields | High |
| Notion | Navigated developers.notion.com, confirmed public vs internal distinction | High |
| Google Gmail | Navigated Cloud Console docs, confirmed scope classification | High |
| Slack | Navigated api.slack.com, confirmed 10-workspace requirement | High |
| Twitter/X | Navigated developer.twitter.com, confirmed tier structure | Medium |
| Salesforce | Navigated Salesforce help docs, confirmed Connected App flow | High |

Twitter/X is rated Medium confidence because approval times are based on community reports — X does not publish official SLAs. All other guides are based on official documentation.

---

## Limitations

- **Agent cannot log in** to developer portals on your behalf — all form submissions are manual
- **Approval timelines are estimates** — providers don't always publish SLAs; times are based on docs and community reports
- **Twitter/X policies change frequently** — verify current tier pricing before starting
- **Google CASA audit costs vary** — check with an authorized lab for current pricing
- **Live-generated guides are auto-saved** to `data/guides/` — they persist across restarts but are not reviewed or curated

---

## What's next (if productionizing)

- Guide version control (track when requirements change)
- Community corrections ("flag this step as outdated")
- Scope recommender: "for this agent use case, you need these scopes"
- Integration with Composio dashboard: show guide link in integration setup flow
- Automated re-verification: agent re-checks guides monthly and flags outdated info
