"use client"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { Avatar } from "@radix-ui/react-avatar"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Bell, Moon, Search, Sun, Zap, Sparkles } from "lucide-react"
import { Badge } from "../ui/badge"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { ProjectTemplates } from "@/data/projectTemplates"
import SpotlightSearch from "./SpotlightSearch"

const Header = ({ title }: { title: string }) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [randomTemplates, setRandomTemplates] = useState<{ name: string; description: string }[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const keys = Object.keys(ProjectTemplates)
    if (keys.length > 1) {
      const shuffled = keys.sort(() => 0.5 - Math.random())
      setRandomTemplates(
        shuffled.slice(0, 2).map((name) => ({
          name,
          description: ProjectTemplates[name as keyof typeof ProjectTemplates].description || "",
        })),
      )
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <header className="h-16 border-b bg-background/40 backdrop-blur-xl border-foreground/10 flex items-center justify-between px-6 md:px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 bg-linear-to-br from-slate-900 to-slate-700 dark:from-blue-400 dark:to-cyan-400 rounded-md flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white dark:text-slate-900" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline text-foreground">DevFlow</span>
          </div>
          {/* Title - with better spacing */}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-foreground/10 min-w-0">
            <h2 className="font-semibold text-sm text-foreground truncate">{title}</h2>
            <Badge variant="secondary" className="animate-pulse shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5" />
              Online
            </Badge>
          </div>
          <div className="md:hidden">
            <h2 className="font-semibold text-sm text-foreground truncate">{title}</h2>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline text-xs">Search</span>
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden"
          >
            <Search className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {randomTemplates.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-3 border-b">
                <h4 className="font-semibold text-sm">Recommended Templates</h4>
                <p className="text-xs text-muted-foreground">Discover new templates to boost your productivity</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {randomTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.name}
                    onClick={() => router.push(`/chat/templates?template=${encodeURIComponent(template.name)}`)}
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50"
                  >
                    <div className="shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{template.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-center py-2 text-sm text-muted-foreground cursor-pointer"
                onClick={() => router.push("/chat/templates")}
              >
                View all templates
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-foreground/10 hidden sm:block" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Avatar className="w-8 h-8">
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Avatar>
        </div>
      </header>

      <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header
