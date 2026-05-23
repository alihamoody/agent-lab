/**
 * Week 3 stretch — Researcher → Writer → Critic
 * Run: npm run w3:multi "topic here"
 */
import "dotenv/config";
import { fileURLToPath } from "node:url";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";

const GraphState = Annotation.Root({
  topic: Annotation<string>,
  researchNotes: Annotation<string>({ default: () => "" }),
  draft: Annotation<string>({ default: () => "" }),
  critique: Annotation<string>({ default: () => "" }),
  verdict: Annotation<"APPROVE" | "REVISE">({ default: () => "APPROVE" }),
  revisionCount: Annotation<number>({ default: () => 0 }),
});

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
});

async function research(state: typeof GraphState.State) {
  console.log("[node] researcher");
  const res = await llm.invoke([
    new SystemMessage(
      "You are a researcher. Gather bullet-point facts and angles only — no full essay."
    ),
    new HumanMessage(`Research this topic for a short blog post:\n${state.topic}`),
  ]);
  return { researchNotes: String(res.content) };
}

async function write(state: typeof GraphState.State) {
  console.log("[node] writer");
  const res = await llm.invoke([
    new SystemMessage(
      "You are a writer. Produce a 2-paragraph draft using the research notes."
    ),
    new HumanMessage(
      `Topic: ${state.topic}\n\nResearch:\n${state.researchNotes}\n\n${
        state.critique ? `Address this critique:\n${state.critique}\n\n` : ""
      }Write the draft.`
    ),
  ]);
  return {
    draft: String(res.content),
    revisionCount: state.critique ? state.revisionCount + 1 : state.revisionCount,
  };
}

async function critique(state: typeof GraphState.State) {
  console.log("[node] critic");
  const res = await llm.invoke([
    new SystemMessage(
      'You are a critic. Reply with JSON only: {"verdict":"APPROVE"|"REVISE","feedback":"..."}'
    ),
    new HumanMessage(
      `Topic: ${state.topic}\n\nDraft:\n${state.draft}\n\nApprove if good enough for a portfolio demo; otherwise REVISE with specific feedback.`
    ),
  ]);
  try {
    const parsed = JSON.parse(String(res.content)) as {
      verdict?: string;
      feedback?: string;
    };
    const verdict =
      parsed.verdict === "REVISE" ? "REVISE" : ("APPROVE" as const);
    return {
      verdict,
      critique: parsed.feedback ?? String(res.content),
    };
  } catch {
    return { verdict: "APPROVE" as const, critique: String(res.content) };
  }
}

function routeAfterCritique(state: typeof GraphState.State) {
  if (state.verdict === "REVISE" && state.revisionCount < 1) {
    return "write";
  }
  return END;
}

const graph = new StateGraph(GraphState)
  .addNode("research", research)
  .addNode("write", write)
  .addNode("critique", critique)
  .addEdge(START, "research")
  .addEdge("research", "write")
  .addEdge("write", "critique")
  .addConditionalEdges("critique", routeAfterCritique);

export const app = graph.compile();

const isMain =
  process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const topic =
    process.argv.slice(2).join(" ") ||
    "Why multi-agent patterns (researcher, writer, critic) help learning agent design";

  console.log(`\n📝 Topic: ${topic}\n${"─".repeat(60)}`);

  const result = await app.invoke({ topic });

  console.log("\n--- Research notes ---\n", result.researchNotes);
  console.log("\n--- Final draft ---\n", result.draft);
  console.log("\n--- Critic ---\n", result.critique);
  console.log("\nVerdict:", result.verdict, "| revisions:", result.revisionCount);
}
