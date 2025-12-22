import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const accounts = [
  { name: "Conta Principal", kind: "Conta corrente", balance: "R$ 7.250" },
  { name: "Cartao Gold", kind: "Credito", balance: "R$ 1.420" },
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
            <CardContent className="space-y-2">
              <p className="text-lg font-semibold text-foreground">{account.name}</p>
              <p className="text-sm text-muted-foreground">Saldo atual</p>
              <p className="text-2xl font-bold text-foreground">{account.balance}</p>
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
