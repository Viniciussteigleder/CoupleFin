import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const insights = [
  {
    title: "Gastos essenciais",
    value: "R$ 3.150",
    description: "Moradia e supermercado representam 62% do total.",
  },
  {
    title: "Lazer",
    value: "R$ 480",
    description: "20% abaixo do limite semanal combinado.",
  },
  {
    title: "Renda do casal",
    value: "R$ 8.400",
    description: "Meta mensal atingida em 92%.",
  },
];

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Insights"
        subtitle="Indicadores e tendencias para manter o casal alinhado."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((insight) => (
          <Card key={insight.title} className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">
                {insight.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{insight.value}</p>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
