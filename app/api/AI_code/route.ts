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

    console.log(`[AI_CODE_ROUTE] User: ${userId} | Model: "${model}"`);

    const completion = await generateCompletionWithFallback({
      primaryModel: model || AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.15,
      maxTokens: 16384,
      validate: (text) => {
        const jsonText = extractJSON(text);
        const parsed = JSON.parse(jsonText);
        if (!parsed.files || typeof parsed.files !== "object") {
          throw new Error("JSON response is missing required 'files' object");
        }
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty model response");

    const jsonText = extractJSON(raw);
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown AI_CODE_ERROR";

    console.error("AI_CODE_ERROR:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
