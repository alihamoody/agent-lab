# Week 3 stretch — Multi-agent (researcher → writer → critic)

Three **roles**, one graph — the pattern from many agent tutorials (sometimes plus a **planner** upstream; here the topic is your plan).

| Node | Role |
|------|------|
| `research` | Gather facts and angles (researcher) |
| `write` | Turn notes into a short draft (writer) |
| `critique` | Approve or ask for one revision (critic) |

If the critic returns `REVISE`, the graph loops back to `write` once (max 1 revision).

```bash
npm run w3:multi
npm run w3:multi "How Groq free tier fits agent prototyping in 2026"
```

**Optional fourth role:** **planner** — add a `plan` node before `research`.

Code: `src/week-03-stretch-multi-agent/agent.ts` · Run from repo root.
