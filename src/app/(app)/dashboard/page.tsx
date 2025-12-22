"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BudgetDonut } from "@/components/dashboard/BudgetDonut";

export default function DashboardPage() {
  const reduceMotion = useReducedMotion();
  const { categories, budgets, transactions, hydrateFromSeed } = useAppStore();

  useEffect(() => {
    (async () => {
      // If store is empty/fresh, load seed.
      if (categories.length === 0) {
        try {
            const res = await fetch("/api/seed");
            const json = await res.json();
            if (json.ok && json.data) {
                hydrateFromSeed(json.data);
            }
        } catch (e) {
            console.error("Failed to seed", e);
        }
      }
    })();
  }, [categories.length, hydrateFromSeed]);

  const monthExpenses = transactions
    .filter((t) => t.amount < 0 && t.status !== "archived")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const pending = transactions.filter((t) => t.status === "pending").length;
  const duplicates = transactions.filter((t) => t.status === "duplicate").length;

  const outBudget = budgets.map((b) => {
    const categoryName = categories.find(c => c.id === b.categoryId)?.name || b.categoryId;
    const spent = transactions
      .filter((t) => t.amount < 0 && t.categoryId === b.categoryId && t.status !== "archived")
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return { ...b, categoryName, spent, pct: Math.min(100, (spent / Math.max(1, b.monthlyLimit)) * 100) };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Painel Mensal</h1>
          <p className="text-sm text-muted-foreground">
            Um resumo rápido do mês + o que precisa de atenção.
          </p>
        </div>
        <Badge variant={pending ? "destructive" : "secondary"} className="gap-2 h-8 px-3">
          {pending ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {pending ? `${pending} pendências` : "Tudo em dia"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[32px] border-none shadow-sm bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gasto no mês</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-3xl font-bold tracking-tight"
            >
              € {monthExpenses.toFixed(2)}
            </motion.div>
            <p className="mt-1 text-xs text-muted-foreground">Inclui confirmadas + pendentes.</p>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-sm bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Duplicatas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{duplicates}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Compare e resolva para manter a confiança.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-sm bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Orçamento Geral</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2">
            {outBudget.length > 0 ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <BudgetDonut 
                   percentage={outBudget.reduce((acc, b) => acc + b.pct, 0) / outBudget.length} 
                   label="Utilizado"
                />
                <div className="w-full space-y-3">
                  {outBudget.slice(0, 2).map((b) => (
                    <div key={b.categoryId} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        <span>{b.categoryName}</span>
                        <span>{Math.round(b.pct)}%</span>
                      </div>
                      <Progress value={b.pct} className={cn("h-1", b.pct > 90 ? "bg-destructive/20" : "bg-primary/20")} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
                <p className="text-xs text-muted-foreground py-10">Nenhum orçamento definido.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
