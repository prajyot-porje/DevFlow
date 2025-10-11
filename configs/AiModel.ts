import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const chatModel = "gemini-2.0-flash-lite";

const chatConfig = {
  responseMimeType: "application/json",
  temperature: 0.7,
  maxOutputTokens: 2048,
};

const codeConfig = {
  responseMimeType: "application/json",
  temperature: 0.3,
  maxOutputTokens: 65536,
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
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    throw new Error(`Failed to generate chat response: ${error}`);
  }
}

export async function generateCodeResponse(prompt: string): Promise<string> {
  const primaryModel = "gemini-2.0-flash-lite";
  const fallbackModel = "gemini-2.5-flash-lite";

  async function tryGenerate(model: string): Promise<string> {
    try {
      const contents = [{ role: "user", parts: [{ text: prompt }] }];
      const result = await ai.models.generateContent({
        model,
        contents,
        config: codeConfig,
      });

      const response = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!response) {
        throw new Error("No response received from AI model");
      }

      if (!response.includes("{") || !response.includes("}")) {
        throw new Error("Response does not appear to contain JSON structure");
      }

      return response;
    } catch (error) {
      const err = error as { message?: string; response?: { status?: number } };
      if (err?.response?.status === 503) {
        console.warn(`Service unavailable for model ${model}.`);
      }
      throw error;
    }
  }

  try {
    // Try the primary model first
    return await tryGenerate(primaryModel);
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } };

    // Handle quota or service limit errors
    if (
      err?.message?.includes("quota") ||
      err?.message?.includes("limit") ||
      err?.response?.status === 429
    ) {
      console.warn("Primary model quota reached, switching to fallback model");
      try {
        return await tryGenerate(fallbackModel);
      } catch (fallbackError) {
        console.error("Error in fallback model:", fallbackError);
        throw new Error(`Failed to generate code response with fallback: ${fallbackError}`);
      }
    }

    // Handle other errors
    console.error("Error in generateCodeResponse:", error);
    throw new Error(`Failed to generate code response: ${error}`);
  }
}