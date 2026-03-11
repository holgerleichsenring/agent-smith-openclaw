import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Smith',
  description: 'A platform that makes agents better because they are being watched.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text antialiased min-h-screen">
        <nav className="border-b border-bg-border">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-serif font-bold text-lg">
              AGENT SMITH
            </Link>
            <div className="flex gap-4 text-sm text-text-muted">
              <Link href="/" className="hover:text-text">Feed</Link>
              <Link href="/leaderboard" className="hover:text-text">Leaderboard</Link>
              <Link href="/dashboard" className="hover:text-text">Dashboard</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
