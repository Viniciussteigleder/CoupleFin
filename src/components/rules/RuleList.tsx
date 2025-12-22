"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface RuleRow {
  id: string;
  keyword: string;
  apply_past: boolean;
  created_at: string;
  category_id: string | null;
  categories?: { name: string } | { name: string }[] | null;
}

export function RuleList() {
  const { data: rules = [] } = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rules")
        .select("id, keyword, apply_past, created_at, category_id, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as RuleRow[]) ?? [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras ativas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {rules.length ? (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-background p-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {`contains("${rule.keyword}")`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rule.apply_past ? "Aplicado retroativo" : "Somente novas"}
                </p>
                {rule.category_id ? (
                  <p className="text-xs text-muted-foreground">
                    Categoria:{" "}
                    {Array.isArray(rule.categories)
                      ? rule.categories[0]?.name
                      : rule.categories?.name ?? "Sem nome"}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p>Nenhuma regra criada ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
