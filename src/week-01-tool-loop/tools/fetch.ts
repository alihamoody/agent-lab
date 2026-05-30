import { tool } from "ai";
import z from "zod";

export const fetchTool = tool({
    description: "Fetch the contents of a URL and return the response as text, use only API calls that return small answers, don't use fetch to get web pages or large data. Also avoid using APIs that need keys or authentication, use only free APIs.",
    inputSchema: z.object({
      url: z.string().describe("The URL to fetch, e.g. http://wttr.in/Toronto?format=3"),
    }),
    execute: async ({ url }) => {
      const res = await fetch(url);
      return await res.text();
    },
  });