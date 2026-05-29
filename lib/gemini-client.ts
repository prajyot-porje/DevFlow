import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function callGeminiPlanner(userPrompt: string): Promise<string> {
  const ai = getClient();

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = result.text;
  if (!text) {
    throw new Error("Empty response from Gemini Planner");
  }
  return text;
}

export async function callGeminiRepair(
  filename: string,
  errorMessage: string,
  code: string
): Promise<string> {
  const ai = getClient();
  const prompt = `Fix all syntax errors in the following code. Return ONLY the corrected file content. No explanation, no markdown, no code fences.
Filename: ${filename}
Error: ${errorMessage}
Code to fix:
${code}`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = result.text;
  if (!text) {
    throw new Error("Empty response from Gemini Repair");
  }
  return text;
}
