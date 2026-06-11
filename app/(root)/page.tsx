"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

import { LandingNavbar } from "@/components/home/LandingNavbar";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Philosophy } from "@/components/home/Philosophy";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Footer } from "@/components/home/Footer";

export default function LandingPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <LandingNavbar />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-[var(--color-bg-page)] transition-colors duration-normal selection:bg-[var(--color-accent)] selection:text-white pb-0">
        <Hero />
        <Features />
        <Philosophy />
        <HowItWorks />
        
        {/* Call to Action */}
        <section
          className={`py-24 transition-colors duration-500 overflow-hidden ${
            mounted && theme === "light"
              ? "bg-[var(--color-text-primary)] text-[var(--color-bg-page)]"
              : "bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)] text-[var(--color-text-primary)]"
          }`}
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[520px] mx-auto text-center px-6"
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl tracking-[-0.025em] leading-[1.1] mb-4">
              Ready to build smarter?
            </h2>
            <p
              className={`font-body text-lg mb-10 max-w-[400px] mx-auto leading-[1.65] ${
                mounted && theme === "light"
                  ? "text-[var(--color-bg-page)] opacity-80"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              Join thousands of developers creating better interfaces with AI
            </p>
            <button
              onClick={() => {
                setIsNavigating(true);
                router.push("/chat");
              }}
              disabled={isNavigating}
              className={`rounded-full px-8 py-4 font-body font-bold text-base transition-[transform,filter,box-shadow] duration-fast ease-soft active:scale-[0.97] flex items-center justify-center gap-3 mx-auto cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                mounted && theme === "light"
                  ? "bg-[var(--color-bg-page)] text-[var(--color-text-primary)] hover:opacity-90 shadow-[0_4px_14px_rgba(255,255,255,0.2)]"
                  : "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 shadow-[0_0_0_1px_var(--color-accent),0_8px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_0_0_1px_var(--color-accent),0_12px_32px_rgba(0,0,0,0.3)]"
              }`}
            >
              <span>{isNavigating ? "Loading..." : "Start Building Free"}</span>
              {isNavigating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        </section>
      </div>
      <Footer />
    </>
  );
}
