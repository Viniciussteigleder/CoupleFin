import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TransacaoDetalhePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Detalhe da transacao"
        subtitle="Revise informacoes e ajuste categoria."
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-foreground">Supermercado Central</p>
            <p className="text-sm text-muted-foreground">24/11 · Cartao Gold</p>
          </div>
          <p className="text-2xl font-bold text-rose-500">- R$ 189,90</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Editar categoria</Button>
            <Button>Confirmar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
