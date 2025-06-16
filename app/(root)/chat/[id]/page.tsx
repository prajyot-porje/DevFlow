"use client"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import ReactMarkdown from "react-markdown"

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react"
import { Send, Code, Eye, Sparkles, FileText, Loader2 } from "lucide-react"
import Image from "next/image"
import { SignedIn, useUser } from "@clerk/nextjs"
import { GetUserDetails } from "@/hooks/GetUserDetails"
import Sidebar from "@/components/custom/Sidebar"
import History from "@/components/custom/History"
import Header from "@/components/custom/Header"
import type { ChatMessage } from "@/data/Types"
import { buildAIPrompt, greetingMessage } from "@/data/data"
import prompt from "@/data/prompt"
import axios from "axios"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useTheme } from "next-themes"
import { sandpackFiles as initialFiles } from "@/data/data"

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Code Tab Skeleton Loader Component
function CodeTabSkeleton() {
  return (
    <div className="flex h-[79vh] w-full animate-in fade-in-0 duration-500">
      {/* File Explorer Skeleton */}
      <div className="w-[12vw] border-r bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Code Editor Skeleton */}
      <div className="flex-1 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Generating code...</span>
          </div>
        </div>

        {/* Code lines skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
              <Skeleton className="h-4 w-8 flex-shrink-0" />
              <Skeleton className="h-4" style={{ width: `${Math.random() * 60 + 20}%` }} />
            </div>
          ))}
        </div>

        {/* Animated typing indicator */}
        <div className="flex items-center gap-2 mt-6">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
          <span className="text-sm text-muted-foreground">Writing your code...</span>
        </div>
      </div>
    </div>
  )
}

// Preview Tab Skeleton Loader Component
function PreviewTabSkeleton() {
  return (
    <div className="h-[79vh] bg-card border rounded-lg overflow-hidden animate-in fade-in-0 duration-500">
      {/* Browser-like header */}
      <div className="h-12 bg-muted border-b flex items-center gap-2 px-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
        </div>
        <div className="flex-1 mx-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Building preview...</span>
        </div>
      </div>

      {/* Preview content skeleton */}
      <div className="p-6 space-y-6">
        {/* Header section */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4 animate-pulse" />
          <Skeleton className="h-4 w-1/2 animate-pulse" style={{ animationDelay: "0.1s" }} />
        </div>

        {/* Content blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 animate-pulse"
                style={{
                  width: `${Math.random() * 40 + 60}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Animated building indicator */}
        <div className="flex items-center justify-center gap-3 mt-8 p-6 bg-muted/50 rounded-lg">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
          <span className="text-sm text-muted-foreground">Compiling your application...</span>
        </div>
      </div>
    </div>
  )
}

export default function ChatWorkspacePage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const params = useParams()
  const id = params.id as string
  const incomingMessage = searchParams.get("message")
  const [files, setFiles] = useState(initialFiles)

  const [message, setMessage] = useState<ChatMessage[]>(() => {
    if (incomingMessage) return []
    return [greetingMessage]
  })

  const user = useUser()
  const userDetails = GetUserDetails()

  const [isLoading, setIsLoading] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [historyOpen, setHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userInput, setuserInput] = useState("")
  const router = useRouter()
  const updateMessages = useMutation(api.workspace.UpdateMessages)

  useEffect(() => {
    if (incomingMessage) {
      const decoded = decodeURIComponent(incomingMessage)
      if (message.length === 0) {
        const newUserId = generateUniqueId()
        const userMessage: ChatMessage = {
          id: newUserId,
          type: "user",
          content: decoded,
          timestamp: Date.now(),
        }
        setMessage([greetingMessage, userMessage])
        setuserInput("")
        setIsLoading(true)
        const params = new URLSearchParams(window.location.search)
        params.delete("message")

        router.replace(`?${params.toString()}`)

        setTimeout(() => {
          setIsLoading(false)
        }, 5000)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingMessage])

  // Only call GetAiResponse after a user message
  useEffect(() => {
    if (message?.length > 0) {
      const role = message[message.length - 1].type
      if (role === "user") {
        GetAiResponse()
      }
    }
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  // Call GenerateAiCode after receiving the AI response
 // ...existing code...

const OnGenerate = async (input: string) => {
  if (!input.trim()) return
  if (!user.user?.id) {
    router.push("/sign-in")
    return
  }
  if (!userDetails || !userDetails._id) {
    return
  }
  setIsLoading(true) // Start chat loader
  setGeneratingCode(false) // Reset code loader

  const newUserId = generateUniqueId()
  const userMessage: ChatMessage = {
    id: newUserId,
    type: "user",
    content: userInput,
    timestamp: Date.now(),
  }
  setMessage((prev) => [...prev, userMessage])
  setuserInput("")
}

const GetAiResponse = async () => {
  setIsLoading(true) // Start chat loader
  const pro = JSON.stringify(message) + (prompt.CHAT_PROMPT || "")
  const response = await axios.post("/api/AI_chat", {
    prompt: pro,
  })
  const ai_response: ChatMessage = {
    id: generateUniqueId(),
    type: "assistant",
    content: response.data.result,
    timestamp: Date.now(),
  }
  setMessage((prev) => [...prev, ai_response])
  if (id) {
    await updateMessages({
      message: [...message, ai_response],
      workspaceID: id as Id<"workspaces">,
    })
  }
  setIsLoading(false) // End chat loader

  setGeneratingCode(true) // Start code loader
  await GenerateAiCode(ai_response.content)
  setGeneratingCode(false) // End code loader
}

const GenerateAiCode = async (aiContent: string) => {
  const prompt = buildAIPrompt(files, aiContent)
  const result = await axios.post("/api/AI_code", { prompt })
  const code_response = result.data
  setFiles({ ...files, ...code_response?.files })
}

// ...existing code...

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function TimeClient({ date }: { date: number }) {
    const [time, setTime] = useState("")
    useEffect(() => {
      setTime(new Date(date).toLocaleTimeString())
    }, [date])
    return <>{time}</>
  }

  return (
    <div className={`w-screen h-screen overflow-hidden `}>
      <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <Sidebar historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <Header title="AI Code Generator" />
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid grid-cols-3 mx-6 mt-4 flex-shrink-0">
                  <TabsTrigger value="chat" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2">
                    <Code className="w-4 h-4" />
                    Code
                    {generatingCode && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                    {generatingCode && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="chat"
                  className="flex-1 flex flex-col m-6 mt-4 overflow-auto min-h-0 hide-scrollbar"
                >
                  {/* Chat Area */}
                  <ScrollArea className="flex-1 pr-4 hide-scrollbar">
                    <div className="space-y-6">
                      {message.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-500 ${
                            message.type === "user" ? "justify-end" : ""
                          }`}
                        >
                          {message.type === "assistant" && (
                            <Avatar className="w-8 h-8 mt-1">
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            </Avatar>
                          )}

                          <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                            <Card
                              className={`${
                                message.type === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-card"
                              }`}
                            >
                              <CardContent className="">
                                <div className="text-sm leading-relaxed">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                              </CardContent>
                            </Card>
                            <p className="text-xs text-muted-foreground mt-2 px-1">
                              <TimeClient date={message.timestamp} />
                            </p>
                          </div>

                          {message.type === "user" && (
                            <Avatar className="w-8 h-8 mt-1">
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
                          )}
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex gap-4 animate-in slide-in-from-bottom-2 duration-500">
                          <Avatar className="w-8 h-8 mt-1">
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white animate-spin" />
                            </div>
                          </Avatar>
                          <Card className="bg-card">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                  <div
                                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  />
                                  <div
                                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">Generating...</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {[
                        "Landing page with hero section",
                        "Dashboard with charts",
                        "E-commerce product grid",
                        "Login form with validation",
                      ].map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs hover:scale-105 transition-transform"
                          onClick={() => setuserInput(suggestion)}
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
                          onChange={(e) => setuserInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              OnGenerate(userInput)
                            }
                          }}
                          className="min-h-[60px] resize-none pr-12"
                        />
                        <Button
                          size="sm"
                          className="absolute right-2 bottom-2 h-8 w-8 p-0"
                          onClick={() => {
                            OnGenerate(userInput)
                          }}
                          disabled={!userInput.trim() || isLoading}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Code and Preview Tabs */}
                <SandpackProvider
                  template="react"
                  theme={theme === "dark" ? "dark" : "light"}
                  files={files}
                  customSetup={{
                    dependencies: {
                      react: "latest",
                      "react-dom": "latest",
                      tailwindcss: "latest",
                      postcss: "latest",
                      autoprefixer: "latest",
                      "lucide-react": "latest",
                    },
                  }}
                >
                  <SandpackLayout>
                    <TabsContent value="code" className="flex-1 flex m-6 mt-4 overflow-auto min-h-0 hide-scrollbar">
                      {generatingCode ? (
                        <CodeTabSkeleton />
                      ) : (
                        <>
                          <SandpackFileExplorer style={{ height: "79vh", width: "12vw" }} />
                          <SandpackCodeEditor
                            style={{ height: "79vh" }}
                            showLineNumbers={true}
                            showInlineErrors
                            wrapContent
                            closableTabs
                          />
                        </>
                      )}
                    </TabsContent>
                    <TabsContent
                      value="preview"
                      className="flex-1 flex flex-col m-6 mt-4 overflow-auto min-h-0 hide-scrollbar"
                    >
                      {generatingCode ? (
                        <PreviewTabSkeleton />
                      ) : (
                        <SandpackPreview style={{ height: "79vh" }} showNavigator={true} />
                      )}
                    </TabsContent>
                  </SandpackLayout>
                </SandpackProvider>
              </Tabs>
            </div>

            {/* History Sidebar */}
            <History historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
          </div>
        </div>
      </div>
    </div>
  )
}
