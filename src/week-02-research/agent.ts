/**
 * Week 2 — Research agent with citations
 * Run: npm run w2 "your question"
 */
import "dotenv/config";
import { generateText, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { withRetry } from "../lib/with-retry.js";
import { searchTool } from "./tools/search.js";
import { calculatorTool } from "../week-01-tool-loop/tools/calculator.js";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const query =
  process.argv.slice(2).join(" ") ||
  "What are the most popular open-source LLM agent frameworks right now?";

console.log(`\n🔍 Query: ${query}\n${"─".repeat(60)}`);

const { text, steps } = await withRetry(() =>
  generateText({
    model: groq("llama-3.3-70b-versatile"),
    tools: { search: searchTool, calculator: calculatorTool },
    stopWhen: stepCountIs(8),
    system: `You are a research assistant. ALWAYS search before answering factual questions.
Search 2-3 times with different queries if needed.
End every answer with a "Sources:" section listing URLs you used.`,
    prompt: query,
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
