"use client"
import Sidebar from "@/components/custom/Sidebar"
import { useState, useRef, useEffect, Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Star, Download, Eye, Zap } from "lucide-react"
import { ProjectTemplates } from "@/data/projectTemplates"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { GetUserDetails } from "@/hooks/GetUserDetails"

type TemplateName = keyof typeof ProjectTemplates

const Templates = () => {
  const [historyOpen, setHistoryOpen] = useState(true)
  const [selected, setSelected] = useState<TemplateName | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const detailsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams();
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace)
  const UpdateFiles = useMutation(api.workspace.UpdateFiles)
  const updateMessages = useMutation(api.workspace.UpdateMessages)
  const updateInfo = useMutation(api.workspace.Updateinfo)
  const userDetails = GetUserDetails()

  useEffect(() => {
    const templateFromQuery = searchParams.get("template");
    if (
      templateFromQuery &&
      (Object.keys(ProjectTemplates) as string[]).includes(templateFromQuery)
    ) {
      setSelected(templateFromQuery as TemplateName);
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [searchParams]);

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

  const getFileCount = (templateName: TemplateName) => {
    const template = ProjectTemplates[templateName]
    return Object.keys(template).filter(
      (key) => !["description", "difficulty", "tags", "features", "popularity", "color"].includes(key),
    ).length
  }

  const getTemplateMetadata = (templateName: TemplateName) => {
    const template = ProjectTemplates[templateName]
    return {
      description: template.description || "",
      difficulty: template.difficulty || "Beginner",
      tags: template.tags || [],
      features: template.features || [],
      popularity: template.popularity || 4.0,
      color: template.color || "from-gray-500 to-gray-600",
    }
  }

  const getTemplateFiles = (templateName: TemplateName) => {
    const template = ProjectTemplates[templateName]
    const files: Record<string, { code: string }> = {}
    Object.entries(template).forEach(([key, value]) => {
      if (
        !["description", "difficulty", "tags", "features", "popularity", "color"].includes(key)
      ) {
        files[key] = value as { code: string }
      }
    })
    return files
  }

  const handleUseTemplate = async (templateName: TemplateName) => {
    if (!userDetails || !userDetails._id) return
    const files = getTemplateFiles(templateName)
    const workspaceID = await CreateWorkspace({
      user: userDetails._id,
      message: {
        id: Date.now().toString(),
        type: "user",
        content: `[TEMPLATE] ${templateName}`,
        timestamp: Date.now(),
      },
    })
    await UpdateFiles({
      workspaceID,
      files,
    })
    await updateMessages({
      workspaceID,
      message: [
        {
          id: Date.now().toString(),
          type: "assistant",
          content: `You are using the "${templateName}" template. Do you want to edit anything in the template?`,
          timestamp: Date.now(),
        },
      ],
    })
    await updateInfo({
      workspaceID,
      info: {
        title: templateName,
        description: ProjectTemplates[templateName].description || "",
      },
    })
    router.push(`/chat/${workspaceID}?fromTemplate=1&templateName=${encodeURIComponent(templateName)}&tab=code`)
  }

  const filteredTemplates = Object.keys(ProjectTemplates).filter((name) => {
    const templateName = name as TemplateName
    const metadata = getTemplateMetadata(templateName)
    if (filter === "all") return true
    return metadata.difficulty.toLowerCase() === filter
  })

  const handleEyeClick = (templateName: TemplateName) => {
    setSelected(templateName)
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-background">
      <Sidebar historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Project Templates</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Choose from our curated collection of starter templates</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-8">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              All Templates
            </Button>
            <Button
              variant={filter === "beginner" ? "default" : "outline"}
              onClick={() => setFilter("beginner")}
              className="rounded-full"
            >
              Beginner
            </Button>
            <Button
              variant={filter === "intermediate" ? "default" : "outline"}
              onClick={() => setFilter("intermediate")}
              className="rounded-full"
            >
              Intermediate
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredTemplates.map((name) => {
              const templateName = name as TemplateName
              const metadata = getTemplateMetadata(templateName)
              const fileCount = getFileCount(templateName)

              return (
                <Card
                  key={name}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg overflow-hidden ${
                    selected === templateName ? "ring-2 ring-blue-500 shadow-2xl" : ""
                  } bg-white dark:bg-card`}
                  onClick={() => setSelected(templateName)}
                >
                  {/* Gradient Header */}
                  <div className={`h-32 bg-gradient-to-r ${metadata.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-white/90">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{metadata.popularity}</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className={`${getDifficultyColor(metadata.difficulty)} border`}>
                        {metadata.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-2">{metadata.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Code className="w-4 h-4" />
                        <span>{fileCount} files</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {metadata.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {metadata.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{metadata.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">Key Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {metadata.features.slice(0, 2).map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={e => {
                          e.stopPropagation()
                          handleUseTemplate(templateName)
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEyeClick(templateName)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Template Details */}
          {selected && (
            <div ref={detailsRef} className="mt-12 bg-white dark:bg-card rounded-xl shadow-lg border p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selected}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{getTemplateMetadata(selected).description}</p>
                </div>
                <Button onClick={() => setSelected(null)} variant="ghost" size="sm">
                  ✕
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">All Features</h3>
                  <ul className="space-y-2">
                    {getTemplateMetadata(selected).features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-700">
                        <Zap className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {getTemplateMetadata(selected).tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Difficulty level:</span>
                      <Badge className={getDifficultyColor(getTemplateMetadata(selected).difficulty)}>
                        {getTemplateMetadata(selected).difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => handleUseTemplate(selected)}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Start Building with {selected}
                </Button>
                <Button size="lg" variant="outline" onClick={() => {}}>
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Code
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div>Loading templates...</div>}>
      <Templates />
    </Suspense>
  )
}
