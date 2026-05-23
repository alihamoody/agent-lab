/**
 * Week 0 — Raw Groq API call with tool calling.
 * Run: npm run w0:groq
 */
import "dotenv/config";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in .env");
  process.exit(1);
}

const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
        },
        required: ["city"],
      },
    },
  },
];

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: "What is the weather in Toronto?" }],
    tools,
    tool_choice: "auto",
  }),
});

const data = await response.json();

console.log("Full response:\n", JSON.stringify(data, null, 2));

const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
if (toolCall) {
  console.log("\n✅ Model wants to call:", toolCall.function.name);
  console.log("   With args:", toolCall.function.arguments);
  console.log("\n👆 Your code runs that function and sends the result back. That's the loop.");
}
