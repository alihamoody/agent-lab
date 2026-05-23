# ts-agent-lab — Your Learning Guide

> This file is for you, not Cursor. It has the full learning path,
> provider cheat sheet, reading links, and week-by-week context.
> Keep it open alongside the code.

**Repo folder:** `agent-lab/` on disk · **All code:** `src/` · **Commands:** run from repo root.

---

## The mental model (read this first)

Every agentic app — no matter the framework — is the same loop:

```
1. LLM receives your message
2. LLM returns either:
   a) a final text answer  →  done
   b) a tool call (name + args)  →  your code runs the function
3. You send the result back to the LLM
4. Go to step 2
```

That's it. LangGraph, AI SDK, CrewAI — they're all just this loop
with different amounts of scaffolding around it. Week 0 shows you
the raw JSON before any scaffolding. Everything else follows from that.

---

## Providers — plain English

**Provider = who hosts the API. Model = which brain you pick on that provider.**

### Groq (your default)
- What: Hosted API, extremely fast inference
- Models available: Llama 3.3 70B, Llama 3.1 8B, Mixtral, and others
- Cost: Free tier, no credit card
- Why you use it: One key, OpenAI-compatible URL, fast enough that
  agent loops don't feel painful while learning
- Sign up: https://console.groq.com
- Rate limits: Check your console — varies by model.
  `llama-3.1-8b-instant` has the highest daily cap on free tier.
  `llama-3.3-70b-versatile` is stronger but lower daily cap.

### Google AI Studio / Gemini
- What: Google's models via API key
- Models: Gemini Flash family (fast + free), Pro (stronger, limited)
- Cost: Free tier on Flash — check current limits in AI Studio
- Why you use it: Best official function-calling docs and codelabs,
  good for following Google's own tutorials in parallel
- Sign up: https://aistudio.google.com
- Note: Model IDs change as Google releases versions. Always check
  your AI Studio project for the current free Flash id.

### Ollama (local fallback)
- What: Software on your Mac that runs models locally — no cloud
- Cost: $0 usage. You pay in RAM and time.
- Why you use it: Unlimited retries when Groq rate-limits you.
  Same tool code works — just swap the model string.
- Install: https://ollama.com
- Then run: `ollama pull llama3.2:3b` (small, fast, fits most Macs)
- For code/tool tasks: `ollama pull qwen2.5-coder:7b` (better reasoning)

### Qwen (not a fourth provider)
- Qwen is a model family (made by Alibaba), not a provider
- You access it through Groq, Ollama, or OpenRouter
- Worth using for: code-heavy tools and reasoning tasks
- As Groq model: check their current catalog for `qwen` listings
- As Ollama model: `ollama pull qwen2.5-coder:7b`

### OpenRouter (optional backup)
- What: One API key, access to dozens of models
- Free models: append `:free` to model names, or use `openrouter/free`
- Limits: ~20 RPM, ~50 req/day on free models (increases after $10 credit)
- Use when: Groq and Gemini both rate-limit you and you're not near Ollama
- Sign up: https://openrouter.ai
- Free models list: https://openrouter.ai/models?max_price=0

**Simple decision:**
| Situation | Use |
|-----------|-----|
| Default cloud dev | Groq |
| Following Google's codelabs | Gemini |
| Hit rate limits / working offline | Ollama |
| Want model variety without multiple accounts | OpenRouter |

---

## Before you write a single line of code

### Get your keys (30 min total, do this now)

1. **Groq** → https://console.groq.com — email only, no card, key in 2 min
2. **Google AI Studio** → https://aistudio.google.com — Google account, get API key
3. **Tavily** → https://tavily.com — free tier, ~1000 searches/month (for week 2)
4. **Install Ollama** → https://ollama.com — then run:
   ```bash
   ollama pull llama3.2:3b        # small + fast, your default local model
   ollama pull qwen2.5-coder:7b  # better for tool/code tasks (optional)
   ```

### One read before week 0 (1–2 hours)

**Gemini function calling docs** → https://ai.google.dev/gemini-api/docs/function-calling

Read this even though you're using Groq. Google's version is the clearest
visual explanation of the tool loop that exists. You'll see exactly what
JSON flows back and forth. Once you understand it here, every framework
makes sense immediately.

---

## Week 0 — Raw API (2–3 hours)

**Goal:** See the raw `tool_calls` JSON that every framework hides from you.

**You are NOT building anything this week.** You are reading output.

### What to do
1. Run `npm run w0:groq`
2. Read the full JSON response in your terminal
3. Find `choices[0].message.tool_calls` in the output
4. Understand: that object is the model saying "I want to call this function
   with these arguments." Your code is supposed to run it and send the result back.
5. Run `npm run w0:ollama` — same thing, local model, no internet
6. Notice the response shape is identical. That's why every framework is
   swappable — they all speak the same JSON format.

**If you hit rate limits on week 0:** switch model string in `src/week-00-raw-api/groq-raw.ts`
from `llama-3.3-70b-versatile` to `llama-3.1-8b-instant` — higher daily cap.

### Key insight from week 0
The SDK is not magic. It's a loop that:
- Sends your message to the API
- Checks if the response has `tool_calls`
- If yes: runs your function, appends the result, calls the API again
- If no: returns the text to you

That's weeks 1–4 in one sentence.

---

## Week 1 — Tool Loop with AI SDK 6 (one day)

**Goal:** LLM decides when to call tools. Loop runs automatically.

### What you build
CLI agent: ask it a question → it decides whether to call
`get_weather(city)` or `calculate(expression)` → returns the answer.

### Key things to learn this week
- **Zod tool schemas** — `inputSchema` on each `tool()`
- **`stopWhen: stepCountIs(n)`** — cap the loop (prevents runaway tool calls)
- **`steps` array** — log `toolCalls` / `toolResults` after `generateText` returns
- **The model picks the tool** — you don't route it; the LLM reads descriptions and decides

### Stretch goal (after it works)
Refactor `agent.ts` to use `ToolLoopAgent` instead of `generateText`.
Compare them. The behaviour is identical — `ToolLoopAgent` is just a
named class wrapping the same loop. Seeing both makes frameworks
less mysterious.

### Provider swap reminder
If Groq rate-limits you mid-session, swap two lines and keep going:
```typescript
// Ollama swap — no rate limits
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
});
const model = ollama("llama3.2:3b");
```

---

## Week 2 — Research Agent (one day)

**Goal:** Agent searches the web, composes an answer, cites sources.

### What you build
Ask it a question → it searches 2–3 times with different queries →
synthesises results → answers with URLs cited.

### Key things to learn this week
- **Multi-step search** — why one search is often not enough
- **System prompt discipline** — telling the model it MUST search
  and MUST cite, not just when it feels like it
- **Tool result size** — search returns a lot of text; you'll need to
  decide how much context to pass back (the `slice(0, 300)` in `search.ts`)

### Tavily vs DuckDuckGo
The `search.ts` tool auto-detects which to use based on your `.env`:
- **Tavily** (if `TAVILY_API_KEY` set): richer results, proper scraping
- **DuckDuckGo** (fallback, no key): instant answers only — less reliable
  but zero setup. Fine for week 2 experimentation.

Tavily free tier: https://tavily.com — worth getting, ~1000 searches/month is plenty.

---

## Week 3 — LangGraph StateGraph (2 days)

**Goal:** Build an explicit graph where each step is a named node.

### What you build
Give it a GitHub repo URL →
- Node 1: fetches the README
- Node 2: summarises it
- Node 3: suggests 3 improvements
- Optional: wrap it in a Hono POST `/analyze` endpoint

### Why LangGraph after 2 weeks of AI SDK
By week 3 you've felt the limits of a linear tool loop:
- What if step 2 depends on the outcome of step 1?
- What if you want to skip step 3 if step 1 fails?
- What if a human needs to approve something before continuing?

LangGraph answers all of these with explicit nodes and conditional edges.
The graph is visible in your code — you can read it like a flowchart.

### Key things to learn this week
- **`Annotation.Root`** — how LangGraph TS defines state
- **Conditional edges** — `routeAfterFetch` in the code routes to `END`
  if the README fetch failed, skipping summarise/suggest
- **`graph.compile()`** — the compiled app is just a function you call
- **Why graphs matter for portfolios** — this pattern is what production
  agentic pipelines actually look like (orchestration, not just loops)

### Important: LangGraph version
The spec pins `^1.2.0`. LangGraph.js moved from `0.x` to `1.x` in 2025
with API changes. If you see import errors after `npm install`, check:
https://langchain-ai.github.io/langgraphjs/ for the current JS API.

### Week 3 stretch — Multi-agent (the pattern you were thinking of)

After the README graph works, run:

```bash
npm run w3:multi
npm run w3:multi "Your topic here"
```

This is the **researcher → writer → critic** loop:

| Role | Node | Job |
|------|------|-----|
| **Researcher** | `research` | Bullet facts and angles only |
| **Writer** | `write` | Short draft from notes |
| **Critic** | `critique` | `APPROVE` or `REVISE` (one revision max) |

**What people often add as a fourth role:** a **planner** node before research
that turns a vague goal into an outline. Same graph machinery — one more node
at the start.

Other names you might see in tutorials: **editor** (like critic), **reviewer**,
**orchestrator** (picks which sub-agent runs next). Same idea: specialize + route.

Folder: `src/week-03-stretch-multi-agent/`

---

## Week 4 — Capstone UI (2 days)

**Goal:** A real streaming chat UI that shows tool steps as they happen.

### What you build
Vite + React (`src/week-04-capstone/client/`) → Hono SSE (`src/week-04-capstone/server/`) → same research tools as week 2.

### Two terminals to run
```bash
npm run w4:server   # Hono on :3001
npm run w4:ui       # Vite on :5173
```

`vite.config.ts` proxies `/chat` → `:3001` (no CORS pain).

### Repo layout (work-style)
All code lives under **`src/`** — weeks are folders inside it, same as many TS codebases. There is **no `dist/`** for weeks 0–3 (`tsx` runs source directly). Week 4 uses Vite dev server (no separate compile step unless you `vite build` for deploy).

### Key things to learn this week
- **SSE** — server pushes events; browser reads the stream
- **Manual stream parsing** in `client/App.tsx` — then compare to `useChat`
- **Split `client/` + `server/`** — mirrors how you'd deploy API and UI separately

### After Vite works
Run the **Next stretch** (`npm run w4:next`) — `useChat` is already wired there. Compare both UIs.

---

## Week 4: Vite + Hono vs Next.js (pros & cons)

This lab uses **Vite + React + separate Hono server** on purpose. You already know TS; Next.js is optional for the capstone.

### Current stack (Vite + Hono) — what you have

| Pros | Cons |
|------|------|
| **Two clear boxes** — UI vs API; easy to understand SSE and agents | Two processes in dev (`w4:server` + `w4:ui`) |
| **Minimal magic** — you see fetch, stream parsing, proxy | No built-in API routes; you wire Hono yourself |
| **Fast Vite HMR** — instant UI feedback | Production = deploy two artifacts (or merge later) |
| **Matches weeks 1–3** — same `generateText` in a plain Node server | Less “batteries included” than Next |
| **Great for learning** the agent loop before framework routing | Not the default pattern on many job postings |

**Best when:** You want to *see* streaming and tool events without Next.js routing abstractions.

### Next.js (App Router + Route Handler or AI SDK)

| Pros | Cons |
|------|------|
| **One app** — `app/api/chat/route.ts` + `app/page.tsx` | Steeper curve: RSC, caching, file-based routing |
| **`useChat` + AI SDK** docs often assume Next | Easy to fight the framework if you don’t need SSR |
| **Single deploy** on Vercel — strong portfolio signal | Dev cold start / bundling heavier than Vite-only |
| **Familiar at work** if your team uses Next | Free tier still needs Groq/Gemini keys — Next doesn’t replace LLM cost |
| **SSR/SEO** if you add marketing pages around the demo | Overkill for a local CLI-heavy learning lab |

**Best when:** You want one deployed URL, your day job is Next, or you’re showcasing “full-stack TS on Vercel.”

### Practical recommendation

1. **Finish week 4 Vite + Hono** — learn SSE and manual stream parsing.  
2. **Then week 4 Next stretch** — `src/week-04-stretch-next/` (`npm run w4:next`), same agent via Route Handler + `useChat`.  
3. **Do not start the lab on Next** — do weeks 0–3 first.

**Rule of thumb:** Vite = teach the loop. Next = teach the deploy and SDK integration pattern you’ll see at work.

### Week 4 stretch — Next.js (built for you)

After the Vite capstone works, run:

```bash
npm run w4:next
```

Open http://localhost:3002

| File (under `src/week-04-stretch-next/`) | Concept |
|------|---------|
| `app/api/chat/route.ts` | **Route Handler** — `streamText` + tools |
| `app/page.tsx` | **Server Component** shell |
| `components/Chat.tsx` | **Client Component** + `useChat` |
| `app/layout.tsx` | Root layout, metadata |
| `next.config.mjs` | Loads `agent-lab/.env` from repo root |

Shared tools: `src/lib/agent-tools.ts` (re-exports week 1–2 tools).

**Compare:** `src/week-04-capstone/server/index.ts` (manual SSE) vs `src/week-04-stretch-next/app/api/chat/route.ts` (`toUIMessageStreamResponse`).

Optional deploy: `npm run w4:next:build` → Vercel with project root `src/week-04-stretch-next`.

**Order:** Do Vite capstone first (`w4:server` + `w4:ui`), then `w4:next` and compare the two `chat` implementations.

---

## Useful links (bookmark these)

### Core docs
| Resource | URL |
|----------|-----|
| AI SDK 6 — Agents | https://ai-sdk.dev/docs/agents/building-agents |
| AI SDK 6 — Tools | https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling |
| LangGraph JS docs | https://langchain-ai.github.io/langgraphjs/ |
| LangGraph JS intro tutorial | https://langchain-ai.github.io/langgraphjs/tutorials/introduction/ |
| Groq quickstart | https://console.groq.com/docs/quickstart |
| Groq rate limits | https://console.groq.com/docs/rate-limits |
| Gemini function calling | https://ai.google.dev/gemini-api/docs/function-calling |
| Gemini function calling codelab | https://codelabs.developers.google.com/codelabs/gemini-function-calling |
| OpenRouter free models | https://openrouter.ai/models?max_price=0 |

### Good tutorials (free, TS-friendly)
| Tutorial | What it covers |
|----------|----------------|
| [MarkTechPost — LangGraph + Groq beginner](https://www.marktechpost.com) | Step-by-step: chatbot → tools → web search |
| [HuggingFace Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction) | Free structured course on agents (Python but concepts transfer) |
| [Anthropic — Building effective agents](https://anthropic.com/engineering/building-effective-agents) | Patterns and mental models, language-agnostic, still current |

### When you're ready to deploy (free tiers)
| Platform | Notes |
|----------|-------|
| Railway | `railway up` — free tier, good for Hono servers |
| Fly.io | `fly deploy` — generous free tier |
| Vercel | Best for **week 4 Next stretch** (`src/week-04-stretch-next`) |
| Railway / Fly | Good for **week 4 Hono** server or week 3 API |

---

## Rate limit survival guide

**When you hit a 429:**

1. First: switch `llama-3.3-70b-versatile` → `llama-3.1-8b-instant` in Groq
   (higher daily cap on free tier)
2. Still hitting limits: swap to Ollama (no limits, same code)
3. Need cloud + more quota: try Gemini Flash free tier
4. Use `withRetry` from `src/lib/with-retry.ts` around `generateText` (weeks 1–2 and capstone servers already do)

**Log token usage (optional):**
```typescript
const { usage } = await generateText({ /* ... */ });
console.log("[usage]", usage);
```

---

## Portfolio exit checklist

Before calling the lab done:

- [ ] `ts-agent-lab` repo is public on GitHub
- [ ] `.env.example` committed, `.env` is in `.gitignore`
- [ ] Root `README.md` has: what the project is, architecture mermaid diagram,
      "Cost: $0 on Groq free tier + Ollama fallback"
- [ ] Each `src/week-*/README.md` has: what it does, how to run, what you learned
- [ ] `LIMITS.md` filled in with real 429 experiences
- [ ] 2–3 min screen recording — tool steps streaming (Vite or Next UI)
- [ ] Live URL: Vercel for Next stretch, or Railway/Fly for Hono API

The screen recording is the most important portfolio item.
Recruiters watch 30 seconds of it and move on — make sure tool steps
are visible streaming in real time before the final answer appears.
