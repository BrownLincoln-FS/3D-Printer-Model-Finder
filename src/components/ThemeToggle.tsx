"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
  // Run ONCE on mount to check preferences and apply the class.
  useEffect(() => {
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isLocalDark = localStorage.theme === "dark";
    const shouldBeDark = isLocalDark || (!("theme" in localStorage) && isSystemDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle clicks by directly toggling the HTML class and saving to localStorage
  const handleToggle = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");

    if (isCurrentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      className="theme-toggle-btn" 
      aria-label="Toggle Theme"
    >
      {/* Lit Lightbulb (Visible ONLY when the .dark class is active) */}
      <svg className="w-6 h-6 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>

      {/* Unlit Lightbulb Outline (Visible ONLY in Light Mode) */}
      <svg className="w-6 h-6 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </button>
  );
}