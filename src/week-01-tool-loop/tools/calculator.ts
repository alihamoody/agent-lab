import { tool } from "ai";
import { z } from "zod";

export const calculatorTool = tool({
  description: "Evaluate a safe math expression and return the result",
  inputSchema: z.object({
    expression: z.string().describe("Math expression, e.g. '42 * 17 + 3'"),
  }),
  execute: async ({ expression }) => {
    try {
      const result = Function(`"use strict"; return (${expression})`)();
      return String(result);
    } catch {
      return "Error: invalid expression";
    }
  },
});
