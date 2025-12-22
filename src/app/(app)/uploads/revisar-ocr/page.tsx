import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RevisarOcrPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Revisar OCR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
            Pre-visualizacao do recibo digitalizado.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <p className="text-xs text-muted-foreground">Estabelecimento</p>
              <p className="text-base font-semibold text-foreground">Mercado Central</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-base font-semibold text-foreground">R$ 189,90</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Editar dados</Button>
            <Button>Confirmar e importar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
