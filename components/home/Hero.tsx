"use client";

import { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Palette,
  Shield,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

export function Hero() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme !== "light";

  return (
    <section
      className="mt-16 pt-12 pb-16 md:pt-16 md:pb-24 px-4 transition-all duration-normal"
      style={
        isDark
          ? {
              backgroundImage: `
                radial-gradient(ellipse 80% 50% at 0% 0%, rgba(140, 96, 243, 0.05) 0%, transparent 55%),
                radial-gradient(ellipse 50% 40% at 100% 80%, rgba(42, 38, 57, 0.3) 0%, transparent 50%)
              `,
            }
          : undefined
      }
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center"
        >
          <div className="flex flex-col">
            {/* Overline badge */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] mb-[20px] self-start shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="font-body font-semibold text-[13px] tracking-wide text-[var(--color-text-primary)]">
                AI Powered Component Generation
              </span>
            </motion.div>

            {/* H1 headline */}
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              className="font-heading font-bold text-3xl md:text-5xl lg:text-[67px] leading-[1.05] tracking-[-0.04em] mb-5 text-[var(--color-text-primary)]"
            >
              Turn ideas into{" "}
              <span className="block text-[var(--color-accent)] mt-1.5">
                polished interfaces
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              className="font-body font-normal text-lg text-[var(--color-text-secondary)] max-w-[440px] leading-[1.65] mb-8"
            >
              Describe what you want to build and let AI craft
              production-ready components in seconds.
            </motion.p>

            {/* CTA Row */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              className="flex items-center gap-4 mb-10"
            >
              <button
                onClick={() => {
                  setIsNavigating(true);
                  router.push("/chat");
                }}
                disabled={isNavigating}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-accent)] text-white font-body font-semibold text-sm transition-[transform,filter] duration-fast ease-soft hover:brightness-110 active:scale-95 cursor-pointer shadow-[0_0_0_1px_var(--color-accent),0_4px_16px_rgba(140,96,243,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isNavigating ? "Loading..." : "Try it now"}</span>
                {isNavigating ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 transition-transform duration-100 ease-soft group-hover:translate-x-1" />
                )}
              </button>
              <a
                href="#how-it-works"
                className="font-body font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline transition-colors duration-fast ease-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                See how it works
              </a>
            </motion.div>

            {/* Feature pills row */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              className="mt-12 flex gap-8 flex-wrap"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body font-semibold text-sm text-[var(--color-text-primary)]">
                    Lightning Fast
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Seconds, not hours
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body font-semibold text-sm text-[var(--color-text-primary)]">
                    Production Ready
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Deployable code
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body font-semibold text-sm text-[var(--color-text-primary)]">
                    Customizable
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Style it your way
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column: Live Preview Card */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.95, rotate: -2 },
              visible: { opacity: 1, scale: 1, rotate: -1, transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.3 } }
            }}
            whileHover={{ rotate: 0, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="hidden lg:block origin-center"
          >
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[24px] p-5 shadow-[0_8px_16px_rgba(14,12,21,0.6),0_4px_8px_rgba(14,12,21,0.4)] group">
              <CardHeader className="p-0 pb-4">
                <div className="w-full flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-[var(--color-text-primary)]">Live Preview</CardTitle>
                  <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>AI • production-ready</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-44 bg-linear-to-br from-base-100 to-base-200 dark:from-surface-900 dark:to-surface-950 rounded-md flex items-center justify-center mb-4 p-3 border border-foreground/5">
                  <div className="w-full h-full rounded-md bg-background/90 dark:bg-background/80 border border-foreground/5 p-3 flex flex-col shadow-inner group-hover:bg-background transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                          Compact Header
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          Short subtitle
                        </div>
                      </div>
                      <div className="ml-auto text-[10px] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full font-mono">
                        v1.2
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-between mt-3">
                      <div className="flex-1 pr-3">
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">
                          Project Title
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                          A concise description of this component preview.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] uppercase font-bold tracking-wider">
                          Ready
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-3 pt-2 border-t border-foreground/5">
                      <span className="px-2 py-0.5 bg-muted/50 rounded text-[10px]">
                        #ui
                      </span>
                      <span className="px-2 py-0.5 bg-muted/50 rounded text-[10px]">
                        #components
                      </span>
                      <span className="ml-auto text-[10px]">Light / Dark</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <div className="text-xs font-mono bg-[var(--color-bg-elevated)] border border-foreground/5 rounded px-2 py-0.5 hover:bg-muted transition-colors">
                    Button
                  </div>
                  <div className="text-xs font-mono bg-[var(--color-bg-elevated)] border border-foreground/5 rounded px-2 py-0.5 hover:bg-muted transition-colors">
                    Card
                  </div>
                  <div className="text-xs font-mono bg-[var(--color-bg-elevated)] border border-foreground/5 rounded px-2 py-0.5 hover:bg-muted transition-colors">
                    Form
                  </div>
                </div>

                <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Generate components, then copy or export them instantly.
                  Fully typed, styled, and responsive.
                </div>
              </CardContent>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
