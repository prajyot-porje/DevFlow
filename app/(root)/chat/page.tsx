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
    setuserInput("") 
  }

  return (
    <>
      <LimitDialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen} />
      <div className="w-screen h-screen overflow-hidden">
        <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
          {/* Sidebar */}
          <Sidebar historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <Header title="AI Code Studio" />
            {/* Centralized Input Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 overflow-auto">
              <div className="max-w-2xl w-full space-y-8">
                {/* Welcome/Greeting */}
                <div className="text-center space-y-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
                    Turn ideas into code
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                    Describe what you want to build and let AI craft production-ready components in seconds.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-3">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground px-2">Quick start</p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {quickPrompts.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs hover:bg-muted/50 hover:scale-105 transition-all bg-card/50 border-foreground/10"
                        onClick={() => setuserInput(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="flex gap-3 w-full pt-4">
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
                      className="min-h-20 resize-none pr-14 bg-card/50 border-foreground/10 focus:border-foreground/30 focus:bg-card"
                    />
                    <Button
                      size="sm"
                      className="absolute right-3 bottom-3 h-8 w-8 p-0 rounded-lg"
                      onClick={() => {
                        OnGenerate(userInput)
                      }}
                      disabled={!userInput.trim() || isLoading}
                    >
                      {isLoading ? (
                        <Sparkles className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Footer hint */}
                <p className="text-xs text-muted-foreground text-center">
                  Press <kbd className="px-2 py-0.5 rounded bg-muted/30 border border-foreground/10 text-foreground mx-1">Enter</kbd> to send or <kbd className="px-2 py-0.5 rounded bg-muted/30 border border-foreground/10 text-foreground mx-1">Shift + Enter</kbd> for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
