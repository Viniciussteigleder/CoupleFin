"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryPicker } from "@/components/transactions/CategoryPicker";
import { DuplicateMergeDialog } from "@/components/confirm/DuplicateMergeDialog";
import { Transaction } from "@/types/transactions";
import { createClient } from "@/lib/supabase/client";
import { fetchCategories } from "@/lib/queries/categories";
import { fetchTransactions } from "@/lib/queries/transactions";
import { findDuplicateGroups } from "@/lib/utils/dedupe";

const confidenceLabels = {
  high: "Alta",
  medium: "Media",
  low: "Baixa",
  unknown: "Desconhecido",
} as const;

type Confidence = keyof typeof confidenceLabels;

type FilterKey = "all" | "duplicates" | Confidence;

type UndoState = {
  ids: string[];
  label: string;
};

function getConfidence(transaction: Transaction): Confidence {
  if (!transaction.merchant || transaction.merchant === "Sem descricao") {
    return "unknown";
  }
  if (!transaction.category) return "low";
  if (transaction.category.length <= 4) return "medium";
  return "high";
}

export function ConfirmQueue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeGroup, setActiveGroup] = useState<Transaction[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: pendingTransactions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["transactions", "pending"],
    queryFn: () => fetchTransactions({ status: "pending" }),
  });

  useEffect(() => {
    setTransactions(pendingTransactions);
  }, [pendingTransactions]);

  const dedupeEnabled = transactions.length <= 400;

  const duplicateGroups = useMemo(
    () => (dedupeEnabled ? findDuplicateGroups(transactions) : []),
    [transactions, dedupeEnabled]
  );

  const duplicateIds = useMemo(() => {
    const ids = new Set<string>();
    duplicateGroups.forEach((group) => {
      group.forEach((item) => ids.add(item.id));
    });
    return ids;
  }, [duplicateGroups]);

  const counts = useMemo(() => {
    const summary: Record<Confidence, number> = {
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
    };
    transactions.forEach((transaction) => {
      const confidence = getConfidence(transaction);
      summary[confidence] += 1;
    });
    return summary;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    if (filter === "duplicates") {
      return transactions.filter((transaction) => duplicateIds.has(transaction.id));
    }
    return transactions.filter(
      (transaction) => getConfidence(transaction) === filter
    );
  }, [transactions, filter, duplicateIds]);

  const maxVisible = 200;
  const visibleTransactions = filteredTransactions.slice(0, maxVisible);
  const hiddenCount = Math.max(filteredTransactions.length - visibleTransactions.length, 0);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => filteredTransactions.some((item) => item.id === id))
    );
  }, [filteredTransactions]);

  useEffect(() => {
    if (!undo) return;
    const timeout = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [undo]);

  const logEvent = async (
    type: string,
    payload: Record<string, unknown>,
    entityId?: string | null
  ) => {
    const supabase = createClient();
    await supabase.from("transaction_events").insert({
      type,
      entity_id: entityId ?? null,
      payload_json: payload,
    });
  };

  const handleConfirmSelected = async () => {
    if (!selectedIds.length) return;
    setMessage(null);
    const ids = [...selectedIds];
    setTransactions((prev) => prev.filter((item) => !ids.includes(item.id)));
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ status: "confirmed" })
      .in("id", ids);
    if (error) {
      setMessage("Falha ao confirmar selecionadas.");
      return;
    }
    await supabase.from("transaction_events").insert(
      ids.map((id) => ({
        type: "transaction_confirmed",
        entity_id: id,
        payload_json: { id },
      }))
    );
    setUndo({ ids, label: `${ids.length} transacoes confirmadas` });
    setSelectedIds([]);
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleConfirmAll = async () => {
    if (!transactions.length) return;
    setMessage(null);
    const ids = transactions.map((item) => item.id);
    setTransactions([]);
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ status: "confirmed" })
      .in("id", ids);
    if (error) {
      setMessage("Falha ao confirmar todas.");
      return;
    }
    await supabase.from("transaction_events").insert(
      ids.map((id) => ({
        type: "transaction_confirmed",
        entity_id: id,
        payload_json: { id },
      }))
    );
    setUndo({ ids, label: `${ids.length} transacoes confirmadas` });
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleUndo = async () => {
    if (!undo) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ status: "pending" })
      .in("id", undo.ids);
    if (!error) {
      await supabase.from("transaction_events").insert(
        undo.ids.map((id) => ({
          type: "transaction_confirm_undo",
          entity_id: id,
          payload_json: { id },
        }))
      );
    }
    setUndo(null);
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleCategorize = async (id: string, categoryName: string) => {
    setMessage(null);
    const category = categories.find((item) => item.name === categoryName);
    if (!category) return;
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, category: category.name, categoryId: category.id }
          : item
      )
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ category_id: category.id })
      .eq("id", id);
    if (error) {
      setMessage("Falha ao categorizar transacao.");
      return;
    }
    await logEvent(
      "transaction_categorized",
      { id, category: category.name },
      id
    );
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleMerge = async () => {
    if (!activeGroup?.length) return;
    const [primary, ...duplicates] = activeGroup;
    setMessage(null);
    setTransactions((prev) =>
      prev.filter((item) => !duplicates.find((dup) => dup.id === item.id))
    );
    const supabase = createClient();
    const duplicateIds = duplicates.map((dup) => dup.id);
    const { error } = await supabase
      .from("transactions")
      .update({ status: "duplicate" })
      .in("id", duplicateIds);
    if (error) {
      setMessage("Falha ao mesclar duplicatas.");
      return;
    }
    await supabase
      .from("transactions")
      .update({ status: "confirmed" })
      .eq("id", primary.id);
    await logEvent("duplicates_merged", {
      primaryId: primary.id,
      mergedIds: duplicateIds,
    });
    setActiveGroup(null);
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleKeepSeparate = async () => {
    if (!activeGroup?.length) return;
    setMessage(null);
    await logEvent("duplicates_kept", {
      ids: activeGroup.map((item) => item.id),
    });
    setActiveGroup(null);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allSelected =
    filteredTransactions.length > 0 &&
    selectedIds.length === filteredTransactions.length;

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Transacoes pendentes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Revise transacoes e aplique categorias com um clique.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/confirmar/duplicatas">Ver duplicatas</Link>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleConfirmAll}
                disabled={isLoading || !transactions.length}
              >
                Confirmar todas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {([
              { key: "duplicates", label: `Duplicatas (${duplicateIds.size})`, tone: "orange" },
              {
                key: "low",
                label: `Baixa (${counts.low})`,
                tone: "red",
              },
              {
                key: "unknown",
                label: `Desconhecido (${counts.unknown})`,
                tone: "slate",
              },
              {
                key: "medium",
                label: `Media (${counts.medium})`,
                tone: "amber",
              },
              { key: "high", label: `Alta (${counts.high})`, tone: "emerald" },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  filter === item.key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 bg-background text-muted-foreground"
                } ${
                  item.tone === "orange"
                    ? "text-orange-700"
                    : item.tone === "red"
                    ? "text-red-600"
                    : item.tone === "amber"
                    ? "text-amber-600"
                    : item.tone === "emerald"
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                filter === "all"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 bg-background text-muted-foreground"
              }`}
            >
              Ver todas
            </button>
          </div>

          {selectedIds.length ? (
            <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/40 bg-emerald-900/95 px-4 py-3 text-sm text-white shadow-soft md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
                  {selectedIds.length}
                </div>
                <span>{selectedIds.length} transacoes selecionadas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" className="text-white">
                  Excluir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white"
                >
                  Categorizar
                </Button>
                <Button size="sm" onClick={handleConfirmSelected}>
                  Confirmar selecionadas
                </Button>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-background">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[48px_120px_1.4fr_1fr_120px_120px_140px] items-center border-b border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds(filteredTransactions.map((item) => item.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </div>
                <span>Data</span>
                <span>Descricao original</span>
                <span>Categoria</span>
                <span className="text-right">Valor</span>
                <span>Tipo</span>
                <span className="text-center">Confianca</span>
              </div>

              <div className="divide-y divide-border/60">
                {isLoading ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    Carregando...
                  </div>
                ) : visibleTransactions.length ? (
                  visibleTransactions.map((item) => {
                    const confidence = getConfidence(item);
                    const confidenceTone =
                      confidence === "high"
                        ? "text-emerald-600"
                        : confidence === "medium"
                        ? "text-amber-600"
                        : confidence === "low"
                        ? "text-red-500"
                        : "text-muted-foreground";

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[48px_120px_1.4fr_1fr_120px_120px_140px] items-center px-3 py-3 text-sm"
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelected(item.id)}
                          />
                        </div>
                        <span className="text-muted-foreground">{item.date}</span>
                        <div>
                          <p className="font-semibold text-foreground">
                            {item.merchant}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.account ?? "Conta principal"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <CategoryPicker
                            value={item.category ?? undefined}
                            options={categories.map((category) => category.name)}
                            onSelect={(category) => handleCategorize(item.id, category)}
                          />
                        </div>
                        <span
                          className={`text-right font-semibold ${
                            item.amount < 0 ? "text-rose-500" : "text-emerald-600"
                          }`}
                        >
                          {item.amount < 0 ? "-" : "+"}R$ {Math.abs(item.amount).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">Variavel</span>
                        <div className="flex items-center justify-center">
                          <span className={`text-xs font-semibold ${confidenceTone}`}>
                            {confidenceLabels[confidence]}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    Nenhuma transacao pendente.
                  </div>
                )}
              </div>
            </div>
          </div>

          {hiddenCount ? (
            <p className="text-xs text-muted-foreground">
              {hiddenCount} transacoes ocultas para manter a performance da lista.
            </p>
          ) : null}

          {!dedupeEnabled ? (
            <p className="text-xs text-muted-foreground">
              Muitas transacoes pendentes. A deteccao de duplicatas foi pausada para
              manter a tela leve.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {message ? <p className="text-sm text-red-500">{message}</p> : null}

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Duplicatas detectadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {duplicateGroups.length ? (
            duplicateGroups.map((group) => (
              <div
                key={group.map((item) => item.id).join("-")}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{group[0].merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.length} entradas parecidas
                  </p>
                </div>
                <Button size="sm" onClick={() => setActiveGroup(group)}>
                  Revisar
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma duplicata encontrada.
            </p>
          )}
        </CardContent>
      </Card>

      {undo ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-border/60 bg-background px-4 py-2 text-sm shadow-soft">
          <span>{undo.label}</span>
          <Button size="sm" variant="ghost" onClick={handleUndo}>
            Desfazer
          </Button>
        </div>
      ) : null}

      <DuplicateMergeDialog
        open={!!activeGroup}
        group={activeGroup ?? []}
        onOpenChange={(open) => (!open ? setActiveGroup(null) : null)}
        onMerge={handleMerge}
        onKeepSeparate={handleKeepSeparate}
      />
    </div>
  );
}
