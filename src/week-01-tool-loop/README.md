# Week 1 — Tool loop

CLI agent with `get_weather` and `calculate` tools. Uses AI SDK 6 `generateText` + `stopWhen: stepCountIs(5)`.

```bash
npm run w1
npm run w1 "Weather in Tokyo and 100 / 4"
npm run devtools
```

The Week 1 agent wraps its Groq model with AI SDK DevTools middleware. Run `npm run devtools` and open `http://localhost:4983` to inspect prompts, model responses, tool calls, timing, and token usage. Captured runs are stored under `.devtools/`, which is gitignored because it can contain sensitive prompts and tool outputs.

Code: `src/week-01-tool-loop/agent.ts` · Shared retry: `src/lib/with-retry.ts`

Stretch: refactor to `ToolLoopAgent` after this works.
