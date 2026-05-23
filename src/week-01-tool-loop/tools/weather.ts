import { tool } from "ai";
import { z } from "zod";

export const weatherTool = tool({
  description: "Get the current weather for a city",
  inputSchema: z.object({
    city: z.string().describe("The city name, e.g. Toronto"),
  }),
  execute: async ({ city }) => {
    const fakeData: Record<string, string> = {
      toronto: "12°C, partly cloudy",
      london: "8°C, rainy",
      tokyo: "22°C, sunny",
    };
    return fakeData[city.toLowerCase()] ?? `No data for ${city}`;
  },
});
