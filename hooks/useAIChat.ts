import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { GetUserDetails } from "@/hooks/GetUserDetails";
import type { ChatMessage } from "@/data/Types";
import { buildCodePrompt, greetingMessage } from "@/data/data";
import { ChatPrompt } from "@/data/data";
import type { InputFileStructure } from "./useWebContainer";
import { generateUniqueId } from "@/lib/utils";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Hook options
// ---------------------------------------------------------------------------

interface UseAIChatOptions {
  workspaceId: string;
  /** Flat file map used to build the code generation prompt. */
  files: InputFileStructure;
  /** Called when AI code generation completes. Returns merged file map. */
  onFilesGenerated: (newFiles: InputFileStructure) => Promise<InputFileStructure>;
  /** Initial message to send when the workspace first loads (from URL param). */
  incomingMessage: string | null;
  /** Whether the workspace was opened from a template. */
  fromTemplate: boolean;
  /** Template name (used to suppress greeting on template opens). */
  templateName: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAIChat({
  workspaceId,
  files,
  onFilesGenerated,
  incomingMessage,
  fromTemplate,
  templateName,
}: UseAIChatOptions) {
  const router = useRouter();
  const user = useUser();
  const userDetails = GetUserDetails();
  const convex = useConvex();

  const updateMessages = useMutation(api.workspace.UpdateMessages);
  const updateInfo = useMutation(api.workspace.Updateinfo);
  const canStartConversation = useMutation(api.users.canStartConversation);

  // ── Message state ──────────────────────────────────────────────────────────
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Scroll helper ──────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Workspace info updater (only writes if field is not yet set) ───────────
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

  // ── Code generation (calls AI_code endpoint, delegates file merge out) ─────
  const GenerateAiCode = useCallback(
    async (aiContent: string) => {
      try {
        const prompt = buildCodePrompt(files, aiContent);
        const selectedModel = typeof window !== "undefined" ? localStorage.getItem("ai-model") || undefined : undefined;
        const result = await axios.post("/api/AI_code", { prompt, model: selectedModel });
        const code_response = result.data.files;

        if (code_response) {
          setResponseReceived(true);
        }

        await onFilesGenerated(code_response ?? {});
        await updateWorkspaceInfoIfNeeded(undefined, result.data?.description);
      } catch (err: unknown) {
        console.error("GenerateAiCode error:", err);
        toast.error("AI code generation failed. Please try again or refine your prompt.");
        throw err;
      }
    },
    [files, onFilesGenerated, updateWorkspaceInfoIfNeeded]
  );

  // ── Main AI chat response ──────────────────────────────────────────────────
  const GetAiResponse = useCallback(
    async (currentMessages: ChatMessage[]) => {
      setIsLoading(true);
      setGeneratingCode(true);

      try {
        const pro = JSON.stringify(currentMessages) + (ChatPrompt.CHAT_PROMPT || "");
        const selectedModel = typeof window !== "undefined" ? localStorage.getItem("ai-model") || undefined : undefined;
        const response = await axios.post("/api/AI_chat", { prompt: pro, model: selectedModel });

        const newTitle: string = response.data.result.title;
        await updateWorkspaceInfoIfNeeded(newTitle);

        const ai_response: ChatMessage = {
          id: generateUniqueId(),
          type: "assistant",
          content: response.data.result.userResponse,
          timestamp: Date.now(),
        };

        const updatedMessages = [...currentMessages, ai_response];
        setMessages(updatedMessages);

        if (workspaceId) {
          await updateMessages({
            message: updatedMessages,
            workspaceID: workspaceId as Id<"workspaces">,
          });
        }

        setIsLoading(false);

        try {
          await GenerateAiCode(response.data.result.modelResponse);
        } catch (codeErr) {
          console.error("Code generation error during chat flow:", codeErr);
        } finally {
          setGeneratingCode(false);
        }
      } catch (err: unknown) {
        console.error("AI chat flow error:", err);
        toast.error("Failed to generate AI response. Please try again.");
        setIsLoading(false);
        setGeneratingCode(false);
      }
    },
    [updateWorkspaceInfoIfNeeded, workspaceId, updateMessages, GenerateAiCode]
  );

  // ── Trigger AI response when last message is from user ────────────────────
  // Kept as ref-stable effect to avoid triggering during history load.
  const loadingHistoryRef = useRef(true);

  useEffect(() => {
    if (loadingHistoryRef.current) return;
    if (messages.length > 0) {
      const lastRole = messages[messages.length - 1].type;
      if (lastRole === "user" && !fromTemplate) {
        GetAiResponse(messages);
      }
    }
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  /** Called by useCodeEditor after history is loaded to unblock the effect above. */
  const markHistoryLoaded = useCallback(() => {
    loadingHistoryRef.current = false;
  }, []);

  // ── Handle incoming message from URL search param ──────────────────────────
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingMessage]);

  // ── Public: send a user message ───────────────────────────────────────────
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
    // State
    messages,
    setMessages,
    isLoading,
    generatingCode,
    responseReceived,
    limitDialogOpen,
    setLimitDialogOpen,
    userInput,
    setUserInput,
    // Refs
    messagesEndRef,
    // Actions
    OnGenerate,
    markHistoryLoaded,
    scrollToBottom,
  };
}
