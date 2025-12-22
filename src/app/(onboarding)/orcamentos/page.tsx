import Link from "next/link";

import { Button } from "@/components/ui/button";

const budgets = [
  { name: "Moradia", amount: "R$ 1.800", hint: "Aluguel, contas fixas" },
  { name: "Supermercado", amount: "R$ 900", hint: "Compras mensais" },
  { name: "Transporte", amount: "R$ 450", hint: "Combustivel e apps" },
];

export default function OrcamentosPage() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Configuracao
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          Defina orcamentos por categoria
        </h1>
        <p className="text-lg text-muted-foreground">
          Sugestoes iniciais para manter o casal alinhado. Ajuste depois se precisar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => (
          <div
            key={budget.name}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{budget.name}</p>
                <p className="text-xs text-muted-foreground">{budget.hint}</p>
              </div>
              <span className="text-lg font-bold text-foreground">{budget.amount}</span>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-2/3 rounded-full bg-primary" />
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-dashed border-border/60 bg-background p-6 text-sm text-muted-foreground">
          Adicione novas categorias depois do onboarding.
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/onboarding/categorias">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/cartoes">Proximo passo</Link>
        </Button>
      </div>
    </div>
  );
}
