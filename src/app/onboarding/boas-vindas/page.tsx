import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function BoasVindasPage() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-10">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Configuracao
        </div>
        <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground">
          Bem-vindos ao Budget Coach
        </h1>
        <p className="text-lg text-muted-foreground">
          Vamos configurar o espaco financeiro do casal em poucos passos. Ao final, voces ja podem
          importar transacoes e acompanhar o painel mensal.
        </p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Checklist do onboarding</h2>
            <p className="text-sm text-muted-foreground">
              Categorias, orcamentos, cartoes e o primeiro ritual.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
            Personalizacao simples, sem planilhas complicadas.
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">group</span>
            Convite rapido para o parceiro(a) acompanhar.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/login">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/categorias">Comecar configuracao</Link>
        </Button>
      </div>
    </div>
  );
}
