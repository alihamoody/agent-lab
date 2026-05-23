# ts-agent-lab

TypeScript learning lab for agentic apps — Groq-first, Ollama fallback.

| Doc | Purpose |
|-----|---------|
| [ME_README.md](./ME_README.md) | Your learning path (read this) |
| [CURSOR_BUILD_SPEC.md](./CURSOR_BUILD_SPEC.md) | Full scaffold spec for Cursor |
| [LIMITS.md](./LIMITS.md) | Log rate limits as you hit them |

**On disk:** repo folder `agent-lab/` · **npm package name:** `ts-agent-lab`

## Layout

```text
agent-lab/
├── src/                          # all application code
│   ├── lib/                      # with-retry.ts, agent-tools.ts
│   ├── week-00-raw-api/
│   ├── week-01-tool-loop/
│   ├── week-02-research/
│   ├── week-03-graph/            # :3000 when w3:server
│   ├── week-03-stretch-multi-agent/
│   ├── week-04-capstone/         # Vite :5173 + Hono :3001
│   └── week-04-stretch-next/     # Next.js :3002
├── package.json
├── tsconfig.json
├── .env.example
└── .env                          # gitignored
```

No root `dist/` for weeks 0–3 (`tsx` runs `.ts` directly). Week 4 Vite is dev-first; Next stretch builds to `src/week-04-stretch-next/.next/` (gitignored).

## Quick start

```bash
cp .env.example .env   # add GROQ_API_KEY
npm install
npm run w0:groq
npm run w1
```

## Commands

| Week | Command |
|------|---------|
| 0 | `npm run w0:groq` / `w0:ollama` |
| 1 | `npm run w1` |
| 2 | `npm run w2` |
| 3 | `npm run w3:agent` / `w3:server` |
| 3 stretch | `npm run w3:multi` |
| 4 | `npm run w4:server` + `npm run w4:ui` (Vite + Hono) |
| 4 stretch | `npm run w4:next` (Next.js on :3002) |

### Dev ports

| Service | Port | Command |
|---------|------|---------|
| Week 3 API | 3000 | `w3:server` |
| Week 4 Hono | 3001 | `w4:server` |
| Week 4 Next | 3002 | `w4:next` |
| Week 4 Vite UI | 5173 | `w4:ui` |

`npm install` uses `.npmrc` (`legacy-peer-deps`) because LangGraph and `@langchain/groq` disagree on core versions — safe for this lab.
