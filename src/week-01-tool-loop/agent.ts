/**
 * Week 1 — AI SDK 6 multi-step tool loop
 * Run: npm run w1
 */
import "dotenv/config";
import { generateText, stepCountIs, ToolLoopAgent } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { withRetry } from "../lib/with-retry.js";
import { weatherTool } from "./tools/weather.js";
import { calculatorTool } from "./tools/calculator.js";
import { terminalTool } from "./tools/terminal.js";
import { fetchTool } from "./tools/fetch.js";
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const query =
  process.argv.slice(2).join(" ") ||
  "What is the weather in Toronto and what is 42 multiplied by 17?";

console.log(`\n🔍 Query: ${query}\n${"─".repeat(60)}`);


// using generateText
// const { text, steps } = await 
//   generateText({
//     model: groq("llama-3.3-70b-versatile"),
//     tools: { weather: weatherTool, calculator: calculatorTool },
//     stopWhen: stepCountIs(5),
//     system:
//       "You are a helpful assistant. Use tools when needed. Explain briefly before calling a tool.",
//     prompt: query,
//   })

// using ToolLoopAgent
const agent = new ToolLoopAgent({
  model: groq("llama-3.3-70b-versatile"),
  // model: groq("llama-3.1-8b-instant"),
  tools: { weather: weatherTool, calculator: calculatorTool , shell: terminalTool, fetch: fetchTool},
  stopWhen: stepCountIs(5),
  instructions: `You are a helpful assistant. Use tools when needed with accurate schma and syntax. Explain briefly before calling a tool.`,
});
const { text, steps } = await agent.generate({
  prompt: query,
}); 

for (const step of steps) {
  for (const tc of step.toolCalls ?? []) {
    console.log(`[tool call]  ${tc.toolName}(${JSON.stringify(tc.input)})`);
  }
  for (const tr of step.toolResults ?? []) {
    console.log(`[tool result] ${tr.toolName} → ${JSON.stringify(tr.output)}`);
  }
}

console.log(`\n✅ Final answer:\n${text}`);
console.log(`\n📊 Total steps: ${steps.length}`);
