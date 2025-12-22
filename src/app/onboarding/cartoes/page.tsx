import Link from "next/link";

import { Button } from "@/components/ui/button";

const cards = [
  { name: "Conta Principal", description: "Banco do casal", last: "2345" },
  { name: "Cartao Gold", description: "Milhas e viagens", last: "7340" },
];

export default function CartoesPage() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Configuracao
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          Conecte suas contas e cartoes
        </h1>
        <p className="text-lg text-muted-foreground">
          Vamos acompanhar gastos automaticos. Voce pode adicionar mais contas depois.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.last} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{card.name}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                **** {card.last}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Atualizacao diaria</span>
              <span className="text-primary">Ativo</span>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-dashed border-border/60 bg-background p-6 text-sm text-muted-foreground">
          Conecte outras contas depois da configuracao inicial.
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/onboarding/orcamentos">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/ritual">Proximo passo</Link>
        </Button>
      </div>
    </div>
  );
}
