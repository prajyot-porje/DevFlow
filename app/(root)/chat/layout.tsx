"use client";

import React from "react";
import Sidebar from "@/components/custom/Sidebar";
import Header from "@/components/custom/Header";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* We can pass onToggleHistory here if needed for mobile, but for now Header manages its own or uses global state */}
        <Header />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
