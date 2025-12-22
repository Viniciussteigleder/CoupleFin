"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const checklist = [
  "Revisar pendências",
  "Ver compromissos do mês",
  "Ajustar orçamento",
  "Confirmar metas",
];

export default function MonthlyRitualPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ritual Mensal</h1>
        <p className="text-muted-foreground">
          Feche o mês e planeje o próximo com poucos passos.
        </p>
      </div>

      <Card className="rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold">Checklist do mês</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button>Iniciar fechamento</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Ver painel</Button>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 space-y-3">
        <p className="text-sm font-semibold">Resumo do mês</p>
        <p className="text-sm text-muted-foreground">
          Saldo final: € 1.320 • Metas concluídas: 2/3
        </p>
        <Button variant="outline">Copiar resumo</Button>
      </Card>
    </div>
  );
}
