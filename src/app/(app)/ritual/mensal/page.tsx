import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RitualMensalPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ritual mensal"
        subtitle="Fechamento do mes e alinhamento de metas."
        action={<Button>Iniciar fechamento</Button>}
      />

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
    </div>
  );
}
