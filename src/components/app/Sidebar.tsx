"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Using Material Symbol icon names
const navItems = [
  { label: "Painel", href: "/dashboard", icon: "dashboard" },
  { label: "Transações", href: "/transactions", icon: "receipt_long" },
  { label: "Confirmar", href: "/confirm-queue", icon: "checklist" },
  { label: "Contas", href: "/accounts", icon: "credit_card" },
  { label: "Metas", href: "/goals", icon: "flag" },
  { label: "Calendário", href: "/calendar", icon: "calendar_month" },
  { label: "Uploads", href: "/uploads", icon: "upload_file" },
  { label: "Insights", href: "/insights", icon: "lightbulb" },
  { label: "Regras", href: "/rules", icon: "rule" },
  { label: "Logs", href: "/audit", icon: "receipt_long" },
  { label: "Configurações", href: "/settings", icon: "settings" },
];

const ritualItems = [
  { label: "Ritual Semanal", href: "/ritual/weekly", icon: "event_repeat" },
  { label: "Ritual Mensal", href: "/ritual/monthly", icon: "date_range" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-72 flex-col justify-between bg-white dark:bg-card-dark border-r border-gray-100 dark:border-gray-800 h-full shrink-0">
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Logo / Branding */}
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-foreground">Couple Budget</h1>
            <p className="text-xs text-muted-foreground font-medium">Coach Financeiro</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <span className={cn(
                  "material-symbols-outlined text-[20px]",
                  isActive && "filled"
                )}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Rituals Section */}
          <div className="mt-4 mb-1 px-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
            Rituais
          </div>
          {ritualItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <span className={cn(
                  "material-symbols-outlined text-[20px]",
                  isActive && "filled"
                )}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - Couple Profile */}
      <div className="p-4 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background cursor-pointer transition-colors">
          <div 
            className="bg-gradient-to-br from-primary/30 to-primary/10 rounded-full size-10 flex items-center justify-center shadow-sm ring-2 ring-primary/20"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <p className="text-sm font-bold truncate text-foreground">Casal Silva</p>
            <p className="text-xs text-muted-foreground truncate">Plano Premium</p>
          </div>
          <span className="material-symbols-outlined text-muted-foreground text-lg">expand_more</span>
        </div>
      </div>
    </aside>
  );
}
