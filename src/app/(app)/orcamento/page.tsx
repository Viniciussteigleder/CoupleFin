import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const budgetItems = [
  { label: "Moradia", planned: "R$ 1.800", spent: "R$ 1.650", status: "ok" },
  { label: "Supermercado", planned: "R$ 900", spent: "R$ 980", status: "warn" },
  { label: "Transporte", planned: "R$ 450", spent: "R$ 520", status: "warn" },
];

export default function OrcamentoPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Orcamento"
        subtitle="Compare planejado vs realizado no mes."
      />

      <div className="grid gap-4">
        {budgetItems.map((item) => (
          <Card key={item.label} className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Planejado</span>
                <span className="font-semibold text-foreground">{item.planned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gasto</span>
                <span className="font-semibold text-foreground">{item.spent}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${
                    item.status === "ok" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: item.status === "ok" ? "70%" : "90%" }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
