import { generateCodeResponse } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const responseText = await generateCodeResponse(prompt);

    let files = {};
    try {
      const parsed = JSON.parse(responseText);
      files = parsed.files || {};
    } catch (e) {
      console.error("AI response is not valid JSON:", e);
      return NextResponse.json(
        { error: "AI response is not valid JSON", raw: responseText },
        { status: 500 }
      );
    }

    return NextResponse.json({ files }, { status: 200 });
  } catch (e) {
    console.error("Error generating code response:", e);
    return NextResponse.json(
      { result: "Error generating code.", error: String(e) },
      { status: 400 }
    );
  }
}