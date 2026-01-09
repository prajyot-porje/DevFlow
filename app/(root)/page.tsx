"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Code,
  Palette,
  Download,
  Shield,
  ArrowRight,
  Zap,
  Lightbulb,
  Code2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {}, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[min(95%,1100px)] px-6 md:px-10 lg:px-12 py-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-foreground/10 shadow-lg">
          <div className="flex items-center justify-between gap-8 w-full">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-linear-to-br from-slate-900 to-slate-700 dark:from-blue-400 dark:to-cyan-400 rounded-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white dark:text-slate-900" />
              </div>
              <span className="font-bold text-lg tracking-tight">DevFlow</span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </a>
            </div>

            <div className="flex items-center gap-3 pl-8 border-l border-foreground/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full w-9 h-9 p-0"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/chat")}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                Start Building
              </Button>
            </div>
          </div>
        </nav>

        <section className="pt-40 pb-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              } grid lg:grid-cols-2 gap-8 items-center`}
            >
              <div>
                <h1 className="text-5xl md:text-7xl lg:text-7xl font-bold text-balance mb-6 leading-[1.05]">
                  Turn ideas into
                  <span className="block bg-linear-to-r from-slate-600 to-slate-400 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
                    polished interfaces
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-6 leading-relaxed">
                  Describe what you want to build and let AI craft
                  production-ready components in seconds.
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/chat")}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-background font-medium text-base transition-all duration-300 hover:shadow-lg hover:shadow-foreground/20 active:scale-95"
                  >
                    <span>Try it now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-foreground/5">
                    <Zap className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-semibold">
                        Lightning Fast
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Seconds, not hours
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-foreground/5">
                    <Shield className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-semibold">
                        Production Ready
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deployable code
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-foreground/5">
                    <Palette className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-semibold">Customizable</div>
                      <div className="text-xs text-muted-foreground">
                        Style it your way
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-foreground/5 sm:hidden">
                    <Code2 className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-semibold">
                        Developer Focused
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Built for real workflows
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <Card className="p-6 border-2 border-foreground/10 shadow-lg">
                  <CardHeader>
                    <div className="w-full flex items-center justify-between">
                      <CardTitle className="text-lg">Live Preview</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        AI • production-ready
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-44 bg-linear-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-md flex items-center justify-center mb-4 p-3">
                      <div className="w-full h-full rounded-md bg-background/80 border border-foreground/5 p-3 flex flex-col">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              Compact Header
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Short subtitle
                            </div>
                          </div>
                          <div className="ml-auto text-xs text-muted-foreground">
                            v1
                          </div>
                        </div>

                        <div className="flex-1 flex items-center justify-between mt-3">
                          <div className="flex-1 pr-3">
                            <div className="text-sm font-medium">
                              Project Title
                            </div>
                            <div className="text-xs text-muted-foreground">
                              A concise description of this component preview.
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="px-2 py-1 rounded-md bg-foreground text-background text-xs">
                              Edit
                            </button>
                            <button className="px-2 py-1 rounded-md border border-foreground/5 text-xs">
                              View
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                          <span className="px-2 py-1 bg-muted/30 rounded">
                            #ui
                          </span>
                          <span className="px-2 py-1 bg-muted/30 rounded">
                            #components
                          </span>
                          <span className="ml-auto">Light / Dark</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1">
                        Button
                      </div>
                      <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1">
                        Card
                      </div>
                      <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1">
                        Form
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Generate components, then copy or export them instantly.
                      Fully typed and styled.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-32 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4">
                Everything you need
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Built for designers and developers who care about quality and
                efficiency
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Featured card */}
              <div className="md:col-span-1">
                <Card className="h-full relative overflow-hidden border-2 border-foreground/20">
                  <CardHeader>
                    <div className="w-14 h-14 bg-foreground/10 rounded-xl flex items-center justify-center mb-6">
                      <Sparkles className="w-7 h-7 text-foreground" />
                    </div>
                    <CardTitle className="text-2xl">
                      Instant Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Write what you want. Watch AI transform your ideas into
                      clean, production-ready code.
                    </p>
                    <div className="bg-muted rounded-lg p-4 text-xs font-mono text-foreground/60 border border-foreground/5">
                      <span className="text-foreground">
                        const component = ai.build
                      </span>
                      (your description)
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary features */}
              <div className="space-y-6">
                {[
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    desc: "Seconds, not hours. See results instantly.",
                  },
                  {
                    icon: Shield,
                    title: "Production Ready",
                    desc: "Clean code you can trust and deploy.",
                  },
                  {
                    icon: Palette,
                    title: "Fully Customizable",
                    desc: "Adapt designs to your exact needs.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-foreground/10 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-base">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="philosophy" className="py-32 px-4 bg-muted/20">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/10 text-foreground text-sm font-medium mb-6">
                <Lightbulb className="w-4 h-4" />
                Our Philosophy
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
                Design at the speed of thought
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                We believe the best interfaces come from removing friction
                between imagination and creation. By combining the precision of
                code with the fluidity of natural language, we help you focus on
                what matters: building things that work beautifully.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Clarity First",
                  description:
                    "Clean, understandable code. No bloat, no confusion. Every line serves a purpose.",
                },
                {
                  title: "Intent Over Process",
                  description:
                    "Tell us what you want. Stop wrestling with tools. Let technology handle the how.",
                },
                {
                  title: "Quality Always",
                  description:
                    "Production-ready code from day one. No shortcuts, no technical debt by default.",
                },
              ].map((item, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-32 px-4 bg-background">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
                How it works
              </h2>
              <p className="text-lg text-muted-foreground">
                Three simple steps to beautiful results
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Describe Your Idea",
                  description:
                    "Tell our AI what you want to build in natural language. Be as specific or creative as you'd like.",
                  icon: Sparkles,
                },
                {
                  step: "02",
                  title: "AI Generates Code",
                  description:
                    "Watch as your idea transforms into beautiful, functional, production-ready code in seconds.",
                  icon: Code,
                },
                {
                  step: "03",
                  title: "Use & Iterate",
                  description:
                    "Download, deploy, or customize further. Iterate instantly with natural language feedback.",
                  icon: Download,
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 shrink-0">
                      <item.icon className="w-6 h-6 text-foreground" />
                    </div>
                    {index < 2 && <div className="w-0.5 h-24 bg-muted" />}
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-semibold text-muted-foreground mb-1">
                      Step {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
              Ready to build smarter?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of developers creating better interfaces with AI
            </p>
            <button
              onClick={() => router.push("/chat")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-background font-medium text-base transition-all duration-300 hover:shadow-lg hover:shadow-foreground/20 active:scale-95"
            >
              <span>Start Building Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
