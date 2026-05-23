# Week 4 stretch — Next.js (App Router)

Same research agent as the Vite capstone, rebuilt with Next.js concepts:

| Concept | Where |
|---------|--------|
| **App Router** | `app/page.tsx`, `app/layout.tsx` |
| **Route Handler** | `app/api/chat/route.ts` — streaming API |
| **Server vs client** | Route = server; `Chat.tsx` = `'use client'` |
| **AI SDK `useChat`** | `components/Chat.tsx` → `DefaultChatTransport` |
| **Shared tools** | `src/lib/agent-tools.ts` |

## Run

From repo root (uses `agent-lab/.env`):

```bash
npm install
npm run w4:next
```

Open http://localhost:3002

**Port 3002** avoids clashing with week 3 (`:3000`), Vite server (`:3001`), and Vite UI (`:5173`).

## What to compare

1. Finish **week 4 Vite** (`w4:server` + `w4:ui`) — manual SSE, two processes.
2. Run **`w4:next`** — one process, framework-owned streaming.
3. Compare `app/api/chat/route.ts` with `src/week-04-capstone/server/index.ts`.

## Deploy (optional)

```bash
npm run w4:next:build
```

Deploy the `src/week-04-stretch-next` folder to Vercel (set root directory in project settings).

## Stretch on top of this

- Add `loading.tsx` / `error.tsx` in `app/`
- Add a Server Component that fetches static config before hydrating chat
- Add middleware for a simple API key check
