"use client";

import { useLoadingStore } from "@/store/loadingStore";

export default function GlobalLoader() {
  const { isLoading, text } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-surface-800 bg-surface-900 px-10 py-8 shadow-2xl">
        
        {/* Spinner */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-4 border-surface-700"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-accent"></div>
        </div>

        {/* Text */}
        <p className="text-sm font-medium text-surface-200 animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}