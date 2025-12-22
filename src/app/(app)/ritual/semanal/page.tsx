import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const agreements = [
  "Reduzir delivery para 2x/semana",
  "Limitar gastos com transporte a R$ 150",
];

export default function RitualSemanalPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ritual semanal"
        subtitle="Revisao rapida dos gastos da semana."
        action={<Button variant="outline">Agendar horario</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Revisar acordo anterior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {agreements.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
              >
                <span>{item}</span>
                <Button size="sm" variant="ghost">
                  Cumprido
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Novo combinado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Defina o combinado principal da semana.</p>
            <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
              Ex: cozinhar juntos 3x na semana
            </div>
            <Button>Salvar combinado</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
