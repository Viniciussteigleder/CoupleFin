import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CsvImport } from "@/components/uploads/CsvImport";

export default function UploadsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Importar transacoes"
        subtitle="Importe extratos bancarios (CSV) ou notas fiscais para leitura OCR."
        action={<Button variant="outline">Ver historico</Button>}
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base text-muted-foreground">
              Extrato bancario (CSV)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Arraste o arquivo ou selecione no seu computador.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">
              CSV
            </Button>
            <Button size="sm" variant="outline">
              OCR
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CsvImport />
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Ultimos uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
            Nenhum upload ainda. Arraste um arquivo ou clique em &quot;Selecionar CSV&quot;.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
