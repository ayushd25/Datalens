"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, initialized, fetchMe } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!initialized && !hasFetched.current) {
      hasFetched.current = true;
      fetchMe();
    }
  }, [initialized, fetchMe]);

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="flex min-h-screen">
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-surface-900 border-r border-surface-800 p-6 hidden md:block">
          <Skeleton width="140px" height="24px" className="mb-8" />
          <div className="space-y-2">
            {[160, 120, 130, 110, 100].map((w, i) => (
              <Skeleton key={i} width={`${w}px`} height="40px" />
            ))}
          </div>
        </div>
        <div className="flex-1 md:ml-64 bg-surface-950 min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 bg-surface-950 min-h-screen">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}