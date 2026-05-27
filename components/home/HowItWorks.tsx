import { Sparkles, Code, Download } from "lucide-react";
import { motion } from "motion/react";

const steps = [
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
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-6 bg-transparent transition-all duration-normal overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-semibold text-2xl md:text-3xl lg:text-4xl tracking-[-0.025em] leading-[1.1] text-[var(--color-text-primary)] mb-3">
            How it works
          </h2>
          <p className="font-body text-lg text-[var(--color-text-secondary)]">
            Three simple steps to beautiful results
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="max-w-[640px] mx-auto flex flex-col">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.2 }}
              className={`relative flex flex-row gap-6 ${
                index < steps.length - 1 ? "pb-12" : ""
              }`}
            >
              {/* LEFT SIDE — Step indicator column */}
              <div className="flex flex-col items-center shrink-0">
                <span className="font-mono font-medium text-xs text-[var(--color-text-tertiary)] mb-2">
                  Step {item.step}
                </span>
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300, delay: index * 0.2 + 0.2 }}
                  className="w-10 h-10 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-full flex items-center justify-center shrink-0 shadow-sm"
                >
                  <item.icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.4, ease: "linear", delay: index * 0.2 + 0.4 }}
                    className="w-px bg-[var(--color-border-subtle)] mt-2 flex-grow origin-top"
                  />
                )}
              </div>

              {/* RIGHT SIDE — Content */}
              <div className="pt-6">
                <h3 className="font-heading font-semibold text-xl tracking-tight text-[var(--color-text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-base text-[var(--color-text-secondary)] leading-[1.65] max-w-[480px]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

