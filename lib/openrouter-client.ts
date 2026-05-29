export async function callOpenRouter(params: {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined in the environment variables.");
  }

  console.log(`[OPENROUTER] Connecting to model "${params.model}"...`);

  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, 8000);
  });

  const fetchPromise = fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
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

  let response: Response;
  try {
    response = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[OPENROUTER] Connection to "${params.model}" failed or timed out: ${errMsg}`);
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (response.status === 429) {
    console.warn(`[OPENROUTER] Model "${params.model}" returned 429 RATE_LIMITED`);
    throw new Error("RATE_LIMITED");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`[OPENROUTER] Model "${params.model}" returned error status: ${response.status}`);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  console.log(`[OPENROUTER] Connected to "${params.model}". Downloading response body...`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (content === undefined || content === null) {
    throw new Error("Invalid response format from OpenRouter");
  }

  return content;
}

export async function callBuilderWithFallback(
  systemPrompt: string,
  userMessage: string,
  selectedModel?: string
): Promise<string> {
  const DEFAULT_BUILDER_MODELS = [
    { model: "poolside/laguna-m.1:free", maxTokens: 32000 },
    { model: "nvidia/nemotron-3-super-120b-a12b:free", maxTokens: 32000 },
    { model: "deepseek/deepseek-v4-flash:free", maxTokens: 32000 },
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
    console.log(`[BUILDER] Attempt ${i + 1}/${builderQueue.length} using model "${model}"...`);
    try {
      const response = await callOpenRouter({
        model,
        systemPrompt,
        userMessage,
        maxTokens,
      });
      console.log(`[BUILDER] Success using model "${model}"!`);
      return response;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[BUILDER] Model "${model}" failed: ${errMsg}. Trying next fallback...`);
    }
  }

  throw new Error("All builder models failed");
}
