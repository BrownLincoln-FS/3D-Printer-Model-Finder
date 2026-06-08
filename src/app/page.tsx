"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="page-wrapper">
      <ThemeToggle />
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo">
            {/* 3D Box SVG Icon */}
            <svg className="logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Model Finder
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="status-badge">
          <span className="ping-dot"></span>
          Database Online
        </div>

        <h1 className="hero-title">
          Find your next <br className="desktop-break" />
          <span className="text-highlight">perfect print.</span>
        </h1>
        
        <p className="hero-subtitle">
          A centralized, decoupled search engine for high-quality 3D printing models. 
          Authenticate to access the database and export directly to your slicer.
        </p>

        <div className="auth-card">
          {/* Conditional Rendering */}
          {session ? (
            <div className="auth-user-info">
              <p className="auth-user-text">
                Logged in as {session.user?.name}
              </p>
              <button 
                onClick={() => signOut()}
                className="btn-signout"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => signIn("google")}
                className="btn-google"
              >
                {/* Google SVG */}
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
              <p className="auth-disclaimer">
                Secure OAuth 2.0 authentication required for database access.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}