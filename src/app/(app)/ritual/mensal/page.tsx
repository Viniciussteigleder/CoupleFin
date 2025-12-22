import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const goals = [
  { label: "Reserva de emergencia", status: "Meta batida" },
  { label: "Viagem de casal", status: "76% concluido" },
];

export default function RitualMensalPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ritual mensal"
        subtitle="Fechamento do mes e alinhamento de metas."
        action={<Button>Iniciar fechamento</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Revisar categorias pendentes</p>
            <p>Conferir metas do mes</p>
            <p>Planejar proximas prioridades</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Metas do mes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {goals.map((goal) => (
              <div
                key={goal.label}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
              >
                <span>{goal.label}</span>
                <span className="font-semibold text-foreground">{goal.status}</span>
              </div>
            ))}
            <Button variant="outline">Copiar resumo</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
