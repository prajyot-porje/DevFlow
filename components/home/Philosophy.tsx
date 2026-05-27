import { motion } from "motion/react";

const pillars = [
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
];

export function Philosophy() {
  return (
    <section id="philosophy" className="py-16 md:py-24 px-6 transition-all duration-normal overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Top Part - Left Aligned */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-left"
        >
          {/* Overline badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-border-default)] mb-5">
            <span className="font-body font-medium text-xs tracking-widest text-[var(--color-accent-light)] uppercase">
              Our Philosophy
            </span>
          </div>

          {/* H2 Headline */}
          <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-[-0.03em] leading-[1.08] text-[var(--color-text-primary)] max-w-[700px] mb-5">
            Design at the speed of thought
          </h2>

          {/* Body Paragraph */}
          <p className="font-body font-normal text-lg text-[var(--color-text-secondary)] leading-[1.65] max-w-[600px]">
            We believe the best interfaces come from removing friction
            between imagination and creation. By combining the precision of
            code with the fluidity of natural language, we help you focus on
            what matters: building things that work beautifully.
          </p>
        </motion.div>

        {/* Principle Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
              className="relative pt-5 mt-0"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.15 }}
                className="absolute top-0 left-0 h-[1px] w-full bg-[var(--color-border-strong)] origin-left"
              />
              <h3 className="font-heading font-semibold text-base text-[var(--color-text-primary)] mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="font-body font-normal text-sm text-[var(--color-text-secondary)] leading-[1.6]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

