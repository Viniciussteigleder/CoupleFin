"use client";

import { useParams, useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { transactions, categories, accounts } = useAppStore();
  const transaction = transactions.find((t) => t.id === params.id);

  if (!transaction) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Transação não encontrada</h1>
        <Button onClick={() => router.push("/transactions")}>Voltar</Button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === transaction.categoryId);
  const account = accounts.find((a) => a.id === transaction.accountId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Detalhe da transação</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste categoria, regra e evidências.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="rounded-2xl border-border/60 p-6">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-foreground">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString("pt-BR")} • {account?.name ?? "Conta principal"}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Categoria</span>
              <span className="font-semibold text-foreground">
                {category?.name ?? "Sem categoria"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Origem</span>
              <span className="font-semibold text-foreground">
                {transaction.source_upload_id ? "Importação" : "Manual"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-foreground">{transaction.status ?? "pendente"}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline">Editar categoria</Button>
            <Button variant="outline" onClick={() => router.push(`/rules/new?tx=${transaction.id}`)}>
              Criar regra
            </Button>
            <Button>Aplicar a anteriores</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border/60 p-6">
            <p className="text-sm font-semibold">Evidências</p>
            <p className="mt-2 text-xs text-muted-foreground">
              CSV: linha 42 • Confiança alta
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
              Prévia do recibo ou linha do CSV.
            </div>
          </Card>
          <Card className="rounded-2xl border-border/60 p-6">
            <p className="text-sm font-semibold">Transações semelhantes</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Encontramos 2 registros similares neste mês.
            </p>
            <Button variant="outline" className="mt-4">
              Aplicar categoria em lote
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
