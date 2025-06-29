"use client"

import { useState, useEffect } from "react"
import { UserProfile } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Bot, Palette, Shield, SettingsIcon, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs"; // To get current user

const MODEL_OPTIONS = [
  {
    label: "Gemini 2.5 Flash Preview",
    value: "gemini-2.5-flash-preview-04-17",
    description: "Latest preview with enhanced capabilities",
    badge: "Preview",
  },
  {
    label: "Gemini 2.5 Flash",
    value: "gemini-2.5-flash",
    description: "Fast and efficient for most tasks",
    badge: "Stable",
  },
]

const THEME_OPTIONS = [
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
  { label: "System", value: "system", icon: Monitor },
]

const Settings = () => {
  const router = useRouter()
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].value)
  const {theme, setTheme} = useTheme();
  const { user } = useUser();
  const usage = useQuery(api.users.getUserConversationUsage, user ? { uid: user.id } : "skip");

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

  const handleBack = () => {
    router.push('/chat')
  }

  const selectedModelInfo = MODEL_OPTIONS.find((opt) => opt.value === selectedModel)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <SettingsIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account and project preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-1/2 grid-cols-2">
            <TabsTrigger value="account" className="gap-2">
              <User className="w-4 h-4" />
              Account Settings
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Project Settings
            </TabsTrigger>
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account information, security, and billing settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg flex justify-center items-center   p-1">
                  <UserProfile routing="hash" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Settings Tab */}
          <TabsContent value="project" className="space-y-6">
            {/* AI Preferences */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>AI Preferences</CardTitle>
                    <CardDescription>Configure AI model and behavior settings for your projects</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-3">
                  <Label htmlFor="ai-model" className="text-sm font-medium">
                    AI Model
                  </Label>
                  <Select value={selectedModel} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-full p-8 ">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="p-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span>{option.label}</span>
                                <Badge
                                  variant={option.badge === "Preview" ? "secondary" : "outline"}
                                  className="text-xs"
                                >
                                  {option.badge}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedModelInfo && (
                    <p className="text-xs text-muted-foreground">{selectedModelInfo.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversation Limit */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Daily Message Limit</CardTitle>
                    <CardDescription>
                      Track your daily usage and remaining messages.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usage ? (
                  <div>
                    <p>
                      <span className="font-semibold">{usage.conversationCount}</span> / {usage.limit} messages used today
                    </p>
                    {usage.conversationCount >= usage.limit ? (
                      <p className="text-red-500 text-xs mt-2">You have reached your daily limit.</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">
                        {usage.limit - usage.conversationCount} messages remaining today.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Loading usage...</p>
                )}
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of your workspace</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {THEME_OPTIONS.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <Button
                          key={option.value}
                          variant={theme === option.value ? "default" : "outline"}
                          className="h-auto p-4 flex flex-col gap-2"
                          onClick={() => handleThemeChange(option.value)}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-xs">{option.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose how the interface appears. System will match your device&aposs theme. 
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Your data protection and security information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Data Protection</span>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Your projects and conversations are encrypted and stored securely</p>
                    <p>• We never share your personal information with third parties</p>
                    <p>• All AI processing is done with privacy-first principles</p>
                    <p>• You maintain full ownership of your code and projects</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Security Features</span>
                  </div>
                  <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                    <p>• End-to-end encryption for all data transmission</p>
                    <p>• Regular security audits and compliance checks</p>
                    <p>• Secure authentication through Clerk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Settings
