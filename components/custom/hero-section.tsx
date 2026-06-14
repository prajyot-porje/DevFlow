'use client'

import * as React from "react"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LaserFlow } from "@/components/custom/LaserFlow"

export const HeroSection = () => {
  const dashboardRef = useRef<HTMLImageElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [beamOffsets, setBeamOffsets] = React.useState({ x: 0.18, y: 0.04 })

  React.useEffect(() => {
    const sync = () => {
      const section = sectionRef.current
      const dash = dashboardRef.current
      if (!section || !dash) return

      const heroRect = section.getBoundingClientRect()
      const dashRect = dash.getBoundingClientRect()

      const landY = dashRect.top - heroRect.top
      const heroHeight = heroRect.height || 1

      // Calculate vertical offset fraction relative to center
      const yFraction = (heroHeight - landY) / heroHeight
      const verticalBeamOffset = yFraction - 0.5

      // Check if mobile view (width < 768)
      const isMobile = window.innerWidth < 768
      const horizontalBeamOffset = isMobile ? 0.30 : 0.18

      setBeamOffsets({ x: horizontalBeamOffset, y: verticalBeamOffset })
    }

    sync()

    // Create ResizeObserver to monitor hero size changes
    const ro = new ResizeObserver(sync)
    if (sectionRef.current) {
      ro.observe(sectionRef.current)
    }

    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync)
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ background: '#080808' }}>

      {/* ─── Volumetric silver beam — z-index 2 ──────────────────── */}
      <LaserFlow
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        horizontalBeamOffset={beamOffsets.x}
        verticalBeamOffset={beamOffsets.y}
        horizontalSizing={0.9}
        verticalSizing={2.4}
        fogIntensity={0.65}
        wispDensity={1.5}
        wispIntensity={6.0}
        color="#E8F1FF"
      />

      {/* ─── All hero content — z-index 10 ───────────────────────── */}
      <div className="relative" style={{ zIndex: 10 }}>

        {/* ─── Text block ─────────────────────────────────────────── */}
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start px-6 pt-24 text-left lg:pt-32">

          {/* Announcement pill */}
          <Link
            href="#"
            className="font-body mb-8 hidden sm:inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs sm:px-4 sm:text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white/80"
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <span>Now powered by Gemini 2.5 Flash · See what&apos;s new</span>
            <ArrowRight className="h-3 w-3 opacity-50" />
          </Link>

          {/* Headline — two lines, large, bold */}
          <h1 className="font-heading text-balance text-[26px] xs:text-[30px] sm:text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl max-w-[80%] sm:max-w-none">
            Build production-ready
            <br />
            <span className="text-white/60">code with AI</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body mt-6 max-w-[80%] sm:max-w-xl text-base sm:text-lg leading-relaxed text-white/45 md:text-xl">
            Describe what you want to build. DevFlow generates full-stack React projects live.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-start sm:items-center gap-3 sm:flex-row w-full justify-start">
            <Button
              asChild
              size="lg"
              className="font-body h-12 rounded-full bg-white px-8 text-sm font-semibold text-black hover:bg-white/90 focus-visible:ring-white/30 w-fit sm:w-auto"
            >
              <Link href="/chat">Start Building Free</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="font-body h-12 rounded-full px-8 text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/80 w-fit sm:w-auto"
            >
              <Link href="#how-it-works" className="flex items-center justify-center gap-2">
                <span>See how it works</span>
                <ArrowRight className="h-4 w-4 opacity-60" />
              </Link>
            </Button>
          </div>
        </div>

        {/* ─── Dashboard section ──────────────────────────────────── */}
        <div className="relative mt-16">

          {/* Tilted 3-D perspective dashboard —
              perspective container → rotateX wrapper → skew container → image
              Bottom and right edges fade via mask-image gradients              */}
          <div className="relative z-10 mx-auto max-w-7xl [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
            <div className="-mr-12 pl-12 [mask-image:linear-gradient(to_right,black_50%,transparent_100%)] [perspective:1200px] md:-mr-16 md:pl-16 lg:-mr-56 lg:pl-56">
              <div className="[transform:rotateX(20deg)]">
                <div className="relative skew-x-[.36rad] h-auto lg:h-[44rem]">
                  <img
                    ref={dashboardRef}
                    className="relative z-[2] rounded-xl border border-white/[0.12] w-full h-auto object-cover md:w-auto bg-[#09090b]"
                    src="/workspace.png"
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
      </div>
    </section>
  )
}
