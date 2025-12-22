import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RevisarOcrPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Revisar OCR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
            Pre-visualizacao do recibo digitalizado.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Estabelecimento</p>
              <Input defaultValue="Mercado Central" />
              <span className="text-[11px] text-amber-600">
                Confianca media · revise este campo.
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Valor</p>
              <Input defaultValue="R$ 189,90" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Data</p>
              <Input defaultValue="24/11/2025" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Categoria sugerida</p>
              <Input defaultValue="Supermercado" />
            </div>
          </div>
          <div className="rounded-xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-xs text-red-600">
            OCR detectou baixa confianca em 1 campo. Revise antes de importar.
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
