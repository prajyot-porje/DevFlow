"use client"

import { useState, useEffect, Suspense } from "react"
import { UserProfile } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  User,
  Bot,
  Palette,
  Shield,
  Moon,
  Sun,
  Monitor,
  Check,
  Sparkles,
  Zap,
  MessageSquare,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { SettingsPageSkeleton } from "@/components/custom/Loaders"

// ── Model options ────────────────────────────────────────────────────────────
const MODEL_OPTIONS = [
  {
    label: "Auto Router",
    provider: "OpenRouter",
    value: "openrouter/free",
    description: "Automatically routes to the best available free model",
    badge: "Recommended",
    icon: Sparkles,
  },
  {
    label: "Qwen 2.5 72B",
    provider: "Qwen",
    value: "qwen/qwen-2.5-72b-instruct:free",
    description: "Strong coding and instruction-following",
    badge: "Free",
    icon: Zap,
  },
  {
    label: "Llama 3.3 70B",
    provider: "Meta",
    value: "meta-llama/llama-3.3-70b-instruct:free",
    description: "Large model, excellent for general instructions",
    badge: "Free",
    icon: Zap,
  },
  {
    label: "Gemma 4 31B",
    provider: "Google",
    value: "google/gemma-4-31b-it:free",
    description: "High-performance instruction-tuned model",
    badge: "Free",
    icon: Zap,
  },
  {
    label: "GLM 4.5 Air",
    provider: "Z-AI",
    value: "z-ai/glm-4.5-air:free",
    description: "Extremely fast, high-quality free model",
    badge: "Free",
    icon: Zap,
  },
  {
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    value: "openai/gpt-oss-120b:free",
    description: "Very large open weights model",
    badge: "Free",
    icon: Zap,
  },
  {
    label: "Gemma 4 26B A4B",
    provider: "Google",
    value: "google/gemma-4-26b-a4b-it:free",
    description: "Instruction-tuned 26B model",
    badge: "Free",
    icon: Zap,
  },
]

const THEME_OPTIONS = [
  {
    label: "Light",
    value: "light",
    icon: Sun,
    description: "Clean and bright",
    preview: "bg-[#FAF8F2]",
    previewAccent: "bg-[#1E293B]",
  },
  {
    label: "Dark",
    value: "dark",
    icon: Moon,
    description: "Easy on the eyes",
    preview: "bg-[#0A0F1A]",
    previewAccent: "bg-[#0EA5E9]",
  },
  {
    label: "System",
    value: "system",
    icon: Monitor,
    description: "Match your device",
    preview: "bg-gradient-to-r from-[#FAF8F2] to-[#0A0F1A]",
    previewAccent: "bg-[#0EA5E9]",
  },
]

// ── Navigation tabs ──────────────────────────────────────────────────────────
const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "project", label: "Preferences", icon: Bot },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

const Settings = () => {
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].value)
  const [activeTab, setActiveTab] = useState("account")
  const { theme, setTheme } = useTheme()
  const { user } = useUser()
  const usage = useQuery(api.users.getUserConversationUsage, user ? { uid: user.id } : "skip")

  useEffect(() => {
    const storedModel = localStorage.getItem("ai-model")
    if (storedModel && MODEL_OPTIONS.some((opt) => opt.value === storedModel)) {
      setSelectedModel(storedModel)
    }
  }, [])

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    localStorage.setItem("ai-model", value)
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  // Usage calculations
  const usagePercent = usage ? Math.round((usage.conversationCount / usage.limit) * 100) : 0
  const usageColor = usagePercent >= 100 ? "bg-[var(--color-danger)]" : usagePercent >= 75 ? "bg-amber-500" : "bg-[var(--color-success)]"
  const usageTextColor = usagePercent >= 100 ? "text-[var(--color-danger)]" : usagePercent >= 75 ? "text-amber-500" : "text-[var(--color-success)]"

  return (
    <div className="h-full bg-[var(--color-bg-page)] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Settings
          </h1>
          <p className="font-body text-[var(--color-text-secondary)] mt-1.5 text-[15px]">
            Manage your account and project preferences
          </p>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 mb-8 p-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ═══ Account Tab ═══ */}
        {activeTab === "account" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold text-[var(--color-text-primary)]">Account Management</h2>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)]">Manage your account, security, and billing</p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex justify-center">
                <UserProfile routing="hash" />
              </div>
            </div>
          </div>
        )}

        {/* ═══ Preferences Tab ═══ */}
        {activeTab === "project" && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* ── AI Model Selector ── */}
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold text-[var(--color-text-primary)]">AI Model</h2>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)]">Choose the AI model for code generation</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODEL_OPTIONS.map((model) => {
                    const isSelected = selectedModel === model.value
                    return (
                      <button
                        key={model.value}
                        onClick={() => handleModelChange(model.value)}
                        className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5 ring-1 ring-[var(--color-accent)]/20"
                            : "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/50 hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)]"
                        }`}
                      >
                        {/* Selection indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                          isSelected
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                            : "border-[var(--color-border-strong)]"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-heading font-semibold text-[14px] text-[var(--color-text-primary)]">{model.label}</span>
                            {model.badge === "Recommended" && (
                              <Badge className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20 text-[10px] px-1.5 py-0">
                                ★
                              </Badge>
                            )}
                          </div>
                          <span className="font-body text-[12px] text-[var(--color-text-tertiary)]">{model.provider}</span>
                          <p className="font-body text-[12px] text-[var(--color-text-secondary)] mt-1 line-clamp-1">{model.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Usage Meter ── */}
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold text-[var(--color-text-primary)]">Daily Usage</h2>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)]">Track your daily message limit</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {usage ? (
                  <div>
                    {/* Stats row */}
                    <div className="flex items-baseline justify-between mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className={`font-heading text-3xl font-bold ${usageTextColor}`}>
                          {usage.conversationCount}
                        </span>
                        <span className="font-body text-[var(--color-text-tertiary)] text-sm">
                          / {usage.limit}
                        </span>
                      </div>
                      <span className="font-body text-[13px] text-[var(--color-text-secondary)]">
                        {usage.limit - usage.conversationCount} remaining
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${usageColor} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>

                    {usagePercent >= 100 && (
                      <p className="font-body text-[13px] text-[var(--color-danger)] mt-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] animate-pulse" />
                        Daily limit reached. Resets at midnight.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)] animate-spin" />
                    <span className="font-body text-[13px] text-[var(--color-text-secondary)]">Loading usage data…</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Appearance ── */}
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold text-[var(--color-text-primary)]">Appearance</h2>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)]">Customize the look and feel</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Label className="font-heading text-sm font-medium text-[var(--color-text-primary)] mb-4 block">
                  Theme
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = theme === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5 ring-1 ring-[var(--color-accent)]/20"
                            : "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/50 hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)]"
                        }`}
                      >
                        {/* Theme preview swatch */}
                        <div className={`w-full h-10 rounded-lg ${option.preview} border border-[var(--color-border-subtle)] overflow-hidden relative`}>
                          <div className={`absolute bottom-1 left-1 w-4 h-1.5 rounded-sm ${option.previewAccent}`} />
                          <div className={`absolute bottom-1 left-6 w-6 h-1.5 rounded-sm ${option.previewAccent} opacity-30`} />
                        </div>
                        <div className="text-center">
                          <Icon className={`w-4 h-4 mx-auto mb-1 ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}`} />
                          <span className={`font-heading text-[13px] font-medium ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"}`}>
                            {option.label}
                          </span>
                          <p className="font-body text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{option.description}</p>
                        </div>

                        {/* Check badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Privacy & Security ── */}
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold text-[var(--color-text-primary)]">Privacy & Security</h2>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)]">How your data is protected</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                    <span className="font-heading text-sm font-medium text-[var(--color-text-primary)]">Data Protection</span>
                  </div>
                  <div className="space-y-2 font-body text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    <p>• Projects and conversations are encrypted and stored securely</p>
                    <p>• Personal information is never shared with third parties</p>
                    <p>• AI processing follows privacy-first principles</p>
                    <p>• Full ownership of your code and projects</p>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                    <span className="font-heading text-sm font-medium text-[var(--color-text-primary)]">Security Features</span>
                  </div>
                  <div className="space-y-2 font-body text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    <p>• End-to-end encryption for all data transmission</p>
                    <p>• Regular security audits and compliance checks</p>
                    <p>• Secure authentication through Clerk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <Settings />
    </Suspense>
  )
}
