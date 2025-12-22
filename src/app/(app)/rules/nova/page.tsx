import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RuleWizard } from "@/components/rules/RuleWizard";

const impacted = [
  { merchant: "Uber", date: "24/11", amount: "R$ 42,00" },
  { merchant: "Uber", date: "22/11", amount: "R$ 39,00" },
  { merchant: "Uber", date: "21/11", amount: "R$ 45,50" },
];

export default function RegraNovaPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Criar regra"
        subtitle="Defina a palavra-chave e confira o impacto antes de salvar."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <RuleWizard />
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Transacoes impactadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {impacted.map((item) => (
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
            <p className="text-xs text-muted-foreground">
              Dica: revise pelo menos uma amostra antes de aplicar retroativo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
