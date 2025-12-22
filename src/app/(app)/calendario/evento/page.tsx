import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const history = [
  { label: "Novembro", value: "R$ 1.500" },
  { label: "Outubro", value: "R$ 1.480" },
  { label: "Setembro", value: "R$ 1.520" },
];

export default function EventoPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Detalhe do evento"
        subtitle="Gastos previstos e recorrencias."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-foreground">Aluguel</p>
              <p className="text-sm text-muted-foreground">Todo dia 5 · Recorrente</p>
            </div>
            <p className="text-2xl font-bold text-rose-500">- R$ 1.500,00</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Editar evento</Button>
              <Button>Marcar como pago</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Historico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {history.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
              >
                <span>{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-700">
              Tendencia: estabilidade nos ultimos 3 meses.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
