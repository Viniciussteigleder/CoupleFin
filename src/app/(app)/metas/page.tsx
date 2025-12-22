import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const goals = [
  { name: "Reserva de emergencia", target: "R$ 12.000", progress: 68 },
  { name: "Viagem de casal", target: "R$ 4.500", progress: 35 },
];

export default function MetasPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Metas"
        subtitle="Acompanhe objetivos financeiros do casal."
        action={<Button>Nova meta</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.name} className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">{goal.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-semibold text-foreground">{goal.target}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {goal.progress}% concluido neste ciclo.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
