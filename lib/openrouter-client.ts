export async function callOpenRouter(params: {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  isUserSelected?: boolean;
  customApiKey?: string;
  timeoutMs?: number;
}): Promise<string> {
  const apiKey = params.customApiKey || process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY_1 || process.env.OPENROUTER_API_KEY_2;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined in the environment variables.");
  }

  const startTime = Date.now();
  console.log(`[OPENROUTER] Request: model="${params.model}" userSelected=${params.isUserSelected ?? false}`);

  // AbortController covers the ENTIRE request lifecycle including response body download.
  const controller = new AbortController();
  const timeoutMs = params.timeoutMs ?? 50000; // Default to 50s
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://devflow.app",
        "X-Title": "DevFlow",
      },
      body: JSON.stringify({
        model: params.model,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userMessage },
        ],
        max_tokens: params.maxTokens,
      }),
    });

    if (response.status === 429) {
      console.warn(`[OPENROUTER] Model "${params.model}" returned 429 RATE_LIMITED`);
      throw new Error("RATE_LIMITED");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[OPENROUTER] Model "${params.model}" returned error: ${response.status}`);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;
    const content = data.choices?.[0]?.message?.content;

    console.log(
      `[OPENROUTER] Response: model="${params.model}" duration=${duration}ms tokens=${data.usage?.total_tokens ?? "N/A"}`
    );

    if (content === undefined || content === null) {
      throw new Error("Invalid response format from OpenRouter");
    }

    return content;
  } catch (err: unknown) {
    const duration = Date.now() - startTime;
    const isAbort = err instanceof Error && err.name === "AbortError";
    if (isAbort) {
      console.warn(`[OPENROUTER] Model "${params.model}" timed out after ${duration}ms`);
      throw new Error("Timeout");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
