import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { PlayerProvider } from "@/contexts/PlayerContext";
import GlobalPlayer from "@/components/GlobalPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AudioStream | Next-Gen Music Player",
  description: "Your personal music library with AI-generated lyrics.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <PlayerProvider>
              
            {/* THE WRAPPER: This holds the persistent Aurora animations */}
            <div className="page-wrapper">
              <ThemeToggle />
              
              <nav className="main-nav">
                  <div className="nav-container">
                      <div className="logo">
                          <Link href="/" className="logo-link">
                              <svg className="logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        d="M9 19V6l12 -3v13M9 19c-1.105 0 -2 .895 -2 2s.895 2 2 2 2 .895 2 2-.895 2 -2 2zm12 -3c-1.105 0 -2 .895 -2 2s.895 2 2 2 2 .895 2 2-.895 2 -2 2zM5 10h4" 
                                    />
                                </svg>
                              AudioStream
                          </Link>
                      </div>

                      {/* Dynamic Navigation: Only visible when signed in */}
                      {session && (
                          <>
                              <div className="nav-links">
                                  <Link href="/search" className="nav-link">Discover</Link>
                                  <Link href="/library" className="nav-link">My Library</Link>
                              </div>
                              <div className="user-controls">
                                  <SignOutButton />
                              </div>
                          </>
                      )}
                  </div>
              </nav>

              {/* Page specific content injects here */}
              {children}
              
            </div>
            
            {/* The global audio player sits entirely outside the page wrapper */}
            <GlobalPlayer />

          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}