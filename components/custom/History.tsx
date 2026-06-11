"use client"
import type React from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  FileText,
  X,
} from "lucide-react"
import { projectIcons } from "@/data/data"

interface historyProps {
  historyOpen: boolean
  setHistoryOpen: (open: boolean) => void
}
const getRandomIcon = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0 
  }
  return Math.abs(hash) % projectIcons.length
}


const formatTimeAgo = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "Just now"
}

const History: React.FC<historyProps> = ({ historyOpen, setHistoryOpen }) => {
  const router = useRouter()
  const { user } = useUser()
  const convexUser = useQuery(api.users.GetUser, user?.id ? { uid: user.id } : "skip")
  const workspaces = useQuery(
    api.workspace.getRecentWorkspacesByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  )
  const handleCardClick = (id: string) => {
    router.push(`/chat/${id}`)
  }

  return (
    <div>
      {historyOpen && (
        <div className="w-80 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] animate-in slide-in-from-right-2 duration-300 h-full overflow-y-auto flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">Recent Projects</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{workspaces?.length || 0} projects</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryOpen(false)}
                className="h-8 w-8 p-0 hover:bg-[var(--color-bg-hover)] rounded-md flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {workspaces?.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[var(--color-text-tertiary)]" />
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">No projects yet</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                    Start a new conversation to create your first project
                  </p>
                </div>
              )}

              {workspaces?.map((project) => {
                const IconComponent = projectIcons[getRandomIcon(project._id)]

                return (
                  <Card
                    key={project._id}
                    onClick={() => handleCardClick(project._id)}
                    className="cursor-pointer hover:shadow-md hover:border-[var(--color-border-default)] border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] transition-all duration-200 group"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-bg-inset)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] group-hover:border-[var(--color-border-strong)] group-hover:scale-105 transition-all duration-200"
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate mb-1 text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-light)] transition-colors">
                            {project.info?.title || "Untitled Project"}
                          </h4>
                          <p className="text-xs text-[var(--color-text-secondary)] truncate mb-2 leading-relaxed">
                            {project.info?.description || "No description available"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
                              {formatTimeAgo(project._creationTime)}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History
