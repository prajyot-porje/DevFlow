"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { GetUserDetails } from "@/hooks/GetUserDetails"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/custom/Sidebar"
import Header from "@/components/custom/Header"
import { quickPrompts } from "@/data/data"
import { LimitDialog } from "@/components/custom/LimitDialog"

export default function DevFlow() {
  const [limitDialogOpen, setLimitDialogOpen] = useState(false)
  const canStartConversation = useMutation(api.users.canStartConversation)
  const user = useUser()
  const [isLoading, setIsLoading] = useState(false)
  // historyOpen and setHistoryOpen are kept for the Sidebar component,
  // even if they don't directly control functionality on this page.
  const [historyOpen, setHistoryOpen] = useState(false)
  const [userInput, setuserInput] = useState("")
  const userDetails = GetUserDetails()
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace)
  const router = useRouter()

  function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const OnGenerate = async (input: string) => {
    if (!user.user?.id) {
      router.push("/sign-in")
      return
    }
    if (!userDetails || !userDetails._id) {
      // Handle case where userDetails might not be loaded yet
      return
    }
    if (!input.trim()) return

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
      content: input,
      timestamp: Date.now(),
    }

    const workspaceID = await CreateWorkspace({
      user: userDetails._id,
      message: userMessage,
    })

    const encodedMessage = encodeURIComponent(input)
    router.push(`/chat/${workspaceID}?message=${encodedMessage}`)
    setuserInput("") // Clear the input field
    // isLoading will be reset naturally as the component unmounts or the new page loads
  }

  return (
    <>
      <LimitDialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen} />
      <div className="w-screen h-screen overflow-hidden">
        <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
          {/* Sidebar - Kept as is */}
          <Sidebar historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header - Kept as is */}
            <Header title="DevFlow AI Code Studio" />
            {/* Centralized Input Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
              <div className="max-w-2xl w-full space-y-6">
                {/* Welcome/Greeting */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Start a new conversation</h1>
                  <p className="text-muted-foreground">
                    Describe what you want to build or choose a quick prompt below.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {quickPrompts.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs hover:scale-105 transition-transform bg-transparent"
                      onClick={() => setuserInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-2 w-full">
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
                      {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
