import { auth } from "@clerk/nextjs/server";
import { callGeminiPlanner } from "@/lib/gemini-client";
import { callOpenRouter } from "@/lib/openrouter-client";
import { safeParseJSON } from "@/lib/json-utils";

export const runtime = "nodejs";

interface PlannerPlan {
  projectTitle: string;
  description: string;
  dependencies: Record<string, string>;
  designSystem?: {
    style: string;
    colors: { primary: string; accent: string; background: string };
    fontFamily: string;
  };
  sections?: string[];
  files: string[];
  buildOrder: string[];
  recommendations?: string[];
}

const PLAN_SYSTEM_PROMPT = `You are a technical planner for a React + Vite frontend code generator.
Analyze the user prompt and return ONLY a valid JSON object with no
markdown, no explanation, no code fences, no extra text.
Schema:
{
  "projectTitle": "string",
  "description": "string",
  "dependencies": { "package-name": "version" },
  "designSystem": {
    "style": "e.g. Modern SaaS, Minimal, Glassmorphism, Dark Premium",
    "colors": { "primary": "#hex", "accent": "#hex", "background": "#hex" },
    "fontFamily": "e.g. Inter, sans-serif"
  },
  "sections": ["Navbar", "Hero", "Features", "...more as needed"],
  "files": ["src/App.jsx", "src/components/Navbar.jsx", "src/components/Hero.jsx"],
  "buildOrder": ["index.html", "package.json", "src/index.css", "src/components/Navbar.jsx", "src/App.jsx", "src/main.jsx"],
  "recommendations": ["string", "string"]
}
Rules:
- Always include src/main.jsx, index.html, package.json, src/index.css in files.
- For any UI with multiple sections (landing pages, dashboards, multi-section apps),
  create separate component files under src/components/ for each section.
- App.jsx should ONLY import and compose components — never contain inline section code.
- Each component file should focus on one section (e.g. Hero.jsx, Features.jsx, Footer.jsx).
- buildOrder: index.html first, package.json second, CSS third, component files next,
  App.jsx after all components, src/main.jsx always last.
- The "sections" array lists UI sections in display order.
- The "designSystem" must define a cohesive visual theme matching the project type.
- Only include npm dependencies actually needed beyond React and Vite.
- Use React 18, Vite 5, Tailwind CSS 3.
- Do not include devDependencies in the dependencies field.
- In "recommendations", provide exactly 2 short prompt suggestions (max 60 chars) for next enhancements.`;

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return new Response("Bad Request: Missing prompt", { status: 400 });
    }

    console.log(`[PLANNER_ROUTE] Prompt: "${prompt.slice(0, 80)}..."`);
    const plannerStart = Date.now();

    // Load Gemini API Keys for sequential self-healing
    const geminiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
    ].filter(Boolean) as string[];

    let planText = "";
    let plannerSuccess = false;

    for (let k = 0; k < geminiKeys.length; k++) {
      const selectedGeminiKey = geminiKeys[k];
      try {
        console.log(`[PLANNER_ROUTE] Attempting Gemini planner with key index ${k}...`);
        const planPrompt = `${PLAN_SYSTEM_PROMPT}\n\nUser prompt: ${prompt}`;
        planText = await Promise.race([
          callGeminiPlanner(planPrompt, selectedGeminiKey),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini planner timeout")), 12000)
          ),
        ]);
        plannerSuccess = true;
        const plannerDuration = Date.now() - plannerStart;
        console.log(`[PLANNER_ROUTE] Gemini success (key index ${k}) | Duration: ${plannerDuration}ms`);
        break;
      } catch (geminiErr: unknown) {
        console.warn(`[PLANNER_ROUTE] Gemini key index ${k} failed:`, getErrorMessage(geminiErr));
      }
    }

    // OpenRouter fallback with key rotation if both Gemini keys failed
    if (!plannerSuccess) {
      console.warn("[PLANNER_ROUTE] All Gemini keys failed, falling back to OpenRouter queue...");
      
      const PLANNER_FALLBACKS = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "qwen/qwen3-coder:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
      ];

      const openrouterKeys = [
        process.env.OPENROUTER_API_KEY_1,
        process.env.OPENROUTER_API_KEY_2,
      ].filter(Boolean) as string[];
      
      let success = false;
      for (const model of PLANNER_FALLBACKS) {
        // Randomly select one OpenRouter key to distribute fallback requests
        const selectedOpenRouterKey = openrouterKeys.length > 0
          ? openrouterKeys[Math.floor(Math.random() * openrouterKeys.length)]
          : undefined;

        try {
          console.log(`[PLANNER_ROUTE] Attempting fallback model: "${model}"...`);
          planText = await callOpenRouter({
            model,
            systemPrompt: PLAN_SYSTEM_PROMPT,
            userMessage: prompt,
            maxTokens: 4096,
            customApiKey: selectedOpenRouterKey,
            timeoutMs: 25000, // 25s timeout for fallback planner models
          });
          success = true;
          console.log(`[PLANNER_ROUTE] Success with fallback model: "${model}"!`);
          break;
        } catch (fallbackErr: unknown) {
          console.warn(`[PLANNER_ROUTE] Fallback model "${model}" failed:`, getErrorMessage(fallbackErr));
        }
      }
      
      if (!success) {
        throw new Error("All planner models failed to return a response.");
      }
    }

    let plan: PlannerPlan;
    try {
      plan = safeParseJSON(planText) as PlannerPlan;
    } catch (parseErr: unknown) {
      console.error("[PLANNER_ROUTE] JSON Parse error:", getErrorMessage(parseErr), "Raw text:", planText);
      return new Response(
        JSON.stringify({ error: "Planner failed to return valid JSON" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ensure boilerplate config files are in the plan
    const BOILERPLATE_CONFIGS = ["vite.config.js", "tailwind.config.js", "postcss.config.js"];
    for (const configFile of BOILERPLATE_CONFIGS) {
      const isPresent = (f: string) => (f.startsWith("/") ? f.substring(1) : f) === configFile;
      if (!plan.buildOrder.some(isPresent)) {
        plan.buildOrder.push(configFile);
      }
      if (!plan.files.some(isPresent)) {
        plan.files.push(configFile);
      }
    }

    return Response.json(plan);
  } catch (err: unknown) {
    console.error("[PLANNER_ROUTE] Route error:", getErrorMessage(err));
    return new Response(
      JSON.stringify({ error: getErrorMessage(err) || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
