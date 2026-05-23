/**
 * Week 4 — SSE streaming server
 * Run: npm run w4:server
 */
import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { cors } from "hono/cors";
import { generateText, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { withRetry } from "../../lib/with-retry.js";
import { searchTool } from "../../week-02-research/tools/search.js";
import { calculatorTool } from "../../week-01-tool-loop/tools/calculator.js";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const server = new Hono();

server.use("*", cors());

server.post("/chat", (c) =>
  streamSSE(c, async (stream) => {
    const { messages } = await c.req.json<{
      messages: { role: string; content: string }[];
    }>();
    const lastMessage = messages.at(-1)?.content ?? "";

    const { text, steps } = await withRetry(() =>
      generateText({
        model: groq("llama-3.3-70b-versatile"),
        tools: { search: searchTool, calculator: calculatorTool },
        stopWhen: stepCountIs(8),
        system:
          "You are a helpful research assistant. Search before answering factual questions. Cite sources at the end.",
        prompt: lastMessage,
      })
    );

    for (const step of steps) {
      for (const tc of step.toolCalls ?? []) {
        await stream.writeSSE({
          event: "tool_call",
          data: JSON.stringify({ tool: tc.toolName, args: tc.input }),
        });
      }
      for (const tr of step.toolResults ?? []) {
        await stream.writeSSE({
          event: "tool_result",
          data: JSON.stringify({ tool: tr.toolName }),
        });
      }
    }

    if (text) {
      await stream.writeSSE({ event: "text", data: text });
    }

    await stream.writeSSE({ event: "done", data: "" });
  })
);

serve({ fetch: server.fetch, port: 3001 }, () => {
  console.log("🚀 Week 4 chat server at http://localhost:3001");
});
