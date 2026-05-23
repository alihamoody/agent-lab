# Week 1 — Tool loop

CLI agent with `get_weather` and `calculate` tools. Uses AI SDK 6 `generateText` + `stopWhen: stepCountIs(5)`.

```bash
npm run w1
npm run w1 "Weather in Tokyo and 100 / 4"
```

Code: `src/week-01-tool-loop/agent.ts` · Shared retry: `src/lib/with-retry.ts`

Stretch: refactor to `ToolLoopAgent` after this works.
