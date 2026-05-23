/**
 * Week 3 — LangGraph.js StateGraph
 * Run: npm run w3:agent "https://github.com/vercel/ai"
 */
import "dotenv/config";
import { fileURLToPath } from "node:url";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";

const GraphState = Annotation.Root({
  repoUrl: Annotation<string>,
  readmeText: Annotation<string>({ default: () => "" }),
  summary: Annotation<string>({ default: () => "" }),
  suggestions: Annotation<string[]>({ default: () => [] }),
  error: Annotation<string | null>({ default: () => null }),
});

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

async function fetchReadme(state: typeof GraphState.State) {
  console.log("[node] fetchReadme");
  try {
    const rawUrl = state.repoUrl
      .replace("github.com", "raw.githubusercontent.com")
      .replace(/\/?$/, "/refs/heads/main/README.md");

    const res = await fetch(rawUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return { readmeText: text.slice(0, 6000) };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Failed to fetch README: ${message}` };
  }
}

async function summarize(state: typeof GraphState.State) {
  console.log("[node] summarize");
  const res = await llm.invoke([
    new SystemMessage("You are a concise technical writer."),
    new HumanMessage(
      `Summarise this README in 3-4 sentences. Focus on: what it does, who it's for, main features.\n\n${state.readmeText}`
    ),
  ]);
  return { summary: String(res.content) };
}

async function suggest(state: typeof GraphState.State) {
  console.log("[node] suggest");
  const res = await llm.invoke([
    new SystemMessage(
      "You are a senior developer reviewing open-source documentation."
    ),
    new HumanMessage(
      `List exactly 3 concrete README improvements as a JSON array of strings. Return ONLY the JSON array.\n\nREADME:\n${state.readmeText}\n\nSUMMARY:\n${state.summary}`
    ),
  ]);
  try {
    const parsed = JSON.parse(String(res.content)) as string[];
    return { suggestions: parsed };
  } catch {
    return { suggestions: [String(res.content)] };
  }
}

function routeAfterFetch(state: typeof GraphState.State) {
  return state.error ? END : "summarize";
}

const graph = new StateGraph(GraphState)
  .addNode("fetchReadme", fetchReadme)
  .addNode("summarize", summarize)
  .addNode("suggest", suggest)
  .addEdge(START, "fetchReadme")
  .addConditionalEdges("fetchReadme", routeAfterFetch)
  .addEdge("summarize", "suggest")
  .addEdge("suggest", END);

export const app = graph.compile();

const isMain =
  process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const repoUrl = process.argv[2] || "https://github.com/vercel/ai";
  console.log(`\n📦 Analysing: ${repoUrl}\n${"─".repeat(60)}`);

  const result = await app.invoke({ repoUrl });

  if (result.error) {
    console.error(`\n❌ Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`\n📝 Summary:\n${result.summary}`);
  console.log(`\n💡 Suggestions:`);
  result.suggestions.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
}
