import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rows = [
  { date: "24/11", merchant: "Miles & More", amount: "- R$ 320,00" },
  { date: "23/11", merchant: "Mercado Central", amount: "- R$ 189,90" },
  { date: "23/11", merchant: "Posto Avenida", amount: "- R$ 120,00" },
];

export default function UploadDetalhePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Detalhe do upload"
        subtitle="Transacoes extraidas do arquivo importado."
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Transacoes importadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {rows.map((row) => (
            <div
              key={`${row.date}-${row.merchant}`}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{row.merchant}</p>
                <p className="text-xs text-muted-foreground">{row.date}</p>
              </div>
              <span className="text-sm font-semibold text-rose-500">{row.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
