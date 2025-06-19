import { FileText, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";


// Code Tab Skeleton Loader Component
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

        {/* Code lines skeleton */}
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

        {/* Animated typing indicator */}
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

// Preview Tab Skeleton Loader Component
export function PreviewTabSkeleton() {
  return (
    <div className="h-[79vh] bg-card border rounded-lg overflow-hidden animate-in fade-in-0 duration-500">
      {/* Browser-like header */}
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

      {/* Preview content skeleton */}
      <div className="p-6 space-y-6">
        {/* Header section */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4 animate-pulse" />
          <Skeleton
            className="h-4 w-1/2 animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
        </div>

        {/* Content blocks */}
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

        {/* Bottom section */}
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

        {/* Animated building indicator */}
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