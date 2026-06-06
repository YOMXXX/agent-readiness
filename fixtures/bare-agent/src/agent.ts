import OpenAI from "openai";

const client = new OpenAI();

export async function run(input: string) {
  const res = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: input }],
  });
  return res.choices[0].message.content;
}
