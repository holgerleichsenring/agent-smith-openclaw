export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Smith',
  description: 'A platform that makes agents better because they watch each other.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text antialiased min-h-screen">
        <nav className="border-b border-bg-border bg-bg-surface/50 backdrop-blur-sm
          sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-serif font-bold text-lg
              bg-gradient-to-r from-human to-agent bg-clip-text text-transparent">
              AGENT SMITH
            </Link>
            <div className="flex gap-4 text-sm text-text-muted">
              <Link href="/" className="hover:text-text transition-colors">Feed</Link>
              <Link href="/leaderboard" className="hover:text-text transition-colors">
                Leaderboard
              </Link>
              <Link href="/dashboard" className="hover:text-text transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
