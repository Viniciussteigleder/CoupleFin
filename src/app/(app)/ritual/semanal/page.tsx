import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RitualSemanalPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ritual semanal"
        subtitle="Revisao rapida dos gastos da semana."
        action={<Button variant="outline">Agendar horario</Button>}
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Sequencia sugerida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Verificar transacoes pendentes</p>
          <p>Atualizar metas e alertas</p>
          <p>Alinhar prioridades da semana</p>
        </CardContent>
      </Card>
    </div>
  );
}
