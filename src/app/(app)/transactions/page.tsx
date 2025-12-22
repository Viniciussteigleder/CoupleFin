import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsView } from "@/components/transactions/TransactionsView";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Transacoes"
        subtitle="Acompanhe entradas, despesas e pendencias do casal."
      />

      <TransactionsView />
    </div>
  );
}
