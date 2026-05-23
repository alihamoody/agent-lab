import { tool } from "ai";
import { z } from "zod";

export const searchTool = tool({
  description:
    "Search the web for current information. Returns title, url, and snippet per result.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const tavilyKey = process.env.TAVILY_API_KEY;

    if (tavilyKey) {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: 4,
          include_answer: false,
        }),
      });
      const data = (await res.json()) as {
        results: { title: string; url: string; content: string }[];
      };
      return data.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 300),
      }));
    }

    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ts-agent-lab/1.0" },
    });
    const data = (await res.json()) as {
      Heading?: string;
      AbstractURL?: string;
      AbstractText?: string;
    };
    return [
      {
        title: data.Heading || query,
        url: data.AbstractURL || "https://duckduckgo.com",
        snippet:
          data.AbstractText ||
          "No instant answer — set TAVILY_API_KEY for richer search.",
      },
    ];
  },
});
