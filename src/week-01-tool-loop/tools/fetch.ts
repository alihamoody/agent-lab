import { tool } from "ai";
import z from "zod";

export const fetchTool = tool({
    description: "Fetch the contents of a URL and return the response as text",
    inputSchema: z.object({
      url: z.string().describe("The URL to fetch, e.g. http://wttr.in/Toronto?format=3"),
    }),
    execute: async ({ url }) => {
      const res = await fetch(url);
      return await res.text();
    },
  });