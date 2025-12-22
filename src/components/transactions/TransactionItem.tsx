import { Transaction } from "@/types/transactions";
import { cn } from "@/lib/utils";
import { useTransactionStore } from "@/lib/store/useTransactionStore";

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const select = useTransactionStore((state) => state.select);
  const amountClass = transaction.amount < 0 ? "text-red-500" : "text-emerald-600";

  return (
    <button
      type="button"
      onClick={() => select(transaction.id)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 text-left transition hover:border-primary/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {transaction.merchant}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {transaction.date} · {transaction.category ?? "Sem categoria"}
        </p>
      </div>
      <div className={cn("text-sm font-semibold", amountClass)}>
        {transaction.amount < 0 ? "-" : "+"}R$ {Math.abs(transaction.amount).toFixed(2)}
      </div>
    </button>
  );
}
