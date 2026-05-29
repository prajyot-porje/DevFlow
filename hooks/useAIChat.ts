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
  loadWorkspace?: () => Promise<any>;
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modelParam = params.get("model");
      if (modelParam) {
        setSelectedModel(modelParam);
      }
    }
  }, []);

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
      let planTitle = "";
      let planDesc = "";

      const assistantMsgId = generateUniqueId();
      const initialAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        type: "assistant",
        content: "Initializing planner...",
        timestamp: Date.now(),
      };

      const messagesWithAssistant = [...currentMessages, initialAssistantMessage];
      setMessages(messagesWithAssistant);
      scrollToBottom();

      // Cancel previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, workspaceId, selectedModel }),
          signal,
        });

        if (!response.ok) {
          const errMsg = `Server returned ${response.status}: ${response.statusText}`;
          toast.error(errMsg);
          setIsLoading(false);
          setGeneratingCode(false);
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          if (signal.aborted) {
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === "status") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          content: `${planTitle ? `**Project:** ${planTitle}\n\n` : ""}${event.message}`,
                        }
                      : msg
                  )
                );
              }

              if (event.type === "plan") {
                console.log("[useAIChat] Planner Agent response:", event.plan);
                planTitle = event.plan.projectTitle;
                planDesc = event.plan.description;
                await updateWorkspaceInfoIfNeeded(planTitle, planDesc);
              }

              if (event.type === "file") {
                const normalizedFilename = event.filename.startsWith("/") ? event.filename : "/" + event.filename;
                collectedFiles[normalizedFilename] = { code: event.code };
              }

              if (event.type === "error") {
                toast.error(event.message);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          content: `${msg.content}\n\n⚠️ **Error:** ${event.message}`,
                        }
                      : msg
                  )
                );
              }

              if (event.type === "done") {
                setIsLoading(false);
                setGeneratingCode(false);

                if (Object.keys(collectedFiles).length > 0) {
                  await onFilesGenerated(collectedFiles);
                  setResponseReceived(true);

                  const fileList = Object.keys(collectedFiles)
                    .map((f) => `- \`${f}\``)
                    .join("\n");

                  const finalContent = `I have successfully generated your project: **${planTitle || "DevFlow Project"}**!\n\n**Description:**\n${planDesc || "No description provided."}\n\n**Files generated:**\n${fileList}`;

                  setMessages((prev) => {
                    const updated = prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, content: finalContent }
                        : msg
                    );

                    if (workspaceId) {
                      updateMessages({
                        message: updated.map((msg) => ({
                          role: msg.type === "user" ? "user" : "assistant",
                          content: msg.content,
                          timestamp: msg.timestamp,
                        })),
                        workspaceID: workspaceId as Id<"workspaces">,
                      }).catch((e) => console.error("Failed to update messages in Convex:", e));
                    }

                    return updated;
                  });
                }
              }
            } catch (err) {
              // skip malformed JSON chunks silently
            }
          }
          scrollToBottom();
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("[useAIChat] Fetch request was aborted dynamically.");
          return;
        }
        console.error("AI chat flow error:", err);
        toast.error("Failed to generate AI response. Please try again.");
        setIsLoading(false);
        setGeneratingCode(false);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `Failed to generate response: ${err.message || "Unknown error"}`,
                }
              : msg
          )
        );
      }
    },
    [workspaceId, onFilesGenerated, updateWorkspaceInfoIfNeeded, updateMessages, scrollToBottom]
  );

  // ── Poll Convex if workspace status is "generating" ──────────────────────────
  useEffect(() => {
    if (!workspaceId || !loadWorkspace) return;

    let pollInterval: NodeJS.Timeout | null = null;

    const checkAndPoll = async () => {
      try {
        const workspace = await convex.query(api.workspace.GetWorkspace, {
          workspaceID: workspaceId as Id<"workspaces">,
        });

        if (workspace?.info?.status === "generating") {
          setIsLoading(true);
          setGeneratingCode(true);

          pollInterval = setInterval(async () => {
            const updated = await loadWorkspace();
            
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

            if (updated?.info?.status !== "generating") {
              if (pollInterval) clearInterval(pollInterval);
              setIsLoading(false);
              setGeneratingCode(false);
              
              if (updated?.files) {
                await onFilesGenerated(updated.files);
              }
            }
          }, 1500);
        }
      } catch (err) {
        console.error("[useAIChat] Polling check failed:", err);
      }
    };

    checkAndPoll();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [workspaceId, loadWorkspace, convex, onFilesGenerated]);

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

      setTimeout(() => setIsLoading(false), 5000);
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
  };
}
