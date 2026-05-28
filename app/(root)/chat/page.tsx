"use client"
import { useState, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"
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
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
      message: [userMessage],
    })

    const encodedMessage = encodeURIComponent(input)
    router.push(`/chat/${workspaceID}?message=${encodedMessage}`)
    setuserInput("") 
  }

  return (
    <>
      <LimitDialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen} />
      <div className="flex w-full h-full">
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto bg-[var(--color-bg-page)] min-h-full w-full"
          style={
            isDark
              ? {
                  backgroundImage: `radial-gradient(ellipse 80% 50% at 0% 0%, rgba(14, 165, 233, 0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(35, 53, 77, 0.3) 0%, transparent 50%)`
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
              <textarea
                placeholder="Describe what you want to build..."
                value={userInput}
                onChange={(e) => setuserInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (!isLoading) {
                      OnGenerate(userInput)
                    }
                  }
                }}
                className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[18px] py-4 pr-14 pl-5 min-h-20 max-h-60 w-full resize-none overflow-y-auto font-body font-normal text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_var(--color-accent),0_4px_16px_rgba(14,165,233,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  transition: "border-color 200ms, box-shadow 200ms",
                }}
              />
              <button
                className={`absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-[10px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                  userInput.trim()
                    ? "bg-[var(--color-accent)] hover:brightness-110 border-none text-white"
                    : "bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] text-[var(--color-text-tertiary)]"
                }`}
                style={{
                  transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1), border-color 200ms cubic-bezier(0.16,1,0.3,1), color 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
                onClick={() => {
                  OnGenerate(userInput)
                }}
                disabled={!userInput.trim() || isLoading}
                aria-label="Send prompt"
              >
                {isLoading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="w-full">
              <p className="font-heading font-semibold text-sm text-[var(--color-text-secondary)] mb-3 text-center uppercase tracking-wider">
                Quick start
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {quickPrompts.map((suggestion, index) => (
                  <button
                    key={index}
                    disabled={isLoading}
                    className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 font-body font-medium text-[13px] md:text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setuserInput(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* History Sidebar – desktop only */}
        <div className="hidden lg:block h-full">
          <History historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
        </div>
      </div>
    </>
  )
}
