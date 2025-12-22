import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Transacoes"
        subtitle="Acompanhe entradas, despesas e pendencias do casal."
        action={<Button variant="outline">Adicionar manual</Button>}
      />

      <TransactionsView />
    </div>
  );
}
