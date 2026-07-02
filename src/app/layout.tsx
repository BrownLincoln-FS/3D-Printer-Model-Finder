import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { PlayerProvider } from "@/contexts/PlayerContext";
import GlobalPlayer from "@/components/GlobalPlayer";
import Navbar from "@/components/Navbar";

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

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <PlayerProvider>
              
            <div className="page-wrapper">
                <ThemeToggle />
                <Navbar />
                {children}
            </div>
            
            <GlobalPlayer />

          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}