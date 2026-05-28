import { Sparkles, Zap, Shield, Palette } from "lucide-react";
import { motion } from "motion/react";

const secondaryFeatures = [
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
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 px-6 transition-all duration-normal overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Heading Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="font-body font-medium text-xs tracking-widest uppercase text-[var(--color-text-tertiary)] mb-3">
            EVERYTHING YOU NEED
          </div>
          <h2 className="font-heading font-semibold text-2xl md:text-3xl lg:text-4xl tracking-[-0.025em] leading-[1.1] text-[var(--color-text-primary)] mb-4">
            Powerful tools for modern creators
          </h2>
          <p className="font-body text-lg text-[var(--color-text-secondary)] max-w-[520px] mx-auto leading-[1.65]">
            Built for designers and developers who care about quality and
            efficiency
          </p>
        </motion.div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4 items-stretch">
          {/* LEFT — Large feature card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[16px] p-8 shadow-[0_4px_8px_rgba(14,12,21,0.5),0_2px_4px_rgba(14,12,21,0.3)] hover:border-[var(--color-border-strong)] hover:shadow-[0_8px_16px_rgba(14,12,21,0.6),0_4px_8px_rgba(14,12,21,0.4)] transition-[border-color,box-shadow] duration-200 ease-soft"
          >
            <div className="w-10 h-10 bg-[var(--color-bg-elevated)] rounded-xl flex items-center justify-center mb-6 border border-[var(--color-border-default)]">
              <Sparkles className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <h3 className="font-heading font-semibold text-xl tracking-tight text-[var(--color-text-primary)] mb-2">
              Instant Generation
            </h3>
            <p className="font-body text-base text-[var(--color-text-secondary)] leading-[1.65] mb-6">
              Write what you want. Watch AI transform your ideas into
              clean, production-ready code.
            </p>
            <div className="bg-[var(--color-code-bg)] border border-[var(--color-border-subtle)] rounded-[8px] px-4 py-3 font-mono text-sm text-[var(--color-code-text)]">
              <span className="text-[var(--color-text-primary)]">
                const component = ai.build
              </span>
              (your description)
            </div>
          </motion.div>

          {/* RIGHT — Stack of 3 small feature cards */}
          <div className="flex flex-col gap-3">
            {secondaryFeatures.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 + index * 0.1 }}
                className="flex flex-row gap-4 p-5 rounded-[12px] border border-[var(--color-border-subtle)] bg-transparent hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-border-default)] transition-all duration-200 ease-soft items-start"
              >
                <div className="w-9 h-9 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-full flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-base text-[var(--color-text-primary)] mb-1">
                    {item.title}
                  </h4>
                  <p className="font-body text-sm text-[var(--color-text-secondary)] leading-[1.6]">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

