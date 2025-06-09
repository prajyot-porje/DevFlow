"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import {
  Send,
  Code,
  Eye,
  History,
  Settings,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Zap,
  Layers,
  FileCode,
  Palette,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
  Bell,
} from "lucide-react"
import Image from "next/image"
import { SignedIn, UserButton, useUser } from "@clerk/nextjs"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  code?: string
  preview?: string
}

interface Project {
  id: string
  name: string
  description: string
  lastModified: Date
  preview: string
  tags: string[]
}

export default function DevFlow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you build beautiful web interfaces. What would you like to create today?",
      timestamp: new Date(),
    },
  ])
  const user = useUser();
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState("desktop")
  const [copied, setCopied] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Landing Page",
      description: "Modern landing page with hero section",
      lastModified: new Date(Date.now() - 1000 * 60 * 30),
      preview: "/placeholder.svg?height=200&width=300",
      tags: ["React", "Tailwind", "Landing"],
    },
    {
      id: "2",
      name: "Dashboard",
      description: "Analytics dashboard with charts",
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
      preview: "/placeholder.svg?height=200&width=300",
      tags: ["Dashboard", "Charts", "Analytics"],
    },
    {
      id: "3",
      name: "E-commerce",
      description: "Product catalog with shopping cart",
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
      preview: "/placeholder.svg?height=200&width=300",
      tags: ["E-commerce", "React", "Shopping"],
    },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I'll help you create ${input}. Here's a beautiful implementation:`,
        timestamp: new Date(),
        code: `import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">
        ${input}
      </h1>
      <Button>Get Started</Button>
    </div>
  )
}`,
        preview: "/",
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 2000)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function TimeClient({ date }: { date: Date }) {
    const [time, setTime] = useState("")
    useEffect(() => {
      setTime(date.toLocaleTimeString())
    }, [date])
    return <>{time}</>
  }

  return (
    <div className={`w-screen h-screen overflow-hidden ${darkMode ? "dark" : ""}`}>
      <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 h-full ease-in-out border-r bg-card/50 backdrop-blur-sm flex-shrink-0`}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <div className="animate-in slide-in-from-left-2 duration-200">
                  <h1 className="font-bold text-lg">DevFlow</h1>
                  <p className="text-xs text-muted-foreground">Build with AI</p>
                </div>
              )}
            </div>

            <nav className="space-y-2">
              {[
                { icon: Zap, label: "Generate", active: true },
                { icon: History, label: "History" },
                { icon: Layers, label: "Projects" },
                { icon: Palette, label: "Templates" },
                { icon: Settings, label: "Settings" },
              ].map((item, index) => (
                <Button
                  key={index}
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all duration-200 ${!sidebarOpen ? "px-2" : ""}`}
                  onClick={() => {
                    if (item.label === "History") setHistoryOpen(!historyOpen)
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  {sidebarOpen && <span className="animate-in slide-in-from-left-2 duration-200">{item.label}</span>}
                </Button>
              ))}
            </nav>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 -right-3 w-6 h-6 rounded-full border bg-background shadow-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold">AI Code Generator</h2>
              <Badge variant="secondary" className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Online
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Avatar className="w-8 h-8">
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </Avatar>
            </div>
          </header>

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
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 flex flex-col m-6 mt-4 overflow-auto min-h-0 hide-scrollbar">
                  <ScrollArea className="flex-1 pr-4 hide-scrollbar">
                    <div className="space-y-6">
                      {messages.map((message) => (
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
                                <p className="text-sm leading-relaxed">{message.content}</p>

                                {message.code && (
                                  <div className="mt-4 rounded-lg border bg-muted/50 overflow-hidden">
                                    <div className="flex items-center justify-between p-3 border-b bg-muted/80">
                                      <div className="flex items-center gap-2">
                                        <FileCode className="w-4 h-4" />
                                        <span className="text-sm font-medium">component.tsx</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyCode(message.code!)}
                                        className="h-8 px-2"
                                      >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                      </Button>
                                    </div>
                                    <pre className="p-4 text-sm overflow-x-auto">
                                      <code>{message.code}</code>
                                    </pre>
                                  </div>
                                )}

                                {message.preview && (
                                  <div className="mt-4 rounded-lg border overflow-hidden bg-background">
                                    <div className="aspect-video bg-muted/20 flex items-center justify-center">
                                      <Image
                                        src={message.preview || "/placeholder.svg"}
                                        alt="Preview"
                                        height={50}
                                        width={50}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                    <div className="p-3 border-t flex gap-2">
                                      <Button size="sm" variant="outline" className="gap-2">
                                        <Eye className="w-4 h-4" />
                                        View
                                      </Button>
                                      <Button size="sm" variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Export
                                      </Button>
                                      <Button size="sm" variant="outline" className="gap-2">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                      </Button>
                                    </div>
                                  </div>
                                )}
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
                          onClick={() => setInput(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Textarea
                          placeholder="Describe what you want to build..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          className="min-h-[60px] resize-none pr-12"
                        />
                        <Button
                          size="sm"
                          className="absolute right-2 bottom-2 h-8 w-8 p-0"
                          onClick={handleSendMessage}
                          disabled={!input.trim() || isLoading}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="flex-1 m-6 mt-4 overflow-auto min-h-0">
                  <Card className="h-full">
                    <CardHeader className="-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Code Editor</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                      <div className="h-full bg-muted/20 rounded-lg p-4 font-mono text-sm overflow-auto">
                        <pre className="text-muted-foreground">
                          {`import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Component() {
  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This is your generated component.
          </p>
          <Button className="w-full">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-6 mt-4 overflow-auto min-h-0">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Preview</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant={previewMode === "mobile" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode("mobile")}
                          >
                            📱
                          </Button>
                          <Button
                            variant={previewMode === "tablet" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode("tablet")}
                          >
                            📱
                          </Button>
                          <Button
                            variant={previewMode === "desktop" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode("desktop")}
                          >
                            🖥️
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                      <div
                        className={`h-full bg-background border rounded-lg mx-auto transition-all duration-300 ${
                          previewMode === "mobile" ? "max-w-sm" : previewMode === "tablet" ? "max-w-2xl" : "w-full"
                        }`}
                      >
                        <div className="h-full flex items-center justify-center p-8">
                          <Card className="max-w-md mx-auto">
                            <CardHeader>
                              <CardTitle>Welcome</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4">This is your generated component preview.</p>
                              <Button className="w-full">Get Started</Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            {/* History Sidebar */}
            {historyOpen && (
              <div className="w-80 border-l bg-card/50 backdrop-blur-sm animate-in slide-in-from-right-2 duration-300 h-full overflow-y-auto flex-shrink-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Projects</h3>
                    <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(false)}>
                      ×
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {projects.map((project) => (
                      <Card key={project.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                              <Image
                                src={project.preview || "/placeholder.svg"}
                                alt={project.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{project.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                              <div className="flex gap-1 mt-2">
                                {project.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
