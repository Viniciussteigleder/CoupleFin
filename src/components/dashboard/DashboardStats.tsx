"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function DashboardStats() {
  const { data } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("amount_cf, status");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categoryCount = 0 } = useQuery({
    queryKey: ["categories", "count"],
    queryFn: async () => {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const total = data?.reduce((sum, row) => sum + Number(row.amount_cf), 0) ?? 0;
  const pending = data?.filter((row) => row.status === "pending").length ?? 0;

  const stats = [
    { label: "Saldo do mes", value: `R$ ${total.toFixed(2)}` },
    { label: "Pendencias", value: `${pending} itens` },
    { label: "Categorias ativas", value: `${categoryCount}` },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">
              {item.value}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Dados atualizados em tempo real.
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
