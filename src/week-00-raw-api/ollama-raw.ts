/**
 * Week 0 — Local Ollama (OpenAI-compatible).
 * Run: npm run w0:ollama  (requires: ollama pull llama3.2:3b)
 */
import "dotenv/config";
const base = process.env.OLLAMA_BASE_URL ;

const tools = [
  {
    type: "function",
    function: {
      name: "run_calculate",
      description: "evaluate a math expression and return the result",
      parameters: {
        type: "object",
        properties: {
          expression: { type: "string", description: "strinctly mathematical expression to evaluate" },
        },
        required: ["expression"],
      },
    },
  },
];



const response = await fetch(`${base}/v1/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    // model: "llama3.2:3b",
    model: "qwen3.5:2b",
    messages: [{ role: "user", content: "What is 42 * 17?" }],    
    tools,
    tool_choice: "auto",
  }),
});

const data = await response.json();
console.log("Ollama response:\n", JSON.stringify(data, null, 2));
