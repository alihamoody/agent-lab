/**
 * Week 0 — Local Ollama (OpenAI-compatible).
 * Run: npm run w0:ollama  (requires: ollama pull llama3.2:3b)
 */
import "dotenv/config";

const base = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(
  /\/$/,
  ""
);

const response = await fetch(`${base}/v1/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama3.2:3b",
    messages: [{ role: "user", content: "What is 42 * 17?" }],
  }),
});

const data = await response.json();
console.log("Ollama response:\n", JSON.stringify(data, null, 2));
