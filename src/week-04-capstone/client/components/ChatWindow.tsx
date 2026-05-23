import type { StreamEvent } from "../App.js";

export function ChatWindow({ events }: { events: StreamEvent[] }) {
  const text = events
    .filter((e): e is StreamEvent & { type: "text" } => e.type === "text")
    .map((e) => e.content)
    .join("");

  if (!text) return null;

  return (
    <div
      style={{
        background: "#f9f9f9",
        borderRadius: 8,
        padding: 16,
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
}
