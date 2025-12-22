"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastAction } from "@/components/ui/toast";

const MAX_VISIBLE = 200;

type FilterKey = "all" | "low" | "uncategorized" | "duplicate";

export default function ConfirmQueuePage() {
  const {
    transactions,
    categories,
    accounts,
    confirmTransactions,
    markDuplicate,
    setTransactionCategory,
    reopenTransactions,
  } = useAppStore();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [lastConfirmed, setLastConfirmed] = useState<string[]>([]);

  const pendingTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.status === "pending" || t.status === undefined)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return pendingTransactions;
    if (filter === "duplicate") return transactions.filter((t) => t.status === "duplicate");
    if (filter === "uncategorized") {
      return pendingTransactions.filter((t) => !t.categoryId);
    }
    return pendingTransactions.filter((t) => !t.categoryId || t.amount <= -300);
  }, [filter, pendingTransactions, transactions]);

  const visible = filtered.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(filtered.length - visible.length, 0);

  const toggleSelect = (id: string, selected: boolean) => {
    if (selected) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleConfirmBatch = (ids: string[]) => {
    if (!ids.length) return;
    confirmTransactions(ids);
    setLastConfirmed(ids);
    setSelectedIds([]);

    toast({
      title: "Confirmado",
      description: `${ids.length} transações foram confirmadas.`,
      action: (
        <ToastAction
          altText="Desfazer"
          onClick={() => {
            reopenTransactions(ids);
          }}
        >
          Desfazer
        </ToastAction>
      ),
    });
  };

  const handleConfirmSingle = (id: string) => {
    handleConfirmBatch([id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Fila de Pendências</h1>
          <p className="text-sm text-muted-foreground">
            Revise apenas o que está incerto e confirme em lote.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/duplicates">Ver duplicatas</Link>
          </Button>
          <Button onClick={() => handleConfirmBatch(selectedIds)} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Confirmar ({selectedIds.length})
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          Todas ({pendingTransactions.length})
        </Button>
        <Button
          variant={filter === "low" ? "default" : "outline"}
          onClick={() => setFilter("low")}
          size="sm"
        >
          Baixa confiança
        </Button>
        <Button
          variant={filter === "uncategorized" ? "default" : "outline"}
          onClick={() => setFilter("uncategorized")}
          size="sm"
        >
          Sem categoria
        </Button>
        <Button
          variant={filter === "duplicate" ? "default" : "outline"}
          onClick={() => setFilter("duplicate")}
          size="sm"
        >
          Duplicatas
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
          <span>{selectedIds.length} selecionadas</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
              Limpar seleção
            </Button>
            <Button size="sm" onClick={() => handleConfirmBatch(selectedIds)}>
              Confirmar selecionadas
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-background">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[48px_120px_1.4fr_1fr_140px_140px_160px] items-center border-b border-border/60 bg-muted/30 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
            <span className="text-center">
              <Checkbox
                checked={selectedIds.length > 0 && selectedIds.length === visible.length}
                onCheckedChange={(checked) =>
                  setSelectedIds(checked ? visible.map((t) => t.id) : [])
                }
              />
            </span>
            <span>Data</span>
            <span>Descrição</span>
            <span>Categoria</span>
            <span className="text-right">Valor</span>
            <span>Conta</span>
            <span className="text-center">Confiança</span>
          </div>

          <div className="divide-y divide-border/60">
            {visible.length === 0 ? (
              <div className="px-4 py-8 text-sm text-muted-foreground">
                Nenhuma pendência neste filtro.
              </div>
            ) : (
              visible.map((t) => {
                const account = accounts.find((a) => a.id === t.accountId);
                const confidence = t.categoryId ? "Alta" : "Baixa";
                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[48px_120px_1.4fr_1fr_140px_140px_160px] items-center px-4 py-3 text-sm"
                  >
                    <span className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(t.id)}
                        onCheckedChange={(checked) => toggleSelect(t.id, Boolean(checked))}
                      />
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <button
                          className="underline"
                          onClick={() => handleConfirmSingle(t.id)}
                        >
                          Confirmar
                        </button>
                        <span>•</span>
                        <button
                          className="underline"
                          onClick={() => markDuplicate(t.id)}
                        >
                          Marcar duplicata
                        </button>
                        <span>•</span>
                        <Link className="underline" href={`/rules/new?tx=${t.id}`}>
                          Criar regra
                        </Link>
                      </div>
                    </div>
                    <Select
                      value={t.categoryId || ""}
                      onValueChange={(value) => setTransactionCategory(t.id, value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-right font-semibold text-foreground">
                      {formatCurrency(Math.abs(t.amount))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {account?.name ?? "Conta"}
                    </span>
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                      {confidence === "Alta" ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {confidence}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {hiddenCount ? (
        <p className="text-xs text-muted-foreground">
          {hiddenCount} itens ocultos para manter a performance.
        </p>
      ) : null}

      {lastConfirmed.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          Dica: crie regras para reduzir a fila de revisão nas próximas importações.
        </div>
      )}
    </div>
  );
}
