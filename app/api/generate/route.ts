import { auth } from "@clerk/nextjs/server";
import { callGeminiPlanner, callGeminiRepair } from "@/lib/gemini-client";
import { callBuilderWithFallback, callOpenRouter } from "@/lib/openrouter-client";
import { safeParseJSON } from "@/lib/json-utils";
import { checkSyntax } from "@/lib/validator";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const runtime = "nodejs";
export const maxDuration = 120;

interface PlannerPlan {
  projectTitle: string;
  description: string;
  dependencies: Record<string, string>;
  files: string[];
  buildOrder: string[];
}

const PLAN_SYSTEM_PROMPT = `You are a technical planner for a React + Vite frontend code generator.
Analyze the user prompt and return ONLY a valid JSON object with no 
markdown, no explanation, no code fences, no extra text.
Schema:
{
  "projectTitle": "string",
  "description": "string",
  "dependencies": { "package-name": "version" },
  "files": ["src/App.jsx", "src/index.css", "src/main.jsx"],
  "buildOrder": ["src/index.css", "src/App.jsx", "src/main.jsx"]
}
Rules:
- Always include src/main.jsx, index.html, package.json in the files array.
- Always include them in buildOrder in this order: index.html first, 
  package.json second, CSS files third, component files last, 
  src/main.jsx always last.
- Only include npm dependencies that are actually needed beyond React 
  and Vite (those are always present).
- Use React 18, Vite 5, Tailwind CSS 3.
- Do not include devDependencies in the dependencies field.`;

const BUILDER_SYSTEM_PROMPT = `You are a React + Vite frontend code generator. Generate ONLY the raw 
file content with no explanation, no markdown code fences, no triple 
backticks, no commentary, no preamble.
Output only the exact file content that should be written to disk.
Rules:
- Use React 18 functional components with hooks only.
- Use Tailwind CSS 3 utility classes for all styling. No CSS-in-JS. 
  No styled-components. No inline style objects unless absolutely required.
- All import paths must be relative (e.g. ./components/Button).
- Do not use require(). Use ES module import/export only.
- Make designs visually impressive: use gradients, proper spacing, 
  modern typography, hover effects, and responsive layouts.
- For package.json, always output valid JSON and merge plan dependencies 
  into this exact base structure:
  {
    "name": "devflow-project",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": { "dev": "vite", "build": "vite build" },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    "devDependencies": {
      "vite": "^5.0.0",
      "@vitejs/plugin-react": "^4.0.0",
      "tailwindcss": "^3.4.0",
      "autoprefixer": "^10.4.0",
      "postcss": "^8.4.0"
    }
  }
- For index.html always load the Tailwind CDN as a fallback:
  <script src="https://cdn.tailwindcss.com"></script>
- For src/main.jsx always use:
  import React from 'react'
  import ReactDOM from 'react-dom/client'
  import './index.css'
  import App from './App'
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><App /></React.StrictMode>
  )`;

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

    const { prompt, workspaceId, selectedModel } = await req.json();
    if (
      !prompt ||
      typeof prompt !== "string" ||
      prompt.trim() === "" ||
      !workspaceId ||
      typeof workspaceId !== "string" ||
      workspaceId.trim() === ""
    ) {
      return new Response("Bad Request", { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined in the environment variables.");
    }
    const convex = new ConvexHttpClient(convexUrl);

    // Helpers to sync status, messages, and files to Convex in real-time
    const updateConvexStatus = async (status: "generating" | "done" | "error", details?: { title?: string; description?: string; error?: string }) => {
      try {
        const currentWorkspace = await convex.query(api.workspace.GetWorkspace, {
          workspaceID: workspaceId as Id<"workspaces">,
        });
        const currentInfo = currentWorkspace?.info || {};
        const updatedInfo = {
          ...currentInfo,
          status,
          ...(details?.title ? { title: details.title } : {}),
          ...(details?.description ? { description: details.description } : {}),
          ...(details?.error ? { error: details.error } : {}),
        };
        await convex.mutation(api.workspace.Updateinfo, {
          workspaceID: workspaceId as Id<"workspaces">,
          info: updatedInfo,
        });
      } catch (err) {
        console.error("[CONVEX_STATUS_ERROR] Failed to update workspace info:", getErrorMessage(err));
      }
    };

    const updateConvexProgress = async (newContent: string) => {
      try {
        const currentWorkspace = await convex.query(api.workspace.GetWorkspace, {
          workspaceID: workspaceId as Id<"workspaces">,
        });
        const messages = [...(currentWorkspace?.messages || [])];
        
        let assistantIndex = -1;
        // Search backwards for the last assistant message
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === "assistant" || (messages[i] as { type?: string }).type === "assistant") {
            assistantIndex = i;
            break;
          }
        }

        if (assistantIndex !== -1) {
          messages[assistantIndex].content = newContent;
        } else {
          messages.push({ role: "assistant", content: newContent, timestamp: Date.now() });
        }
        
        await convex.mutation(api.workspace.UpdateMessages, {
          workspaceID: workspaceId as Id<"workspaces">,
          message: messages,
        });
      } catch (err) {
        console.error("[CONVEX_PROGRESS_ERROR] Failed to update progress:", getErrorMessage(err));
      }
    };

    const saveConvexFile = async (filename: string, code: string) => {
      try {
        const currentWorkspace = await convex.query(api.workspace.GetWorkspace, {
          workspaceID: workspaceId as Id<"workspaces">,
        });
        const existingFiles = currentWorkspace?.files || {};
        const updatedFiles = {
          ...existingFiles,
          [filename]: { code },
        };
        await convex.mutation(api.workspace.UpdateFiles, {
          workspaceID: workspaceId as Id<"workspaces">,
          files: updatedFiles,
        });
      } catch (err) {
        console.error(`[CONVEX_FILE_ERROR] Failed to save file ${filename}:`, getErrorMessage(err));
      }
    };

    const encoder = new TextEncoder();
    const emit = (controller: ReadableStreamDefaultController, data: object) => {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      } catch {
        // Client disconnected. We swallow it to continue generation in background.
      }
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initialize status in Convex
          await updateConvexStatus("generating");
          await updateConvexProgress("Initializing planner...");

          // STEP 1 — PLANNER
          emit(controller, { type: "status", message: "Creating plan..." });

          let planText = "";
          try {
            const planPrompt = `${PLAN_SYSTEM_PROMPT}\n\nUser prompt: ${prompt}`;
            planText = await Promise.race([
              callGeminiPlanner(planPrompt),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Gemini planner timeout")), 12000)
              ),
            ]);
            console.log("[PLANNER] Gemini success! Raw plan text:\n", planText);
          } catch (geminiErr: unknown) {
            console.warn("[PLANNER] Gemini failed, falling back to OpenRouter queue. Error:", getErrorMessage(geminiErr));
            
            const PLANNER_FALLBACKS = [
              "meta-llama/llama-3.3-70b-instruct:free",
              "qwen/qwen-2.5-72b-instruct:free",
              "nvidia/nemotron-3-super-120b-a12b:free",
            ];
            
            let success = false;
            for (const model of PLANNER_FALLBACKS) {
              try {
                console.log(`[PLANNER] Attempting fallback model: "${model}"...`);
                planText = await callOpenRouter({
                  model,
                  systemPrompt: PLAN_SYSTEM_PROMPT,
                  userMessage: prompt,
                  maxTokens: 4096,
                });
                success = true;
                console.log(`[PLANNER] Success with fallback model: "${model}"! Raw plan text:\n`, planText);
                break;
              } catch (fallbackErr: unknown) {
                console.warn(`[PLANNER] Fallback model "${model}" failed:`, getErrorMessage(fallbackErr));
              }
            }
            
            if (!success) {
              throw new Error("All planner models failed to return a response.");
            }
          }

          let plan: PlannerPlan;
          try {
            plan = safeParseJSON(planText) as PlannerPlan;
            console.log("[PLANNER] Parsed Plan Object:", JSON.stringify(plan, null, 2));
          } catch (parseErr: unknown) {
            console.error("[PLANNER] JSON Parse error:", getErrorMessage(parseErr), "Raw text:", planText);
            emit(controller, {
              type: "error",
              message: "Planner failed to return valid JSON",
            });
            emit(controller, { type: "done" });
            controller.close();
            await updateConvexStatus("error", { error: "Planner failed to return valid JSON" });
            await updateConvexProgress("⚠️ **Error:** Planner failed to return valid JSON");
            return;
          }

          // Sync planner results with Convex
          await updateConvexStatus("generating", { title: plan.projectTitle, description: plan.description });
          await updateConvexProgress("Planning complete. Starting code generation...");
          emit(controller, { type: "status", message: "Planning complete" });
          emit(controller, { type: "plan", plan });

          // STEP 2 — BUILDER
          const generatedFiles = new Map<string, string>();
          const totalFiles = plan.buildOrder.length;
          console.log(`[BUILDER] Starting code generation for ${totalFiles} files.`);

          for (let i = 0; i < totalFiles; i++) {
            const filename = plan.buildOrder[i];
            const formattedFilename = filename.startsWith("/") ? filename : "/" + filename;

            emit(controller, {
              type: "status",
              message: `Generating ${formattedFilename} (${i + 1}/${totalFiles})...`,
            });
            console.log(`[BUILDER] Generating file: "${formattedFilename}" (${i + 1}/${totalFiles})...`);
            await updateConvexProgress(`Generating ${formattedFilename} (${i + 1}/${totalFiles})...`);

            let fileCode = "";
            let generatedLocally = false;

            if (formattedFilename === "/index.html") {
              fileCode = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${plan.projectTitle || "DevFlow App"}</title>
    <meta name="description" content="${plan.description || "Generated by DevFlow"}" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
              generatedLocally = true;
            } else if (formattedFilename === "/src/main.jsx" || formattedFilename === "/src/main.js") {
              fileCode = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
              generatedLocally = true;
            } else if (formattedFilename === "/package.json") {
              const cleanName = (plan.projectTitle || "devflow-project")
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-_]/g, "");
              const packageJsonObj = {
                name: cleanName || "devflow-project",
                private: true,
                version: "0.0.0",
                type: "module",
                description: plan.description || "Generated by DevFlow",
                scripts: {
                  dev: "vite",
                  build: "vite build"
                },
                dependencies: {
                  react: "^18.2.0",
                  "react-dom": "^18.2.0",
                  ...(plan.dependencies || {})
                },
                devDependencies: {
                  vite: "^5.0.0",
                  "@vitejs/plugin-react": "^4.0.0",
                  tailwindcss: "^3.4.0",
                  autoprefixer: "^10.4.0",
                  postcss: "^8.4.0"
                }
              };
              fileCode = JSON.stringify(packageJsonObj, null, 2);
              generatedLocally = true;
            }

            if (generatedLocally) {
              generatedFiles.set(formattedFilename, fileCode);
              console.log(`[BUILDER] Generated boilerplate file locally: "${formattedFilename}"`);
              await saveConvexFile(formattedFilename, fileCode);
            } else {
              const userMessage = `Generate the complete content for file: ${formattedFilename}
Project title: ${plan.projectTitle}
Project description: ${plan.description}
All files in this project: ${plan.files.map(f => f.startsWith("/") ? f : "/" + f).join(", ")}
Available dependencies: ${JSON.stringify(plan.dependencies)}

Output only the raw file content. No markdown. No explanation.`;

              try {
                const fileCodeResponse = await callBuilderWithFallback(BUILDER_SYSTEM_PROMPT, userMessage, selectedModel);
                generatedFiles.set(formattedFilename, fileCodeResponse);
                console.log(`[BUILDER] Success generating: "${formattedFilename}"!`);
              } catch (builderErr: unknown) {
                console.error(`[BUILDER] Failed to generate ${formattedFilename}:`, getErrorMessage(builderErr));
                emit(controller, {
                  type: "status",
                  message: `Skipping ${formattedFilename} — all models failed`,
                });
              }
            }
          }

          // STEP 3 — VALIDATOR
          for (const [filename, code] of generatedFiles.entries()) {
            const isBoilerplate = filename === "/package.json" || filename === "/index.html" || filename === "/src/main.jsx";
            let syntaxError = isBoilerplate ? null : checkSyntax(code, filename);
            if (!syntaxError) {
              emit(controller, { type: "file", filename, code });
              await saveConvexFile(filename, code);
              continue;
            }

            console.warn(`[VALIDATOR] Syntax error in ${filename}: ${syntaxError}`);
            emit(controller, {
              type: "status",
              message: `Syntax error in ${filename}, attempting auto-repair...`,
            });
            await updateConvexProgress(`Syntax error in ${filename}, attempting auto-repair...`);

            let currentCode = code;
            let repaired = false;
            for (let attempt = 1; attempt <= 2; attempt++) {
              try {
                currentCode = await callGeminiRepair(filename, syntaxError ?? "Unknown syntax error", currentCode);
                syntaxError = checkSyntax(currentCode, filename);
                if (!syntaxError) {
                  repaired = true;
                  break;
                }
              } catch (repairErr: unknown) {
                console.error(`[VALIDATOR] Repair attempt ${attempt} failed:`, getErrorMessage(repairErr));
              }
            }

            if (repaired) {
              emit(controller, { type: "file", filename, code: currentCode });
              emit(controller, {
                type: "status",
                message: `Auto-repaired syntax in ${filename}`,
              });
              await saveConvexFile(filename, currentCode);
              await updateConvexProgress(`Auto-repaired syntax in ${filename}`);
            } else {
              emit(controller, {
                type: "file",
                filename,
                code: currentCode,
                warning: "syntax_error",
              });
              await saveConvexFile(filename, currentCode);
            }
          }

          // Generate final success file list and messages
          const fileList = Object.keys(Object.fromEntries(generatedFiles))
            .map((f) => `- \`${f}\``)
            .join("\n");
          const finalContent = `I have successfully generated your project: **${plan.projectTitle}**!\n\n**Description:**\n${plan.description}\n\n**Files generated:**\n${fileList}`;

          await updateConvexStatus("done", { title: plan.projectTitle, description: plan.description });
          await updateConvexProgress(finalContent);

          emit(controller, { type: "done" });
          controller.close();
        } catch (innerErr: unknown) {
          console.error("[STREAM_PIPELINE_ERROR] Inner pipeline error:", getErrorMessage(innerErr));
          emit(controller, {
            type: "error",
            message: getErrorMessage(innerErr) || "An error occurred during generation pipeline",
          });
          emit(controller, { type: "done" });
          controller.close();
          await updateConvexStatus("error", { error: getErrorMessage(innerErr) || "An error occurred during generation pipeline" });
          await updateConvexProgress(`⚠️ **Error during generation:** ${getErrorMessage(innerErr) || "An error occurred during generation pipeline"}`);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("[STREAM_ROUTE_ERROR] Route error:", getErrorMessage(err));
    return new Response(
      JSON.stringify({ error: getErrorMessage(err) || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
