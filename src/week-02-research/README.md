# Week 2 — Research agent

Web search + cited answers. Tavily if `TAVILY_API_KEY` is set; otherwise DuckDuckGo instant answers.

```bash
npm run w2
npm run w2 "What are the most popular open-source LLM agent frameworks right now?"
```

Reuses `calculator` from `src/week-01-tool-loop/tools/`. Run from repo root.

Like Week 1, this agent wraps its Groq model with AI SDK DevTools middleware. Run `npm run devtools` and open `http://localhost:4983` to inspect prompts, model responses, tool calls, timing, and token usage.
