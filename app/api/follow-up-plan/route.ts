import { auth } from "@clerk/nextjs/server";
import { callGeminiPlanner } from "@/lib/gemini-client";
import { callOpenRouter } from "@/lib/openrouter-client";
import { safeParseJSON } from "@/lib/json-utils";

export const runtime = "nodejs";
export const maxDuration = 120;

const FOLLOW_UP_SYSTEM_PROMPT = `You are a code change planner for a React + Vite project.
Given an existing project's file list and a user request, determine the minimal set of files that need to be changed or created.
Return ONLY a valid JSON object with no markdown, no explanation, no code fences.
Schema:
{
  "filesToChange": ["src/components/Navbar.jsx"],
  "changeReason": "Brief description of what needs to change and why"
}
Rules:
- Only include files that genuinely need to be modified or regenerated.
- If a component's props or exports change, include its parent (e.g. App.jsx) only if it imports that component and the interface changed.
- If the request adds a new section, include the new file AND App.jsx.
- If the request mentions a specific error with a component name, include only that file.
- Never include boilerplate files: index.html, package.json, src/main.jsx, src/index.css, vite.config.js, tailwind.config.js, postcss.config.js.
- Minimum 1 file. Maximum the full component list only if a complete redesign is requested.
- Return an empty filesToChange array ONLY if no code changes are needed at all.`;

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { userPrompt, existingFiles, existingPlan } = await req.json();
    if (!userPrompt || !existingFiles) {
      return new Response("Bad Request: Missing userPrompt or existingFiles", { status: 400 });
    }

    const projectTitle = existingPlan?.projectTitle || "DevFlow Project";
    const description = existingPlan?.description || "React + Vite Application";

    const userMessage = `Existing project: "${projectTitle}" — ${description}
Existing files: ${existingFiles.join(", ")}
User request: ${userPrompt}`;

    const geminiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
    ].filter(Boolean) as string[];

    let resultText = "";
    let success = false;

    for (const key of geminiKeys) {
      try {
        resultText = await Promise.race([
          callGeminiPlanner(`${FOLLOW_UP_SYSTEM_PROMPT}\n\n${userMessage}`, key),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini timeout")), 12000)
          ),
        ]);
        success = true;
        break;
      } catch (err) {
        console.warn("[FOLLOW_UP_PLAN] Gemini failed:", getErrorMessage(err));
      }
    }

    if (!success) {
      const FALLBACK_MODELS = [
        "nvidia/nemotron-3-super-120b-a12b:free",
        "openai/gpt-oss-20b:free",
        "meta-llama/llama-3.3-70b-instruct:free",
      ];
      const openrouterKeys = [
        process.env.OPENROUTER_API_KEY_1,
        process.env.OPENROUTER_API_KEY_2,
      ].filter(Boolean) as string[];

      for (const model of FALLBACK_MODELS) {
        const key = openrouterKeys[Math.floor(Math.random() * openrouterKeys.length)];
        try {
          resultText = await callOpenRouter({
            model,
            systemPrompt: FOLLOW_UP_SYSTEM_PROMPT,
            userMessage,
            maxTokens: 1024,
            customApiKey: key,
            timeoutMs: 25000,
          });
          success = true;
          break;
        } catch (err) {
          console.warn(`[FOLLOW_UP_PLAN] ${model} failed:`, getErrorMessage(err));
        }
      }
    }

    if (!success) {
      return new Response(
        JSON.stringify({ error: "Follow-up planner failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const parsed = safeParseJSON(resultText) as {
      filesToChange: string[];
      changeReason: string;
    };

    if (!parsed?.filesToChange || !Array.isArray(parsed.filesToChange)) {
      return new Response(
        JSON.stringify({ error: "Invalid planner response" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return Response.json(parsed);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: getErrorMessage(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
