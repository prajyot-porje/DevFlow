import { ArrowLeft, ChevronDown, FileText, Filter, Loader2, Plus, Search, Sparkles } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";


export function CodeTabSkeleton() {
  return (
    <div className="flex h-[79vh] w-full animate-in fade-in-0 duration-500">
      {/* File Explorer Skeleton */}
      <div className="w-[12vw] border-r bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Code Editor Skeleton */}
      <div className="flex-1 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Generating code...
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Skeleton className="h-4 w-8 flex-shrink-0" />
              <Skeleton
                className="h-4"
                style={{ width: `${Math.random() * 60 + 20}%` }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-6">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            Writing your code...
          </span>
        </div>
      </div>
    </div>
  );
}

export function PreviewTabSkeleton() {
  return (
    <div className="h-[79vh] bg-card border rounded-lg overflow-hidden animate-in fade-in-0 duration-500">
      <div className="h-12 bg-muted border-b flex items-center gap-2 px-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
          <div
            className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-3 h-3 bg-green-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
        <div className="flex-1 mx-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Building preview...
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4 animate-pulse" />
          <Skeleton
            className="h-4 w-1/2 animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 animate-pulse"
                style={{
                  width: `${Math.random() * 40 + 60}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-8 p-6 bg-muted/50 rounded-lg">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            Compiling your application...
          </span>
        </div>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 animate-pulse">
        <Avatar className="w-8 h-8 mt-1">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </Avatar>
        <div className="w-3xl">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      </div>
      <div className="flex gap-4 w-full justify-end animate-pulse">
        <div className="w-3xl order-first">
          <Card className="bg-primary text-primary-foreground ml-auto">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 bg-primary-foreground/20" />
            </CardContent>
          </Card>
          <Skeleton className="h-3 w-16 mt-2 ml-auto" />
        </div>
        <Skeleton className="w-8 h-8 mt-1 rounded-full" />
      </div>
    
      <div className="flex gap-4  animate-pulse">
        <Avatar className="w-8 h-8 mt-1">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </Avatar>
        <div className="w-3xl">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      </div>      
    </div>
  )
}

export function ChatInputSkeleton() {
  return (
    <div className="mt-4 space-y-4 animate-pulse">
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-32 rounded-md" />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Skeleton className="h-[60px] w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function ChatTabSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 pr-4">
        <ChatMessageSkeleton />
      </div>
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <Card className="h-full animate-pulse">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProjectsHeaderSkeleton() {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" disabled>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Latest
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            <Button size="sm" disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <ProjectsHeaderSkeleton />
      <div className="container mx-auto px-6 py-8">
        <ProjectsGridSkeleton />
      </div>
    </div>
  )
}