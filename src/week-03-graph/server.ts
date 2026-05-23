/**
 * Week 3 — Hono API
 * Run: npm run w3:server
 */
import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { app as agent } from "./agent.js";

const server = new Hono();

server.post("/analyze", async (c) => {
  const { repoUrl } = await c.req.json<{ repoUrl: string }>();
  if (!repoUrl) return c.json({ error: "repoUrl is required" }, 400);

  const result = await agent.invoke({ repoUrl });

  if (result.error) return c.json({ error: result.error }, 500);

  return c.json({
    repoUrl,
    summary: result.summary,
    suggestions: result.suggestions,
  });
});

serve({ fetch: server.fetch, port: 3000 }, () => {
  console.log("🚀 Week 3 server at http://localhost:3000");
  console.log('   POST /analyze  { "repoUrl": "https://github.com/vercel/ai" }');
});
