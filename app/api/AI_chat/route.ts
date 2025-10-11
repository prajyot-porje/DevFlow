import { generateChatResponse } from "@/configs/AiModel";
import { NextResponse } from "next/server";

function sanitizeJSON(text: string) {
  return text
    .replace(/```json/gi, "") // remove ```json
    .replace(/```/g, "")      // remove remaining ```
    .trim();
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const responseText = await generateChatResponse(prompt);

    let parsedResult;

    // Try parsing as JSON after cleanup
    try {
      parsedResult = JSON.parse(sanitizeJSON(responseText));
    } catch {
      parsedResult = responseText; // fallback to raw text
    }

    return NextResponse.json({ result: parsedResult }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { result: "Error processing request.", error: String(e) },
      { status: 400 }
    );
  }
}
