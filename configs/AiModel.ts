import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const chatModel = "gemini-2.5-flash-preview-05-20"; 
const codeModel = "gemini-2.5-flash-preview-05-20"; 
const chatConfig = {
  responseMimeType: "text/plain",
};
const codeConfig = {
  responseMimeType: "application/json",
};


export async function generateChatResponse(prompt: string): Promise<string> {
  const contents = [{ role: "user", parts: [{ text: prompt }] }];

  const result = await ai.models.generateContent({
    model: chatModel,
    contents,
    config: chatConfig,
  });

  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

export async function generateCodeResponse(prompt: string): Promise<string> {
  const contents = [{ role: "user", parts: [{ text: prompt }] }];

  const result = await ai.models.generateContent({
    model: codeModel,
    contents,
    config: codeConfig,
  });

  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}
