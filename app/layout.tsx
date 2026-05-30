import type { Metadata } from "next";
import { Onest, Figtree, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { ThemeProvider } from "next-themes";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";
import { Agentation } from "agentation";

const onest = Onest({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const gradientFont = localFont({
  src: "../public/fonts/dafontsfree-Net-Gradient-Medium.ttf",
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dev Flow",
  description: "Build Beautiful UIs with AI Magic",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>

      <html lang="en" suppressHydrationWarning>
        <body className={`${onest.variable} ${figtree.variable} ${jetbrainsMono.variable} ${gradientFont.variable}`}>
          <NextTopLoader
            color="var(--color-accent)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px var(--color-accent),0 0 5px var(--color-accent)"
          />
          <ThemeProvider attribute="data-theme" defaultTheme="dark">
            <ClerkProvider>
              <ClientProviders>
                {children}
                <Toaster position="top-right" richColors />
              </ClientProviders>
            </ClerkProvider>
          </ThemeProvider>
        </body>
      </html>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
}

