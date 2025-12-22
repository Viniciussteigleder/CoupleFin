"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/transactions/CategoryPicker";
import { useTransactionStore } from "@/lib/store/useTransactionStore";
import { createClient } from "@/lib/supabase/client";
import { fetchCategories } from "@/lib/queries/categories";
import { Transaction } from "@/types/transactions";

export function TransactionDetailsSheet({
  transactions,
  onRefresh,
}: {
  transactions: Transaction[];
  onRefresh?: () => void;
}) {
  const selectedId = useTransactionStore((state) => state.selectedId);
  const clear = useTransactionStore((state) => state.clear);
  const [message, setMessage] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const transaction = transactions.find((item) => item.id === selectedId);

  const handleUpdate = async (updates: Record<string, unknown>, type: string) => {
    if (!transaction) return;
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", transaction.id);
    if (!error) {
      await supabase.from("transaction_events").insert({
        type,
        entity_id: transaction.id,
        payload_json: updates,
      });
      onRefresh?.();
    } else {
      setMessage("Nao foi possivel atualizar a transacao.");
    }
  };

  const handleCategory = async (categoryName: string) => {
    const category = categories.find((item) => item.name === categoryName);
    if (!category) return;
    await handleUpdate(
      { category_id: category.id },
      "transaction_categorized"
    );
  };

  const handleConfirm = async () => {
    await handleUpdate({ status: "confirmed" }, "transaction_confirmed");
    clear();
  };

  const handleDuplicate = async () => {
    await handleUpdate({ status: "duplicate" }, "transaction_marked_duplicate");
    clear();
  };

  return (
    <Dialog open={!!transaction} onOpenChange={(open) => (!open ? clear() : null)}>
      <DialogContent>
        {transaction ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Detalhe da transacao</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{transaction.merchant}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.date} · {transaction.account ?? "Conta principal"}
              </p>
              <p className="text-xl font-semibold text-foreground">
                {transaction.amount < 0 ? "-" : "+"}R$ {Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Categoria</p>
              <CategoryPicker
                value={transaction.category ?? undefined}
                options={categories.map((item) => item.name)}
                onSelect={handleCategory}
              />
            </div>
            {message ? (
              <p className="text-sm text-red-500">{message}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleConfirm}>
                Confirmar
              </Button>
              <Button size="sm" variant="outline" onClick={handleDuplicate}>
                Marcar duplicata
              </Button>
              <Button size="sm" variant="ghost">
                Editar
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
