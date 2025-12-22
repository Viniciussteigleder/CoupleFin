"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { TransactionDetailsSheet } from "@/components/transactions/TransactionDetailsSheet";
import { fetchTransactions } from "@/lib/queries/transactions";

export function TransactionsView() {
  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchTransactions(),
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de transacoes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : transactions.length ? (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma transacao registrada.
            </p>
          )}
        </CardContent>
      </Card>

      <TransactionDetailsSheet transactions={transactions} onRefresh={refetch} />
    </>
  );
}
