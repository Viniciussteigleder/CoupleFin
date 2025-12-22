"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { TransactionItem } from "@/components/app/TransactionItem";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ConfirmQueuePage() {
  const { transactions, categories, accounts, confirmTransactions } = useAppStore();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const pendingTransactions = transactions
    .filter(t => t.status === "pending" || t.status === undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleSelect = (id: string, selected: boolean) => {
      if (selected) setSelectedIds([...selectedIds, id]);
      else setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const handleConfirmBatch = () => {
      confirmTransactions(selectedIds);
      toast({
          title: "Confirmado!",
          description: `${selectedIds.length} transações foram confirmadas.`
      });
      setSelectedIds([]);
  };

  const handleConfirmSingle = (id: string) => {
      confirmTransactions([id]);
      toast({ title: "Confirmado!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-xl font-semibold md:text-2xl">Fila de Pendências</h1>
            <p className="text-sm text-muted-foreground">
                Revise e confirme as transações importadas.
            </p>
         </div>
         {selectedIds.length > 0 && (
             <Button onClick={handleConfirmBatch} className="gap-2">
                 <CheckCircle2 className="h-4 w-4" />
                 Confirmar ({selectedIds.length})
             </Button>
         )}
      </div>

      <div className="space-y-3">
         {pendingTransactions.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card">
                 <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                     <CheckCircle2 className="h-6 w-6" />
                 </div>
                 <h3 className="font-semibold">Tudo limpo!</h3>
                 <p className="text-sm text-muted-foreground">Não há pendências para revisar.</p>
             </div>
         )}

         {pendingTransactions.map(t => (
             <TransactionItem
                key={t.id}
                transaction={t}
                category={categories.find(c => c.id === t.categoryId)}
                account={accounts.find(a => a.id === t.accountId)}
                showCheckbox
                selected={selectedIds.includes(t.id)}
                onSelect={toggleSelect}
                onAction={(action) => {
                    if (action === "confirm") handleConfirmSingle(t.id);
                    // Edit logic implemented later/via dialog
                }}
             />
         ))}
      </div>
    </div>
  );
}
