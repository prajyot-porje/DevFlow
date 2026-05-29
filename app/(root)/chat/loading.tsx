import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function ChatLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-bg-page)] animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center max-w-sm px-8 py-10 rounded-2xl bg-[var(--color-bg-surface)]/40 border border-[var(--color-border-subtle)] backdrop-blur-md shadow-xl text-center">
        {/* Glow effect */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-[var(--color-accent)] opacity-10 rounded-full blur-2xl animate-pulse" />
        
        {/* Pulsing Logo Container */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(140,96,243,0.25)] mb-6 animate-bounce">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        {/* Loading text with a subtle spinner */}
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
          <h3 className="font-heading text-[16px] font-bold text-[var(--color-text-primary)]">
            Loading DevFlow...
          </h3>
        </div>
        
        <p className="font-body text-[13px] text-[var(--color-text-secondary)] leading-relaxed max-w-[200px]">
          Getting your workspace ready. Just a moment...
        </p>

        {/* Premium Bouncing dots */}
        <div className="flex gap-1.5 mt-5 justify-center">
          <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}
