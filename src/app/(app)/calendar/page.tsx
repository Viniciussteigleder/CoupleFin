"use client";

import { Button } from "@/components/ui/button";
import { format, isToday, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ViewMode = "week" | "day";
type FilterType = "all" | "income" | "expense" | "commitments";

export default function CalendarPage() {
  const { transactions } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [filter, setFilter] = useState<FilterType>("all");

  // Navigation
  const nextPeriod = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevPeriod = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Get week days for week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Calculate projections
  const monthExpenses = transactions
    .filter((t) => t.amount < 0 && t.status !== "archived")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const monthIncome = transactions
    .filter((t) => t.amount > 0 && t.status !== "archived")
    .reduce((acc, t) => acc + t.amount, 0);

  const projectedBalance = monthIncome - monthExpenses + 2450; // Mock starting balance

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <header className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-white/10 shrink-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Calendário</h2>
              <p className="text-sm text-muted-foreground hidden md:block">
                Visualize seus compromissos e fluxo de caixa.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="bg-background dark:bg-white/5 p-1 rounded-lg flex items-center h-10 border border-gray-200 dark:border-white/5">
                <button
                  onClick={() => setViewMode("week")}
                  className={cn(
                    "px-4 h-full rounded-md text-xs font-medium transition-all",
                    viewMode === "week"
                      ? "bg-white dark:bg-card-dark shadow-sm font-bold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semana
                </button>
                <button
                  onClick={() => setViewMode("day")}
                  className={cn(
                    "px-4 h-full rounded-md text-xs font-medium transition-all",
                    viewMode === "day"
                      ? "bg-white dark:bg-card-dark shadow-sm font-bold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Dia
                </button>
              </div>
              {/* Add Event */}
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold h-10 px-5 rounded-lg shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="hidden sm:inline">Novo Evento</span>
              </Button>
            </div>
          </div>

          {/* Month Navigation & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={prevPeriod}
                className="size-8 flex items-center justify-center rounded-full hover:bg-background text-foreground transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="text-lg font-bold w-40 text-center select-none capitalize">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </h3>
              <button
                onClick={nextPeriod}
                className="size-8 flex items-center justify-center rounded-full hover:bg-background text-foreground transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filter === "all"
                    ? "bg-foreground text-background font-bold"
                    : "border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter("income")}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
                  filter === "income"
                    ? "bg-green-500 text-white font-bold"
                    : "border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-block size-2 rounded-full bg-green-500" />
                Entradas
              </button>
              <button
                onClick={() => setFilter("expense")}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
                  filter === "expense"
                    ? "bg-red-500 text-white font-bold"
                    : "border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-block size-2 rounded-full bg-red-500" />
                Saídas
              </button>
              <button
                onClick={() => setFilter("commitments")}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
                  filter === "commitments"
                    ? "bg-blue-500 text-white font-bold"
                    : "border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-block size-2 rounded-full bg-blue-500" />
                Compromissos
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Bar */}
      <div className="bg-primary/5 dark:bg-primary/5 border-b border-gray-200 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1400px] mx-auto flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">trending_up</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Entradas Prev.</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(monthIncome)}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">trending_down</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Saídas Prev.</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(monthExpenses)}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">event_available</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Compromissos</span>
              <span className="text-sm font-bold text-foreground">3 Restantes</span>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Saldo Projetado</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(projectedBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-background-dark p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto h-full flex flex-col relative">
          {/* Week Header */}
          <div className="grid grid-cols-8 gap-4 mb-4 sticky top-0 bg-white dark:bg-background-dark z-10 py-2 border-b border-gray-100 dark:border-white/5">
            <div className="col-span-1 text-center pt-8" /> {/* Time column */}
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className={cn(
                  "text-xs font-bold uppercase",
                  [5, 6].includes(i) ? "text-red-400" : "text-muted-foreground"
                )}>
                  {format(day, "EEE", { locale: ptBR })}
                </span>
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center font-bold text-sm",
                  isToday(day)
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : [5, 6].includes(i)
                      ? "text-muted-foreground"
                      : "text-foreground"
                )}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center p-10 text-center max-w-md bg-white/80 dark:bg-background-dark/90 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="size-16 rounded-full bg-background flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-muted-foreground">calendar_today</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Seu calendário está vazio</h3>
              <p className="text-sm text-muted-foreground">
                Adicione um compromisso ou assinatura para começar o planejamento semanal!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
