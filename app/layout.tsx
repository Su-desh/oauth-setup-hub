import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OAuth Setup Hub — Composio",
  description:
    "Clear, agent-researched OAuth setup guides for AI agent builders using Composio. Know the timeline, requirements, and blockers before you start.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-gray-900">
                OAuth Setup Hub
              </span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                by Composio
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Library
              </Link>
              <Link
                href="/generate"
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-white hover:bg-violet-700 transition-colors"
              >
                Generate Guide →
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
          <p>
            OAuth Setup Hub — Built for{" "}
            <a
              href="https://composio.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-600 hover:underline"
            >
              Composio
            </a>{" "}
            developers. Guides are agent-researched; always verify with official docs.
          </p>
        </footer>
      </body>
    </html>
  );
}
