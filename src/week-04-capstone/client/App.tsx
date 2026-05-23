import { useState } from "react";
import { ChatWindow } from "./components/ChatWindow.js";
import { ToolStep } from "./components/ToolStep.js";

export type StreamEvent =
  | { type: "tool_call"; tool: string; args?: Record<string, unknown> }
  | { type: "tool_result"; tool: string }
  | { type: "text"; content: string }
  | { type: "done" };

function parseSseChunk(buffer: string): { events: StreamEvent[]; rest: string } {
  const events: StreamEvent[] = [];
  const blocks = buffer.split("\n\n");
  const rest = blocks.pop() ?? "";

  for (const block of blocks) {
    let eventType = "message";
    let data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) eventType = line.slice(6).trim();
      if (line.startsWith("data:")) data = line.slice(5).trim();
    }
    if (eventType === "done") {
      events.push({ type: "done" });
      continue;
    }
    if (!data) continue;
    try {
      if (eventType === "text") {
        events.push({ type: "text", content: data });
      } else if (eventType === "tool_call") {
        const payload = JSON.parse(data) as {
          tool: string;
          args?: Record<string, unknown>;
        };
        events.push({ type: "tool_call", tool: payload.tool, args: payload.args });
      } else if (eventType === "tool_result") {
        const payload = JSON.parse(data) as { tool: string };
        events.push({ type: "tool_result", tool: payload.tool });
      }
    } catch {
      /* ignore malformed chunks */
    }
  }

  return { events, rest };
}

export default function App() {
  const [input, setInput] = useState("");
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    setEvents([]);
    setLoading(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: input }] }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseChunk(buffer);
        buffer = parsed.rest;
        if (parsed.events.length) {
          setEvents((prev) => [...prev, ...parsed.events]);
        }
      }
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        fontFamily: "system-ui",
        padding: "0 16px",
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>ts-agent-lab — Week 4</h1>

      <div style={{ marginBottom: 16 }}>
        {events.map((e, i) => (
          <ToolStep key={i} event={e} />
        ))}
      </div>

      <ChatWindow events={events} />

      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything…"
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#1D9E75",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
