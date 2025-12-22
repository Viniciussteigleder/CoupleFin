import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-5 pb-24 pt-6 md:px-10 md:pb-10 md:pt-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
