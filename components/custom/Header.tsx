"use client"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Bell, Moon, Search, Sun, Zap, Menu, Clock } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { usePathname, useRouter } from "next/navigation"
import { ProjectTemplates } from "@/data/projectTemplates"
import SpotlightSearch from "./SpotlightSearch"

const Header = ({ showHistoryButton = false, onToggleHistory }: { showHistoryButton?: boolean, onToggleHistory?: () => void }) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [randomTemplates, setRandomTemplates] = useState<{ name: string; description: string }[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  let title = "Dashboard"
  if (pathname === "/chat") title = "Generate"
  else if (pathname.startsWith("/chat/projects")) title = "Projects"
  else if (pathname.startsWith("/chat/templates")) title = "Templates"
  else if (pathname.startsWith("/chat/settings")) title = "Settings"
  else if (pathname.startsWith("/chat/")) title = "Chat"

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
      <header className="sticky top-0 z-50 h-[52px] border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] flex items-center justify-between px-6 gap-3 shrink-0">
        <span className="sr-only">{title}</span>
        {/* Left Group */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger Menu (Mobile Only) */}
          <button
            onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors duration-fast ease-soft cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* DevFlow Icon & Brand name */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/logo-new.png"
              alt="DevFlow Logo"
              className="w-5 h-5 object-contain shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] dark:drop-shadow-none dark:invert"
            />
            <span className="font-logo font-semibold text-base tracking-normal">
              <span className="text-[var(--color-text-primary)]">DevFlow</span>
            </span>
            <span className="text-[var(--color-text-tertiary)] hidden sm:inline">/</span>
            <span className="font-body text-sm font-medium text-[var(--color-text-secondary)] hidden sm:inline truncate max-w-[200px]">
              {title}
            </span>
          </div>

        </div>

        {/* Right Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Button (Desktop) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center justify-between gap-2 w-48 md:w-60 h-9 px-3.5 rounded-xl bg-[var(--color-bg-elevated)]/50 border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-default)] font-body text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
              <span className="truncate text-left text-[13px]">Search...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center h-5 px-1.5 bg-[var(--color-bg-inset)]/50 border border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-tertiary)] font-mono font-medium rounded-md tracking-widest shrink-0 select-none shadow-xs">
              {mounted && typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || "") ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>

          {/* Search Button (Mobile) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors duration-fast ease-soft cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* History Button (if enabled) */}
          {showHistoryButton && onToggleHistory && (
            <button
              onClick={onToggleHistory}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors duration-fast ease-soft cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              title="Toggle Recent Projects"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors duration-fast ease-soft cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            title="Toggle Theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* Notification Bell Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-transparent hover:bg-[var(--color-bg-elevated)] flex items-center justify-center relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-fast ease-soft cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
                <Bell className="w-[18px] h-[18px]" />

              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[12px] shadow-lg p-1">
              <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
                <h4 className="font-heading font-semibold text-sm text-[var(--color-text-primary)]">Recommended Templates</h4>
                <p className="font-body text-xs text-[var(--color-text-secondary)]">Discover new templates to boost your productivity</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {randomTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.name}
                    onClick={() => router.push(`/chat/templates?template=${encodeURIComponent(template.name)}`)}
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[var(--color-bg-hover)] rounded-md transition-colors"
                  >
                    <div className="shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-[var(--color-accent)]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] leading-none">{template.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{template.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className="bg-[var(--color-border-subtle)]" />
              <DropdownMenuItem
                className="text-center py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer rounded-md"
                onClick={() => router.push("/chat/templates")}
              >
                View all templates
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Button / Avatar */}
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border-default)] hover:border-[var(--color-accent)] transition-colors duration-100 overflow-hidden shrink-0 flex items-center justify-center">
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            </SignedIn>
          </div>
        </div>
      </header>

      <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header
