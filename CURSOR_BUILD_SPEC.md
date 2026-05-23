# ts-agent-lab — Cursor Build Spec

> Hand this file to Cursor. It contains everything needed to scaffold and build
> the full project: folder structure, packages, code patterns, and week-by-week
> deliverables. Do not deviate from the stack unless a package is unavailable.

> **Repo root:** This lab lives in **`agent-lab/`** on disk (npm package name:
> `ts-agent-lab`). All paths below are relative to that folder.

---

## Project overview

A TypeScript agentic app learning lab: **four core weeks** (0–4) plus **optional
stretches** (multi-agent graph, Next.js UI). Each week lives under `src/`.
One root `package.json` and one `.env` at repo root. Portfolio-ready after week 4.

**Non-negotiables**
- TypeScript everywhere (no plain JS files)
- `tsx` for running `.ts` files directly — no compile step during development
- Groq as the default cloud LLM (free tier, no card)
- Ollama as the local fallback (same tool code, swap model string)
- `zod` for all tool input schemas
- No Python, no Jupyter notebooks

---

## Repo layout

```
agent-lab/
├── package.json
├── tsconfig.json
├── .env.example
├── .env
├── .gitignore
├── README.md
├── ME_README.md
├── LIMITS.md
├── src/                    # all application code (no root dist/)
│   ├── lib/
│   │   └── with-retry.ts
│   ├── week-00-raw-api/
│   │   ├── groq-raw.ts
│   │   ├── ollama-raw.ts
│   │   └── README.md
│   ├── week-01-tool-loop/
│   │   ├── agent.ts
│   │   ├── tools/
│   │   └── README.md
│   ├── week-02-research/
│   │   ├── agent.ts
│   │   ├── tools/search.ts
│   │   └── README.md
│   ├── week-03-graph/
│   │   ├── agent.ts
│   │   ├── server.ts
│   │   └── README.md
│   ├── week-03-stretch-multi-agent/
│   │   ├── agent.ts
│   │   └── README.md
│   ├── week-04-capstone/
│   │   ├── vite.config.ts
│   │   ├── client/
│   │   ├── server/
│   │   └── README.md
│   └── week-04-stretch-next/   # Stretch — Next.js App Router + useChat
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── api/chat/route.ts
│       ├── components/Chat.tsx
│       ├── next.config.mjs
│       └── README.md
```

---

## Root config files

### package.json

```json
{
  "name": "ts-agent-lab",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "w0:groq":    "npx tsx src/week-00-raw-api/groq-raw.ts",
    "w0:ollama":  "npx tsx src/week-00-raw-api/ollama-raw.ts",
    "w1":         "npx tsx src/week-01-tool-loop/agent.ts",
    "w2":         "npx tsx src/week-02-research/agent.ts",
    "w3:agent":   "npx tsx src/week-03-graph/agent.ts",
    "w3:server":  "npx tsx src/week-03-graph/server.ts",
    "w3:multi":   "npx tsx src/week-03-stretch-multi-agent/agent.ts",
    "w4:server":  "npx tsx src/week-04-capstone/server/index.ts",
    "w4:ui":      "vite --config src/week-04-capstone/vite.config.ts",
    "w4:next":    "cd src/week-04-stretch-next && next dev -p 3002",
    "w4:next:build": "cd src/week-04-stretch-next && next build"
  },
  "dependencies": {
    "ai":                       "^6.0.0",
    "@ai-sdk/groq":             "^3.0.0",
    "@ai-sdk/google":           "^3.0.0",
    "@ai-sdk/react":            "^3.0.0",
    "@ai-sdk/openai-compatible": "^0.2.0",
    "next":                     "^15.3.0",
    "@langchain/langgraph":     "^1.2.0",
    "@langchain/core":          "^1.1.0",
    "@langchain/groq":          "^0.2.0",
    "hono":                     "^4.0.0",
    "@hono/node-server":        "^1.0.0",
    "zod":                      "^3.23.0",
    "dotenv":                   "^16.0.0"
  },
  "devDependencies": {
    "tsx":           "^4.0.0",
    "typescript":    "^5.4.0",
    "@types/node":   "^20.0.0",
    "vite":          "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@types/react":  "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react":         "^18.0.0",
    "react-dom":     "^18.0.0"
  }
}
```

> **AI SDK 6 API (May 2026):** Use `inputSchema` (not `parameters`) on `tool()`, and
> `stopWhen: stepCountIs(n)` (not `maxSteps`) on `generateText`. Log steps via the returned
> `steps` array after the call completes.

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### .env.example

```
# Groq — free tier, no card: https://console.groq.com
GROQ_API_KEY=

# Google AI Studio — free tier: https://aistudio.google.com
GOOGLE_API_KEY=

# Tavily — free tier (~1k searches/mo): https://tavily.com
# Leave blank to use DuckDuckGo instead (no key needed)
TAVILY_API_KEY=

# Ollama — local, no key needed. Install: https://ollama.com
# Then run: ollama pull llama3.2:3b
OLLAMA_BASE_URL=http://localhost:11434
```

### .gitignore

```
.env
node_modules/
dist/
.next/
```

### .npmrc

```
legacy-peer-deps=true
```

Required for `npm install` — `@langchain/langgraph` and `@langchain/groq` peer-deps conflict otherwise.

---

## Week 0 — Raw API (no SDK)

**Goal:** See raw tool_calls JSON before any framework abstracts it away.
**Time:** 2–3 hours. No deliverable — just run and read the output.

> **Quota note:** `groq-raw.ts` uses `llama-3.3-70b-versatile` to show the best output.
> If you hit daily caps running it repeatedly, switch the model string to
> `llama-3.1-8b-instant` — it has a higher RPD on Groq's free tier and is
> fine for week 0 exploration.

### src/week-00-raw-api/groq-raw.ts

```typescript
/**
 * Week 0 — Raw Groq API call with tool calling.
 * No SDK. Just fetch. Read the raw JSON response.
 * Run: npm run w0:groq
 */
import "dotenv/config";

const GROQ_API_KEY = process.env.GROQ_API_KEY!;

const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
        },
        required: ["city"],
      },
    },
  },
];

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: "What is the weather in Toronto?" }],
    tools,
    tool_choice: "auto",
  }),
});

const data = await response.json();

// ← READ THIS OUTPUT. This is what every SDK is wrapping.
console.log("Full response:\n", JSON.stringify(data, null, 2));

const toolCall = data.choices[0].message.tool_calls?.[0];
if (toolCall) {
  console.log("\n✅ Model wants to call:", toolCall.function.name);
  console.log("   With args:", toolCall.function.arguments);
  console.log("\n👆 Your code would now execute that function and send");
  console.log("   the result back as a tool message. That's the whole loop.");
}
```

### src/week-00-raw-api/ollama-raw.ts

```typescript
/**
 * Week 0 — Same call against local Ollama.
 * Ollama uses the same OpenAI-compatible format.
 * Run: npm run w0:ollama  (requires: ollama run llama3.2:3b)
 */
import "dotenv/config";

const BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama3.2:3b",
    messages: [{ role: "user", content: "What is 42 * 17?" }],
  }),
});

const data = await response.json();
console.log("Ollama response:\n", JSON.stringify(data, null, 2));
```

---

## Week 1 — Tool Loop (AI SDK 6)

**Goal:** LLM decides when to call tools. You handle execution. Loop repeats
until no more tool calls. Learn: Zod `inputSchema`, `stopWhen: stepCountIs(n)`, `steps` logging.
**Run:** `npm run w1`

> **Implementation note:** Week 1 uses `generateText` + `stopWhen` — the AI SDK 6
> multi-step tool loop. `ToolLoopAgent` wraps the same mechanism. Stretch: refactor to
> `ToolLoopAgent` after week 1 works and compare.

### src/week-01-tool-loop/tools/weather.ts

```typescript
import { tool } from "ai";
import { z } from "zod";

// Fake implementation — swap for a real weather API later
export const weatherTool = tool({
  description: "Get the current weather for a city",
  inputSchema: z.object({
    city: z.string().describe("The city name, e.g. Toronto"),
  }),
  execute: async ({ city }) => {
    // Replace with: fetch(`https://wttr.in/${city}?format=j1`)
    const fakeData: Record<string, string> = {
      toronto:  "12°C, partly cloudy",
      london:   "8°C, rainy",
      tokyo:    "22°C, sunny",
    };
    return fakeData[city.toLowerCase()] ?? `No data for ${city}`;
  },
});
```

### src/week-01-tool-loop/tools/calculator.ts

```typescript
import { tool } from "ai";
import { z } from "zod";

export const calculatorTool = tool({
  description: "Evaluate a safe math expression and return the result",
  inputSchema: z.object({
    expression: z.string().describe("Math expression, e.g. '42 * 17 + 3'"),
  }),
  execute: async ({ expression }) => {
    try {
      // NOTE: In production use mathjs — eval is fine for a learning lab
      const result = Function(`"use strict"; return (${expression})`)();
      return String(result);
    } catch {
      return "Error: invalid expression";
    }
  },
});
```

### src/week-01-tool-loop/agent.ts

```typescript
/**
 * Week 1 — AI SDK 6 multi-step tool loop
 * Loops automatically: LLM → tool call → execute → back to LLM → repeat
 * Run: npm run w1
 */
import "dotenv/config";
import { generateText, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { weatherTool } from "./tools/weather.js";
import { calculatorTool } from "./tools/calculator.js";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const query = process.argv.slice(2).join(" ")
  || "What is the weather in Toronto and what is 42 multiplied by 17?";

console.log(`\n🔍 Query: ${query}\n${"─".repeat(60)}`);

const { text, steps } = await generateText({
  model: groq("llama-3.3-70b-versatile"),
  tools: { weather: weatherTool, calculator: calculatorTool },
  stopWhen: stepCountIs(5),
  system: `You are a helpful assistant. Use tools when needed.
           Always show your reasoning before calling a tool.`,
  prompt: query,
});

for (const step of steps) {
  for (const tc of step.toolCalls ?? []) {
    console.log(`[tool call]  ${tc.toolName}(${JSON.stringify(tc.input)})`);
  }
  for (const tr of step.toolResults ?? []) {
    console.log(`[tool result] ${tr.toolName} → ${JSON.stringify(tr.output)}`);
  }
}

console.log(`\n✅ Final answer:\n${text}`);
console.log(`\n📊 Total steps: ${steps.length}`);
```

---

## Week 2 — Research Agent

**Goal:** Agent searches the web, synthesises results, cites sources.
**Learn:** Multi-step loops, managing search results in context, citations.
**Run:** `npm run w2`

### src/week-02-research/tools/search.ts

```typescript
import { tool } from "ai";
import { z } from "zod";

/**
 * Web search tool — uses Tavily if TAVILY_API_KEY is set,
 * otherwise falls back to a DuckDuckGo instant-answer scrape.
 */
export const searchTool = tool({
  description:
    "Search the web for current information. Returns a list of results with title, url, and snippet.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const tavilyKey = process.env.TAVILY_API_KEY;

    if (tavilyKey) {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: 4,
          include_answer: false,
        }),
      });
      const data = await res.json();
      return data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 300),
      }));
    }

    // DuckDuckGo fallback (no key, instant answers only)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`;
    const res = await fetch(url, { headers: { "User-Agent": "ts-agent-lab/1.0" } });
    const data = await res.json();
    return [
      {
        title: data.Heading || query,
        url: data.AbstractURL || "https://duckduckgo.com",
        snippet: data.AbstractText || "No instant answer available — try Tavily for richer results.",
      },
    ];
  },
});
```

### src/week-02-research/agent.ts

```typescript
/**
 * Week 2 — Research agent with web search + citations
 * Run: npm run w2 "What are the latest AI agent frameworks in 2026?"
 */
import "dotenv/config";
import { generateText, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { searchTool } from "./tools/search.js";
import { calculatorTool } from "../week-01-tool-loop/tools/calculator.js";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const query = process.argv.slice(2).join(" ")
  || "What are the most popular open-source LLM agent frameworks right now?";

console.log(`\n🔍 Query: ${query}\n${"─".repeat(60)}`);

const { text, steps } = await generateText({
  model: groq("llama-3.3-70b-versatile"),
  tools: { search: searchTool, calculator: calculatorTool },
  stopWhen: stepCountIs(8),
  system: `You are a research assistant. ALWAYS search before answering.
           Search 2-3 times with different queries if needed.
           End every answer with a "Sources:" section listing the URLs you used.
           Never answer from memory alone on factual questions.`,
  prompt: query,
});

for (const step of steps) {
  for (const tc of step.toolCalls ?? []) {
    const input = tc.input as { query?: string };
    if (input.query) console.log(`[searching] "${input.query}"`);
  }
}

console.log(`\n✅ Answer:\n${text}`);
console.log(`\n📊 Steps taken: ${steps.length}`);
```

---

## Week 3 — Stateful Graph (LangGraph.js)

**Goal:** Explicit node → edge graph. Agent fetches a GitHub README,
summarises it, then suggests improvements. Optional Hono API server.
**Learn:** StateGraph, typed state, conditional edges, checkpointing.
**Run:** `npm run w3:agent` or `npm run w3:server`

### src/week-03-graph/agent.ts

```typescript
/**
 * Week 3 — LangGraph.js StateGraph
 * Graph: fetchReadme → summarize → suggest → END
 * Run: npm run w3:agent "https://github.com/vercel/ai"
 */
import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";

// ── State ─────────────────────────────────────────────────────────────────────
const GraphState = Annotation.Root({
  repoUrl:      Annotation<string>(),
  readmeText:   Annotation<string>({ default: () => "" }),
  summary:      Annotation<string>({ default: () => "" }),
  suggestions:  Annotation<string[]>({ default: () => [] }),
  error:        Annotation<string | null>({ default: () => null }),
});

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

// ── Node: fetch README ─────────────────────────────────────────────────────────
async function fetchReadme(state: typeof GraphState.State) {
  console.log("[node] fetchReadme");
  try {
    // Convert github.com URL → raw.githubusercontent.com
    const rawUrl = state.repoUrl
      .replace("github.com", "raw.githubusercontent.com")
      .replace(/\/?$/, "/refs/heads/main/README.md");

    const res = await fetch(rawUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return { readmeText: text.slice(0, 6000) };  // cap to avoid token overflow
  } catch (e: any) {
    return { error: `Failed to fetch README: ${e.message}` };
  }
}

// ── Node: summarise ────────────────────────────────────────────────────────────
async function summarize(state: typeof GraphState.State) {
  console.log("[node] summarize");
  const res = await llm.invoke([
    new SystemMessage("You are a concise technical writer."),
    new HumanMessage(
      `Summarise this README in 3-4 sentences. Focus on: what it does, who it's for, and main features.\n\n${state.readmeText}`
    ),
  ]);
  return { summary: res.content as string };
}

// ── Node: suggest improvements ────────────────────────────────────────────────
async function suggest(state: typeof GraphState.State) {
  console.log("[node] suggest");
  const res = await llm.invoke([
    new SystemMessage("You are a senior developer reviewing open-source documentation."),
    new HumanMessage(
      `Based on this README, list exactly 3 concrete improvement suggestions as a JSON array of strings. Return ONLY the JSON array, nothing else.\n\nREADME:\n${state.readmeText}\n\nSUMMARY:\n${state.summary}`
    ),
  ]);
  try {
    const suggestions = JSON.parse(res.content as string);
    return { suggestions };
  } catch {
    return { suggestions: [res.content as string] };
  }
}

// ── Routing ───────────────────────────────────────────────────────────────────
function routeAfterFetch(state: typeof GraphState.State) {
  return state.error ? END : "summarize";
}

// ── Graph ─────────────────────────────────────────────────────────────────────
const graph = new StateGraph(GraphState)
  .addNode("fetchReadme", fetchReadme)
  .addNode("summarize",   summarize)
  .addNode("suggest",     suggest)
  .addEdge(START,         "fetchReadme")
  .addConditionalEdges("fetchReadme", routeAfterFetch)
  .addEdge("summarize",   "suggest")
  .addEdge("suggest",     END);

export const app = graph.compile();

// ── Run ───────────────────────────────────────────────────────────────────────
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const repoUrl = process.argv[2] || "https://github.com/vercel/ai";
  console.log(`\n📦 Analysing: ${repoUrl}\n${"─".repeat(60)}`);

  const result = await app.invoke({ repoUrl });

  if (result.error) {
    console.error(`\n❌ Error: ${result.error}`);
  } else {
    console.log(`\n📝 Summary:\n${result.summary}`);
    console.log(`\n💡 Suggestions:`);
    result.suggestions.forEach((s: string, i: number) =>
      console.log(`  ${i + 1}. ${s}`)
    );
  }
}
```

### src/week-03-graph/server.ts

```typescript
/**
 * Week 3 — Hono HTTP server wrapping the LangGraph agent
 * POST /analyze  { "repoUrl": "https://github.com/..." }
 * Run: npm run w3:server
 * Test: curl -X POST http://localhost:3000/analyze \
 *         -H "Content-Type: application/json" \
 *         -d '{"repoUrl":"https://github.com/vercel/ai"}'
 */
import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { app as agent } from "./agent.js";

const server = new Hono();

server.post("/analyze", async (c) => {
  const { repoUrl } = await c.req.json<{ repoUrl: string }>();
  if (!repoUrl) return c.json({ error: "repoUrl is required" }, 400);

  const result = await agent.invoke({ repoUrl });

  if (result.error) return c.json({ error: result.error }, 500);

  return c.json({
    repoUrl,
    summary:     result.summary,
    suggestions: result.suggestions,
  });
});

serve({ fetch: server.fetch, port: 3000 }, () => {
  console.log("🚀 Week 3 server running at http://localhost:3000");
  console.log("   POST /analyze  { repoUrl: string }");
});
```

---

## Week 4 — Capstone (Vite + React streaming UI)

**Goal:** A real chat interface that streams tool steps as they happen.
**Learn:** SSE streaming from Hono to React, `useChat` or manual `EventSource`.
**Run:** Two terminals — `npm run w4:server` then `npm run w4:ui`

### src/week-04-capstone/server/index.ts

```typescript
/**
 * Week 4 — SSE streaming server
 * Streams each agent step as a separate event so the UI can show
 * "Searching...", "Reading...", "Answering..." in real time.
 */
import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { cors } from "hono/cors";
import { generateText, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { withRetry } from "../../lib/with-retry.js";
import { searchTool, calculatorTool } from "../../lib/agent-tools.js";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const server = new Hono();

server.use("*", cors());

server.post("/chat", (c) =>
  streamSSE(c, async (stream) => {
    const { messages } = await c.req.json<{ messages: { role: string; content: string }[] }>();
    const lastMessage = messages.at(-1)?.content ?? "";

    const { text, steps } = await withRetry(() =>
      generateText({
        model: groq("llama-3.3-70b-versatile"),
        tools: { search: searchTool, calculator: calculatorTool },
        stopWhen: stepCountIs(8),
        system: "Research assistant. Search before facts. Cite sources at the end.",
        prompt: lastMessage,
      })
    );

    for (const step of steps) {
      for (const tc of step.toolCalls ?? []) {
        await stream.writeSSE({
          event: "tool_call",
          data: JSON.stringify({ tool: tc.toolName, args: tc.input }),
        });
      }
      for (const tr of step.toolResults ?? []) {
        await stream.writeSSE({
          event: "tool_result",
          data: JSON.stringify({ tool: tr.toolName }),
        });
      }
    }
    if (text) {
      await stream.writeSSE({ event: "text", data: text });
    }
    await stream.writeSSE({ event: "done", data: "" });
  })
);

serve({ fetch: server.fetch, port: 3001 }, () => {
  console.log("🚀 Week 4 chat server at http://localhost:3001");
});
```

### src/week-04-capstone/vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname),   // week-04-capstone/ is the Vite root
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/chat": "http://localhost:3001",  // forward /chat to Hono server
    },
  },
});
```

### src/week-04-capstone/client/App.tsx

```tsx
/**
 * Week 4 — Chat UI
 * Connects to the SSE stream and renders tool steps inline.
 */
import { useState, useRef } from "react";
import { ChatWindow } from "./components/ChatWindow.js";
import { ToolStep } from "./components/ToolStep.js";

type Event =
  | { type: "tool_call";   tool: string; args: Record<string, unknown> }
  | { type: "tool_result"; tool: string }
  | { type: "text";        content: string }
  | { type: "done" };

export default function App() {
  const [input,    setInput]    = useState("");
  const [events,   setEvents]   = useState<Event[]>([]);
  const [loading,  setLoading]  = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    setEvents([]);
    setLoading(true);

    const res = await fetch("/chat", {   // proxied to :3001 via vite.config.ts (from client/)
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: input }] }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          const eventType = line.slice(7).trim();
          // next line is data:
          continue;
        }
        if (line.startsWith("data:")) {
          const raw = line.slice(5).trim();
          if (!raw) continue;
          try {
            const payload = JSON.parse(raw);
            setEvents((prev) => [...prev, { type: payload.event ?? "text", ...payload }]);
          } catch {}
        }
        if (line === "event: done") {
          setLoading(false);
        }
      }
    }

    setLoading(false);
    setInput("");
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui", padding: "0 16px" }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>ts-agent-lab — Week 4</h1>

      {/* Tool steps */}
      <div style={{ marginBottom: 16 }}>
        {events.map((e, i) => <ToolStep key={i} event={e} />)}
      </div>

      {/* Final answer */}
      <ChatWindow events={events} />

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything…"
          disabled={loading}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8,
                   border: "1px solid #ddd", fontSize: 14 }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{ padding: "10px 20px", borderRadius: 8, background: "#1D9E75",
                   color: "white", border: "none", cursor: "pointer", fontSize: 14 }}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
```

### src/week-04-capstone/client/components/ToolStep.tsx

```tsx
type Event = { type: string; tool?: string; args?: Record<string, unknown>; content?: string };

export function ToolStep({ event }: { event: Event }) {
  if (event.type === "tool_call") {
    return (
      <div style={{ fontSize: 12, color: "#888", padding: "4px 0" }}>
        🔧 Calling <strong>{event.tool}</strong>
        {event.args && <span> ({JSON.stringify(event.args)})</span>}
      </div>
    );
  }
  if (event.type === "tool_result") {
    return (
      <div style={{ fontSize: 12, color: "#888", padding: "4px 0" }}>
        ✅ Got result from <strong>{event.tool}</strong>
      </div>
    );
  }
  return null;
}
```

### src/week-04-capstone/client/components/ChatWindow.tsx

```tsx
type Event = { type: string; content?: string };

export function ChatWindow({ events }: { events: Event[] }) {
  const text = events
    .filter((e) => e.type === "text")
    .map((e) => e.content)
    .join("");

  if (!text) return null;

  return (
    <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 16,
                  lineHeight: 1.6, whiteSpace: "pre-wrap", fontSize: 14 }}>
      {text}
    </div>
  );
}
```

### src/week-04-capstone/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ts-agent-lab</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/client/main.tsx"></script>
  </body>
</html>
```

### src/week-04-capstone/client/main.tsx

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## Week 4 stretch — Next.js (`src/week-04-stretch-next/`)

**Run:** `npm run w4:next` (port 3002) · **Build:** `npm run w4:next:build`

Implemented in repo — see `app/api/chat/route.ts`, `components/Chat.tsx`, and
`src/week-04-stretch-next/README.md`. Uses `src/lib/agent-tools.ts` and `useChat`.

---

## Week 3 stretch — Multi-agent (researcher → writer → critic)

**Goal:** Three specialist nodes instead of one general LLM. The pattern you may
remember from tutorials: **researcher** gathers facts, **writer** drafts, **critic**
reviews and either approves or sends back for one revision.

**Run:** `npm run w3:multi` (optional, after week 3 main graph works)

**Graph:** `research` → `write` → `critique` → (if critic says REVISE → `write` again, else END)

This is the same LangGraph machinery as week 3 — only the roles and conditional edge change.

---

## Switching to Ollama (local fallback)

In any week, swap the model by changing two lines:

```typescript
// BEFORE (Groq)
import { createGroq } from "@ai-sdk/groq";
const groq  = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = groq("llama-3.3-70b-versatile");

// AFTER (Ollama — requires: ollama pull llama3.2:3b)
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
});
const model = ollama("llama3.2:3b");
```

The rest of the code is identical — tools, loop, graph, server.

---

## Switching to Gemini

```typescript
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
const model  = google("gemini-2.5-flash");  // check aistudio.google.com for current free-tier id
```

> Model IDs change as Google releases new versions. Verify the current free Flash model id
> in your AI Studio project — it may be `gemini-2.0-flash`, `gemini-2.5-flash`, or newer.

---

## Portfolio checklist (week 4 exit criteria)

- [ ] Public GitHub repo (`agent-lab` or renamed `ts-agent-lab`) with `.env.example`, no real keys
- [ ] Root `README.md`: architecture diagram, cost note ("$0 Groq + Ollama fallback")
- [ ] Each `src/week-*/README.md` documents run commands and learnings
- [ ] Screen recording: tool steps streaming in Vite (`w4:ui`) and/or Next (`w4:next`)
- [ ] `LIMITS.md` with real 429 notes
- [ ] Optional: deploy Next stretch to Vercel (`w4:next:build`) or Hono to Railway

---

## Rate limit strategy (handle 429s)

```typescript
// Simple exponential backoff wrapper
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (e?.status === 429 && i < maxAttempts - 1) {
        const wait = 2 ** i * 1000;
        console.log(`[429] Rate limited. Retrying in ${wait}ms…`);
        await new Promise((r) => setTimeout(r, wait));
      } else throw e;
    }
  }
  throw new Error("Max retries exceeded");
}

// Use src/lib/with-retry.ts:
const { text } = await withRetry(() => generateText({ model, prompt }));
```

Hit Groq's rate limit during heavy loops → switch model to `llama-3.1-8b-instant`
(higher daily cap) or swap `createGroq` for Ollama entirely.