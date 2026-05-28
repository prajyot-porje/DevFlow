"use client";

import { SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Page() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme !== "light";

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)] px-4"
      style={
        isDark
          ? {
              backgroundImage: `
                radial-gradient(ellipse 80% 50% at 0% 0%, rgba(140, 96, 243, 0.05) 0%, transparent 55%),
                radial-gradient(ellipse 50% 40% at 100% 80%, rgba(42, 38, 57, 0.3) 0%, transparent 50%),
                url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.75' fill='%238e8a9c' fill-opacity='0.06'/%3E%3C/svg%3E")
              `,
            }
          : undefined
      }
    >
      <ClerkLoading>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          <p className="text-sm text-[var(--color-text-secondary)] font-body">Loading Clerk Secure Auth...</p>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp
          appearance={{
            variables: {
              colorBackground: 'var(--color-bg-surface)',
              colorInputBackground: 'var(--color-bg-elevated)',
              colorText: 'var(--color-text-primary)',
              colorTextSecondary: 'var(--color-text-secondary)',
              colorInputText: 'var(--color-text-primary)',
              colorPrimary: 'var(--color-accent)',
              colorDanger: 'var(--color-danger)',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
            },
            elements: {
              card: 'bg-transparent border border-[var(--color-border-default)] rounded-xl shadow-xl p-10',
              headerTitle: 'font-heading font-semibold text-xl tracking-tight',
              headerSubtitle: 'font-body text-sm text-[var(--color-text-secondary)]',
              socialButtonsBlockButton: 
                'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] rounded-md font-body font-medium text-sm transition-colors duration-100',
              formFieldInput:
                'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] focus:border-[var(--color-accent)] rounded-md font-body text-base px-4 py-3 focus:shadow-[0_0_0_1px_var(--color-accent),0_4px_16px_rgba(140,96,243,0.2)]',
              formButtonPrimary:
                'bg-[var(--color-accent)] hover:brightness-110 font-body font-semibold text-sm rounded-md py-3 tracking-wide transition-all duration-100',
              footerActionLink: 'text-[var(--color-accent)] hover:text-[var(--color-accent-light)]',
              dividerLine: 'bg-[var(--color-border-subtle)]',
              dividerText: 'font-body text-xs text-[var(--color-text-tertiary)]',
              footer: 'opacity-30 text-xs',
            }
          }}
        />
      </ClerkLoaded>
    </div>
  );
}

