"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Painel", href: "/dashboard", icon: "dashboard" },
  { label: "Transações", href: "/transactions", icon: "receipt_long" },
  { label: "Confirmar", href: "/confirm-queue", icon: "checklist" },
  { label: "Calendário", href: "/calendar", icon: "calendar_month" },
  { label: "Mais", href: "/settings", icon: "menu" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 px-4 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[11px] font-semibold",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl",
                  isActive ? "bg-primary/10" : "bg-transparent"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
