// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  // Check if the API key is set
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Simple test prompt to check if API key works
    const response = await ai.models.generateContent({
      model: 'gemma-3-4b-it',
      config: { responseMimeType: 'text/plain' },
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Say hello' }],
        },
      ],
    });

    // If response is received, API key is valid
    console.log('✅ API key is working!');
    console.log('Gemini says:', response.candidates?.[0]?.content?.parts?.[0]?.text || response);
  } catch (error) {
    // If error, API key is likely invalid or there is a network issue
    console.error('❌ API key test failed:', error.message || error);
    process.exit(1);
  }
}

main();
