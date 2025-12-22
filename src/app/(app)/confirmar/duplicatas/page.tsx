import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const duplicates = [
  { merchant: "Uber", date: "24/11", amount: "R$ 42,00" },
  { merchant: "Uber", date: "24/11", amount: "R$ 42,00" },
];

export default function DuplicatasPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Comparar duplicatas"
        subtitle="Revise transacoes similares e mantenha apenas uma." 
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Possiveis duplicatas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {duplicates.map((item, index) => (
            <div
              key={`${item.merchant}-${index}`}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{item.merchant}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{item.amount}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Manter separadas</Button>
            <Button>Mesclar duplicatas</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
