"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { motion } from "motion/react";

export function LandingNavbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Solidify navbar background and scroll spy ──────────────────────────
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = ["features", "philosophy", "how-it-works"];
      let current = "";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // sync on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close mobile menu on click outside the nav ──────────────────────────
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // ── Lock body scroll when mobile menu is open ───────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      {/* ── Backdrop overlay (mobile menu open) ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--color-bg-page)]/80 backdrop-blur-md border-b border-[var(--color-border-subtle)] py-3 shadow-[0_4px_24px_rgba(14,12,21,0.05)]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto max-w-[1200px] px-6">
          <div className="flex items-center justify-between relative">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => router.push("/")}
            >
              <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-violet-700 dark:from-violet-400 dark:to-violet-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-[0_0_12px_rgba(140,96,243,0.3)] transition-all duration-300">
                <Sparkles className="w-4 h-4 text-white dark:text-surface-950" />
              </div>
              <span className="font-logo font-semibold text-[22px] tracking-normal">
                <span className="text-[var(--color-text-primary)]">Dev </span>
                <span className="text-[var(--color-accent)]">Flow</span>
              </span>
            </div>

            {/* Desktop Navigation links */}
            <div className="hidden lg:flex items-center gap-8 font-body text-sm font-medium absolute left-1/2 -translate-x-1/2">
              <a
                href="#features"
                className={`transition-colors duration-200 relative ${activeSection === "features" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
              >
                Features
                {activeSection === "features" && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
                )}
              </a>
              <a
                href="#philosophy"
                className={`transition-colors duration-200 relative ${activeSection === "philosophy" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
              >
                Philosophy
                {activeSection === "philosophy" && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
                )}
              </a>
              <a
                href="#how-it-works"
                className={`transition-colors duration-200 relative ${activeSection === "how-it-works" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
              >
                How it works
                {activeSection === "how-it-works" && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
                )}
              </a>
            </div>

            {/* Right side actions */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all duration-200"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {mounted && theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-5 py-2 rounded-full font-body font-semibold text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200 cursor-pointer">
                    Log In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-5 py-2 rounded-full font-body font-semibold text-sm bg-[var(--color-text-primary)] text-[var(--color-bg-page)] hover:opacity-90 transition-opacity duration-200 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <button
                  onClick={() => {
                    setIsNavigating(true);
                    router.push("/chat");
                  }}
                  disabled={isNavigating}
                  className="px-5 py-2 rounded-full font-body font-semibold text-sm bg-[var(--color-accent)] text-white hover:brightness-110 shadow-[0_0_0_1px_var(--color-accent),0_4px_16px_rgba(140,96,243,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isNavigating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Dashboard
                </button>
                <div className="ml-2 flex items-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>

            {/* Mobile menu toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)]"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              <button
                className="text-[var(--color-text-secondary)] p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[var(--color-bg-page)] border-b border-[var(--color-border-subtle)] shadow-lg px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <a
              href="#features"
              onClick={closeMobileMenu}
              className="text-[var(--color-text-primary)] font-medium py-2 border-b border-[var(--color-border-subtle)]"
            >
              Features
            </a>
            <a
              href="#philosophy"
              onClick={closeMobileMenu}
              className="text-[var(--color-text-primary)] font-medium py-2 border-b border-[var(--color-border-subtle)]"
            >
              Philosophy
            </a>
            <a
              href="#how-it-works"
              onClick={closeMobileMenu}
              className="text-[var(--color-text-primary)] font-medium py-2 border-b border-[var(--color-border-subtle)]"
            >
              How it works
            </a>
            <div className="mt-2 flex flex-col gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full py-3 rounded-full font-body font-semibold text-sm border border-[var(--color-border-default)] text-[var(--color-text-primary)] cursor-pointer">
                    Log In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full py-3 rounded-full font-body font-bold text-sm bg-[var(--color-text-primary)] text-[var(--color-bg-page)] cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => {
                    setIsNavigating(true);
                    closeMobileMenu();
                    router.push("/chat");
                  }}
                  disabled={isNavigating}
                  className="w-full py-3 rounded-full font-body font-bold text-sm bg-[var(--color-accent)] text-white cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isNavigating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Dashboard
                </button>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
