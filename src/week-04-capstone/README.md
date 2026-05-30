# Week 4 — Capstone UI

Streaming chat with visible tool steps.

```bash
# Terminal 1 — from repo root
npm run w4:server

# Terminal 2
npm run w4:ui
```

Open http://localhost:5173 — `/chat` is proxied to Hono on :3001.

Like Week 1, the Hono server wraps its Groq model with AI SDK DevTools middleware. Run `npm run devtools` and open `http://localhost:4983` while using the chat UI to inspect prompts, model responses, tool calls, timing, and token usage.

**Paths:** `client/` = React, `server/` = Hono SSE API.

**Next stretch (recommended after this):** `npm run w4:next` — see `src/week-04-stretch-next/README.md` and [ME_README.md](../../ME_README.md).
