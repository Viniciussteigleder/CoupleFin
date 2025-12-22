"use client";

import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale"; // Prompt said English routes but maybe UI in PT? "Design Files" are likely PT.
// Actually implementation plan said "Refactor Routes to English", but UI language wasn't strictly enforced as English.
// Given "Bem-vindos" was used in Onboarding, I will use PT for UI text, English for code/routes.
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const { transactions } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Mock upcoming bills or use transactions
  const events = transactions.map(t => ({
      date: new Date(t.date),
      amount: t.amount,
      title: t.description
  }));

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl font-semibold md:text-2xl">Calendário</h1>
         <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" onClick={prevMonth}>
                 <ChevronLeft className="h-4 w-4" />
             </Button>
             <span className="min-w-[120px] text-center font-medium capitalize">
                 {format(currentDate, "MMMM yyyy", { locale: ptBR })}
             </span>
             <Button variant="outline" size="icon" onClick={nextMonth}>
                 <ChevronRight className="h-4 w-4" />
             </Button>
         </div>
      </div>

      <Card className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 text-muted-foreground">
              <div>Dom</div>
              <div>Seg</div>
              <div>Ter</div>
              <div>Qua</div>
              <div>Qui</div>
              <div>Sex</div>
              <div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
              {/* Padding for start of month */}
              {Array.from({ length: firstDay.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[80px] bg-muted/20 rounded opacity-50" />
              ))}
              
              {days.map(day => {
                  const dayEvents = events.filter(e => isSameDay(e.date, day));
                  const total = dayEvents.reduce((acc, e) => acc + e.amount, 0);
                  
                  return (
                      <div key={day.toISOString()} className={cn("min-h-[80px] p-2 border rounded flex flex-col gap-1 hover:bg-muted/30 transition-colors", isToday(day) && "bg-primary/5 border-primary")}>
                          <span className={cn("text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full", isToday(day) && "bg-primary text-primary-foreground")}>
                              {format(day, "d")}
                          </span>
                          {dayEvents.length > 0 && (
                              <div className="mt-auto">
                                  <div className={cn("text-xs font-semibold truncate", total < 0 ? "text-foreground" : "text-green-600")}>
                                      {total < 0 ? "-" : "+"} € {Math.abs(total).toFixed(0)}
                                  </div>
                                  <div className="h-1 w-full flex gap-0.5 mt-1">
                                      {dayEvents.slice(0, 3).map((e, i) => (
                                          <div key={i} className="h-full w-full rounded-full bg-primary/40" />
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      </Card>
    </div>
  );
}
