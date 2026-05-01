"use client";

import dynamic from "next/dynamic";

// Import the actual dashboard content with SSR disabled
const DashboardContent = dynamic(
  () => import("@/app/dashboard/DashboardContent"),
  { ssr: false, loading: () => <DashboardSkeleton /> }
);

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-900 border border-surface-800 rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-surface-800 rounded w-24 mb-3" />
            <div className="h-8 bg-surface-800 rounded w-32 mb-2" />
            <div className="h-3 bg-surface-800 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-900 border border-surface-800 rounded-2xl p-5 animate-pulse">
          <div className="h-5 bg-surface-800 rounded w-32 mb-1" />
          <div className="h-3 bg-surface-800 rounded w-20 mb-4" />
          <div className="h-72 bg-surface-800 rounded" />
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 animate-pulse">
          <div className="h-5 bg-surface-800 rounded w-32 mb-1" />
          <div className="h-3 bg-surface-800 rounded w-40 mb-4" />
          <div className="h-44 bg-surface-800 rounded" />
        </div>
      </div>
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 animate-pulse">
        <div className="h-5 bg-surface-800 rounded w-40 mb-1" />
        <div className="h-3 bg-surface-800 rounded w-24 mb-4" />
        <div className="h-64 bg-surface-800 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}