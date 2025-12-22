"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function DashboardAlerts() {
  const { data: transactionStats } = useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("status");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: rulesCount = 0 } = useQuery({
    queryKey: ["rules", "count"],
    queryFn: async () => {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("rules")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const pendingCount =
    transactionStats?.filter((row) => row.status === "pending").length ?? 0;
  const duplicateCount =
    transactionStats?.filter((row) => row.status === "duplicate").length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {pendingCount ? (
          <p>{pendingCount} transacoes aguardando confirmacao.</p>
        ) : (
          <p>Nenhuma pendencia no momento.</p>
        )}
        {duplicateCount ? (
          <p>{duplicateCount} duplicatas aguardando revisao.</p>
        ) : null}
        {rulesCount ? (
          <p>{rulesCount} regras ativas no motor de categorias.</p>
        ) : (
          <p>Nenhuma regra cadastrada ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
