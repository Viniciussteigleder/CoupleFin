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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="relative overflow-hidden border-border/60 shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Saldo projetado
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
