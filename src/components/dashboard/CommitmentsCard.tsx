"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";

interface CommitmentsCardProps {
  totalRemaining: number;
  totalCommitted: number;
  upcomingCount: number;
  daysAhead: number;
}

export function CommitmentsCard({ 
  totalRemaining, 
  totalCommitted, 
  upcomingCount, 
  daysAhead 
}: CommitmentsCardProps) {
  const paidPercentage = totalCommitted > 0 
    ? Math.round(((totalCommitted - totalRemaining) / totalCommitted) * 100) 
    : 0;

  return (
    <Card className="relative overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-card">
      {/* Subtle red gradient for urgency */}
      <div className="absolute inset-0 bg-gradient-to-bl from-rose-50 to-transparent dark:from-rose-900/10 dark:to-transparent opacity-50" />
      
      <CardContent className="relative z-10 p-6 flex flex-col h-full justify-between gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">event_busy</span>
              Compromissos Restantes
            </div>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(totalRemaining)}
            </p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">
            <span className="material-symbols-outlined text-rose-500">notifications_active</span>
          </div>
        </div>

        {/* Upcoming badges */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white dark:border-card-dark text-xs font-bold text-gray-600">N</div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white dark:border-card-dark text-xs font-bold text-blue-600">C</div>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white dark:border-card-dark text-xs font-bold text-orange-600">L</div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {upcomingCount} contas a vencer nos próximos {daysAhead} dias
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mt-auto">
          <div 
            className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${paidPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
