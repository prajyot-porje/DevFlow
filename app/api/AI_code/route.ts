import { generateCodeResponse } from "@/configs/AiModel";
import { NextResponse } from "next/server";

type ParsedResponse = Record<string, unknown>;

function tryParseJson<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

function cleanJsonString(str: string): string {
  const startIndex = str.indexOf('{');
  if (startIndex === -1) return str;
  const endIndex = str.lastIndexOf('}');
  if (endIndex === -1) return str;
  
  let cleaned = str.slice(startIndex, endIndex + 1);
  cleaned = cleaned
    .replace(/```json\s*/g, '') 
    .replace(/```\s*/g, '') 
    .replace(/,(\s*[}\]])/g, '$1') 
    .replace(/\n\s*\n/g, '\n') 
    .trim();
  
  return cleaned;
}


function extractJson(responseText: string): ParsedResponse {
    const directParsed = tryParseJson<ParsedResponse>(responseText);
  if (directParsed) {
    return directParsed;
  }
  
  const cleaned = cleanJsonString(responseText);
  
  const cleanedParsed = tryParseJson<ParsedResponse>(cleaned);
  if (cleanedParsed) {
    return cleanedParsed;
  }
  
  const blockMatches = responseText.match(/```json\s*([\s\S]*?)\s*```/g);
  if (blockMatches) {
    for (const match of blockMatches) {
      const content = match.replace(/```json\s*/, '').replace(/\s*```/, '');
      const blockParsed = tryParseJson<ParsedResponse>(content);
      if (blockParsed) {
        return blockParsed;
      }
    }
  }
  
  const jsonMatches = responseText.match(/\{[\s\S]*\}/g);
  if (jsonMatches) {
    const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);
    for (const match of sortedMatches) {
      const matchParsed = tryParseJson<ParsedResponse>(match);
      if (matchParsed) {
        return matchParsed;
      }
    }
  }
  
  if (!responseText.includes('}') || !responseText.includes('{')) {
    throw new Error("Response appears to be truncated or incomplete");
  }
  
  const explanationMatch = responseText.match(/"description":\s*"([^"]*(?:\\.[^"]*)*)"/);
  
  if (explanationMatch) {
    const fallbackResponse: ParsedResponse = {
      description: explanationMatch[1],
      files: {},
      generatedFiles: [],
      error: "Response was partially parsed due to formatting issues"
    };
    return fallbackResponse;
  }
  
  throw new Error(`Failed to parse JSON from AI response. Response length: ${responseText.length}, First 500 chars: ${responseText.slice(0, 500)}`);
}


function validateResponse(parsed: ParsedResponse): boolean {
  if (!parsed || typeof parsed !== 'object') return false;
  if (!('description' in parsed) || !('files' in parsed)) {
    return false;
  }
  if (typeof parsed.files !== 'object' || parsed.files === null) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  try {
    const { prompt }: { prompt: string } = await request.json();
    const responseText: string = await generateCodeResponse(prompt);
    const parsedJson = extractJson(responseText);
    
    if (!validateResponse(parsedJson)) {
      throw new Error("Invalid response structure from AI");
    }
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
