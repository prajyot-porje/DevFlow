import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { GetUserDetails } from "@/hooks/GetUserDetails";
import type { ChatMessage } from "@/data/Types";
import { greetingMessage } from "@/data/data";
import type { InputFileStructure } from "./useWebContainer";
import { generateUniqueId } from "@/lib/utils";
import { toast } from "sonner";

interface UseAIChatOptions {
  workspaceId: string;
  files: InputFileStructure;
  onFilesGenerated: (newFiles: InputFileStructure) => Promise<InputFileStructure>;
  incomingMessage: string | null;
  fromTemplate: boolean;
  templateName: string | null;
  loadWorkspace?: (isSilent?: boolean) => Promise<any>;
}

async function runWithConcurrencyLimit<T, R>(
  limit: number,
  items: T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const pool = new Set<Promise<void>>();
  const results: R[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const p = fn(item, i).then((r) => {
      results.push(r);
      pool.delete(p);
    });
    pool.add(p);
    if (pool.size >= limit) {
      await Promise.race(pool);
    }
  }
  await Promise.all(pool);
  return results;
}

export function useAIChat({
  workspaceId,
  files,
  onFilesGenerated,
  incomingMessage,
  fromTemplate,
  templateName,
  loadWorkspace,
}: UseAIChatOptions) {
  const router = useRouter();
  const user = useUser();
  const userDetails = GetUserDetails();
  const convex = useConvex();

  const updateMessages = useMutation(api.workspace.UpdateMessages);
  const updateInfo = useMutation(api.workspace.Updateinfo);
  const updateFiles = useMutation(api.workspace.UpdateFiles);
  const canStartConversation = useMutation(api.users.canStartConversation);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (incomingMessage) return [];
    if (fromTemplate && templateName) return [];
    return [greetingMessage];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [responseReceived, setResponseReceived] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modelParam = params.get("model");
      if (modelParam) {
        setSelectedModel(modelParam);
      } else {
        const storedModel = localStorage.getItem("ai-model");
        if (storedModel) {
          setSelectedModel(storedModel);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem("ai-model", selectedModel);
    }
  }, [selectedModel]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const updateWorkspaceInfoIfNeeded = useCallback(
    async (newTitle?: string, newDesc?: string) => {
      if (!workspaceId) return;
      const workspace = await convex.query(api.workspace.GetWorkspace, {
        workspaceID: workspaceId as Id<"workspaces">,
      });
      const info = workspace?.info || {};
      let shouldUpdate = false;
      const updatedInfo: Record<string, unknown> = { ...info };

      if (newTitle && !info.title) {
        updatedInfo.title = newTitle;
        shouldUpdate = true;
      }
      if (newDesc && !info.description) {
        updatedInfo.description = newDesc;
        shouldUpdate = true;
      }
      if (shouldUpdate) {
        await updateInfo({
          workspaceID: workspaceId as Id<"workspaces">,
          info: updatedInfo,
        });
      }
    },
    [convex, workspaceId, updateInfo]
  );

  const GetAiResponse = useCallback(
    async (currentMessages: ChatMessage[]) => {
      setIsLoading(true);
      setGeneratingCode(true);
      setResponseReceived(false);

      const prompt = currentMessages[currentMessages.length - 1].content;
      const collectedFiles: Record<string, { code: string }> = {};
      const assistantMsgId = generateUniqueId();
      let assistantMsgAdded = false;
      let planTitle = "";
      let planDesc = "";
      let planFiles: string[] = [];
      const fileStatuses: Record<string, "pending" | "generating" | "success" | "failed"> = {};

      const constructContent = (statusMessage: string) => {
        let content = `**Project:** ${planTitle || "DevFlow Project"}\n`;
        content += `**Status:** ${statusMessage}\n\n`;
        if (planFiles.length > 0) {
          content += `**Files:**\n`;
          planFiles.forEach((file) => {
            const normalized = file.startsWith("/") ? file : "/" + file;
            const status = fileStatuses[normalized] || "pending";
            let statusChar = " ";
            if (status === "generating") statusChar = "/";
            else if (status === "success") statusChar = "x";
            else if (status === "failed") statusChar = "!";
            content += `- [${statusChar}] \`${normalized}\`\n`;
          });
        }
        return content.trim();
      };

      const mapMessagesToDb = (msgsArray: any[]) => {
        return msgsArray.map((msg) => {
          const role = "role" in msg ? msg.role : (msg.type === "user" ? "user" : "assistant");
          return {
            role,
            content: msg.content,
            timestamp: msg.timestamp,
          };
        });
      };

      // Set initial user messages
      setMessages(currentMessages);
      scrollToBottom();

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        // Step 1: Call /api/plan
        const planResponse = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal,
        });

        if (!planResponse.ok) {
          throw new Error(`Failed to generate plan: ${planResponse.statusText}`);
        }

        const plan = await planResponse.json();
        console.log("[useAIChat] Plan generated:", plan);

        planTitle = plan.projectTitle;
        planDesc = plan.description;
        planFiles = plan.buildOrder || [];
        
        planFiles.forEach((file) => {
          const normalized = file.startsWith("/") ? file : "/" + file;
          fileStatuses[normalized] = "pending";
        });

        if (plan.recommendations) {
          setRecommendations(plan.recommendations);
        }

        // Initialize status in Convex
        await updateInfo({
          workspaceID: workspaceId as Id<"workspaces">,
          info: {
            status: "generating",
            title: plan.projectTitle,
            description: plan.description,
            recommendations: plan.recommendations,
          },
        });

        const initialContent = constructContent("Planning complete. Generating files...");

        // Add the assistant message placeholder
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            type: "assistant",
            content: initialContent,
            timestamp: Date.now(),
          },
        ]);
        assistantMsgAdded = true;

        await updateMessages({
          workspaceID: workspaceId as Id<"workspaces">,
          message: mapMessagesToDb([...currentMessages, {
            role: "assistant",
            content: initialContent,
            timestamp: Date.now()
          }]),
        });

        const currentFiles = { ...files };
        const BUILDER_MODELS = [
          "nvidia/nemotron-3-super-120b-a12b:free",
          "openai/gpt-oss-20b:free",
          "meta-llama/llama-3.3-70b-instruct:free",
          "qwen/qwen3-coder:free",
          "poolside/laguna-m.1:free",
        ];

        let winnerModel: string | null = null;
        const rateLimitedModels = new Set<string>();

        // Step 2: Loop through files with concurrency limit of 2
        await runWithConcurrencyLimit(2, planFiles, async (filename, index) => {
          if (signal.aborted) return;
          const normalized = filename.startsWith("/") ? filename : "/" + filename;

          let fileSuccess = false;

          for (let attempt = 0; attempt < BUILDER_MODELS.length; attempt++) {
            if (signal.aborted) break;
            const retryIndex = index + attempt;
            const availableModels = BUILDER_MODELS.filter(m => !rateLimitedModels.has(m));
            const currentModel = availableModels[retryIndex % availableModels.length] ?? BUILDER_MODELS[0];

            fileStatuses[normalized] = "generating";
            const progressContent = constructContent(
              `Generating ${normalized} (Attempt ${attempt + 1}/${BUILDER_MODELS.length}: ${currentModel.split("/").pop()})...`
            );

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, content: progressContent } : msg
              )
            );

            await updateMessages({
              workspaceID: workspaceId as Id<"workspaces">,
              message: mapMessagesToDb([...currentMessages, {
                role: "assistant",
                content: progressContent,
                timestamp: Date.now()
              }]),
            });

            try {
              const fileResponse = await fetch("/api/generate-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  filename,
                  plan,
                  selectedModel: winnerModel !== null ? winnerModel : currentModel,
                  fileIndex: retryIndex,
                }),
                signal,
              });

              if (!fileResponse.ok) {
                const errorData = await fileResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed HTTP ${fileResponse.status}`);
              }

              const result = await fileResponse.json();
              collectedFiles[normalized] = { code: result.code };
              currentFiles[normalized] = { code: result.code };

              // Save file in Convex
              await updateFiles({
                workspaceID: workspaceId as Id<"workspaces">,
                files: { ...currentFiles },
              });

              fileStatuses[normalized] = "success";
              fileSuccess = true;
              console.log(`[useAIChat] Succeeded building ${filename} with model ${currentModel}`);
              if (winnerModel === null) {
                winnerModel = currentModel;
              }
              break; // Success, exit model fallback loop
            } catch (err) {
              console.warn(
                `[useAIChat] Model ${currentModel} failed for ${filename}:`,
                err instanceof Error ? err.message : err
              );
              const errMsg = err instanceof Error ? err.message : String(err);
              if (errMsg.includes("RATE_LIMITED") || errMsg.includes("429")) {
                rateLimitedModels.add(currentModel);
              }
              // Loop continues to next fallback model...
            }
          }

          if (!fileSuccess) {
            fileStatuses[normalized] = "failed";
          }
        });

        if (signal.aborted) return;

        // Step 2.5: Self-Healing Retry Phase for failed files (sequential final pass)
        const failedFiles = planFiles.filter((filename) => {
          const normalized = filename.startsWith("/") ? filename : "/" + filename;
          return fileStatuses[normalized] === "failed";
        });

        if (failedFiles.length > 0 && !signal.aborted) {
          console.log(`[useAIChat] Retrying ${failedFiles.length} failed files after queue completion...`);
          
          for (const filename of failedFiles) {
            if (signal.aborted) break;
            const normalized = filename.startsWith("/") ? filename : "/" + filename;
            const originalIndex = planFiles.indexOf(filename);
            
            let retrySuccess = false;
            for (let attempt = 0; attempt < BUILDER_MODELS.length; attempt++) {
              if (signal.aborted) break;
              const retryIndex = originalIndex + 1 + attempt;
              const availableModels = BUILDER_MODELS.filter(m => !rateLimitedModels.has(m));
              const currentModel = availableModels[retryIndex % availableModels.length] ?? BUILDER_MODELS[0];

              fileStatuses[normalized] = "generating";
              const progressContent = constructContent(
                `Retrying ${normalized} (Final Pass - Attempt ${attempt + 1}/${BUILDER_MODELS.length}: ${currentModel.split("/").pop()})...`
              );

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId ? { ...msg, content: progressContent } : msg
                )
              );

              await updateMessages({
                workspaceID: workspaceId as Id<"workspaces">,
                message: mapMessagesToDb([...currentMessages, {
                  role: "assistant",
                  content: progressContent,
                  timestamp: Date.now()
                }]),
              });

              try {
                const fileResponse = await fetch("/api/generate-file", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    filename,
                    plan,
                    selectedModel: currentModel,
                    fileIndex: retryIndex,
                  }),
                  signal,
                });

                if (!fileResponse.ok) {
                  const errorData = await fileResponse.json().catch(() => ({}));
                  throw new Error(errorData.error || `Failed HTTP ${fileResponse.status}`);
                }

                const result = await fileResponse.json();
                collectedFiles[normalized] = { code: result.code };
                currentFiles[normalized] = { code: result.code };

                // Save file in Convex
                await updateFiles({
                  workspaceID: workspaceId as Id<"workspaces">,
                  files: { ...currentFiles },
                });

                fileStatuses[normalized] = "success";
                retrySuccess = true;
                console.log(`[useAIChat] Final retry succeeded for: ${filename} using ${currentModel}`);
                break;
              } catch (retryErr) {
                console.error(`[useAIChat] Final retry failed for ${filename} using ${currentModel}:`, retryErr);
                const errMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
                if (errMsg.includes("RATE_LIMITED") || errMsg.includes("429")) {
                  rateLimitedModels.add(currentModel);
                }
              }
            }

            if (!retrySuccess) {
              fileStatuses[normalized] = "failed";
            }
          }
        }

        if (signal.aborted) return;

        // Step 3: Complete and assemble final output
        setIsLoading(false);
        setGeneratingCode(false);

        // Apply generated files to the WebContainer
        if (Object.keys(collectedFiles).length > 0) {
          await onFilesGenerated(collectedFiles);
          setResponseReceived(true);
        }

        const fileList = planFiles
          .map((f) => {
            const normalized = f.startsWith("/") ? f : "/" + f;
            const status = fileStatuses[normalized];
            const char = status === "failed" ? "!" : "x";
            return `- [${char}] \`${normalized}\``;
          })
          .join("\n");

        const finalContent = `I have successfully generated your project: **${planTitle || "DevFlow Project"}**!\n\n**Description:**\n${planDesc || "No description provided."}\n\n**Files generated:**\n${fileList}`;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: finalContent } : msg
          )
        );

        await updateInfo({
          workspaceID: workspaceId as Id<"workspaces">,
          info: {
            status: "done",
            title: planTitle,
            description: planDesc,
            recommendations: plan.recommendations,
          },
        });

        await updateMessages({
          workspaceID: workspaceId as Id<"workspaces">,
          message: mapMessagesToDb([...currentMessages, {
            role: "assistant",
            content: finalContent,
            timestamp: Date.now()
          }]),
        });

      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("[useAIChat] Fetch request was aborted dynamically.");
          return;
        }
        console.error("AI chat flow error:", err);
        toast.error("Failed to generate AI response. Please try again.");
        setIsLoading(false);
        setGeneratingCode(false);

        const errorMsg = `⚠️ **Error during generation:** ${err.message || "Unknown error"}`;
        
        if (assistantMsgAdded) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: errorMsg } : msg
            )
          );
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              type: "assistant",
              content: errorMsg,
              timestamp: Date.now(),
            },
          ]);
        }

        await updateInfo({
          workspaceID: workspaceId as Id<"workspaces">,
          info: {
            status: "error",
            error: err.message || "Unknown error",
          },
        });
      }
    },
    [workspaceId, files, onFilesGenerated, updateInfo, updateFiles, updateMessages, scrollToBottom, selectedModel]
  );

  const loadWorkspaceRef = useRef(loadWorkspace);
  const onFilesGeneratedRef = useRef(onFilesGenerated);

  useEffect(() => {
    loadWorkspaceRef.current = loadWorkspace;
  }, [loadWorkspace]);

  useEffect(() => {
    onFilesGeneratedRef.current = onFilesGenerated;
  }, [onFilesGenerated]);

  // ── Poll Convex if workspace status is "generating" ──────────────────────────
  useEffect(() => {
    if (!workspaceId) return;

    let pollInterval: NodeJS.Timeout | null = null;

    const checkAndPoll = async () => {
      try {
        const workspace = await convex.query(api.workspace.GetWorkspace, {
          workspaceID: workspaceId as Id<"workspaces">,
        });

        const status = workspace?.info?.status;

        if (status === "generating") {
          setIsLoading(true);
          setGeneratingCode(true);

          pollInterval = setInterval(async () => {
            const updated = await loadWorkspaceRef.current?.(true);
            
            // Sync messages to local state
            if (updated?.messages) {
              const msgs = Array.isArray(updated.messages) ? updated.messages : [updated.messages];
              const formattedMsgs = msgs.map((m: any, index: number) => ({
                id: m.id || `msg-${index}-${Date.now()}`,
                type: (m.role === "user" || m.type === "user" ? "user" : "assistant") as "user" | "assistant",
                content: m.content || "",
                timestamp: m.timestamp || Date.now(),
              }));
              setMessages(formattedMsgs);
            }

            if (updated?.info?.recommendations) {
              setRecommendations(updated.info.recommendations);
            }

            if (updated?.info?.status !== "generating") {
              if (pollInterval) clearInterval(pollInterval);
              setIsLoading(false);
              setGeneratingCode(false);
              
              if (updated?.files) {
                await onFilesGeneratedRef.current?.(updated.files);
              }
            }
          }, 1500);
        }

      } catch (err) {
        console.error("[useAIChat] Polling check failed:", err);
        setIsLoading(false);
        setGeneratingCode(false);
      }
    };

    checkAndPoll();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [workspaceId, convex]);

  const loadingHistoryRef = useRef(true);

  // Clean up and abort active streams if workspace changes or component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [workspaceId]);

  useEffect(() => {
    if (loadingHistoryRef.current) return;
    if (messages.length > 0) {
      const lastRole = messages[messages.length - 1].type;
      if (lastRole === "user" && !fromTemplate) {
        GetAiResponse(messages);
      }
    }
    scrollToBottom();
  }, [messages, fromTemplate, GetAiResponse, scrollToBottom]);

  const markHistoryLoaded = useCallback(() => {
    loadingHistoryRef.current = false;
  }, []);

  useEffect(() => {
    if (!incomingMessage) return;
    const decoded = decodeURIComponent(incomingMessage);
    if (messages.length === 0) {
      const userMessage: ChatMessage = {
        id: generateUniqueId(),
        type: "user",
        content: decoded,
        timestamp: Date.now(),
      };
      setMessages([greetingMessage, userMessage]);
      setUserInput("");
      setIsLoading(true);

      const params = new URLSearchParams(window.location.search);
      params.delete("message");
      router.replace(`?${params.toString()}`);
    }
  }, [incomingMessage, messages.length, router]);

  const OnGenerate = useCallback(
    async (input: string) => {
      if (!input.trim()) return;
      if (!user.user?.id) {
        router.push("/sign-in");
        return;
      }
      if (!userDetails || !userDetails._id) return;

      const result = await canStartConversation({ userId: userDetails._id });
      if (!result.allowed) {
        setLimitDialogOpen(true);
        return;
      }

      setIsLoading(true);
      setGeneratingCode(false);

      const userMessage: ChatMessage = {
        id: generateUniqueId(),
        type: "user",
        content: input,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setUserInput("");
    },
    [user.user?.id, userDetails, canStartConversation, router]
  );

  return {
    messages,
    setMessages,
    isLoading,
    generatingCode,
    responseReceived,
    limitDialogOpen,
    setLimitDialogOpen,
    userInput,
    setUserInput,
    messagesEndRef,
    OnGenerate,
    markHistoryLoaded,
    scrollToBottom,
    selectedModel,
    setSelectedModel,
    recommendations,
    setRecommendations,
  };
}
