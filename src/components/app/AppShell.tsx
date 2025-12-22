"use client";

import { useEffect } from "react";

import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { BottomNav } from "@/components/app/BottomNav";
import { useAppStore } from "@/lib/store/useAppStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const fetchData = useAppStore((state) => state.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-dvh bg-background">
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden bg-white md:block">
          <Sidebar />
        </div>
        <div className="flex flex-col">
          <Topbar />
          <main className="flex flex-1 flex-col gap-4 p-4 pb-24 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
