"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { TransactionItem } from "@/components/app/TransactionItem";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function TransactionsPage() {
  const { transactions, categories, accounts } = useAppStore();
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions
    .filter(t => t.status !== "archived")
    .filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return t.description.toLowerCase().includes(q) || 
               t.amount.toString().includes(q) ||
               (t.merchant || "").toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-xl font-semibold md:text-2xl">Transações</h1>
         </div>
         <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Buscar..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
         </div>
      </div>

      <div className="space-y-3">
         {filteredTransactions.map(t => (
             <TransactionItem
                key={t.id}
                transaction={t}
                category={categories.find(c => c.id === t.categoryId)}
                account={accounts.find(a => a.id === t.accountId)}
                // No checkbox/actions for read-only view in MVP default
             />
         ))}
      </div>
    </div>
  );
}
