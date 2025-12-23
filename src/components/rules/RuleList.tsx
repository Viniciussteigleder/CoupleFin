"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const priorityLabel = useMemo(() => {
    return (index: number) => (index === 0 ? "Alta" : index < 3 ? "Media" : "Baixa");
  }, []);

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle>Regras ativas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {rules.length ? (
          rules.map((rule, index) => (
            <div
              key={rule.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {`contains("${rule.keyword}")`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rule.apply_past ? "Aplicado retroativo" : "Somente novas"}
                  </p>
                  {rule.category_id ? (
                    <p className="text-xs text-muted-foreground">
                      Categoria: {" "}
                      {Array.isArray(rule.categories)
                        ? rule.categories[0]?.name
                        : rule.categories?.name ?? "Sem nome"}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost">
                    Desativar
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                  Prioridade: {priorityLabel(index)}
                </span>
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                  Impacto: {rule.apply_past ? "Historico + novo" : "Novas"}
                </span>
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                  Status: Ativa
                </span>
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
