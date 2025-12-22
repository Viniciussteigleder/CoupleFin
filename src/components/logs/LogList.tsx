"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const typeFilters = ["all", "import", "rule", "confirm", "ritual"] as const;

type FilterType = (typeof typeFilters)[number];

const filterMatchers: Record<Exclude<FilterType, "all">, (type: string) => boolean> = {
  import: (type) => type.startsWith("import"),
  rule: (type) => type.startsWith("rule"),
  confirm: (type) =>
    type.includes("confirm") || type.includes("duplicate") || type.includes("categor"),
  ritual: (type) => type.startsWith("ritual"),
};

export function LogList() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const { data = [] } = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transaction_events")
        .select("id, type, created_at, payload_json")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchesQuery = query
        ? item.type.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesFilter =
        filter === "all" ? true : filterMatchers[filter](item.type);
      return matchesQuery && matchesFilter;
    });
  }, [data, filter, query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tipo ou palavra-chave"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filter === type ? "default" : "outline"}
                onClick={() => setFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          {filtered.length ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-background p-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  {item.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p>Nenhum evento registrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
