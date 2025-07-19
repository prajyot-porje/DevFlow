import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const chatModel = "gemini-2.5-flash-preview-04-17";

const chatConfig = {
  responseMimeType: "application/json",
  temperature: 0.7,
  maxOutputTokens: 2048, 
};

const codeConfig = {
  responseMimeType: "application/json", 
  temperature: 0.3, 
  maxOutputTokens: 32768, 
};

export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    const result = await ai.models.generateContent({
      model: chatModel,
      contents,
      config: chatConfig,
    });

    const response = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!response) {
      throw new Error("No response received from AI model");
    }
    
    console.log("Chat response length:", response.length);
    return response;
    
  } catch (error ) {
    console.error("Error in generateChatResponse:", error);
    throw new Error(`Failed to generate chat response: ${error}`);
  }
}

export async function generateCodeResponse(prompt: string): Promise<string> {
  const selectedModel = typeof window !== "undefined"
    ? localStorage.getItem("ai-model") || "gemini-2.5-flash"
    : "gemini-2.5-flash";
  const fallbackModel = 
    selectedModel === "gemini-2.5-flash-preview-04-17"
      ? "gemini-2.5-flash"
      : "gemini-2.5-flash-preview-04-17";

  async function tryGenerate(model: string) {
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const result = await ai.models.generateContent({
      model,
      contents,
      config: codeConfig,
    });
    const response = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!response) throw new Error("No response received from AI model");
    if (!response.includes('{') || !response.includes('}')) {
      throw new Error("Response does not appear to contain JSON structure");
    }
    return response;
  }

  try {
    return await tryGenerate(selectedModel);
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } };
    if (
      err?.message?.includes("quota") ||
      err?.message?.includes("limit") ||
      err?.response?.status === 429
    ) {
      console.warn("Primary code model quota reached, switching to fallback model");
      try {
        return await tryGenerate(fallbackModel);
      } catch (fallbackError) {
        console.error("Error in fallback model:", fallbackError);
        throw new Error(`Failed to generate code response with fallback: ${fallbackError}`);
      }
    }
    console.error("Error in generateCodeResponse:", error);
    throw new Error(`Failed to generate code response: ${error}`);
  }
}