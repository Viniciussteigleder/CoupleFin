import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const accounts = [
  {
    name: "Conta Principal",
    kind: "Conta corrente",
    balance: "R$ 7.250",
    projection: "R$ 6.980",
    bill: "-",
  },
  {
    name: "Cartao Gold",
    kind: "Credito",
    balance: "R$ 1.420",
    projection: "R$ 1.850",
    bill: "R$ 1.200",
  },
];

export default function ContasPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Contas"
        subtitle="Cartoes e contas conectadas ao casal."
        action={<Button variant="outline">Adicionar conta</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.name} className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">
                {account.kind}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg font-semibold text-foreground">{account.name}</p>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Saldo atual</span>
                  <span className="font-semibold text-foreground">{account.balance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Projecao semanal</span>
                  <span className="font-semibold text-foreground">{account.projection}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fatura estimada</span>
                  <span className="font-semibold text-foreground">{account.bill}</span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Ajustar saldo inicial
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card className="border-dashed border-border/60 bg-muted/40">
          <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
            Conecte outras instituicoes quando precisar.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
