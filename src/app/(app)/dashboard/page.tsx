"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";

const cards = [
  { name: "Cartao Gold", balance: "R$ 1.420", due: "Vence em 10 dias" },
  { name: "Cartao Miles", balance: "R$ 980", due: "Vence em 16 dias" },
];

const insights = [
  { title: "Supermercado", detail: "12% acima da media", cta: "Revisar" },
  { title: "Mobilidade", detail: "R$ 320 no mes", cta: "Ver detalhes" },
  { title: "Assinaturas", detail: "3 servicos ativos", cta: "Gerenciar" },
];

const activity = [
  { title: "Importacao CSV", detail: "23 transacoes pendentes" },
  { title: "Regra aplicada", detail: "Uber -> Transporte" },
  { title: "Ritual semanal", detail: "Acordo atualizado" },
];

export default function DashboardPage() {
  const [month, setMonth] = useState(() => new Date());
  const label = month.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Painel mensal"
        subtitle="Resumo de gastos, metas e categorias do casal."
        action={<Button>Adicionar transacao</Button>}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          Mes anterior
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          Proximo mes
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="relative overflow-hidden border-border/60 shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Projecao do mes
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <p className="text-4xl font-black text-foreground">R$ 4.250,00</p>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <p>Receitas previstas</p>
                <p className="font-semibold text-emerald-600">R$ 10.000,00</p>
              </div>
              <div>
                <p>Despesas previstas</p>
                <p className="font-semibold text-rose-500">R$ 5.750,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/60 shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 to-transparent" />
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Compromissos restantes
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <p className="text-4xl font-black text-foreground">R$ 1.200,00</p>
            <p className="text-sm text-muted-foreground">
              3 contas recorrentes vencendo nesta semana.
            </p>
            <Button variant="outline" size="sm">
              Ver detalhes
            </Button>
          </CardContent>
        </Card>
      </section>

      <DashboardStats />

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Ciclo dos cartoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              {cards.map((card) => (
                <div
                  key={card.name}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{card.name}</p>
                    <p className="text-xs text-muted-foreground">{card.due}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {card.balance}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {insights.map((insight) => (
                <div
                  key={insight.title}
                  className="rounded-2xl border border-border/60 bg-muted/30 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {insight.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{insight.detail}</p>
                  <Button size="sm" variant="ghost" className="mt-2">
                    {insight.cta}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <DashboardAlerts />
          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle>Atividade recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {activity.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/60 bg-background px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
