"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// New Stitch-style components
import { ProjectionCard } from "@/components/dashboard/ProjectionCard";
import { CommitmentsCard } from "@/components/dashboard/CommitmentsCard";
import { CategorySpending } from "@/components/dashboard/CategorySpending";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const router = useRouter();
  const { categories, transactions, events } = useAppStore();
  const [insight, setInsight] = useState<{ title: string; body: string } | null>(null);

  const currentMonthLabel = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }, []);

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data?.length) {
          setInsight({ title: json.data[0].title, body: json.data[0].body });
        } else {
          setInsight(null);
        }
      })
      .catch(() => setInsight(null));
  }, []);

  // Calculate dashboard metrics
  const now = new Date();
  const isCurrentMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const monthExpenses = transactions
    .filter((t) => t.amount < 0 && t.status !== "archived" && isCurrentMonth(t.date))
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const monthIncome = transactions
    .filter((t) => t.amount > 0 && t.status !== "archived" && isCurrentMonth(t.date))
    .reduce((acc, t) => acc + t.amount, 0);

  const projectedBalance = monthIncome - monthExpenses;

  // Category spending breakdown
  const categoryTotals = categories.slice(0, 4).map((cat) => {
    const spent = transactions
      .filter(
        (t) =>
          t.amount < 0 &&
          t.categoryId === cat.id &&
          t.status !== "archived" &&
          isCurrentMonth(t.date)
      )
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const total = monthExpenses || 1;
    return {
      name: cat.name,
      icon: getCategoryIcon(cat.name),
      spent,
      percentage: Math.round((spent / total) * 100),
      color: getCategoryColor(cat.name),
    };
  }).filter(c => c.percentage > 0);

  // Recent transactions
  const recentTxs = transactions
    .filter((t) => t.status !== "archived")
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      merchant: t.description,
      date: formatRelativeDate(t.date),
      amount: t.amount,
      icon: t.amount < 0 ? "shopping_cart" : "payments",
      type: (t.amount < 0 ? "expense" : "income") as "income" | "expense",
    }));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20">
        {/* Month Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Painel Mensal</h2>
            <p className="text-sm text-muted-foreground">Visão geral das finanças do casal</p>
          </div>
          <div className="flex items-center bg-white dark:bg-card-dark rounded-full shadow-sm p-1 border border-gray-100 dark:border-gray-800">
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-muted-foreground transition-colors"
              onClick={() => {/* prev month */}}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex items-center gap-2 px-6">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
              <span className="text-lg font-bold text-foreground min-w-[140px] text-center capitalize">
                {currentMonthLabel}
              </span>
            </div>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-muted-foreground transition-colors"
              onClick={() => {/* next month */}}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProjectionCard
            projectedBalance={projectedBalance}
            expectedIncome={monthIncome}
            expectedExpenses={monthExpenses}
          />
          <CommitmentsCard
            totalRemaining={getUpcomingTotal(transactions, events)}
            totalCommitted={getCommittedTotal(transactions, events)}
            upcomingCount={getUpcomingCount(transactions, events, 7)}
            daysAhead={7}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Categories */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <CategorySpending 
              categories={categoryTotals}
              total={monthExpenses}
            />
          </div>

          {/* Right Column: Insights & Activity */}
          <div className="flex flex-col gap-6">
            <InsightCard
              title={insight?.title ?? "Insights do mês"}
              message={
                insight?.body ??
                "Sem dados suficientes para gerar insights agora. Faça uploads para começar."
              }
              onViewDetails={() => router.push("/insights")}
            />
            <RecentActivity
              transactions={recentTxs}
              onViewAll={() => router.push("/transactions")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryIcon(name: string): string {
  const icons: Record<string, string> = {
    "Alimentação": "restaurant",
    "Moradia": "home",
    "Transporte": "directions_car",
    "Lazer": "sports_esports",
    "Saúde": "health_and_safety",
    "Educação": "school",
    "Compras": "shopping_bag",
    "Assinaturas": "subscriptions",
  };
  return icons[name] || "category";
}

function getCategoryColor(name: string): string {
  const colors: Record<string, string> = {
    "Alimentação": "orange",
    "Moradia": "blue",
    "Transporte": "purple",
    "Lazer": "green",
    "Saúde": "red",
    "Educação": "blue",
    "Compras": "orange",
    "Assinaturas": "purple",
  };
  return colors[name] || "blue";
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Ontem, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getCommittedTotal(
  transactions: Array<{ amount: number; status?: string; date: string }>,
  events: Array<{ amount: number | null; startDate: string }>
) {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const committedFromTransactions = transactions
    .filter(
      (t) =>
        t.status !== "archived" &&
        t.amount < 0 &&
        new Date(t.date).getMonth() === month &&
        new Date(t.date).getFullYear() === year
    )
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const committedFromEvents = events
    .filter((event) => {
      const date = new Date(event.startDate);
      return date.getMonth() === month && date.getFullYear() === year;
    })
    .reduce((acc, event) => acc + Math.abs(event.amount ?? 0), 0);
  return committedFromTransactions + committedFromEvents;
}

function getUpcomingTotal(
  transactions: Array<{ amount: number; status?: string; date: string }>,
  events: Array<{ amount: number | null; startDate: string }>
) {
  const now = Date.now();
  const horizon = now + 7 * 24 * 60 * 60 * 1000;
  const upcomingTransactions = transactions
    .filter((t) => {
      const date = new Date(t.date).getTime();
      return t.status === "pending" && date >= now && date <= horizon;
    })
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const upcomingEvents = events
    .filter((event) => {
      const date = new Date(event.startDate).getTime();
      return date >= now && date <= horizon;
    })
    .reduce((acc, event) => acc + Math.abs(event.amount ?? 0), 0);
  return upcomingTransactions + upcomingEvents;
}

function getUpcomingCount(
  transactions: Array<{ status?: string; date: string }>,
  events: Array<{ startDate: string }>,
  daysAhead: number
) {
  const now = Date.now();
  const horizon = now + daysAhead * 24 * 60 * 60 * 1000;
  const txCount = transactions.filter((t) => {
    const date = new Date(t.date).getTime();
    return t.status === "pending" && date >= now && date <= horizon;
  }).length;
  const eventCount = events.filter((event) => {
    const date = new Date(event.startDate).getTime();
    return date >= now && date <= horizon;
  }).length;
  return txCount + eventCount;
}
