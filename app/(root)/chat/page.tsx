"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import History from "@/components/custom/History";
import { Send, Sparkles } from "lucide-react";
import Image from "next/image";
import { SignedIn, useUser } from "@clerk/nextjs";
import { GetUserDetails } from "@/hooks/GetUserDetails";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/custom/Sidebar";
import Header from "@/components/custom/Header";
import { TabsContent } from "@radix-ui/react-tabs";
import { ChatMessage } from "@/data/Types";
import { greetingMessage } from "@/data/data";



export default function DevFlow() {
  const [message, setMessage] = useState<ChatMessage[]>([]);
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setuserInput] = useState("");
  const userDetails = GetUserDetails();
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();
  function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  const OnGenerate = async (input: string) => {
    if (!user.user?.id) {
      router.push("/sign-in");
      return;
    }
    if (!userDetails || !userDetails._id) {
      return;
    }
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      type: "user",
      content: userInput,
      timestamp: Date.now(), 
    };
    setMessage([userMessage]);

    const workspaceID = await CreateWorkspace({
      user: userDetails._id,
      message: userMessage,
    });
    const encodedMessage = encodeURIComponent(input);
    router.push(`/chat/${workspaceID}?message=${encodedMessage}`);

    setuserInput("");
    setIsLoading(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [message]);

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
        <Sidebar historyOpen={historyOpen} setHistoryOpen={setHistoryOpen}  />

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
                <TabsList className="grid grid-cols-1 mx-6 mt-4 flex-shrink-0">
                  <TabsTrigger value="chat" className="gap-2 w-24">
                    <Sparkles className="w-4 h-4" />
                    Chat
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  className="flex-1 flex flex-col m-6 mt-4 overflow-auto min-h-0 hide-scrollbar"
                  value={"chat"}
                >
                  <ScrollArea className="flex-1 pr-4 hide-scrollbar">
                    <div className="space-y-6">
                      {[greetingMessage, ...message].map((message) => (
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
                        "Make a Todo App",
                        "Build a Budget tracker website",
                        "Simple E-commerce website",
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
