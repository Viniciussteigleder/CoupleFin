"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ViewMode = "week" | "day";

type FilterType = "all" | "income" | "expense" | "commitments";

export default function CalendarPage() {
  const { transactions, events } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [filter, setFilter] = useState<FilterType>("all");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filter === "income") return t.amount > 0;
      if (filter === "expense") return t.amount < 0;
      if (filter === "commitments") return false;
      return true;
    });
  }, [filter, transactions]);

  const filteredEvents = useMemo(() => {
    if (filter === "commitments") return events;
    return events;
  }, [events, filter]);

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      const key = new Date(t.date).toDateString();
      map.set(key, (map.get(key) ?? 0) + t.amount);
    });
    filteredEvents.forEach((event) => {
      if (!event.amount) return;
      const key = new Date(event.startDate).toDateString();
      map.set(key, (map.get(key) ?? 0) + event.amount * -1);
    });
    return map;
  }, [filteredEvents, filteredTransactions]);

  const dayTransactions = useMemo(() => {
    return filteredTransactions.filter((t) =>
      isSameDay(new Date(t.date), selectedDate)
    );
  }, [filteredTransactions, selectedDate]);

  const dayEvents = useMemo(() => {
    return filteredEvents.filter((event) =>
      isSameDay(new Date(event.startDate), selectedDate)
    );
  }, [filteredEvents, selectedDate]);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black">Calendário</h1>
          <p className="text-sm text-muted-foreground">
            Visualize compromissos e padrões do mês.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-sm">
            <button
              type="button"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                )
              }
              className="rounded-full p-1 hover:bg-muted"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="min-w-[130px] text-center font-semibold capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                )
              }
              className="rounded-full p-1 hover:bg-muted"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-1">
            <Button
              size="sm"
              variant={viewMode === "week" ? "secondary" : "ghost"}
              onClick={() => setViewMode("week")}
            >
              Semana
            </Button>
            <Button
              size="sm"
              variant={viewMode === "day" ? "secondary" : "ghost"}
              onClick={() => setViewMode("day")}
            >
              Dia
            </Button>
          </div>
          <Button asChild>
            <Link href="/calendar/event">Novo evento</Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {["all", "income", "expense", "commitments"].map((item) => (
          <Button
            key={item}
            size="sm"
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item as FilterType)}
          >
            {item === "all"
              ? "Todos"
              : item === "income"
              ? "Entradas"
              : item === "expense"
              ? "Saídas"
              : "Compromissos"}
          </Button>
        ))}
      </div>

      {viewMode === "week" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
            {weekDays.map((day) => (
              <div key={day.toISOString()}>{format(day, "EEE", { locale: ptBR })}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const total = dayTotals.get(day.toDateString()) ?? 0;
              const isActive = isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day);
                    setViewMode("day");
                  }}
                  className={cn(
                    "rounded-xl border border-border/60 bg-background p-3 text-left text-xs transition",
                    isActive ? "ring-2 ring-primary/40" : "hover:border-primary/40"
                  )}
                >
                  <div className="text-sm font-semibold text-foreground">
                    {format(day, "dd")}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">Total</div>
                  <div className={cn(
                    "text-xs font-semibold",
                    total < 0 ? "text-rose-500" : "text-emerald-600"
                  )}>
                    {formatCurrency(Math.abs(total))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="text-xs text-muted-foreground">Eventos e transações do dia</p>
          </div>

          {dayTransactions.length === 0 && dayEvents.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-background p-6 text-sm text-muted-foreground">
              Nenhum lançamento para este dia.
            </div>
          ) : (
            <div className="grid gap-3">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Compromisso {event.type === "recurring" ? "recorrente" : "planejado"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {event.amount ? formatCurrency(Math.abs(event.amount)) : "--"}
                  </span>
                </div>
              ))}
              {dayTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.amount < 0 ? "Saída" : "Entrada"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(Math.abs(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
