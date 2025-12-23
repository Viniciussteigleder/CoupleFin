"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/formatCurrency";

export default function EventPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const { events, addEvent, addTransactions } = useAppStore();
  const existingEvent = events.find((event) => event.id === eventId);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"recurring" | "planned">("recurring");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (existingEvent) {
      setName(existingEvent.name);
      setAmount(existingEvent.amount ? String(existingEvent.amount) : "");
      setType(existingEvent.type);
      setFrequency(existingEvent.frequency ?? "monthly");
      setStartDate(existingEvent.startDate);
    }
  }, [existingEvent]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const newEvent = await addEvent({
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: amount ? Number(amount) : null,
      type,
      frequency,
      startDate,
    });
    if (newEvent) {
      router.push(`/calendar/event?id=${newEvent.id}`);
    }
  };

  const handleMarkPaid = async () => {
    if (!existingEvent) return;
    if (!existingEvent.amount) return;
    await addTransactions([
      {
        id: crypto.randomUUID(),
        description: existingEvent.name,
        amount: Number(existingEvent.amount) * -1,
        date: new Date().toISOString(),
        status: "confirmed",
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Detalhe do evento</h1>
        <p className="text-sm text-muted-foreground">Compromissos recorrentes e planejados.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="rounded-2xl border-border/60 p-6 space-y-4">
          {!existingEvent ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do evento</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (opcional)</label>
                <Input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={type === "recurring" ? "default" : "outline"}
                    onClick={() => setType("recurring")}
                  >
                    Recorrente
                  </Button>
                  <Button
                    type="button"
                    variant={type === "planned" ? "default" : "outline"}
                    onClick={() => setType("planned")}
                  >
                    Planejado
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequência</label>
                <Input value={frequency} onChange={(event) => setFrequency(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de início</label>
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <Button onClick={handleSave} disabled={!name.trim()}>
                Salvar evento
              </Button>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-semibold text-foreground">{existingEvent.name}</p>
                <p className="text-sm text-muted-foreground">
                  {existingEvent.type === "recurring" ? "Recorrente" : "Planejado"} · {" "}
                  {existingEvent.frequency ?? "mensal"}
                </p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {existingEvent.amount ? formatCurrency(Math.abs(existingEvent.amount)) : "--"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Editar recorrência</Button>
                <Button onClick={handleMarkPaid}>Marcar como pago</Button>
              </div>
            </>
          )}
        </Card>

        <Card className="rounded-2xl border-border/60 p-6 space-y-3">
          <p className="text-sm font-semibold">Histórico</p>
          {existingEvent ? (
            <div className="text-xs text-muted-foreground">
              Nenhum histórico disponível ainda.
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Salve um evento para acompanhar o histórico.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
