"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CalendarEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Detalhe do evento</h1>
        <p className="text-sm text-muted-foreground">Compromissos recorrentes e planejados.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="rounded-2xl border-border/60 p-6 space-y-4">
          <div>
            <p className="text-lg font-semibold text-foreground">Aluguel</p>
            <p className="text-sm text-muted-foreground">Todo dia 5 · Recorrente</p>
          </div>
          <p className="text-2xl font-bold text-foreground">€ 1.500,00</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Editar recorrência</Button>
            <Button>Marcar como pago</Button>
          </div>
        </Card>

        <Card className="rounded-2xl border-border/60 p-6 space-y-3">
          <p className="text-sm font-semibold">Histórico</p>
          {[
            { label: "Novembro", value: "€ 1.500" },
            { label: "Outubro", value: "€ 1.480" },
            { label: "Setembro", value: "€ 1.520" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2 text-xs"
            >
              <span>{item.label}</span>
              <span className="font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-700">
            Tendência estável nos últimos meses.
          </div>
        </Card>
      </div>
    </div>
  );
}
