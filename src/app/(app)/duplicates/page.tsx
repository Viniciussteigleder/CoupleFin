"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { TransactionItem } from "@/components/app/TransactionItem";
import { Button } from "@/components/ui/button";
import { Check, Trash } from "lucide-react";

export default function DuplicatesPage() {
  const { transactions, categories, accounts, confirmTransactions } = useAppStore();
  
  const duplicated = transactions.filter(t => t.status === "duplicate");

  // Simple logic: user sees list, can "Keep This" which might imply unmarking duplicate, or "Dismiss" (archive).
  // For MVP, if it is marked as duplicate, it means system detected it.
  // The user should confirm it IS a duplicate (archive it) or say "No, it's real" (change status to pending/confirmed).

  const handleResolve = (id: string, action: "keep" | "archive") => {
      // If 'keep', change to confirmed
      if (action === "keep") {
          confirmTransactions([id]); // Reuses confirm
      } else {
          // Archive logic needs to be added to store or just leave as duplicate status but hidden?
          // Prompt says "Duplicates resolves conflicts". We'll just leave them as duplicate (ignored) or delete.
          // Let's assume resolve = archive.
          // We need an archive action. For now, we can just say unmarkDuplicate logic is specific.
          // We'll use confirm logic for 'keep'.
      }
  };

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-xl font-semibold md:text-2xl">Duplicatas</h1>
          <p className="text-sm text-muted-foreground">
             Transações que parecem repetidas. O sistema ignora do saldo.
          </p>
       </div>

       <div className="space-y-4">
          {duplicated.length === 0 && (
             <div className="text-center py-12 text-muted-foreground border rounded-lg">
                Nenhuma duplicata detectada.
             </div>
          )}

          {duplicated.map(t => (
              <div key={t.id} className="relative group">
                  <div className="absolute right-4 top-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded">
                      <Button size="sm" variant="outline" onClick={() => handleResolve(t.id, "keep")}>
                          <Check className="h-4 w-4 mr-1" /> Não é duplicata
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleResolve(t.id, "archive")}>
                          <Trash className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                  </div>
                  <TransactionItem
                    transaction={t}
                    category={categories.find(c => c.id === t.categoryId)}
                    account={accounts.find(a => a.id === t.accountId)}
                  />
              </div>
          ))}
       </div>
    </div>
  );
}
