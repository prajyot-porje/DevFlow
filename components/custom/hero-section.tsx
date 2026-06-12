import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#09090b]">

      {/* ─── Text block ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 text-center lg:pt-32">

        {/* Announcement pill */}
        <Link
          href="#"
          className="font-body mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs sm:px-4 sm:text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white/80"
        >
          <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
          <span>Now powered by Gemini 2.5 Flash · See what&apos;s new</span>
          <ArrowRight className="h-3 w-3 opacity-50" />
        </Link>

        {/* Headline — two lines, large, bold */}
        <h1 className="font-heading text-balance text-[26px] xs:text-[30px] sm:text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
          Build production-ready
          <br />
          <span className="text-white/60">code with AI</span>
        </h1>

        {/* Subtitle */}
        <p className="font-body mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white/45 md:text-xl">
          Describe what you want to build. DevFlow generates full-stack React projects live.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row w-full justify-center px-4 sm:px-0">
          <Button
            asChild
            size="lg"
            className="font-body h-12 rounded-full bg-white px-8 text-sm font-semibold text-black hover:bg-white/90 focus-visible:ring-white/30 w-full sm:w-auto"
          >
            <Link href="/chat">Start Building Free</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="font-body h-12 rounded-full px-8 text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/80 w-full sm:w-auto"
          >
            <Link href="#how-it-works" className="flex items-center justify-center gap-2">
              <span>See how it works</span>
              <ArrowRight className="h-4 w-4 opacity-60" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Dashboard section with silver glow ─────────────────── */}
      <div className="relative z-10 mt-16">

        {/* Silver glow — centered at the top edge of the dashboard,
            spills upward into the CTA area, matches the silver/monochrome palette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-56 -translate-y-1/2"
        >
          <div className="mx-auto h-full w-full max-w-3xl bg-[radial-gradient(ellipse_70%_100%_at_50%_100%,hsla(240,5%,80%,0.35)_0%,hsla(240,5%,60%,0.15)_50%,transparent_80%)]" />
        </div>

        {/* Tilted 3-D perspective dashboard —
            perspective container → rotateX wrapper → skew container → image
            Bottom and right edges fade via mask-image gradients              */}
        <div className="relative z-10 mx-auto max-w-7xl [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
          <div className="-mr-12 pl-12 [mask-image:linear-gradient(to_right,black_50%,transparent_100%)] [perspective:1200px] md:-mr-16 md:pl-16 lg:-mr-56 lg:pl-56">
            <div className="[transform:rotateX(20deg)]">
              <div className="relative skew-x-[.36rad] h-auto lg:h-[44rem]">

                {/*
                  ↓ REPLACE THIS SRC ↓
                  Take a screenshot of your live workspace at:
                  https://dev-flow-lime.vercel.app/chat
                  Save it to /public/devflow-workspace.png
                  Then change the src to: "/devflow-workspace.png"

                  The dark placeholder below works as-is for layout testing.
                */}
                <img
                  className="relative z-[2] rounded-xl border border-white/[0.12] w-full h-auto object-cover md:w-auto"
                  src="/devflow-workspace.png"
                  alt="DevFlow — AI-powered code generation workspace"
                  width={2880}
                  height={2074}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="sm:h-0 h-30"></div>
    </section>
  )
}
