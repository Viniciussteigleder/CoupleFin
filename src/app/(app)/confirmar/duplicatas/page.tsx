import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const duplicatePair = {
  left: {
    merchant: "Uber",
    date: "24/11/2025",
    amount: "R$ 42,00",
    account: "Cartao Gold",
    city: "Sao Paulo",
    description: "UBER *TRIP 2025-11-24",
  },
  right: {
    merchant: "Uber",
    date: "24/11/2025",
    amount: "R$ 42,00",
    account: "Conta Principal",
    city: "Sao Paulo",
    description: "UBER *TRIP 24/11",
  },
  diffs: ["Descricao original", "Conta origem"],
};

export default function DuplicatasPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Comparar duplicatas"
        subtitle="Revise transacoes similares lado a lado antes de mesclar."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Transacoes em conflito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[duplicatePair.left, duplicatePair.right].map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border/60 bg-background p-4"
                >
                  <p className="text-xs text-muted-foreground">Transacao {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {item.merchant}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Data</span>
                      <span className="font-semibold text-foreground">{item.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-semibold text-foreground">{item.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Conta</span>
                      <span className="font-semibold text-foreground">{item.account}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cidade</span>
                      <span className="font-semibold text-foreground">{item.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Manter separadas</Button>
              <Button>Mesclar duplicatas</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle>Diferencas encontradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {duplicatePair.diffs.map((diff) => (
              <div
                key={diff}
                className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
              >
                <p className="font-semibold text-foreground">{diff}</p>
                <p className="text-xs text-muted-foreground">
                  Revise qual registro manter antes de confirmar.
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-700">
                Sugestao: manter a transacao com mais detalhes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
