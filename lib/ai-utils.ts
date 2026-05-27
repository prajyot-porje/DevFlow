import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Shared AI client
// Configured to use OpenRouter API.
// ---------------------------------------------------------------------------

export const aiClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://devflow.ai",
    "X-Title": "DevFlow",
  },
});

// Default to openrouter/free, which automatically routes to the best available free model.
export const AI_MODEL = "openrouter/free";

// List of fallback free models from OpenRouter to cycle through on errors
export const FALLBACK_MODELS = [
  "openrouter/free",
  "qwen/qwen-2.5-72b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-31b-it:free",
  "z-ai/glm-4.5-air:free",
  "openai/gpt-oss-120b:free",
  "google/gemma-4-26b-a4b-it:free",
];

/**
 * Attempts to generate a chat completion. If the primary model fails (due to rate limits, 
 * endpoints not found, temporary outages, or output validation failures), it automatically 
 * cycles through the fallback models.
 */
export async function generateCompletionWithFallback({
  primaryModel,
  messages,
  temperature,
  maxTokens,
  validate,
}: {
  primaryModel: string;
  messages: OpenAI.ChatCompletionMessageParam[];
  temperature: number;
  maxTokens: number;
  validate?: (text: string) => void;
}) {
  // Ensure the primary model is tried first, followed by fallbacks without duplicates
  const modelsToTry = [
    primaryModel,
    ...FALLBACK_MODELS.filter((m) => m !== primaryModel),
  ];

  console.log(`[AI_CLIENT] Starting LLM generation request.`);
  console.log(`[AI_CLIENT] Primary Model Requested: "${primaryModel}"`);
  console.log(`[AI_CLIENT] Fallback Queue:`, modelsToTry.slice(1));

  let lastError: unknown = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    console.log(`[AI_CLIENT] Attempt ${i + 1}/${modelsToTry.length} using model "${model}"...`);

    try {
      const completion = await aiClient.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error(`Empty response content returned from model "${model}"`);
      }

      // If a validator is provided, run it. If it throws, this attempt counts as a failure.
      if (validate) {
        console.log(`[AI_CLIENT] Validating response format for "${model}"...`);
        try {
          validate(responseText);
          console.log(`[AI_CLIENT] Validation passed.`);
        } catch (valErr) {
          console.warn(
            `[AI_CLIENT] Validation failed for "${model}". First 150 chars: "${responseText.slice(
              0,
              150
            )}..."`
          );
          throw new Error(`Validation failed: ${valErr instanceof Error ? valErr.message : String(valErr)}`);
        }
      }

      console.log(`[AI_CLIENT] Success! Response generated using model "${model}" (${responseText.length} chars).`);
      return completion;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI_CLIENT] Attempt ${i + 1} ("${model}") failed with error:`, errMsg);
      lastError = err;

      // Continue to next model if available
      if (i < modelsToTry.length - 1) {
        console.log(`[AI_CLIENT] Switching to next fallback model...`);
      }
    }
  }

  console.error(`[AI_CLIENT] All attempts in fallback queue failed.`);
  throw lastError || new Error("All model endpoints failed to respond");
}

// ---------------------------------------------------------------------------
// extractJSON
// Strips optional markdown fences and returns the first complete JSON object
// found in an LLM response string. Shared between AI_chat and AI_code routes.
// ---------------------------------------------------------------------------

export function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const clean = fenced ? fenced[1] : text;

  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON found in response");
  }

  return clean.slice(start, end + 1);
}
