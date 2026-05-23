"use client";

/**
 * Client Component — useChat wires the UI to app/api/chat/route.ts.
 * Concepts: 'use client', streaming messages, tool parts in the UI.
 */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

function MessageParts({ parts }: { parts: ReadonlyArray<{ type: string } & Record<string, unknown>> }) {
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "text" && typeof part.text === "string") {
          return <span key={i}>{part.text}</span>;
        }
        if (
          part.type === "tool-invocation" ||
          part.type === "dynamic-tool" ||
          part.type.startsWith("tool-")
        ) {
          const name =
            typeof part.toolName === "string"
              ? part.toolName
              : part.type.replace("tool-", "") || "tool";
          return (
            <div key={i} className="tool-step">
              🔧 {name}
              {part.input != null && (
                <span> ({JSON.stringify(part.input)})</span>
              )}
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

export function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "streaming" || status === "submitted";

  return (
    <>
      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === "user" ? "user" : "assistant"}`}
          >
            <strong>{message.role === "user" ? "You" : "Agent"}</strong>
            <div style={{ marginTop: 6 }}>
              <MessageParts parts={message.parts} />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="error">{error.message ?? "Something went wrong"}</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || busy) return;
          sendMessage({ text });
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          {busy ? "…" : "Send"}
        </button>
      </form>

      <p className="hint">
        Compare with week 4 Vite: here one app serves UI + API. Tool steps appear as
        message parts while streaming.
      </p>
    </>
  );
}
