"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);

  // Sync with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("datalens-theme");
    const dark = saved !== "light";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nowDark = !isDark;
    setIsDark(nowDark);
    if (nowDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("datalens-theme", nowDark ? "dark" : "light");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute w-[700px] h-[700px] rounded-full bg-accent opacity-[0.07] blur-[140px] -top-[200px] -left-[100px] animate-pulse" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500 opacity-[0.05] blur-[140px] -bottom-[150px] -right-[100px]" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-amber-500 opacity-[0.04] blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <span className="text-xl font-bold">DataLens</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-surface-400">
          <a href="/#features" className="hover:text-surface-50 transition-colors">Features</a>
          <Link href="/docs" className="hover:text-surface-50 transition-colors">Docs</Link>
          {/* Theme toggle — visible to everyone */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg hover:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-surface-50 transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-surface-300 hover:text-surface-50 transition-colors">Sign In</Link>
          <Link href="/signup" className="px-5 py-2 text-sm bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors">Get Started</Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-5xl mx-auto text-center px-6 pt-20 pb-28">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-surface-700 bg-surface-900/50 text-sm text-surface-300 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Now with AI-powered insights
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
          Transform Raw Data
          <br />
          Into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-300 to-teal-400">
            Clear Decisions
          </span>
        </h1>
        <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your datasets, visualize patterns through interactive dashboards,
          and let AI uncover the insights your team needs — all in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-semibold text-base transition-colors shadow-lg shadow-accent/20">
            Start NOW
          </Link>
          
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to understand your data</h2>
          <p className="text-surface-400 text-lg max-w-xl mx-auto">No PhD required. Upload, explore, and get AI-powered answers in plain language.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: "M3 10h18M3 14h18M3 6h18M3 18h18", title: "Smart Upload", desc: "Drop any CSV file. Auto-detects column types, cleans data, and generates statistics instantly." },
            { icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 001-1v-1a2 2 0 10-4 0v-1a1 1 0 00-1-1h-3a1 1 0 00-1-1v-1a2 2 0 10-4 0z", title: "Interactive Charts", desc: "Bar, line, area, pie charts that respond to your filters. No configuration needed." },
            { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "AI Insights", desc: "AI analyzes your data and explains trends, anomalies, and opportunities in plain English." },
            { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", title: "Secure by Default", desc: "Your data is isolated per user. Encrypted storage, JWT auth, and rate-limited access." },
            { icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z", title: "Dark Mode", desc: "Work comfortably at any hour with a carefully crafted dark interface." },
            { icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", title: "Blazing Fast", desc: "Client-side parsing, lazy-loaded charts, and debounced filters keep everything snappy." },
          ].map((f) => (
            <div key={f.title} className="bg-surface-900/50 backdrop-blur-sm border border-surface-800 rounded-2xl p-6 hover:border-accent/20 transition-all hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-surface-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-surface-500">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <span className="font-medium text-surface-400">DataLens</span>
          </Link>
          <p>Built for teams that take data seriously.</p>
        </div>
      </footer>
    </div>
  );
}