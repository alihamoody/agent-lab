# Week 3 — LangGraph

Linear graph: fetch README → summarize → suggest. Optional HTTP API.

```bash
npm run w3:agent
npm run w3:agent https://github.com/langchain-ai/langgraphjs
npm run w3:server
```

`npm run w3:server` → http://localhost:3000 (`POST /analyze`)

Stretch: `npm run w3:multi` — `src/week-03-stretch-multi-agent/` (researcher → writer → critic).
