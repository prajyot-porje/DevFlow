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
  const timeoutMs = params.timeoutMs ?? 25000; // Default to 25s instead of 55s
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

export async function callBuilderWithFallback(
  systemPrompt: string,
  userMessage: string,
  selectedModel?: string,
  customApiKey?: string
): Promise<{ content: string; modelUsed: string }> {
  // Optimize models and token limits (8192 tokens max) to speed up latency
  const DEFAULT_BUILDER_MODELS = [
    { model: "poolside/laguna-m.1:free", maxTokens: 8192 },
    { model: "qwen/qwen3-coder:free", maxTokens: 8192 },
    { model: "deepseek/deepseek-v4-flash:free", maxTokens: 8192 },
    { model: "nvidia/nemotron-3-super-120b-a12b:free", maxTokens: 8192 },
    { model: "openrouter/free", maxTokens: 8192 },
  ];

  let builderQueue = [...DEFAULT_BUILDER_MODELS];
  if (selectedModel && selectedModel !== "auto") {
    const selectedItem = DEFAULT_BUILDER_MODELS.find(m => m.model === selectedModel);
    if (selectedItem) {
      builderQueue = [selectedItem, ...DEFAULT_BUILDER_MODELS.filter(m => m.model !== selectedModel)];
    }
  }

  const overallBudgetMs = 50000; // Hard limit: 50s total execution budget for this single file request
  const fileStartTime = Date.now();

  for (let i = 0; i < builderQueue.length; i++) {
    const { model, maxTokens } = builderQueue[i];
    
    const elapsed = Date.now() - fileStartTime;
    const remainingForFile = overallBudgetMs - elapsed;
    
    // Fail-fast if we have less than 5s left
    if (remainingForFile < 5000) {
      console.warn(`[BUILDER] Skipping model "${model}" due to low remaining budget (${remainingForFile}ms left)`);
      break;
    }
    
    // Clamp the timeout of this attempt to the smaller of 25s or the remaining budget
    const attemptTimeout = Math.min(25000, remainingForFile);
    
    const isUserSelected = i === 0 && selectedModel === model;
    console.log(`[BUILDER] Attempt ${i + 1}/${builderQueue.length} using model "${model}" (timeout: ${attemptTimeout}ms)...`);
    try {
      const content = await callOpenRouter({
        model,
        systemPrompt,
        userMessage,
        maxTokens,
        isUserSelected,
        customApiKey,
        timeoutMs: attemptTimeout,
      });
      console.log(`[BUILDER] Success using model "${model}"!`);
      return { content, modelUsed: model };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[BUILDER] Model "${model}" failed: ${errMsg}. Trying next fallback...`);
    }
  }

  throw new Error("All builder models failed or timed out within the 50s budget");
}
