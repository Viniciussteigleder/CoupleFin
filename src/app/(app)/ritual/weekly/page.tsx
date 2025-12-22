"use client";

import { useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WeeklyRitualPage() {
  const router = useRouter();
  const { transactions } = useAppStore();

  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const duplicateCount = transactions.filter((t) => t.status === "duplicate").length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ritual Semanal</h1>
        <p className="text-muted-foreground">
          Resolva pendências e combine o foco da semana em 5 minutos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Pendências</p>
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Itens aguardando categoria.</p>
        </Card>
        <Card className="rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Duplicatas</p>
          <p className="text-2xl font-bold">{duplicateCount}</p>
          <p className="text-xs text-muted-foreground">Revisões rápidas.</p>
        </Card>
        <Card className="rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Compromissos</p>
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-muted-foreground">Vencimentos próximos.</p>
        </Card>
      </div>

      <Card className="rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold">Resolver tudo em 5 minutos</p>
        <p className="text-sm text-muted-foreground">
          Revisar pendências, duplicatas e próximos compromissos em um fluxo único.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/confirm-queue")}>Ir para pendências</Button>
          <Button variant="outline" onClick={() => router.push("/duplicates")}>Ver duplicatas</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Ver painel</Button>
        </div>
      </Card>
    </div>
  );
}
