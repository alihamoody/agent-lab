import type { StreamEvent } from "../App.js";

export function ToolStep({ event }: { event: StreamEvent }) {
  if (event.type === "tool_call") {
    return (
      <div style={{ fontSize: 12, color: "#888", padding: "4px 0" }}>
        🔧 Calling <strong>{event.tool}</strong>
        {event.args && <span> ({JSON.stringify(event.args)})</span>}
      </div>
    );
  }
  if (event.type === "tool_result") {
    return (
      <div style={{ fontSize: 12, color: "#888", padding: "4px 0" }}>
        ✅ Got result from <strong>{event.tool}</strong>
      </div>
    );
  }
  return null;
}
