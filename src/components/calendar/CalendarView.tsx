"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/formatCurrency";

export function CalendarView() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const { events } = useAppStore();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const selectedKey = selectedDate.toISOString().slice(0, 10);
  const label = viewDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const { data } = useQuery({
    queryKey: ["calendar", year, month],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("date, amount_cf, merchant")
        .gte("date", startDate.toISOString().slice(0, 10))
        .lte("date", endDate.toISOString().slice(0, 10));
      if (error) throw error;
      return data ?? [];
    },
  });

  const dayTotals = useMemo(() => {
    const map = new Map<number, number>();
    data?.forEach((row) => {
      const date = new Date(row.date);
      if (date.getFullYear() !== year || date.getMonth() !== month) return;
      const day = date.getDate();
      map.set(day, (map.get(day) ?? 0) + Number(row.amount_cf));
    });
    return map;
  }, [data, month, year]);

  const dayTransactions = useMemo(() => {
    return (data ?? []).filter((row) => row.date === selectedKey);
  }, [data, selectedKey]);

  const dayEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.startDate === selectedKey ||
        event.nextOccurrence === selectedKey
    );
  }, [events, selectedKey]);

  const selectedTotal = dayTransactions.reduce(
    (acc, row) => acc + Number(row.amount_cf ?? 0),
    0
  );


  const weekStart = useMemo(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    return date;
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    });
  }, [weekStart]);

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Agenda</CardTitle>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={viewMode === "week" ? "secondary" : "outline"}
              onClick={() => setViewMode("week")}
            >
              Semana
            </Button>
            <Button
              size="sm"
              variant={viewMode === "day" ? "secondary" : "outline"}
              onClick={() => setViewMode("day")}
            >
              Dia
            </Button>
            <Button size="sm" variant="outline">
              Filtros
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
            >
              Mes anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
            >
              Proximo mes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "week" ? (
          <>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
              {["S", "T", "Q", "Q", "S", "S", "D"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const total = dayTotals.get(date.getDate());
                const isActive =
                  date.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`flex h-20 flex-col items-start justify-start rounded-xl border border-border/60 bg-background p-2 text-xs transition ${
                      isActive ? "ring-2 ring-primary/40" : "hover:border-primary/40"
                    }`}
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {date.getDate()}
                    </span>
                    {total ? (
                      <span
                        className={`mt-auto text-[10px] ${
                          total < 0 ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {total < 0 ? "-" : "+"}R$ {Math.abs(total).toFixed(0)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Eventos e transacoes do dia
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/calendario/evento">Adicionar evento</Link>
              </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3 text-sm text-muted-foreground">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-border/60 bg-background px-4 py-3"
                  >
                    <p className="font-semibold text-foreground">{event.name}</p>
                    <p className="text-xs">
                      {event.type === "recurring" ? "Recorrente" : "Planejado"}
                      {event.amount ? ` · ${formatCurrency(Math.abs(event.amount))}` : ""}
                    </p>
                  </div>
                ))}
                {dayTransactions.map((row, index) => (
                  <div
                    key={`${row.date}-${index}`}
                    className="rounded-xl border border-border/60 bg-background px-4 py-3"
                  >
                    <p className="font-semibold text-foreground">
                      {row.merchant ?? "Transação"}
                    </p>
                    <p className="text-xs">
                      {formatCurrency(Math.abs(Number(row.amount_cf ?? 0)))}
                    </p>
                  </div>
                ))}
                {!dayEvents.length && !dayTransactions.length ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                    Nenhum evento ou transação neste dia.
                  </div>
                ) : null}
              </div>
              <div className="space-y-3 rounded-xl border border-border/60 bg-background p-4 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Resumo do dia
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {selectedTotal < 0 ? "-" : "+"}
                  {formatCurrency(Math.abs(selectedTotal))}
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Historico: media de R$ 160 nos ultimos 30 dias.</p>
                  <p>Tendencia: acima do esperado nesta semana.</p>
                  <p>Insight: ajuste lazer para manter o saldo projetado.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
