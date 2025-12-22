"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";

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
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gasto no mês</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-2xl font-bold"
            >
              € {monthExpenses.toFixed(2)}
            </motion.div>
            <p className="mt-1 text-xs text-muted-foreground">Inclui confirmadas + pendentes.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duplicatas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duplicates}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Compare e resolva para manter a confiança.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orçamentos (top)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {outBudget.slice(0, 3).map((b) => (
              <div key={b.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{b.categoryName}</span>
                  <span className={b.pct > 90 ? "text-destructive" : "text-muted-foreground"}>
                      {Math.round(b.pct)}%
                  </span>
                </div>
                <Progress value={b.pct} className={cn("h-2", b.pct > 90 && "bg-destructive/20")} />
              </div>
            ))}
            {outBudget.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum orçamento definido.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
