import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODELS = [
  "poolside/laguna-m.1:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "deepseek/deepseek-v4-flash:free",
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      signal: controller.signal,
      next: { revalidate: 60 }, // Cache response for 60 seconds
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenRouter returned status ${response.status}`);
    }

    const json = await response.json();
    const activeIds: string[] = Array.isArray(json?.data)
      ? json.data.map((m: { id: string }) => m.id)
      : [];

    const statuses: Record<string, "online" | "offline"> = {};
    for (const model of MODELS) {
      statuses[model] = activeIds.includes(model) ? "online" : "offline";
    }

    return NextResponse.json({ statuses });
  } catch (err) {
    console.error("[MODELS_STATUS] Failed to fetch OpenRouter models:", err);
    // If the check itself fails (e.g. connection timed out or blocked), fallback gracefully to online
    const fallbackStatuses: Record<string, "online" | "offline"> = {};
    for (const model of MODELS) {
      fallbackStatuses[model] = "online";
    }
    return NextResponse.json({ statuses: fallbackStatuses, error: "Status check failed" });
  }
}
