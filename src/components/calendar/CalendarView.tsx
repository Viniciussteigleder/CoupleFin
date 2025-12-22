"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function CalendarView() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const { data } = useQuery({
    queryKey: ["calendar", year, month],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("date, amount_cf");
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

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells = useMemo(() => {
    const items: Array<{ day: number | null; total?: number }> = [];
    for (let i = 0; i < firstWeekday; i += 1) items.push({ day: null });
    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push({ day, total: dayTotals.get(day) });
    }
    while (items.length < 35) items.push({ day: null });
    return items;
  }, [daysInMonth, firstWeekday, dayTotals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda do mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {cells.map((cell, index) => (
            <div
              key={`${cell.day ?? "empty"}-${index}`}
              className="flex h-16 flex-col items-start justify-start rounded-xl border border-border/60 bg-background p-2 text-xs"
            >
              {cell.day ? (
                <>
                  <span className="text-sm font-semibold text-foreground">
                    {cell.day}
                  </span>
                  {cell.total ? (
                    <span
                      className={`mt-auto text-[10px] ${
                        cell.total < 0 ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {cell.total < 0 ? "-" : "+"}R$ {Math.abs(cell.total).toFixed(0)}
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
