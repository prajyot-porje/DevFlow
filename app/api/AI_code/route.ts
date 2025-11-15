import { generateCodeResponse } from "@/configs/AiModel";
import { NextResponse } from "next/server";

type ParsedResponse = {
  description?: string;
  files?: Record<string, { code: string }>;
  generated_files?: string[];
  [key: string]: any;
};

/**
 * Safely parse JSON, return null if fails
 */
function tryParseJson<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

function cleanJsonString(str: string): string {
  const startIndex = str.indexOf("{");
  const endIndex = str.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1) return str;

  let cleaned = str.slice(startIndex, endIndex + 1);
  cleaned = cleaned
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return cleaned;
}

/**
 * Extract JSON safely from AI response
 */
function extractJson(responseText: string): ParsedResponse {
  const directParsed = tryParseJson<ParsedResponse>(responseText);
  if (directParsed) return directParsed;

  const cleaned = cleanJsonString(responseText);
  const cleanedParsed = tryParseJson<ParsedResponse>(cleaned);
  if (cleanedParsed) return cleanedParsed;

  const blockMatches = responseText.match(/```json\s*([\s\S]*?)\s*```/g);
  if (blockMatches) {
    for (const match of blockMatches) {
      const content = match.replace(/```json\s*/, '').replace(/\s*```/, '');
      const blockParsed = tryParseJson<ParsedResponse>(content);
      if (blockParsed) return blockParsed;
    }
  }

  const jsonMatches = responseText.match(/\{[\s\S]*\}/g);
  if (jsonMatches) {
    const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);
    for (const match of sortedMatches) {
      const matchParsed = tryParseJson<ParsedResponse>(match);
      if (matchParsed) return matchParsed;
    }
  }

  throw new Error(`Failed to parse JSON from AI response. Response length: ${responseText.length}, First 500 chars: ${responseText.slice(0, 500)}`);
}

/**
 * Normalize AI response to always { "/path": { code: "..." } }
 */
function normalizeFiles(raw: ParsedResponse): Record<string, { code: string }> {
  if (!raw) return {};

  // Case 1: Expected structure
  if (raw.files && typeof raw.files === "object" && !Array.isArray(raw.files)) {
    return raw.files;
  }

  // Case 2: Array of files [{ filename, content }]
  if (Array.isArray(raw.files)) {
    const files: Record<string, { code: string }> = {};
    for (const f of raw.files) {
      if (f.filename && f.content) files[f.filename] = { code: f.content };
    }
    return files;
  }

  // Case 3: Malformed / legacy like {"0": { filename, content }}
  const files: Record<string, { code: string }> = {};
  for (const key in raw) {
    const val = raw[key];
    if (val?.filename && val?.content) {
      files[val.filename] = { code: val.content };
    } else if (val?.code) {
      files[key] = { code: val.code };
    }
  }
  return files;
}

/**
 * Validate parsed response
 */
function validateResponse(parsed: ParsedResponse): boolean {
  if (!parsed || typeof parsed !== 'object') return false;
  if (!('description' in parsed) || !('files' in parsed)) return false;
  if (typeof parsed.files !== 'object' || parsed.files === null) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const { prompt }: { prompt: string } = await request.json();

    // Generate AI code
    const responseText: string = await generateCodeResponse(prompt);

    // Parse JSON safely
    const parsedJson = extractJson(responseText);

    // Normalize files
    const files = normalizeFiles(parsedJson);
    parsedJson.files = files;

    // Optional sanity check
    if (!files || Object.keys(files).length === 0) {
      throw new Error("AI returned no valid files. Possibly invalid response.");
    }
    if (!validateResponse(parsedJson)) {
  throw new Error("Invalid response structure from AI");
}


    // Ensure generated_files array exists
    parsedJson.generated_files = parsedJson.generated_files || Object.keys(files);

    return NextResponse.json(parsedJson, { status: 200 });
  } catch (err) {
    console.error("💥 Error in POST handler:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Failed to handle request",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}
