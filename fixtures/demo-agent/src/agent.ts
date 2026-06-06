import { generateObject, generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import pRetry from "p-retry";

// A deliberately half-baked agent: solid output validation via zod,
// but missing several production safeguards.

const weatherTool = tool({
  description: "Get the weather for a city",
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    const res = await fetch(`https://api.example.com/weather?city=${city}`);
    return res.json();
  },
});

export async function classify(input: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({ category: z.string(), confidence: z.number() }),
    temperature: 0,
    prompt: `Classify the following text: ${input}`,
  });
  return object;
}

export async function run(input: string) {
  return pRetry(
    async () => {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        tools: { weather: weatherTool },
        maxOutputTokens: 1024,
        temperature: 0.2,
        prompt: input,
      });
      return text;
    },
    { retries: 3 },
  );
}
