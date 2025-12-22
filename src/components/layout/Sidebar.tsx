"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems, settingsItem } from "@/components/layout/nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-border/70 bg-card px-6 py-8 md:flex md:flex-col md:justify-between">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <span className="text-lg font-bold">CB</span>
          </div>
          <div>
            <p className="text-lg font-semibold">Couple Budget</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Premium
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-105" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href={settingsItem.href}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
            pathname === settingsItem.href
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>{settingsItem.label}</span>
        </Link>
      </div>
    </aside>
  );
}
