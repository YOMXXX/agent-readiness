import { generateObject, generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import pRetry from "p-retry";
import { Langfuse } from "langfuse";
import { encoding_for_model } from "tiktoken";
import { systemPrompt } from "../prompts/system.js";

const langfuse = new Langfuse();
const enc = encoding_for_model("gpt-4o");

const refundTool = tool({
  description: "Issue a refund to a customer",
  inputSchema: z.object({ amount: z.number(), reason: z.string() }),
  execute: async ({ amount, reason }) => {
    try {
      return await issueRefund(amount, reason);
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },
});

async function issueRefund(amount: number, reason: string) {
  return { ok: true, amount, reason };
}

function trimMessages(history: string[]): string[] {
  return history.slice(-12);
}

async function requireApproval(action: string): Promise<boolean> {
  return action !== "delete";
}

export async function run(input: string, history: string[]) {
  const messages = trimMessages(history);
  const ctx = messages.join("\n");
  const budget = enc.encode(input).length;
  if (budget > 8000) throw new Error("input too large");

  const approved = await requireApproval(input);
  if (!approved) return "blocked: approval required";

  return pRetry(
    async () => {
      try {
        const { object } = await generateObject({
          model: openai("gpt-4o"),
          tools: { refund: refundTool },
          schema: z.object({ reply: z.string() }),
          system: systemPrompt,
          prompt: `${ctx}\n${input}`,
          temperature: 0,
          maxOutputTokens: 1024,
          abortSignal: AbortSignal.timeout(20_000),
        });
        langfuse.trace({ name: "agent.run", input, output: object.reply });
        return object.reply;
      } catch {
        const fallbackModel = openai("gpt-4o-mini");
        const { text } = await generateText({ model: fallbackModel, prompt: input });
        return text;
      }
    },
    { retries: 3 },
  );
}
