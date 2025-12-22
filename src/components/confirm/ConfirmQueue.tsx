"use client";

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

export function ConfirmQueue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeGroup, setActiveGroup] = useState<Transaction[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const duplicateGroups = useMemo(
    () => findDuplicateGroups(transactions),
    [transactions]
  );

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

  const handleConfirm = async (id: string) => {
    setMessage(null);
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ status: "confirmed" })
      .eq("id", id);
    if (error) {
      setMessage("Falha ao confirmar transacao.");
      return;
    }
    await logEvent("transaction_confirmed", { id }, id);
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

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Transacoes pendentes</CardTitle>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleConfirmAll}
              disabled={isLoading || !transactions.length}
            >
              Confirmar todas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : transactions.length ? (
            transactions.map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-2xl border border-border/60 bg-background p-4"
              >
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-semibold">{item.merchant}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.date} · R$ {Math.abs(item.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => handleConfirm(item.id)}>
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCategorize(
                          item.id,
                          categories[0]?.name ?? "Mercado"
                        )
                      }
                    >
                      Categorizar
                    </Button>
                  </div>
                </div>
                <CategoryPicker
                  value={item.category ?? undefined}
                  options={categories.map((category) => category.name)}
                  onSelect={(category) => handleCategorize(item.id, category)}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma transacao pendente.
            </p>
          )}
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
