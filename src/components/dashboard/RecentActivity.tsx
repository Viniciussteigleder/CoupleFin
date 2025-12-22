"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface RecentTransaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  icon: string;
  type: "income" | "expense";
}

interface RecentActivityProps {
  transactions: RecentTransaction[];
  onViewAll?: () => void;
}

export function RecentActivity({ transactions, onViewAll }: RecentActivityProps) {
  return (
    <Card className="bg-white dark:bg-card-dark rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Atividade Recente</CardTitle>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-muted-foreground">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform",
                tx.type === "expense" 
                  ? "bg-red-50 dark:bg-red-900/20 text-red-500" 
                  : "bg-green-50 dark:bg-green-900/20 text-green-600"
              )}>
                <span className="material-symbols-outlined text-[20px]">{tx.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{tx.merchant}</span>
                <span className="text-xs text-muted-foreground">{tx.date}</span>
              </div>
            </div>
            <span className={cn(
              "text-sm font-bold",
              tx.type === "expense" ? "text-red-500" : "text-green-600"
            )}>
              {tx.type === "expense" ? "- " : "+ "}{formatCurrency(Math.abs(tx.amount))}
            </span>
          </div>
        ))}
        
        {onViewAll && (
          <Button 
            variant="outline" 
            className="w-full mt-2 py-3 text-sm font-bold text-primary border-primary/20 hover:bg-primary/5 rounded-xl"
            onClick={onViewAll}
          >
            Ver todas as transações
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
