"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import {
  Send,
  Code,
  Eye,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  FileCode,
} from "lucide-react";
import Image from "next/image";
import { SignedIn, useUser } from "@clerk/nextjs";
import { GetUserDetails } from "@/hooks/GetUserDetails";
import Sidebar from "@/components/custom/Sidebar";
import History from "@/components/custom/History";
import Header from "@/components/custom/Header";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number; // <-- Change from Date to number
  code?: string;
  preview?: string;
}

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function ChatWorkspacePage() {
  const searchParams = useSearchParams();
  const incomingMessage = searchParams.get("message");
  const [message, setMessage] = useState<ChatMessage[]>(() => {
    // If there's an incoming message, start with an empty array (no greeting)
    if (incomingMessage) return [];
    // Otherwise, show the assistant greeting
    return [
      {
        id: "1",
        type: "assistant",
        content:
          "Hello! I'm your AI assistant. I can help you build beautiful web interfaces. What would you like to create today?",
        timestamp: new Date().getTime(),
      },
    ];
  });
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setuserInput] = useState("");
  const userDetails = GetUserDetails();
  const router = useRouter();

  const greetingMessage: ChatMessage = {
    id: "greeting",
    type: "assistant",
    content: "Hello! I'm your AI assistant. I can help you build beautiful web interfaces. What would you like to create today?",
    timestamp: Date.now(),
  };

  useEffect(() => {
    if (incomingMessage) {
      const decoded = decodeURIComponent(incomingMessage);
      if (message.length === 0) {
        const newUserId = generateUniqueId();
        const userMessage: ChatMessage = {
          id: newUserId,
          type: "user",
          content: decoded,
          timestamp: Date.now(),
        };
        setMessage([
          greetingMessage,
          userMessage,
        ]);
        setuserInput(""); // clear input

        setIsLoading(true);
        setTimeout(() => {
          const newAssistantId = generateUniqueId();
          const assistantMessage: ChatMessage = {
            id: newAssistantId,
            type: "assistant",
            content: `I'll help you create ${decoded}. Here's a beautiful implementation:`,
            timestamp: Date.now(),
            code: `import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">
        ${decoded}
      </h1>
      <Button>Get Started</Button>
    </div>
  )
}`,
            preview: "/",
          };
          setMessage([
            greetingMessage,
            userMessage,
            assistantMessage,
          ]);
          setIsLoading(false);
        }, 2000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingMessage]);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  const OnGenerate = async (input: string) => {
    if (!input.trim()) return;
    if (!user.user?.id) {
      router.push("/sign-in");
      return;
    }
    if (!userDetails || !userDetails._id) {
      return;
    }

    const newUserId = generateUniqueId();

    const userMessage: ChatMessage = {
      id: newUserId,
      type: "user",
      content: userInput,
      timestamp: Date.now(),
    };
    setMessage((prev) => [...prev, userMessage]);
    setuserInput("");
    setIsLoading(true);

    setTimeout(() => {
      const newAssistantId = generateUniqueId();

      const assistantMessage: ChatMessage = {
        id: newAssistantId,
        type: "assistant",
        content: `I'll help you create ${userInput}. Here's a beautiful implementation:`,
        timestamp:  Date.now(),
        code: `import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">
        ${userInput}
      </h1>
      <Button>Get Started</Button>
    </div>
  )
}`,
        preview: "/",
      };
      setMessage((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function TimeClient({ date }: { date: number }) {
    const [time, setTime] = useState("");
    useEffect(() => {
      setTime(new Date(date).toLocaleTimeString());
    }, [date]);
    return <>{time}</>;
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
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden"
              >
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

                <TabsContent
                  value="chat"
                  className="flex-1 flex flex-col m-6 mt-4 overflow-auto min-h-0 hide-scrollbar"
                >
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

                          <div
                            className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}
                          >
                            <Card
                              className={`${
                                message.type === "user"
                                  ? "bg-primary text-primary-foreground ml-auto"
                                  : "bg-card"
                              }`}
                            >
                              <CardContent className="">
                                <p className="text-sm leading-relaxed">
                                  {message.content}
                                </p>

                                {message.code && (
                                  <div className="mt-4 rounded-lg border bg-muted/50 overflow-hidden">
                                    <div className="flex items-center justify-between p-3 border-b bg-muted/80">
                                      <div className="flex items-center gap-2">
                                        <FileCode className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                          component.tsx
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyCode(message.code!)}
                                        className="h-8 px-2"
                                      >
                                        {copied ? (
                                          <Check className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
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
                                        src={
                                          message.preview || "/placeholder.svg"
                                        }
                                        alt="Preview"
                                        height={50}
                                        width={50}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                    <div className="p-3 border-t flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2"
                                      >
                                        <Download className="w-4 h-4" />
                                        Export
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2"
                                      >
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
                                  src={
                                    user.user?.imageUrl || "/placeholder.svg"
                                  }
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
                                <span className="text-sm text-muted-foreground">
                                  Generating...
                                </span>
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
                              e.preventDefault();
                              OnGenerate(userInput);
                            }
                          }}
                          className="min-h-[60px] resize-none pr-12"
                        />
                        <Button
                          size="sm"
                          className="absolute right-2 bottom-2 h-8 w-8 p-0"
                          onClick={() => {
                            OnGenerate(userInput);
                          }}
                          disabled={!userInput.trim() || isLoading}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            {/* History Sidebar */}
            <History
              historyOpen={historyOpen}
              setHistoryOpen={setHistoryOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
