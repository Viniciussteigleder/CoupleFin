import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const rows = [
  { date: "24/11", merchant: "Miles & More", amount: "- R$ 320,00", status: "Pendente" },
  { date: "23/11", merchant: "Mercado Central", amount: "- R$ 189,90", status: "Pendente" },
  { date: "23/11", merchant: "Posto Avenida", amount: "- R$ 120,00", status: "Duplicata" },
];

export default function UploadDetalhePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Detalhe do upload"
        subtitle="Transacoes extraidas do arquivo importado."
        action={<Button variant="outline">Enviar para confirmar</Button>}
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Transacoes importadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {rows.map((row) => (
            <div
              key={`${row.date}-${row.merchant}`}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{row.merchant}</p>
                <p className="text-xs text-muted-foreground">{row.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-rose-500">
                  {row.amount}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    row.status === "Duplicata"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
