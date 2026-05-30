export async function callOpenRouter(params: {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  isUserSelected?: boolean;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined in the environment variables.");
  }

  const startTime = Date.now();
  console.log(`[OPENROUTER] Request: model="${params.model}" userSelected=${params.isUserSelected ?? false}`);

  // AbortController covers the ENTIRE request lifecycle including response body download.
  // This fixes the critical bug where response.json() could block indefinitely
  // after the connection was established, exceeding Vercel's timeout.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s total budget per model

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

export async function callBuilderWithFallback(
  systemPrompt: string,
  userMessage: string,
  selectedModel?: string
): Promise<{ content: string; modelUsed: string }> {
  const DEFAULT_BUILDER_MODELS = [
    { model: "poolside/laguna-m.1:free", maxTokens: 32000 },
    { model: "nvidia/nemotron-3-super-120b-a12b:free", maxTokens: 32000 },
    { model: "deepseek/deepseek-v4-flash:free", maxTokens: 32000 },
    { model: "openrouter/free", maxTokens: 32000 },
  ];

  let builderQueue = [...DEFAULT_BUILDER_MODELS];
  if (selectedModel && selectedModel !== "auto") {
    const selectedItem = DEFAULT_BUILDER_MODELS.find(m => m.model === selectedModel);
    if (selectedItem) {
      builderQueue = [selectedItem, ...DEFAULT_BUILDER_MODELS.filter(m => m.model !== selectedModel)];
    }
  }

  for (let i = 0; i < builderQueue.length; i++) {
    const { model, maxTokens } = builderQueue[i];
    const isUserSelected = i === 0 && selectedModel === model;
    console.log(`[BUILDER] Attempt ${i + 1}/${builderQueue.length} using model "${model}"...`);
    try {
      const content = await callOpenRouter({
        model,
        systemPrompt,
        userMessage,
        maxTokens,
        isUserSelected,
      });
      console.log(`[BUILDER] Success using model "${model}"!`);
      return { content, modelUsed: model };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[BUILDER] Model "${model}" failed: ${errMsg}. Trying next fallback...`);
    }
  }

  throw new Error("All builder models failed");
}
