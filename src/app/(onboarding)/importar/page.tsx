import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ImportarPage() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Configuracao
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          Primeiro import
        </h1>
        <p className="text-lg text-muted-foreground">
          Carregue um CSV para gerar suas primeiras transacoes e alimentar o painel mensal.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-background px-6 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Arraste seu CSV aqui</p>
            <p className="text-sm text-muted-foreground">Ou clique para selecionar o arquivo</p>
          </div>
          <Button>Selecionar arquivo</Button>
          <p className="text-xs text-muted-foreground">Suporta CSV, PDF, JPG, PNG</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/onboarding/ritual">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Ir para o painel</Link>
        </Button>
      </div>
    </div>
  );
}
