"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Upload, CheckSquare, Layers, Sparkles, Target, CalendarDays, Archive, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Fila de Confirmação", href: "/confirm-queue", icon: CheckSquare },
  { label: "Transações", href: "/transactions", icon: Layers },
  { label: "Contas", href: "/accounts", icon: Wallet },
  { label: "Insights", href: "/insights", icon: Sparkles },
  { label: "Metas", href: "/goals", icon: Target },
  { label: "Calendário", href: "/calendar", icon: CalendarDays },
  { label: "Uploads", href: "/uploads", icon: Upload },
  { label: "Configurações", href: "/settings", icon: Settings },
  { label: "Audit Log", href: "/audit", icon: Archive },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="flex h-14 items-center px-4 lg:h-[72px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex -space-x-1.5 translate-y-0.5">
             <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20" />
             <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary" />
          </div>
          <span className="text-xl tracking-tight text-primary font-bold">CoupleFin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <div className="px-2 py-1.5 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[18px] px-3.5 py-3 transition-all hover:bg-muted/50",
                  isActive ? "bg-primary text-white font-bold shadow-sm shadow-primary/20" : "text-muted-foreground font-medium"
                )}
              >
                 <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
                 {item.label}
              </Link>
            );
          })}
          
          <div className="mt-6 px-2 py-1.5 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
             Rituals
          </div>
          <Link
            href="/ritual/weekly"
            className={cn(
              "flex items-center gap-3 rounded-[18px] px-3.5 py-3 transition-all hover:bg-muted/50",
              pathname.includes("/ritual/weekly") ? "bg-primary text-white font-bold shadow-sm shadow-primary/20" : "text-muted-foreground font-medium"
            )}
          >
             <CheckSquare className={cn("h-5 w-5", pathname.includes("/ritual/weekly") ? "text-white" : "text-muted-foreground")} />
             Weekly Check-in
          </Link>
           <Link
            href="/ritual/monthly"
            className={cn(
              "flex items-center gap-3 rounded-[18px] px-3.5 py-3 transition-all hover:bg-muted/50",
              pathname.includes("/ritual/monthly") ? "bg-primary text-white font-bold shadow-sm shadow-primary/20" : "text-muted-foreground font-medium"
            )}
          >
             <CalendarDays className={cn("h-5 w-5", pathname.includes("/ritual/monthly") ? "text-white" : "text-muted-foreground")} />
             Monthly Review
          </Link>

        </nav>
      </div>
    </div>
  );
}
