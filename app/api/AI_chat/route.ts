import { generateChatResponse } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const responseText = await generateChatResponse(prompt);
    return NextResponse.json({ result: JSON.parse(responseText) }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ result: "Error processing request.", error: String(e) }, { status: 400 });
  }
}
