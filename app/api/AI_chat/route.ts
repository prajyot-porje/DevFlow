import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AI_MODEL, extractJSON, generateCompletionWithFallback } from "@/lib/ai-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized — please sign in" },
        { status: 401 }
      );
    }

    const { prompt, model } = await req.json();

    console.log(`[AI_CHAT_ROUTE] User: ${userId} | Model: "${model}"`);

    const completion = await generateCompletionWithFallback({
      primaryModel: model || AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      maxTokens: 2048,
      validate: (text) => {
        const jsonText = extractJSON(text);
        const parsed = JSON.parse(jsonText);
        if (!parsed.userResponse || !parsed.modelResponse) {
          throw new Error("JSON response is missing required userResponse or modelResponse fields");
        }
      },
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
