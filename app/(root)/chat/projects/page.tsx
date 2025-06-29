"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hours ago`;
  if (minutes > 0) return `${minutes} minutes ago`;
  return "Just now";
};

const Projects = () => {
  const router = useRouter();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [showSearch, setShowSearch] = useState(false);

  const convexUser = useQuery(
    api.users.getUserByUid,
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

  const handleBack = () => {
    router.back();
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-9 w-9 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">My Projects</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredAndSortedProjects.length} of{" "}
                  {workspaces?.length || 0} projects
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showSearch ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10 w-64"
                      autoFocus
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {sortOrder === "latest" ? "Latest" : "Oldest"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("latest")}>
                    Latest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleNewProject} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {filteredAndSortedProjects.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              {searchTerm ? (
                <Search className="w-12 h-12 text-muted-foreground" />
              ) : (
                <Briefcase className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchTerm
                ? `No projects match "${searchTerm}". Try adjusting your search terms.`
                : "Get started by creating your first project. You can build anything from web apps to AI assistants."}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
            ) : (
              <Button onClick={handleNewProject} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          // Projects Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProjects.map((project) => {
              const IconComponent = projectIcons[getRandomIcon(project._id)];
              const colorClass = iconColors[getRandomColor(project._id)];

              return (
                <Card
                  key={project._id}
                  className="hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 group h-full"
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${colorClass} group-hover:scale-105 transition-transform duration-200`}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 transition-opacity text-red-400 bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your project and remove its
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project._id)}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {project.info?.title || "Untitled Project"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                        {project.info?.description ||
                          "No description available for this project."}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(project._creationTime)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProjectClick(project._id)}
                        className="h-8 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
