"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "../ui/input"
import { Search, FileText, Folder, Clock, Star, ArrowRight } from "lucide-react"
import { ProjectTemplates } from "@/data/projectTemplates"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { GetUserDetails } from "@/hooks/GetUserDetails"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"


interface SpotlightSearchProps {
  isOpen: boolean
  onClose: () => void
}

const SpotlightSearch = ({ isOpen, onClose }: SpotlightSearchProps) => {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const userDetails = GetUserDetails()

  const workspaces = useQuery(
    api.workspace.getWorkspacesByUser,
    typeof userDetails === "object" && userDetails !== null && "_id" in userDetails
      ? { userId: userDetails._id }
      : "skip",
  )

  const searchResults = useMemo(() => {
    if (!query.trim()) return { templates: [], projects: [] }

    const templateResults = Object.entries(ProjectTemplates)
      .filter(
        ([name, template]) =>
          name.toLowerCase().includes(query.toLowerCase()) ||
          template.description?.toLowerCase().includes(query.toLowerCase()) ||
          template.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
      .map(([name, template]) => ({
        type: "template" as const,
        id: name,
        title: name,
        description: template.description || "",
        tags: template.tags || [],
        difficulty: template.difficulty || "Beginner",
        popularity: template.popularity || 4.0,
      }))

    const projectResults =
      workspaces
        ?.filter(
          (project) =>
            project.info?.title?.toLowerCase().includes(query.toLowerCase()) ||
            project.info?.description?.toLowerCase().includes(query.toLowerCase()),
        )
        .map((project) => ({
          type: "project" as const,
          id: project._id,
          title: project.info?.title || "Untitled Project",
          description: project.info?.description || "No description available",
          createdAt: project._creationTime,
        })) || []

    return {
      templates: templateResults.slice(0, 5),
      projects: projectResults.slice(0, 5),
    }
  }, [query, workspaces])

  const allResults = [...searchResults.templates, ...searchResults.projects]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % allResults.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev === 0 ? allResults.length - 1 : prev - 1))
          break
        case "Enter":
          e.preventDefault()
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedIndex])
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  const handleSelect = (item: (typeof allResults)[0]) => {
    if (item.type === "template") {
      router.push(`/chat/templates?template=${encodeURIComponent(item.title)}`)
    } else {
      router.push(`/chat/${item.id}?highlight=true`)
    }
    onClose()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogTitle asChild>
        <VisuallyHidden>Spotlight Search</VisuallyHidden>
      </DialogTitle>
        <div className="flex items-center border-b px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground mr-3" />
          <Input
            placeholder="Search templates and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 text-base"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Search everything</p>
              <p className="text-sm">Find templates, projects, and more...</p>
            </div>
          ) : allResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.templates.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Templates
                  </div>
                  {searchResults.templates.map((template, index) => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedIndex === index ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelect(template)}
                    >
                      <div className="flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{template.title}</p>
                          <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            {template.popularity}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                        <div className="flex gap-1 mt-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              {searchResults.projects.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Projects
                  </div>
                  {searchResults.projects.map((project, index) => (
                    <div
                      key={project.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedIndex === searchResults.templates.length + index ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelect(project)}
                    >
                      <div className="flex-shrink-0">
                        <Folder className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{project.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(project.createdAt)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {allResults.length > 0 && (
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SpotlightSearch
