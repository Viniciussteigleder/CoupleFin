import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const evidence = [
  { label: "Origem", value: "CSV Amex" },
  { label: "Descricao original", value: "UBER *TRIP 2025-11-24" },
  { label: "Categoria sugerida", value: "Transporte" },
  { label: "Confiança", value: "Alta" },
];

const related = [
  { merchant: "Uber", date: "22/11", amount: "R$ 39,00" },
  { merchant: "Uber", date: "21/11", amount: "R$ 45,50" },
];

export default function TransacaoDetalhePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Detalhe da transacao"
        subtitle="Revise informacoes e aplique regras em lote."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-lg font-semibold text-foreground">Uber</p>
              <p className="text-sm text-muted-foreground">24/11 · Cartao Gold</p>
            </div>
            <p className="text-3xl font-bold text-rose-500">- R$ 42,00</p>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {evidence.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Editar categoria</Button>
              <Button>Confirmar</Button>
              <Button variant="outline" asChild>
                <Link href="/rules/nova">Criar regra</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Transacoes similares
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {related.map((item) => (
              <div
                key={`${item.merchant}-${item.date}`}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.merchant}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <span className="text-sm font-semibold text-rose-500">
                  {item.amount}
                </span>
              </div>
            ))}
            <Button variant="outline">Aplicar categoria em lote</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
