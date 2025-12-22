import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CsvImport } from "@/components/uploads/CsvImport";

export default function UploadsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Uploads"
        subtitle="Importe CSV ou extratos para gerar transacoes pendentes."
        action={<Button>Selecionar CSV</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <CsvImport />
        <Card>
          <CardHeader>
            <CardTitle>Ultimos uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
              Nenhum upload ainda. Arraste um arquivo ou clique em &quot;Selecionar CSV&quot;.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
