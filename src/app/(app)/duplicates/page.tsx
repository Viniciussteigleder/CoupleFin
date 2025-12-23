"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";

export default function DuplicatesPage() {
  const { transactions, confirmTransactions, markDuplicate } = useAppStore();

  const pairs = useMemo(() => {
    const duplicates = transactions.filter((t) => t.status === "duplicate");
    return duplicates.map((dup) => {
      const match = transactions.find(
        (t) =>
          t.id !== dup.id &&
          t.description === dup.description &&
          Math.abs(t.amount) === Math.abs(dup.amount)
      );
      return { left: dup, right: match ?? dup };
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Comparar duplicatas</h1>
        <p className="text-sm text-muted-foreground">
          Encontramos transações parecidas para evitar contagem dupla.
        </p>
      </div>

      {pairs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          Nenhuma duplicata detectada.
        </div>
      ) : (
        pairs.map((pair) => (
          <div key={pair.left.id} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-4 md:grid-cols-2">
              {[pair.left, pair.right].map((item, index) => (
                <div
                  key={item.id + index}
                  className="rounded-2xl border border-border/60 bg-background p-4"
                >
                  <p className="text-xs text-muted-foreground">Transação {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {item.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="mt-4 text-2xl font-bold text-foreground">
                    {formatCurrency(Math.abs(item.amount))}
                  </p>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p>Conta: {item.accountId ?? "Conta principal"}</p>
                    <p>Status: {item.status ?? "pendente"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Diferenças</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Conta de origem</li>
                  <li>Descrição normalizada</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => confirmTransactions([pair.left.id])}
                  variant="outline"
                >
                  Não é duplicata
                </Button>
                <Button onClick={() => markDuplicate(pair.left.id)}>
                  Confirmar duplicata
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
