/**
 * Week 2 — Research agent with citations
 * Run: npm run w2 "your question"
 */
import "dotenv/config";
import { generateText, stepCountIs, wrapLanguageModel } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { withRetry } from "../lib/with-retry.js";
import { searchTool } from "./tools/search.js";
import { calculatorTool } from "../week-01-tool-loop/tools/calculator.js";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = wrapLanguageModel({
  model: groq("llama-3.3-70b-versatile"),
  middleware: devToolsMiddleware(),
});

const query =
  process.argv.slice(2).join(" ") ||
  "What is LangGraph.js used for in 2026? and is Vercel AI SDK better latest version v6?";

console.log(`\n🔍 Query: ${query}\n${"─".repeat(60)}`);

const system = `You are a research assistant.
For factual or current questions, call the search tool before answering.
Wait for tool results, then answer in prose.
End with a "Sources:" section listing URLs you used.`;
const tools = { search: searchTool, calculator: calculatorTool };

const { text, steps } = await withRetry(() =>
  generateText({
    model,
    tools,
    stopWhen: stepCountIs(8),
    system,
    prompt: query,
    prepareStep: ({ stepNumber }) =>
      stepNumber === 0
        ? { toolChoice: { type: "tool", toolName: "search" } }
        : { toolChoice: "auto" },
  })
);

for (const step of steps) {
  for (const tc of step.toolCalls ?? []) {
    const input = tc.input as { query?: string };
    if (input.query) console.log(`[searching] "${input.query}"`);
  }
}

console.log(`\n✅ Answer:\n${text}`);
console.log(`\n📊 Steps taken: ${steps.length}`);
