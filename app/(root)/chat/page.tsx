"use client"
import { useState, useEffect } from "react"
import { Send, Sparkles, FileText, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { GetUserDetails } from "@/hooks/GetUserDetails"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import History from "@/components/custom/History"
import { quickPrompts } from "@/data/data"
import { LimitDialog } from "@/components/custom/LimitDialog"
import { generateUniqueId } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"
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

export default function DevFlow() {
  const [limitDialogOpen, setLimitDialogOpen] = useState(false)
  const canStartConversation = useMutation(api.users.canStartConversation)
  const user = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [userInput, setuserInput] = useState("")
  const [selectedModel, setSelectedModel] = useState<string>("auto")
  const [pastedFile, setPastedFile] = useState<{ name: string; content: string } | null>(null)
  const [viewFileDialogOpen, setViewFileDialogOpen] = useState(false)
  const userDetails = GetUserDetails()
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace)
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [modelStatuses, setModelStatuses] = useState<Record<string, "online" | "offline">>({
    "poolside/laguna-m.1:free": "online",
    "nvidia/nemotron-3-super-120b-a12b:free": "online",
    "openai/gpt-oss-20b:free": "online",
    "meta-llama/llama-3.3-70b-instruct:free": "online",
    "qwen/qwen3-coder:free": "online",
  });
  const [offlineAlertOpen, setOfflineAlertOpen] = useState(false);

  useEffect(() => {
    const storedModel = localStorage.getItem("ai-model")
    if (storedModel) {
      setSelectedModel(storedModel)
    }
  }, [])

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    localStorage.setItem("ai-model", value)
  }

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
              data.statuses["openai/gpt-oss-20b:free"] === "offline" &&
              data.statuses["meta-llama/llama-3.3-70b-instruct:free"] === "offline" &&
              data.statuses["qwen/qwen3-coder:free"] === "offline";
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

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isDark = mounted && theme !== "light"

  const OnGenerate = async (input: string) => {
    if (!user.user?.id) {
      router.push("/sign-in")
      return
    }
    if (!userDetails || !userDetails._id) {
      return
    }
    
    const finalInput = pastedFile
      ? (input.trim() ? `${input}\n\nAttachment:\n${pastedFile.content}` : pastedFile.content)
      : input

    if (!finalInput.trim()) return

    setIsLoading(true)

    const result = await canStartConversation({ userId: userDetails._id })
    if (!result.allowed) {
      setLimitDialogOpen(true)
      setIsLoading(false)
      return
    }

    const userMessage = {
      id: generateUniqueId(),
      type: "user",
      content: finalInput,
      timestamp: Date.now(),
    }

    const workspaceID = await CreateWorkspace({
      user: userDetails._id,
      message: [userMessage],
    })

    const encodedMessage = encodeURIComponent(finalInput)
    router.push(`/chat/${workspaceID}?message=${encodedMessage}&model=${selectedModel}`)
    setuserInput("")
    setPastedFile(null)
  }

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
            <AlertDialogAction className="w-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 rounded-lg font-body font-semibold text-sm py-2.5 transition-all duration-fast cursor-pointer">
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex w-full h-full">
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto bg-[var(--color-bg-page)] min-h-full w-full"
          style={
            isDark
              ? {
                  backgroundImage: `radial-gradient(ellipse 80% 50% at 0% 0%, rgba(255, 255, 255, 0.015) 0%, transparent 55%)`
                }
              : undefined
          }
        >
          <div className="max-w-[640px] w-full flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: "150ms" }}>
            {/* Welcome/Greeting */}
            <div className="text-center flex flex-col gap-3">
              <p className="font-body text-lg text-[var(--color-text-secondary)] leading-[1.65] max-w-[480px] mx-auto text-center">
                Describe what you want to build and let AI craft production-ready components in seconds.
              </p>
            </div>

            {/* Input Area */}
            <div className="relative w-full">
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
                onChange={(e) => setuserInput(e.target.value)}
                onPaste={isMobile ? undefined : handlePaste}
                disabled={isLoading || isMobile}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (!isLoading && !isMobile) {
                      OnGenerate(userInput)
                    }
                  }
                }}
                className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[18px] py-4 pr-14 pl-5 pb-14 min-h-28 max-h-60 w-full resize-none overflow-y-auto font-body font-normal text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_var(--color-accent),0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar-chat"
                style={{
                  transition: "border-color 200ms, box-shadow 200ms",
                }}
              />
              <div className="absolute left-3.5 bottom-3 flex items-center gap-2">
                <Select value={selectedModel} onValueChange={handleModelChange} disabled={isMobile}>
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
                    <SelectItem value="openai/gpt-oss-20b:free">
                      <span className="flex items-center gap-2 font-medium">
                        <span>OpenAI GPT-OSS-20B (Free)</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${modelStatuses["openai/gpt-oss-20b:free"] === "online" ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                      </span>
                    </SelectItem>
                    <SelectItem value="meta-llama/llama-3.3-70b-instruct:free">
                      <span className="flex items-center gap-2 font-medium">
                        <span>Llama 3.3 70B Instruct (Free)</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${modelStatuses["meta-llama/llama-3.3-70b-instruct:free"] === "online" ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                      </span>
                    </SelectItem>
                    <SelectItem value="qwen/qwen3-coder:free">
                      <span className="flex items-center gap-2 font-medium">
                        <span>Qwen 3 Coder (Free)</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${modelStatuses["qwen/qwen3-coder:free"] === "online" ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                      </span>
                    </SelectItem>

                  </SelectContent>
                </Select>
              </div>
              {!isMobile && (
                <button
                  className={`absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] shadow-sm transition-all duration-200 ${
                    userInput.trim() || pastedFile
                      ? "bg-[var(--color-accent)] hover:opacity-90 border border-transparent text-[var(--color-accent-foreground)]"
                      : "bg-[var(--color-bg-elevated)]/60 hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]"
                  }`}
                  style={{
                    transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1), border-color 200ms cubic-bezier(0.16,1,0.3,1), color 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms",
                  }}
                  onClick={() => {
                    OnGenerate(userInput)
                  }}
                  disabled={!(userInput.trim() || pastedFile) || isLoading}
                  aria-label="Send prompt"
                >
                  {isLoading ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Quick Prompts */}
            {!pastedFile && !userInput.trim() && (
              <div className="w-full">
                <p className="font-heading font-semibold text-sm text-[var(--color-text-secondary)] mb-3 text-center uppercase tracking-wider">
                  Quick start
                </p>
                <div className="flex flex-wrap sm:flex-nowrap gap-3 justify-center w-full">
                  {quickPrompts.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      disabled={isLoading}
                      className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 font-body font-medium text-[13px] md:text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      onClick={() => setuserInput(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* History Sidebar – desktop only */}
        <div className="hidden lg:block h-full">
          <History historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
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
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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
