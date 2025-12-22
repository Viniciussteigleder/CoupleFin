"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";

const mobileItems = navItems.filter((item) =>
  ["/dashboard", "/transactions", "/uploads", "/confirmar", "/calendario"].includes(
    item.href
  )
);

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/70 bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
      <nav className="mx-auto flex max-w-md items-center justify-between">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl",
                  isActive ? "bg-primary/15 text-primary" : "bg-transparent"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
