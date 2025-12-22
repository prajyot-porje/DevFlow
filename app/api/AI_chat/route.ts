import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

function extractJSON(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const clean = fenced ? fenced[1] : text;

  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON found in response");
  }

  return clean.slice(start, end + 1);
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const completion = await client.chat.completions.create({
      model: "Qwen/Qwen2.5-Coder-7B-Instruct:nscale",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty model response");

    const jsonText = extractJSON(raw);
    const parsed = JSON.parse(jsonText);

    return NextResponse.json({ result: parsed });
} catch (err: unknown) {
  const message =
    err instanceof Error ? err.message : "Unknown AI_CHAT_ERROR";

  console.error("AI_CHAT_ERROR:", message);

  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
}
