/**
 * Route Handler — same agent as week 4 Vite capstone, one Next.js process.
 * Concepts: App Router, POST handler, streamText, tool loop, UIMessage stream.
 */
import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  wrapLanguageModel,
  type UIMessage,
} from "ai";
import { createGroq } from "@ai-sdk/groq";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { searchTool, calculatorTool } from "../../../../lib/agent-tools";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = wrapLanguageModel({
  model: groq("llama-3.3-70b-versatile"),
  middleware: devToolsMiddleware(),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing GROQ_API_KEY in agent-lab/.env" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
    tools: { search: searchTool, calculator: calculatorTool },
    stopWhen: stepCountIs(8),
    system: `You are a helpful research assistant. Search before answering factual questions.
End with a "Sources:" section when you used search. Cite URLs.`,
  });

  return result.toUIMessageStreamResponse();
}
