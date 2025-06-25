"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import { Send, Code, Eye, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { SignedIn, useUser } from "@clerk/nextjs";
import { GetUserDetails } from "@/hooks/GetUserDetails";
import Sidebar from "@/components/custom/Sidebar";
import History from "@/components/custom/History";
import Header from "@/components/custom/Header";
import type { ChatMessage } from "@/data/Types";
import { buildAIPrompt, greetingMessage } from "@/data/data";
import prompt from "@/data/prompt";
import axios from "axios";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { sandpackFiles as initialFiles } from "@/data/data";
import { useWebContainer } from "@/hooks/useWebContainer ";
import {
  CodeTabSkeleton,
  PreviewTabSkeleton,
} from "@/components/custom/Loaders";
import { WebContainerPreview } from "@/components/custom/webContainer/preview";
import { ResizableEditor } from "@/components/custom/webContainer/resizeable-editor";
import type { FileSystemTree } from "@webcontainer/api";

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

type InputFileStructure = Record<string, { code: string }>;

export function convertToWebContainerFileSystem(
  fileStructure: InputFileStructure
): FileSystemTree {
  const root: FileSystemTree = {};

  for (const fullPath in fileStructure) {
    const parts = fullPath.replace(/^\//, "").split("/");
    let current: FileSystemTree = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current[part] = {
          file: {
            contents: fileStructure[fullPath].code,
          },
        };
      } else {
        if (!current[part]) {
          current[part] = {
            directory: {},
          };
        } else if (!("directory" in current[part])) {
          throw new Error(
            `Conflict at ${fullPath}: trying to create directory but found a file.`
          );
        }

        // Safely narrow the type
        current = (current[part] as { directory: FileSystemTree }).directory;
      }
    }
  }

  return root;
}



export default function ChatWorkspacePage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const incomingMessage = searchParams.get("message");
  const [files, setFiles] = useState<InputFileStructure>(initialFiles);
  const UpdateFiles = useMutation(api.workspace.UpdateFiles);
  const { webContainer, error: containerError } = useWebContainer();
  const [selectedFile, setSelectedFile] = useState("/src/App.jsx");
  const [responseRecevied, setresponseRecevied] = useState(false);
  const [message, setMessage] = useState<ChatMessage[]>(() => {
    if (incomingMessage) return [];
    return [greetingMessage];
  });
  const user = useUser();
  const userDetails = GetUserDetails();
  const [isLoading, setIsLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [title, setTitle] = useState("AI Code Generator");
  const [activeTab, setActiveTab] = useState("chat");
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setuserInput] = useState("");
  const router = useRouter();
  const updateMessages = useMutation(api.workspace.UpdateMessages);
  const convex = useConvex();
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Update WebContainer files when files change
  useEffect(() => {
    if (webContainer && Object.keys(files).length > 0) {
      const updateFiles = async () => {
        try {
          const convertedFiles = convertToWebContainerFileSystem(files);
          await webContainer.mount(convertedFiles);
        } catch (error) {
          console.error("Failed to update WebContainer files:", error);
        }
      };
      updateFiles();
    }
  }, [files, webContainer]);

  // Handle file changes
  const handleFileChange = (fileName: string, code: string) => {
    const updatedFiles = {
      ...files,
      [fileName]: { code },
    };
    setFiles(updatedFiles);
  };


  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getData = async () => {
    setLoadingHistory(true);
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceID: id as Id<"workspaces">,
    });
    const dbFiles = { ...files, ...result?.files };
    setFiles(dbFiles);

    if (Array.isArray(result?.messages)) {
      setMessage(result.messages);
    }
    setLoadingHistory(false);
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
        setMessage([greetingMessage, userMessage]);
        setuserInput("");
        setIsLoading(true);
        const params = new URLSearchParams(window.location.search);
        params.delete("message");

        router.replace(`?${params.toString()}`);

        setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingMessage]);

  useEffect(() => {
    if (loadingHistory) return;

    if (message?.length > 0) {
      const role = message[message.length - 1].type;
      if (role === "user") {
        GetAiResponse();
      }
    }
    scrollToBottom();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, loadingHistory]);

  const OnGenerate = async (input: string) => {
    if (!input.trim()) return;
    if (!user.user?.id) {
      router.push("/sign-in");
      return;
    }
    if (!userDetails || !userDetails._id) {
      return;
    }
    setIsLoading(true);
    setGeneratingCode(false);

    const newUserId = generateUniqueId();
    const userMessage: ChatMessage = {
      id: newUserId,
      type: "user",
      content: input,
      timestamp: Date.now(),
    };
    setMessage((prev) => [...prev, userMessage]);
    setuserInput("");
  };

  const GetAiResponse = async () => {
    setIsLoading(true);
    setGeneratingCode(true);
    const pro = JSON.stringify(message) + (prompt.CHAT_PROMPT || "");
    const response = await axios.post("/api/AI_chat", {
      prompt: pro,
    });
    setTitle(response.data.result.title);
    const ai_response: ChatMessage = {
      id: generateUniqueId(),
      type: "assistant",
      content: response.data.result.userResponse,
      timestamp: Date.now(),
    };
    setMessage((prev) => [...prev, ai_response]);
    if (id) {
      await updateMessages({
        message: [...message, ai_response],
        workspaceID: id as Id<"workspaces">,
      });
    }
    setIsLoading(false);
    await GenerateAiCode(response.data.result.modelResponse);
    setGeneratingCode(false);
  };

  const GenerateAiCode = async (aiContent: string) => {
    const prompt = buildAIPrompt(files, aiContent);
    const result = await axios.post("/api/AI_code", { prompt });
    const code_response = result.data;
    if (code_response) {
      setresponseRecevied(true);
    }
    const mergefiles = { ...files, ...code_response?.files };
    setFiles(mergefiles);
    await UpdateFiles({
      workspaceID: id as Id<"workspaces">,
      files: mergefiles,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function TimeClient({ date }: { date: number }) {
    const [time, setTime] = useState("");
    useEffect(() => {
      setTime(new Date(date).toLocaleTimeString());
    }, [date]);
    return <>{time}</>;
  }

  if (containerError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <CardContent className="text-center space-y-4">
            <div className="text-red-500">
              <Loader2 className="h-8 w-8 mx-auto mb-2" />
            </div>
            <h2 className="text-lg font-semibold">WebContainer Error</h2>
            <p className="text-sm text-muted-foreground">{containerError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen overflow-hidden `}>
      <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <Sidebar historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <Header title={title} />
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
                    {generatingCode && (
                      <Loader2 className="w-3 h-3 animate-spin ml-1" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                    {generatingCode && (
                      <Loader2 className="w-3 h-3 animate-spin ml-1" />
                    )}
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
                                <div className="text-sm leading-relaxed">
                                  <ReactMarkdown>
                                    {message.content}
                                  </ReactMarkdown>
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
                        "Make a todo website",
                        "Make a budget traking app",
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

                {/* Code Tab */}
                <TabsContent
                  value="code"
                  className="flex-1 flex m-6 mt-4 overflow-auto min-h-0 hide-scrollbar"
                >
                  {generatingCode ? (
                    <CodeTabSkeleton />
                  ) : (
                    <div className="flex h-full w-full">
                      <ResizableEditor
                        files={files}
                        selectedFile={selectedFile}
                        onFileSelect={setSelectedFile}
                        onFileChange={handleFileChange}
                      />
                    </div>
                  )}
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent
                  value="preview"
                  className="flex-1 flex flex-col m-6 mt-4 overflow-auto min-h-0 hide-scrollbar"
                >
                  {generatingCode ? (
                    <PreviewTabSkeleton />
                  ) : (
                    <WebContainerPreview
                      webContainer={webContainer}
                      files={files}
                      responseRecevied={responseRecevied}
                    />
                  )}
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
