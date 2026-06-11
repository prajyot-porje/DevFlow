import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] pt-16 pb-8 transition-colors duration-normal">
      <div className="container mx-auto px-6 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12 border-b border-[var(--color-border-subtle)] pb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80 mb-4"
            >
              <img
                src="/logo.png"
                alt="DevFlow Logo"
                className="w-8 h-8 object-cover rounded-lg shadow-sm grayscale contrast-125 dark:invert"
              />
              <span className="font-logo font-semibold text-[22px] tracking-normal">
                <span className="text-[var(--color-text-primary)]">DevFlow</span>
              </span>
            </Link>
            <p className="font-body text-sm text-[var(--color-text-secondary)] leading-[1.6] max-w-[300px] mb-6">
              AI-powered UI component generator. Turn your ideas into production-ready interfaces in seconds.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/devflow" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors duration-200">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://github.com/prajyot-porje/DevFlow" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-colors duration-200">
                <Github className="w-4 h-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] tracking-wide mb-4">Product</h4>
            <ul className="flex flex-col gap-3 font-body text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link href="#features" className="hover:text-[var(--color-accent)] transition-colors">Features</Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-[var(--color-accent)] transition-colors">How it Works</Link>
              </li>
              <li>
                <Link href="#philosophy" className="hover:text-[var(--color-accent)] transition-colors">Philosophy</Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-[var(--color-accent)] transition-colors">Try App</Link>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] tracking-wide mb-4">Legal</h4>
            <ul className="flex flex-col gap-3 font-body text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-body text-sm text-[var(--color-text-tertiary)]">
          <div>&copy; {currentYear} DevFlow. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span>Crafted with</span>
            <span className="text-[var(--color-accent)]">♥</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
