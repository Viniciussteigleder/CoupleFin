import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Painel mensal"
        subtitle="Resumo de gastos, metas e categorias do casal."
        action={<Button>Adicionar transacao</Button>}
      />

      <DashboardStats />

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo do mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-2xl border border-dashed border-border/80 bg-muted/40" />
          </CardContent>
        </Card>
        <DashboardAlerts />
      </section>
    </div>
  );
}
