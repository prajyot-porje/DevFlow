"use client";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Zap,
  MessageSquare,
  MoreHorizontal
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.GetUser,
    user?.id ? { uid: user.id } : "skip"
  );
  const workspaces = useQuery(
    api.workspace.getWorkspacesByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Collapse by default on mobile, and listen for custom header toggles
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    const handleToggle = () => setSidebarOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  const isChatDetail = /^\/chat\/[^/]+$/.test(pathname) && ![
    "/chat/projects",
    "/chat/templates",
    "/chat/settings"
  ].includes(pathname);

  const sidebarItems = [
    { icon: Zap, label: "Generate", route: "/chat", active: pathname === "/chat" || isChatDetail },
    { icon: Layers, label: "Projects", route: "/chat/projects", active: pathname === "/chat/projects" },
    { icon: Palette, label: "Templates", route: "/chat/templates", active: pathname === "/chat/templates" },
    { icon: Settings, label: "Settings", route: "/chat/settings", active: pathname === "/chat/settings" },
  ];

  const recentProjects = workspaces
    ? [...workspaces].sort((a, b) => b._creationTime - a._creationTime).slice(0, 3)
    : [];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col ${
          sidebarOpen ? "translate-x-0 w-[240px]" : "-translate-x-full md:translate-x-0 w-[60px]"
        } transition-all duration-300 ease-in-out h-full border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] backdrop-blur-md overflow-y-auto overflow-x-hidden shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-4 py-5 shrink-0 h-[72px]">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[var(--color-accent)] to-violet-600 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(140,96,243,0.3)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-300 min-w-0">
              <span className="font-logo font-semibold text-base leading-tight tracking-normal truncate">
                <span className="text-[var(--color-text-primary)]">Dev </span>
                <span className="text-[var(--color-accent)]">Flow</span>
              </span>
              <span className="font-body text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Code Studio
              </span>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="px-3 pb-4 shrink-0">
          <button
            className={`flex items-center border transition-all duration-200 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
              sidebarOpen
                ? "w-full py-2 px-3 rounded-xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] gap-2 group shadow-sm"
                : "w-9 h-9 mx-auto rounded-xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] group shadow-sm flex items-center justify-center"
            }`}
            onClick={() => {
              router.push("/chat");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          >
            <Plus className="w-4 h-4 text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
            {sidebarOpen && (
              <span className="font-body font-medium text-[13px] text-[var(--color-text-primary)] animate-in fade-in duration-300">
                New Chat
              </span>
            )}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col px-2 gap-1 shrink-0 mb-6">
          {sidebarItems.map((item, index) => {
            const active = item.active;
            
            return (
              <button
                key={index}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center transition-all duration-200 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] group ${
                  sidebarOpen
                    ? `py-2 px-3 rounded-lg gap-3 ${
                        active
                          ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-medium"
                          : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                      }`
                    : `mx-auto w-9 h-9 items-center justify-center rounded-lg ${
                        active
                          ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                          : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                      }`
                }`}
                onClick={() => {
                  if (item.route) {
                    router.push(item.route);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }
                }}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                    active
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)]"
                  }`}
                />
                {sidebarOpen && (
                  <span className="font-body text-[13px] animate-in fade-in duration-300 truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Recent Projects */}
        {sidebarOpen && workspaces !== undefined && (
          <div className="px-3 py-4 mt-auto animate-in fade-in duration-500 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Recent Projects
              </span>
            </div>
            {recentProjects.length > 0 ? (
              <div className="flex flex-col gap-1">
                {recentProjects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => {
                      router.push(`/chat/${project._id}`);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[var(--color-bg-elevated)] text-left group transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] shrink-0 transition-colors" />
                    <span className="font-body text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate transition-colors">
                      {project.info?.title || "Untitled Project"}
                    </span>
                  </button>
                ))}
                {workspaces && workspaces.length > 3 && (
                  <button
                    onClick={() => {
                      router.push("/chat/projects");
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[var(--color-bg-elevated)] text-left group transition-colors mt-1"
                  >
                    <MoreHorizontal className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] shrink-0 transition-colors" />
                    <span className="font-body text-sm text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                      View all projects
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="px-3 py-4 rounded-xl bg-[var(--color-bg-elevated)]/30 border border-dashed border-[var(--color-border-subtle)] text-center">
                <Sparkles className="w-4 h-4 text-[var(--color-text-tertiary)] mx-auto mb-1.5" />
                <p className="text-[11px] font-body font-medium text-[var(--color-text-secondary)]">No projects yet</p>
                <button
                  onClick={() => router.push("/chat")}
                  className="text-[10px] font-body text-[var(--color-accent)] hover:text-[var(--color-accent-light)] hover:underline mt-1.5 font-bold cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          className="absolute top-6 -right-3.5 w-7 h-7 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] z-50 transition-all duration-200 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] hidden md:flex"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </>
  );
};

export default Sidebar;
