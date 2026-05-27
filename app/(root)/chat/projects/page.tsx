"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  ExternalLink,
  ChevronDown,
  X,
  ArrowUpDown,
  FolderOpen,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Id } from "@/convex/_generated/dataModel";
import { ProjectsPageSkeleton } from "@/components/custom/Loaders";
import { iconColors, projectIcons } from "@/data/data";

// ── Deterministic icon/color from project ID ─────────────────────────────────
const getRandomIcon = (id: string) => {
  const hash = id.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash) % projectIcons.length;
};

const getRandomColor = (id: string) => {
  const hash = id.split("").reduce((a, b) => {
    a = (a << 7) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash) % iconColors.length;
};

// ── Accent strip colors for the left edge of each card ───────────────────────
const accentStrips = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-cyan-500",
];

// ── Relative time formatter ──────────────────────────────────────────────────
const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

const Projects = () => {
  const router = useRouter();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [showSearch, setShowSearch] = useState(false);

  const convexUser = useQuery(
    api.users.GetUser,
    user?.id ? { uid: user.id } : "skip"
  );
  const workspaces = useQuery(
    api.workspace.getWorkspacesByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const deleteWorkspace = useMutation(api.workspace.deleteWorkspace);
  const isLoading =
    !user?.id || convexUser === undefined || workspaces === undefined;

  const filteredAndSortedProjects = useMemo(() => {
    if (!workspaces) return [];

    let filtered = workspaces;
    if (searchTerm.trim()) {
      filtered = workspaces.filter(
        (project) =>
          project.info?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.info?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === "latest") {
        return b._creationTime - a._creationTime;
      } else {
        return a._creationTime - b._creationTime;
      }
    });

    return sorted;
  }, [workspaces, searchTerm, sortOrder]);

  const handleProjectClick = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleNewProject = () => {
    router.push("/chat");
  };

  const handleDeleteProject = async (id: Id<"workspaces">) => {
    try {
      await deleteWorkspace({ id });
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSearch(false);
  };

  if (isLoading) {
    return <ProjectsPageSkeleton />;
  }

  return (
    <div className="h-full bg-[var(--color-bg-page)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Projects
            </h1>
            <p className="font-body text-[var(--color-text-secondary)] mt-1.5 text-[15px]">
              {workspaces?.length || 0} project{(workspaces?.length || 0) !== 1 ? "s" : ""} total
              {searchTerm && (
                <span className="text-[var(--color-accent)]">
                  {" "}· {filteredAndSortedProjects.length} matching
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={handleNewProject}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white gap-2 font-medium h-10 px-5 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            {showSearch ? (
              <div className="relative animate-in fade-in slide-in-from-left-4 duration-200">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
                <Input
                  placeholder="Search projects…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-10 bg-[var(--color-bg-surface)] border-[var(--color-border-default)] rounded-xl text-sm font-body"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowSearch(true)}
                className="h-10 px-4 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] gap-2 text-sm"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            )}
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 px-4 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] gap-2 text-sm"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "latest" ? "Newest first" : "Oldest first"}
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] rounded-xl">
              <DropdownMenuItem onClick={() => setSortOrder("latest")} className="rounded-lg">
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")} className="rounded-lg">
                Oldest first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Content ── */}
        {filteredAndSortedProjects.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex items-center justify-center mb-6">
              {searchTerm ? (
                <Search className="w-9 h-9 text-[var(--color-text-tertiary)]" />
              ) : (
                <FolderOpen className="w-9 h-9 text-[var(--color-text-tertiary)]" />
              )}
            </div>
            <h3 className="font-heading text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              {searchTerm ? "No results found" : "No projects yet"}
            </h3>
            <p className="font-body text-[var(--color-text-secondary)] text-center max-w-sm mb-8 text-[15px] leading-relaxed">
              {searchTerm
                ? `Nothing matches "${searchTerm}". Try different keywords.`
                : "Start building something amazing. Your first project is just a click away."}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={clearSearch} className="rounded-xl h-10 px-5 border-[var(--color-border-default)]">
                Clear Search
              </Button>
            ) : (
              <Button
                onClick={handleNewProject}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white gap-2 font-medium h-10 px-6 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          /* ── Projects List ── */
          <div className="flex flex-col gap-3">
            {filteredAndSortedProjects.map((project, index) => {
              const IconComponent = projectIcons[getRandomIcon(project._id)];
              const colorClass = iconColors[getRandomColor(project._id)];
              const stripColor = accentStrips[getRandomColor(project._id)];

              return (
                <div
                  key={project._id}
                  onClick={() => handleProjectClick(project._id)}
                  className="group relative flex items-center gap-5 p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/5 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${Math.min(index * 50, 400)}ms`, animationFillMode: "both" }}
                >
                  {/* Accent strip */}
                  <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${stripColor} opacity-60 group-hover:opacity-100 transition-opacity duration-200`} />

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${colorClass} transition-transform duration-200 group-hover:scale-105`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-[15px] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-light)] transition-colors truncate">
                      {project.info?.title || "Untitled Project"}
                    </h3>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                      {project.info?.description || "No description"}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)] shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-body">
                      {formatTimeAgo(project._creationTime)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectClick(project._id);
                      }}
                      className="h-8 w-8 p-0 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 p-0 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-heading text-[var(--color-text-primary)]">
                            Delete project?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-[var(--color-text-secondary)]">
                            This will permanently delete &ldquo;{project.info?.title || "Untitled"}&rdquo; and all its data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-[var(--color-border-default)]">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProject(project._id)}
                            className="rounded-xl bg-[var(--color-danger)] hover:bg-red-600 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
