"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import { 
  Send, Code, Eye, Sparkles, Loader2, AlertTriangle, FileText, X,
  FolderOpen, CheckCircle2, XCircle, Compass, Terminal, FileCode, Check, Copy, ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"
import { SignedIn, useUser } from "@clerk/nextjs"
import { existingProjectPrompts } from "@/data/data"
import History from "@/components/custom/History"
import { ChatTabSkeleton, CodeTabSkeleton, PreviewTabSkeleton } from "@/components/custom/Loaders"
import { WebContainerPreview } from "@/components/custom/webContainer/preview"
import { ResizableEditor } from "@/components/custom/webContainer/resizeable-editor"
import { LimitDialog } from "@/components/custom/LimitDialog"
import { useCodeEditor } from "@/hooks/useCodeEditor"
import { useAIChat } from "@/hooks/useAIChat"

// ---------------------------------------------------------------------------
// Hydration-safe timestamp display
// ---------------------------------------------------------------------------

function TimeClient({ date }: { date: number }) {
  const [time, setTime] = useState("")
  useEffect(() => {
    setTime(new Date(date).toLocaleTimeString())
  }, [date])
  return <>{time}</>
}

// ---------------------------------------------------------------------------
// Assistant Message Parsing & Beautiful Visual Card Rendering
// ---------------------------------------------------------------------------

interface ParsedAssistantMessage {
  isGenerationMessage: boolean;
  status: "planning" | "generating" | "success" | "error";
  projectTitle: string;
  description: string;
  errorMessage: string;
  currentTask: string;
  files: { path: string; status: "pending" | "generating" | "success" | "failed" }[];
}

function parseAssistantMessage(content: string): ParsedAssistantMessage {
  const result: ParsedAssistantMessage = {
    isGenerationMessage: false,
    status: "planning",
    projectTitle: "",
    description: "",
    errorMessage: "",
    currentTask: "",
    files: [],
  };

  const lower = content.toLowerCase();
  const isPlanning = lower.includes("initializing planner") || lower.includes("creating plan");
  const isGenerating = lower.includes("status:") || lower.includes("generating ") || lower.includes("planning complete") || lower.includes("project:") || lower.includes("failed to generate ");
  const isSuccess = lower.includes("successfully generated your project");
  const isError = lower.includes("error during generation") || lower.includes("failed to generate response");

  if (!isPlanning && !isGenerating && !isSuccess && !isError) {
    return result;
  }

  result.isGenerationMessage = true;

  // Extract Project Title
  const projectMatch = content.match(/\*\*Project:\*\*\s*(.*)/i) || content.match(/Project:\s*(.*)/i);
  if (projectMatch) {
    result.projectTitle = projectMatch[1].split("\n")[0].trim();
  }
  const successMatch = content.match(/generated your project:\s*\*\*(.*?)\*\*/i);
  if (successMatch) {
    result.projectTitle = successMatch[1].trim();
  }

  // Set status
  if (isError) {
    result.status = "error";
  } else if (isSuccess) {
    result.status = "success";
  } else if (isGenerating) {
    result.status = "generating";
  } else {
    result.status = "planning";
  }

  // Extract description
  const descMatch = content.match(/\*\*Description:\*\*\s*\n?([\s\S]*?)(?=\n\n\*\*Files|$)/i) || content.match(/Description:\s*\n?([\s\S]*?)(?=\n\n\*\*Files|$)/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }

  // Extract error message
  const errMatch = content.match(/⚠️\s*\*\*Error.*?\*\*:\s*(.*)/i) || content.match(/Failed to generate response:\s*(.*)/i);
  if (errMatch) {
    result.errorMessage = errMatch[1].trim();
  }

  // Extract current task
  const statusMatch = content.match(/\*\*Status:\*\*\s*(.*)/i);
  if (statusMatch) {
    result.currentTask = statusMatch[1].trim();
  } else {
    const lines = content.split("\n");
    const taskLine = lines.find(line => 
      line.startsWith("Generating ") || 
      line.startsWith("Failed to generate ") || 
      line.startsWith("Successfully generated ") || 
      line.startsWith("Syntax error ") ||
      line.startsWith("Planning complete")
    );
    if (taskLine) {
      result.currentTask = taskLine.trim();
    }
  }

  // Extract Files List
  const lines = content.split("\n");
  lines.forEach((line) => {
    const checkboxMatch = line.match(/^-\s*\[(.*?)\]\s*`?(.*?)`?$/);
    if (checkboxMatch) {
      const char = checkboxMatch[1].trim();
      const path = checkboxMatch[2].trim();
      let fileStatus: "pending" | "generating" | "success" | "failed" = "pending";
      if (char === "x") fileStatus = "success";
      else if (char === "/") fileStatus = "generating";
      else if (char === "!") fileStatus = "failed";
      result.files.push({ path, status: fileStatus });
    } else {
      const bulletMatch = line.match(/^-\s*`?(.*?)`?$/);
      if (bulletMatch) {
        const path = bulletMatch[1].trim();
        if (path.startsWith("**") && path.endsWith("**")) return;
        if (path.toLowerCase().startsWith("files")) return;
        result.files.push({ path, status: result.status === "success" ? "success" : "pending" });
      }
    }
  });

  return result;
}

function AssistantMessageCard({ content }: { content: string }) {
  const parsed = parseAssistantMessage(content);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!parsed.isGenerationMessage) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // 1. Planning State
  if (parsed.status === "planning") {
    return (
      <div className="flex flex-col gap-4 p-5 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-sm animate-pulse w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shrink-0">
            <Compass className="w-5.5 h-5.5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Initializing Build Pipeline</h4>
            <p className="text-xs text-[var(--color-text-tertiary)]">Creating blueprint and architecture...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (parsed.status === "error") {
    return (
      <div className="flex flex-col gap-4 p-5 bg-[var(--color-bg-surface)] border border-rose-500/20 rounded-2xl shadow-sm w-full animate-in fade-in duration-300">
        <div className="flex items-center gap-3 border-b border-rose-500/10 pb-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <Terminal className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-500">Generation Pipeline Interrupted</h4>
            <p className="text-xs text-[var(--color-text-tertiary)]">The builder pipeline encountered an unexpected issue</p>
          </div>
        </div>
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[13px] md:text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p className="font-semibold text-[var(--color-text-primary)] mb-1">We couldn&apos;t complete your request</p>
          We are currently experiencing unusually high traffic, or the model is temporarily down. Please try again in a few moments, select a different model from the dropdown below, or come back later.
        </div>
        <details className="group border border-[var(--color-border-subtle)] rounded-xl overflow-hidden bg-[var(--color-bg-elevated)]/10">
          <summary className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] cursor-pointer select-none">
            <span>Show technical details</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="px-4 py-3.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] font-mono text-xs text-rose-400 leading-relaxed whitespace-pre-wrap">
            {parsed.errorMessage || content}
          </div>
        </details>
      </div>
    );
  }

  // Calculate stats for generating & success
  const totalFiles = parsed.files.length;
  const successFiles = parsed.files.filter(f => f.status === "success").length;
  const failedFiles = parsed.files.filter(f => f.status === "failed").length;
  const progressPct = totalFiles > 0 ? ((successFiles + failedFiles) / totalFiles) * 100 : 0;
  const activeFiles = parsed.files.filter(f => f.status !== "pending");

  // 3. Generating/Building State
  if (parsed.status === "generating") {
    return (
      <div className="flex flex-col gap-5 p-5 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-sm w-full">
        <div className="flex items-start justify-between border-b border-[var(--color-border-subtle)] pb-3.5 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shrink-0">
              <Loader2 className="w-5.5 h-5.5 animate-spin" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-full">Building Assets</span>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)] mt-1 truncate">
                {parsed.projectTitle || "DevFlow Project"}
              </h4>
            </div>
          </div>
          <div className="text-xs font-semibold text-[var(--color-text-secondary)] shrink-0">
            {successFiles}/{totalFiles} files
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] transition-all duration-500 ease-out rounded-full" 
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-ping shrink-0" />
            <span className="animate-pulse truncate">{parsed.currentTask || "Generating files..."}</span>
          </p>
        </div>

        {/* Files Checklist */}
        {activeFiles.length > 0 && (
          <div className="border border-[var(--color-border-subtle)] rounded-xl overflow-hidden bg-[var(--color-bg-elevated)]/20 animate-in fade-in duration-300">
            <div className="max-h-56 overflow-y-auto divide-y divide-[var(--color-border-subtle)] custom-scrollbar-workspace">
              {activeFiles.map((file, idx) => {
                const displayPath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
                return (
                  <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 text-[13px] hover:bg-[var(--color-bg-elevated)]/40 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {file.status === "success" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Generated
                        </span>
                      )}
                      {file.status === "generating" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 shrink-0 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating
                        </span>
                      )}
                      {file.status === "failed" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      <span className={`font-mono truncate ${
                        file.status === "success" 
                          ? "text-[var(--color-text-primary)]" 
                          : file.status === "failed"
                          ? "text-rose-400 line-through"
                          : "text-[var(--color-text-secondary)] font-semibold"
                      }`}>
                        {displayPath}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Success State
  if (parsed.status === "success") {
    return (
      <div className="flex flex-col gap-5 p-5 bg-[var(--color-bg-surface)] border border-emerald-500/20 rounded-2xl shadow-sm w-full">
        <div className="flex items-start justify-between border-b border-emerald-500/10 pb-3.5 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <FolderOpen className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Success</span>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)] mt-1 truncate">
                {parsed.projectTitle || "DevFlow Project"}
              </h4>
            </div>
          </div>
        </div>

        {parsed.description && (
          <p className="text-[13px] md:text-[14px] text-[var(--color-text-secondary)] leading-relaxed italic bg-[var(--color-bg-elevated)]/30 p-3.5 rounded-xl border border-[var(--color-border-subtle)]">
            {parsed.description}
          </p>
        )}

        {/* Files Grid */}
        {totalFiles > 0 && (
          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Assets Created ({totalFiles})</h5>
            <div className="border border-[var(--color-border-subtle)] rounded-xl overflow-hidden bg-[var(--color-bg-elevated)]/20">
              <div className="max-h-56 overflow-y-auto divide-y divide-[var(--color-border-subtle)] custom-scrollbar-workspace">
                {parsed.files.map((file, idx) => {
                  const displayPath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
                  return (
                    <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 text-[13px] hover:bg-[var(--color-bg-elevated)]/40 transition-colors group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCode className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                        <span className="font-mono truncate text-[var(--color-text-primary)]">
                          {displayPath}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(displayPath)}
                        className="p-1 rounded-lg text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer shrink-0"
                      >
                        {copiedFile === displayPath ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 animate-in fade-in zoom-in duration-200" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <ReactMarkdown>{content}</ReactMarkdown>;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChatWorkspacePage() {
  const params = useParams()
  const id = params.id as string
  const searchParams = useSearchParams()
  const incomingMessage = searchParams.get("message")
  const fromTemplate = searchParams.get("fromTemplate") === "1"
  const templateName = searchParams.get("templateName")
  const initialTab = searchParams.get("tab") || "chat"
  const user = useUser()

  const [historyOpen, setHistoryOpen] = useState(false)

  const [pastedFile, setPastedFile] = useState<{ name: string; content: string } | null>(null)
  const [viewFileDialogOpen, setViewFileDialogOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text")
    if (pastedText.length > 500) {
      e.preventDefault()
      setPastedFile({
        name: "Pasted Prompt",
        content: pastedText,
      })
      toast.success("Large prompt pasted as attachment")
    }
  }

  const handleWorkspaceGenerate = (input: string) => {
    const finalInput = pastedFile
      ? (input.trim() ? `${input}\n\nAttachment:\n${pastedFile.content}` : pastedFile.content)
      : input;
    OnGenerate(finalInput)
    setPastedFile(null)
  }

  // ── Editor / file / container state ───────────────────────────────────────
  const {
    files,
    selectedFile,
    setSelectedFile,
    activeTab,
    setActiveTab,
    loadingHistory,
    setLoadingHistory,
    webContainer,
    containerError,
    loadWorkspace,
    handleFileChange,
    applyGeneratedFiles,
  } = useCodeEditor({ workspaceId: id })

  // ── Sync initial tab from URL ──────────────────────────────────────────────
  useEffect(() => {
    setActiveTab(initialTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab])

  // ── AI chat state ──────────────────────────────────────────────────────────
  const {
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
    selectedModel,
    setSelectedModel,
    recommendations,
    setRecommendations,
  } = useAIChat({
    workspaceId: id,
    files,
    onFilesGenerated: applyGeneratedFiles,
    incomingMessage,
    fromTemplate,
    templateName,
    loadWorkspace,
  })

  const [modelStatuses, setModelStatuses] = useState<Record<string, "online" | "offline">>({
    "poolside/laguna-m.1:free": "online",
    "nvidia/nemotron-3-super-120b-a12b:free": "online",
    "deepseek/deepseek-v4-flash:free": "online",
  });
  const [offlineAlertOpen, setOfflineAlertOpen] = useState(false);

  const isValidRecommendation = (recs: unknown): recs is string[] => {
    return (
      Array.isArray(recs) &&
      recs.length >= 2 &&
      recs.every((r) => typeof r === "string" && r.trim().length > 0 && r.length <= 60)
    );
  };

  const displayRecommendations = isValidRecommendation(recommendations)
    ? recommendations.slice(0, 2)
    : existingProjectPrompts.slice(0, 2);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch("/api/models/status");
        if (res.ok) {
          const data = await res.json();
          if (data.statuses) {
            setModelStatuses(data.statuses);
            const allOffline = 
              data.statuses["poolside/laguna-m.1:free"] === "offline" &&
              data.statuses["nvidia/nemotron-3-super-120b-a12b:free"] === "offline" &&
              data.statuses["deepseek/deepseek-v4-flash:free"] === "offline";
            if (allOffline) {
              setOfflineAlertOpen(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load model statuses:", err);
      }
    };
    fetchStatuses();
  }, []);

  // ── Load workspace history on mount ───────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const result = await loadWorkspace()

      if (result?.info?.recommendations) {
        setRecommendations(result.info.recommendations)
      }
      if (result?.info?.title) {
        // title is managed by Convex now
      }
      if (result?.messages) {
        const msgs = Array.isArray(result.messages) ? result.messages : [result.messages];
        const formattedMsgs = msgs.map((m: { id?: string; type?: string; role?: string; content?: string; timestamp?: number }, index: number) => ({
          id: m.id || `msg-${index}-${Date.now()}`,
          type: (m.type === "user" || m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content || "",
          timestamp: m.timestamp || Date.now(),
        }));
        setMessages(formattedMsgs);
      }

      setLoadingHistory(false)
      markHistoryLoaded()
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── WebContainer error screen ──────────────────────────────────────────────
  if (containerError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <CardContent className="text-center space-y-4">
            <div className="text-red-500">
              <Loader2 className="h-8 w-8 mx-auto mb-2" />
            </div>
            <h2 className="text-lg font-semibold">WebContainer Error</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{containerError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <>
      <LimitDialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen} />
      
      <AlertDialog open={offlineAlertOpen} onOpenChange={setOfflineAlertOpen}>
        <AlertDialogContent className="max-w-sm bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-xl z-50">
          <AlertDialogHeader className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              All Generator Models Offline
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-[var(--color-text-secondary)] leading-relaxed">
              We detect that all AI code generation models are currently offline or experiencing high demand. Please try again in a few minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogAction className="w-full bg-[var(--color-accent)] text-white hover:brightness-110 rounded-lg font-body font-semibold text-sm py-2.5 transition-all duration-fast cursor-pointer">
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex w-full h-full overflow-hidden">
        <div className="flex-1 flex overflow-hidden gap-0">
          {/* Chat / Code / Preview area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <TabsList className="flex mx-4 md:mx-6 mt-3 md:mt-4 shrink-0 gap-1 h-10 bg-[var(--color-bg-surface)]/80 backdrop-blur-md border border-[var(--color-border-subtle)] rounded-xl p-1 shadow-sm w-max self-center sm:self-start relative">
                    <TabsTrigger value="chat" className="gap-2 text-[13px] px-3 md:px-4 rounded-lg data-[state=active]:bg-[var(--color-bg-elevated)] data-[state=active]:text-[var(--color-accent)] data-[state=active]:shadow-sm transition-all duration-200">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-medium">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="gap-2 text-[13px] px-3 md:px-4 rounded-lg data-[state=active]:bg-[var(--color-bg-elevated)] data-[state=active]:text-[var(--color-accent)] data-[state=active]:shadow-sm transition-all duration-200">
                      <Code className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-medium">Code</span>
                      {generatingCode && <Loader2 className="w-3 h-3 animate-spin ml-0 md:ml-1" />}
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2 text-[13px] px-3 md:px-4 rounded-lg data-[state=active]:bg-[var(--color-bg-elevated)] data-[state=active]:text-[var(--color-accent)] data-[state=active]:shadow-sm transition-all duration-200">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-medium">Preview</span>
                      {generatingCode && <Loader2 className="w-3 h-3 animate-spin ml-0 md:ml-1" />}
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Chat Tab ── */}
                  <TabsContent
                    value="chat"
                    forceMount
                    className="tab-content-persist flex-1 flex flex-col mx-4 md:mx-6 mt-3 md:mt-4 overflow-auto min-h-0 hide-scrollbar data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:zoom-in-95 duration-300"
                  >
                    {loadingHistory ? (
                      <ChatTabSkeleton />
                    ) : (
                      <>
                        <ScrollArea className="flex-1 hide-scrollbar">
                          <div className="space-y-4 md:space-y-6">
                            {messages.map((msg) => (
                              <div
                                key={msg.id}
                                className="w-full max-w-[760px] mx-auto relative my-4"
                              >
                                <div className={`flex gap-3 md:gap-0 items-start w-full relative ${
                                  msg.type === "user" ? "justify-end" : "justify-start"
                                }`}>
                                  {/* Mobile Assistant Avatar */}
                                  {msg.type === "assistant" && (
                                    <div className="block md:hidden shrink-0">
                                      <Avatar className="w-7 h-7 mt-1">
                                        <div className="w-full h-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center rounded-full">
                                          <Sparkles className="w-3.5 h-3.5 text-white" />
                                        </div>
                                      </Avatar>
                                    </div>
                                  )}

                                  {/* Desktop Assistant Avatar (Absolutely positioned on the left, outside the 760px boundary) */}
                                  {msg.type === "assistant" && (
                                    <div className="hidden md:block absolute right-full mr-4 top-1 shrink-0">
                                      <Avatar className="w-8 h-8">
                                        <div className="w-full h-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center rounded-full">
                                          <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                      </Avatar>
                                    </div>
                                  )}

                                  {/* Bubble content */}
                                  <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] ${msg.type === "user" ? "ml-auto animate-in fade-in slide-in-from-bottom-2 duration-300" : "w-full animate-in fade-in duration-300"}`}>
                                    <div
                                      className={
                                        msg.type === "user"
                                          ? "rounded-2xl px-4 py-3 shadow-sm border bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20 text-[var(--color-text-primary)] rounded-tr-sm"
                                          : !parseAssistantMessage(msg.content).isGenerationMessage
                                          ? "rounded-2xl px-4 py-3 shadow-sm border bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-tl-sm"
                                          : ""
                                      }
                                    >
                                      <div className={
                                        msg.type === "user" || (msg.type === "assistant" && !parseAssistantMessage(msg.content).isGenerationMessage)
                                          ? "text-[13px] md:text-[14px] leading-relaxed break-words markdown-body" 
                                          : "w-full"
                                      }>
                                        {msg.type === "assistant" ? (
                                          <AssistantMessageCard content={msg.content} />
                                        ) : (
                                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        )}
                                      </div>
                                    </div>
                                    <p className={`text-[10px] md:text-[11px] font-medium text-[var(--color-text-tertiary)] mt-1.5 md:mt-2 px-1 ${
                                      msg.type === "user" ? "text-right" : "text-left"
                                    }`}>
                                      <TimeClient date={msg.timestamp} />
                                    </p>
                                  </div>

                                  {/* Mobile User Avatar */}
                                  {msg.type === "user" && (
                                    <div className="block md:hidden shrink-0">
                                      <Avatar className="w-7 h-7 mt-1 ring-2 ring-[var(--color-bg-page)] shadow-sm">
                                        <SignedIn>
                                          <Image
                                            src={user.user?.imageUrl || "/placeholder.svg"}
                                            alt={user.user?.firstName || "User"}
                                            width={28}
                                            height={28}
                                            className="rounded-full object-cover w-7 h-7"
                                          />
                                        </SignedIn>
                                      </Avatar>
                                    </div>
                                  )}

                                  {/* Desktop User Avatar (Absolutely positioned on the right, outside the 760px boundary) */}
                                  {msg.type === "user" && (
                                    <div className="hidden md:block absolute left-full ml-4 top-1 shrink-0">
                                      <Avatar className="w-8 h-8 ring-2 ring-[var(--color-bg-page)] shadow-sm">
                                        <SignedIn>
                                          <Image
                                            src={user.user?.imageUrl || "/placeholder.svg"}
                                            alt={user.user?.firstName || "User"}
                                            width={32}
                                            height={32}
                                            className="rounded-full object-cover w-8 h-8"
                                          />
                                        </SignedIn>
                                      </Avatar>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {isLoading && (messages.length === 0 || messages[messages.length - 1].type !== "assistant") && (
                              <div className="w-full max-w-[760px] mx-auto relative my-4">
                                <div className="flex gap-3 md:gap-0 items-start w-full relative justify-start">
                                  {/* Mobile Avatar */}
                                  <div className="block md:hidden shrink-0">
                                    <Avatar className="w-7 h-7 mt-1 shadow-sm">
                                      <div className="w-full h-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center rounded-full">
                                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                                      </div>
                                    </Avatar>
                                  </div>

                                  {/* Desktop Avatar (Absolute outside) */}
                                  <div className="hidden md:block absolute right-full mr-4 top-1 shrink-0">
                                    <Avatar className="w-8 h-8 shadow-sm">
                                      <div className="w-full h-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center rounded-full">
                                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                      </div>
                                    </Avatar>
                                  </div>

                                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-[var(--color-accent)]/60 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" style={{ animationDelay: "-0.32s" }} />
                                        <div className="w-1.5 h-1.5 bg-[var(--color-accent)]/80 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" style={{ animationDelay: "-0.16s" }} />
                                        <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" />
                                      </div>
                                      <span className="text-[13px] font-medium text-[var(--color-text-secondary)] animate-pulse">Thinking...</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div ref={messagesEndRef} />
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="max-w-[760px] w-full mx-auto mt-3 md:mt-4 space-y-3 md:space-y-4 pt-2 pb-4 md:pb-6">
                          {!pastedFile && !userInput.trim() && (
                            <div className="flex gap-1.5 md:gap-2 flex-wrap justify-center sm:justify-start">
                              {displayRecommendations.map((suggestion, index) => (
                                <button
                                  key={index}
                                  disabled={isLoading}
                                  className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl px-3 py-2 font-body font-medium text-[12px] md:text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => setUserInput(suggestion)}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              {isMobile && (
                                <div className="mb-3 flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                  <span>DevFlow prompting is not supported on mobile devices. Please switch to a desktop screen to start building.</span>
                                </div>
                              )}
                              {pastedFile && !isMobile && (
                                <div className="mb-2 flex items-center justify-between p-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl w-fit gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm max-w-full">
                                  <div 
                                    className="flex items-center gap-2 cursor-pointer hover:text-[var(--color-accent)] transition-colors min-w-0"
                                    onClick={() => setViewFileDialogOpen(true)}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex flex-col">
                                      <span className="text-xs font-semibold truncate text-[var(--color-text-primary)]">
                                        {pastedFile.name}
                                      </span>
                                      <span className="text-[10px] text-[var(--color-text-tertiary)]">
                                        {Math.round(pastedFile.content.length / 1024 * 100) / 100} KB • {pastedFile.content.split(/\s+/).filter(Boolean).length} words
                                      </span>
                                    </div>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setPastedFile(null)}
                                    className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              <textarea
                                placeholder={isMobile ? "Prompting is not supported on mobile." : "Describe what you want to build..."}
                                value={isMobile ? "" : userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onPaste={isMobile ? undefined : handlePaste}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    if (!isMobile) {
                                      handleWorkspaceGenerate(userInput)
                                    }
                                  }
                                }}
                                disabled={isLoading || isMobile}
                                className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[18px] py-4 pr-14 pl-5 pb-14 min-h-28 max-h-60 w-full resize-none overflow-y-auto font-body font-normal text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_var(--color-accent),0_4px_16px_rgba(14,165,233,0.15)] disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar-workspace"
                                style={{
                                  transition: "border-color 200ms, box-shadow 200ms",
                                }}
                              />

                              {/* Bottom row actions inside textarea */}
                              <div className="absolute left-3.5 bottom-3 flex items-center gap-2">
                                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isMobile}>
                                  <SelectTrigger className="h-8 border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/60 hover:bg-[var(--color-bg-hover)] text-xs md:text-sm font-medium rounded-xl px-3 text-[var(--color-text-secondary)] focus:ring-0 gap-2 w-fit max-w-[380px] shadow-sm transition-all" size="default">
                                    <SelectValue placeholder="Model Selector" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[var(--color-bg-surface)] border-[var(--color-border-default)] rounded-xl shadow-lg p-1.5 min-w-[240px] text-xs md:text-sm">
                                    <SelectItem value="auto">
                                      <span className="flex items-center gap-2 font-medium">
                                        <span>Auto</span>
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                                        <span className="ml-2 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">Recommended</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="poolside/laguna-m.1:free">
                                      <span className="flex items-center gap-2 font-medium">
                                        <span>Poolside Laguna-M.1 (Free)</span>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${modelStatuses["poolside/laguna-m.1:free"] === "online" ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                                        <span className="ml-2 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">Recommended</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="nvidia/nemotron-3-super-120b-a12b:free">
                                      <span className="flex items-center gap-2 font-medium">
                                        <span>Nvidia Nemotron-3 Super 120B (Free)</span>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${modelStatuses["nvidia/nemotron-3-super-120b-a12b:free"] === "online" ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="deepseek/deepseek-v4-flash:free">
                                      <span className="flex items-center gap-2 font-medium">
                                        <span>Deepseek v4 Flash (Free)</span>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${modelStatuses["deepseek/deepseek-v4-flash:free"] === "online" ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {!isMobile && (
                                <button
                                  className={`absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] shadow-sm transition-all duration-200 ${
                                    userInput.trim() || pastedFile
                                      ? "bg-[var(--color-accent)] hover:brightness-110 border border-transparent text-white"
                                      : "bg-[var(--color-bg-elevated)]/60 hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]"
                                  }`}
                                  onClick={() => handleWorkspaceGenerate(userInput)}
                                  disabled={!(userInput.trim() || pastedFile) || isLoading}
                                >
                                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* ── Code Tab ── */}
                  <TabsContent
                    value="code"
                    forceMount
                    className="tab-content-persist flex-1 flex mx-4 md:mx-6 mt-3 md:mt-4 overflow-hidden min-h-0"
                  >
                    {loadingHistory ? (
                      <CodeTabSkeleton />
                    ) : (
                      <div className="flex h-full w-full relative">
                        <ResizableEditor
                          files={files}
                          selectedFile={selectedFile}
                          onFileSelect={setSelectedFile}
                          onFileChange={handleFileChange}
                          readOnly={generatingCode}
                        />
                        {generatingCode && (
                          <div className="absolute inset-0 bg-[var(--color-bg-page)]/50 backdrop-blur-xs flex flex-col items-center justify-center z-10 animate-in fade-in duration-200">
                            <Card className="p-5 shadow-xl border-[var(--color-border-default)] bg-[var(--color-bg-surface)] backdrop-blur max-w-sm text-center">
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
                                <div>
                                  <h4 className="font-semibold text-sm">Generating Code Updates</h4>
                                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                    AI is writing the next iteration of your components. Please wait...
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* ── Preview Tab ── */}
                  <TabsContent
                    value="preview"
                    forceMount
                    className="tab-content-persist flex-1 flex flex-col mx-4 md:mx-6 mt-3 md:mt-4 overflow-hidden min-h-0"
                  >
                    {loadingHistory ? (
                      <PreviewTabSkeleton />
                    ) : (
                      <div className="flex-1 flex flex-col relative h-full">
                        <WebContainerPreview
                          webContainer={webContainer}
                          files={files}
                          responseReceived={responseReceived}
                        />
                        {generatingCode && (
                          <div className="absolute top-16 right-4 z-10 animate-in slide-in-from-top-2 duration-300">
                            <Card className="p-3 shadow-md bg-[var(--color-bg-surface)] backdrop-blur border-[var(--color-border-default)] flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
                              <span className="text-xs font-medium text-[var(--color-text-primary)]">Rebuilding preview...</span>
                            </Card>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* History Sidebar – desktop only */}
              <div className="hidden lg:block">
                <History historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
              </div>
            </div>
      </div>

      {/* Edit Paste Attachment Modal Dialog */}
      <Dialog open={viewFileDialogOpen} onOpenChange={setViewFileDialogOpen}>
        <DialogContent className="max-w-2xl bg-[var(--color-bg-surface)] border-[var(--color-border-default)] shadow-2xl text-[var(--color-text-primary)]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-accent)]" />
              Pasted Prompt Attachment
            </DialogTitle>
            <DialogDescription className="font-body text-xs text-[var(--color-text-secondary)]">
              You pasted a large prompt ({pastedFile?.content.length} characters). You can view or edit the content below.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2">
            <textarea
              value={pastedFile?.content || ""}
              onChange={(e) => {
                if (pastedFile) {
                  setPastedFile({ ...pastedFile, content: e.target.value });
                }
              }}
              className="w-full h-80 bg-[var(--color-bg-inset)] border border-[var(--color-border-subtle)] rounded-xl p-4 text-xs md:text-sm font-mono text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-0 custom-scrollbar-workspace resize-none overflow-y-auto"
            />
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between w-full gap-4">
            <div className="text-xs text-[var(--color-text-tertiary)] font-medium">
              {pastedFile ? pastedFile.content.split(/\s+/).filter(Boolean).length : 0} words
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (pastedFile) {
                    navigator.clipboard.writeText(pastedFile.content);
                    toast.success("Copied to clipboard!");
                  }
                }}
                className="px-4 py-2 border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => setViewFileDialogOpen(false)}
                className="px-4 py-2 bg-[var(--color-accent)] text-white hover:brightness-110 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}