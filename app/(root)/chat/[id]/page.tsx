"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import { Send, Code, Eye, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { SignedIn, useUser } from "@clerk/nextjs"
import { quickPrompts } from "@/data/data"
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
  } = useAIChat({
    workspaceId: id,
    files,
    onFilesGenerated: applyGeneratedFiles,
    incomingMessage,
    fromTemplate,
    templateName,
  })

  // ── Load workspace history on mount ───────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const result = await loadWorkspace()

      if (result?.info?.title) {
        // title is managed by Convex now
      }
      if (result?.messages) {
        const msgs = Array.isArray(result.messages) ? result.messages : [result.messages];
        setMessages(msgs);
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
                        <ScrollArea className="flex-1 pr-2 md:pr-4 hide-scrollbar">
                          <div className="space-y-4 md:space-y-6">
                            {messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex gap-3 md:gap-4 animate-in slide-in-from-bottom-2 duration-500 ${
                                  msg.type === "user" ? "justify-end" : ""
                                }`}
                              >
                                {msg.type === "assistant" && (
                                  <Avatar className="w-7 h-7 md:w-8 md:h-8 mt-1 shrink-0">
                                    <div className="w-full h-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center">
                                      <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                    </div>
                                  </Avatar>
                                )}

                                <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] ${msg.type === "user" ? "order-first" : ""}`}>
                                  <div
                                    className={`rounded-2xl px-4 py-3 shadow-sm border ${
                                      msg.type === "user"
                                        ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20 text-[var(--color-text-primary)] rounded-tr-sm ml-auto"
                                        : "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] rounded-tl-sm"
                                    }`}
                                  >
                                    <div className="text-[13px] md:text-[14px] leading-relaxed break-words markdown-body">
                                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                  </div>
                                  <p className={`text-[10px] md:text-[11px] font-medium text-[var(--color-text-tertiary)] mt-1.5 md:mt-2 px-1 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                                    <TimeClient date={msg.timestamp} />
                                  </p>
                                </div>

                                {msg.type === "user" && (
                                  <Avatar className="w-7 h-7 md:w-8 md:h-8 mt-1 shrink-0 ring-2 ring-[var(--color-bg-page)] shadow-sm">
                                    <SignedIn>
                                      <Image
                                        src={user.user?.imageUrl || "/placeholder.svg"}
                                        alt={user.user?.firstName || "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full object-cover w-7 h-7 md:w-8 md:h-8"
                                      />
                                    </SignedIn>
                                  </Avatar>
                                )}
                              </div>
                            ))}

                            {isLoading && (
                              <div className="flex gap-3 md:gap-4 animate-in slide-in-from-bottom-2 duration-500">
                                <Avatar className="w-7 h-7 md:w-8 md:h-8 mt-1 shrink-0 shadow-sm">
                                  <div className="w-full h-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center rounded-full">
                                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white animate-pulse" />
                                  </div>
                                </Avatar>
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
                            )}
                          </div>
                          <div ref={messagesEndRef} />
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="mt-3 md:mt-4 space-y-3 md:space-y-4 pt-2">
                          <div className="flex gap-1.5 md:gap-2 flex-wrap">
                            {quickPrompts.slice(0, 3).map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-[10px] md:text-xs hover:bg-[var(--color-bg-hover)] hover:scale-105 transition-all bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] h-7 md:h-8 px-2 md:px-3"
                                onClick={() => setUserInput(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <Textarea
                                placeholder="Describe what you want to build..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    OnGenerate(userInput)
                                  }
                                }}
                                className="min-h-12 md:min-h-14 resize-none pr-10 md:pr-12 text-xs md:text-sm bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-0"
                              />
                              <Button
                                size="sm"
                                className="absolute right-2 bottom-2 h-7 w-7 md:h-8 md:w-8 p-0 rounded-lg"
                                onClick={() => OnGenerate(userInput)}
                                disabled={!userInput.trim() || isLoading}
                              >
                                <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </Button>
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
                    className="tab-content-persist flex-1 flex mx-4 md:mx-6 mt-3 md:mt-4 overflow-auto min-h-0 hide-scrollbar"
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
                    className="tab-content-persist flex-1 flex flex-col mx-4 md:mx-6 mt-3 md:mt-4 overflow-auto min-h-0 hide-scrollbar"
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
    </>
  )
}