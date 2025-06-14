import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const config = { responseMimeType: "text/plain" };
const model = "gemma-3n-e4b-it";
const contents = [{ role: "user", parts: [{ text: `INSERT_INPUT_HERE` }] }];

export const chatSession = ai.chats.create({
  model,
  config: {
    temperature: 0.5,
    maxOutputTokens: 1024,
  }
});

 const response = await ai.models.generateContentStream({
  model,
  config,
  contents,
});

for await (const chunk of response) {
  console.log(chunk.text);
}
