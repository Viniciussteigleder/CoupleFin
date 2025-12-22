import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function RitualOnboardingPage() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Configuracao
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          Ritual semanal com o casal
        </h1>
        <p className="text-lg text-muted-foreground">
          Reserve 20 minutos por semana para revisar gastos e alinhar metas. Convide seu parceiro(a)
          para participar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Quinta, 20h</p>
              <p className="text-xs text-muted-foreground">Horario sugerido</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>Resumo das transacoes da semana</p>
            <p>Definicao de metas e alertas</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <p className="text-sm font-semibold text-foreground">Convite rapido</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Envie o link para o parceiro(a) acessar o painel compartilhado.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            https://couplefin.app/convite/4fd2
          </div>
          <Button className="mt-4" variant="outline">
            Copiar convite
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/onboarding/cartoes">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/importar">Proximo passo</Link>
        </Button>
      </div>
    </div>
  );
}
