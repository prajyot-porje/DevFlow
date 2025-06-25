import { generateCodeResponse } from "@/configs/AiModel";
import { NextResponse } from "next/server";

type FileContent = {
  code: string;
};

type ParsedResponse = {
  files?: Record<string, FileContent>;
};

/**
 * Safe JSON.parse with type fallback
 */
function tryParseJson<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

/**
 * Attempts to extract a valid JSON object using various strategies
 */
function extractJson(responseText: string): ParsedResponse {
  // Try full parse
  const parsed = tryParseJson<ParsedResponse>(responseText);
  if (parsed && parsed.files) return parsed;

  // Try ```json block
  const blockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (blockMatch) {
    const blockParsed = tryParseJson<ParsedResponse>(blockMatch[1]);
    if (blockParsed && blockParsed.files) return blockParsed;
  }

  // Try slicing between first and last braces
  const start = responseText.indexOf("{");
  const end = responseText.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const sliced = tryParseJson<ParsedResponse>(responseText.slice(start, end + 1));
    if (sliced && sliced.files) return sliced;
  }

  // Try extracting files object manually
  const filesMatch = responseText.match(/"files"\s*:\s*({[\s\S]*})/);
  if (filesMatch) {
    const wrapped = `{"files":${filesMatch[1]}}`;
    const manualParsed = tryParseJson<ParsedResponse>(wrapped);
    if (manualParsed && manualParsed.files) return manualParsed;
  }

  throw new Error("Failed to parse valid JSON from AI response");
}

export async function POST(request: Request) {
  try {
    const { prompt }: { prompt: string } = await request.json();
    const responseText: string = await generateCodeResponse(prompt);

    console.log("AI response preview:", responseText.slice(0, 300));

    let files: Record<string, FileContent> = {};

    try {
      const parsed = extractJson(responseText);
      files = parsed.files ?? {};
    } catch (parseError) {
      console.error("Parsing error:", parseError);
      return NextResponse.json(
        {
          error: "AI response is not valid JSON",
          details: String(parseError),
          sample: responseText.slice(0, 1000) + "...",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ files }, { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error", message: String(err) },
      { status: 400 }
    );
  }
}
