"use client";

import { useState, useRef, useEffect } from "react";

export function Header() {
  const [isDark, setIsDark] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Sync state with DOM on mount
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

  const toggleNotif = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") setNotifOpen(false); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const notifications = [
    { id: 1, text: "Welcome to DataLens! Upload your first CSV to get started.", time: "Just now" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-surface-800 px-6 py-4 flex items-center gap-4 bg-surface-950/80 backdrop-blur-xl">
      <div className="flex-1" />

      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-lg hover:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-surface-50 transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle theme"
      >
        {isDark ? (
          /* Sun icon — shown when in dark mode (click to go light) */
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          /* Moon icon — shown when in light mode (click to go dark) */
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="relative" ref={notifRef}>
        <button
          onClick={toggleNotif}
          className="w-9 h-9 rounded-lg hover:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-surface-50 transition-colors relative"
          aria-label="Notifications"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-accent text-[10px] text-white font-bold flex items-center justify-center leading-none px-1">
            {notifications.length}
          </span>
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-surface-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-surface-50">Notifications</span>
              <button onClick={() => setNotifOpen(false)} className="text-xs text-accent hover:text-accent-light transition-colors">Close</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-surface-800/50 hover:bg-surface-800/50 transition-colors cursor-pointer">
                  <p className="text-sm text-surface-300 leading-relaxed">{n.text}</p>
                  <p className="text-xs text-surface-500 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}