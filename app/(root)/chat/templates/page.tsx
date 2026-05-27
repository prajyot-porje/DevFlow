"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, Star, Download, Eye, Zap, X, ChevronRight, FileCode, Layers } from "lucide-react"
import { ProjectTemplates } from "@/data/projectTemplates"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { GetUserDetails } from "@/hooks/GetUserDetails"
import { TemplatesPageSkeleton } from "@/components/custom/Loaders"

type TemplateName = keyof typeof ProjectTemplates

// ── Category icon mapping ────────────────────────────────────────────────────
const categoryGradients: Record<string, string> = {
  Beginner: "from-emerald-500/80 to-teal-600/80",
  Intermediate: "from-amber-500/80 to-orange-600/80",
  Advanced: "from-rose-500/80 to-pink-600/80",
}

const Templates = () => {
  const [selected, setSelected] = useState<TemplateName | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const detailsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace)
  const UpdateFiles = useMutation(api.workspace.UpdateFiles)
  const updateMessages = useMutation(api.workspace.UpdateMessages)
  const updateInfo = useMutation(api.workspace.Updateinfo)
  const userDetails = GetUserDetails()

  useEffect(() => {
    const templateFromQuery = searchParams.get("template")
    if (
      templateFromQuery &&
      (Object.keys(ProjectTemplates) as string[]).includes(templateFromQuery)
    ) {
      setSelected(templateFromQuery as TemplateName)
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 200)
    }
  }, [searchParams])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "Intermediate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Advanced":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]"
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
      message: [
        {
          id: Date.now().toString(),
          type: "user",
          content: `[TEMPLATE] ${templateName}`,
          timestamp: Date.now(),
        },
      ],
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

  const filterOptions = [
    { label: "All", value: "all", count: Object.keys(ProjectTemplates).length },
    { label: "Beginner", value: "beginner", count: Object.keys(ProjectTemplates).filter(n => (ProjectTemplates[n as TemplateName].difficulty || "Beginner") === "Beginner").length },
    { label: "Intermediate", value: "intermediate", count: Object.keys(ProjectTemplates).filter(n => (ProjectTemplates[n as TemplateName].difficulty || "Beginner") === "Intermediate").length },
  ]

  return (
    <div className="h-full bg-[var(--color-bg-page)] text-[var(--color-text-primary)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Templates
          </h1>
          <p className="font-body text-[var(--color-text-secondary)] mt-1.5 text-[15px]">
            Kickstart your project with a pre-built starter template
          </p>
        </div>

        {/* ── Filter Pills ── */}
        <div className="flex gap-2 mb-8">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`h-9 px-4 rounded-xl text-sm font-medium font-body transition-all duration-200 flex items-center gap-2 ${
                filter === opt.value
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {opt.label}
              <span className={`text-xs ${filter === opt.value ? "text-white/70" : "text-[var(--color-text-tertiary)]"}`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Templates Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTemplates.map((name, index) => {
            const templateName = name as TemplateName
            const metadata = getTemplateMetadata(templateName)
            const fileCount = getFileCount(templateName)
            const gradientClass = categoryGradients[metadata.difficulty] || "from-gray-500/80 to-gray-600/80"

            return (
              <div
                key={name}
                className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-3 ${
                  selected === templateName
                    ? "border-[var(--color-accent)]/50 shadow-lg shadow-[var(--color-accent)]/5 ring-1 ring-[var(--color-accent)]/20"
                    : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:shadow-xl hover:shadow-black/5"
                } bg-[var(--color-bg-surface)] hover:-translate-y-0.5`}
                style={{ animationDelay: `${Math.min(index * 60, 360)}ms`, animationFillMode: "both" }}
                onClick={() => handleEyeClick(templateName)}
              >
                {/* Gradient Header */}
                <div className={`h-28 bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
                  {/* Pattern overlay */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)"
                  }} />
                  {/* Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1">
                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span className="text-xs font-medium text-white/90">{metadata.popularity}</span>
                  </div>
                  {/* Difficulty badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge className={`${getDifficultyColor(metadata.difficulty)} border text-[11px] font-medium`}>
                      {metadata.difficulty}
                    </Badge>
                  </div>
                  {/* File count */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/60">
                    <FileCode className="w-3 h-3" />
                    <span className="text-[11px] font-medium">{fileCount} files</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                  <h3 className="font-heading font-semibold text-[16px] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-light)] transition-colors mb-1.5">
                    {name}
                  </h3>
                  <p className="font-body text-[13px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed mb-4">
                    {metadata.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {metadata.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium font-body px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
                      >
                        {tag}
                      </span>
                    ))}
                    {metadata.tags.length > 4 && (
                      <span className="text-[11px] font-medium font-body px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
                        +{metadata.tags.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Features (compact) */}
                  <div className="space-y-1.5 mb-5">
                    {metadata.features.slice(0, 2).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-[13px] font-body text-[var(--color-text-secondary)]">
                        <Zap className="w-3 h-3 text-[var(--color-success)] shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-5 pb-5">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-9 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white text-[13px] font-medium gap-2 transition-all duration-200"
                      onClick={e => {
                        e.stopPropagation()
                        handleUseTemplate(templateName)
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEyeClick(templateName)
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Selected Template Details Panel ── */}
        {selected && (
          <div
            ref={detailsRef}
            className="mt-10 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">{selected}</h2>
                  <p className="font-body text-[13px] text-[var(--color-text-secondary)] mt-0.5">{getTemplateMetadata(selected).description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="px-8 py-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Features */}
                <div>
                  <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--color-accent)]" />
                    Features
                  </h3>
                  <div className="space-y-2.5">
                    {getTemplateMetadata(selected).features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-[14px] font-body text-[var(--color-text-secondary)]">
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--color-success)] mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies + Metadata */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                      <Code className="w-4 h-4 text-[var(--color-accent)]" />
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {getTemplateMetadata(selected).tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[13px] font-medium font-body px-3 py-1 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats card */}
                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-body text-[var(--color-text-secondary)]">Difficulty</span>
                      <Badge className={`${getDifficultyColor(getTemplateMetadata(selected).difficulty)} border text-xs`}>
                        {getTemplateMetadata(selected).difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
                      <span className="font-body text-[var(--color-text-secondary)]">Files included</span>
                      <span className="font-mono text-[13px] text-[var(--color-text-primary)]">{getFileCount(selected)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
                      <span className="font-body text-[var(--color-text-secondary)]">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-mono text-[13px] text-[var(--color-text-primary)]">{getTemplateMetadata(selected).popularity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
                <Button
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white gap-2 font-medium h-11 px-6 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                  onClick={() => handleUseTemplate(selected)}
                >
                  <Download className="w-4 h-4" />
                  Start Building with {selected}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<TemplatesPageSkeleton />}>
      <Templates />
    </Suspense>
  )
}
