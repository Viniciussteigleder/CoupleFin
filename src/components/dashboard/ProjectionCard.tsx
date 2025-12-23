"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";

interface ProjectionCardProps {
  projectedBalance: number;
  expectedIncome: number;
  expectedExpenses: number;
}

export function ProjectionCard({ 
  projectedBalance, 
  expectedIncome, 
  expectedExpenses 
}: ProjectionCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl shadow-card border-0">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-teal-500/10 dark:from-primary/20 dark:to-teal-600/20" />
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      
      <CardContent className="relative z-10 p-6 flex flex-col h-full justify-between gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Saldo Projetado
            </div>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(projectedBalance)}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-black/20 p-2 rounded-lg backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          </div>
        </div>

        {/* Income & Expenses */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 dark:border-white/10">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Receitas Previstas</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              {formatCurrency(expectedIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Despesas Previstas</p>
            <p className="text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              {formatCurrency(expectedExpenses)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
