"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const typeFilters = ["all", "import", "rule", "confirm", "ritual"] as const;
const dateRanges = ["all", "7d", "30d"] as const;
const people = ["todos", "Ana", "Joao", "Sistema"] as const;

type FilterType = (typeof typeFilters)[number];
type DateRange = (typeof dateRanges)[number];
type PersonFilter = (typeof people)[number];

const filterMatchers: Record<Exclude<FilterType, "all">, (type: string) => boolean> = {
  import: (type) => type.startsWith("import"),
  rule: (type) => type.startsWith("rule"),
  confirm: (type) =>
    type.includes("confirm") || type.includes("duplicate") || type.includes("categor"),
  ritual: (type) => type.startsWith("ritual"),
};

function resolvePerson(payload: unknown) {
  if (payload && typeof payload === "object" && "actor" in payload) {
    const actor = (payload as { actor?: string }).actor;
    if (actor) return actor;
  }
  return "Sistema";
}

export function LogList() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [range, setRange] = useState<DateRange>("all");
  const [person, setPerson] = useState<PersonFilter>("todos");

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
    const since =
      range === "all"
        ? null
        : new Date(Date.now() - Number(range.replace("d", "")) * 24 * 60 * 60 * 1000);

    return data.filter((item) => {
      const matchesQuery = query
        ? item.type.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesFilter =
        filter === "all" ? true : filterMatchers[filter](item.type);
      const matchesRange = since
        ? new Date(item.created_at).getTime() >= since.getTime()
        : true;
      const actor = resolvePerson(item.payload_json);
      const matchesPerson = person === "todos" ? true : actor === person;
      return matchesQuery && matchesFilter && matchesRange && matchesPerson;
    });
  }, [data, filter, query, range, person]);

  return (
    <Card className="border-border/60 shadow-soft">
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
            {dateRanges.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={range === value ? "default" : "outline"}
                onClick={() => setRange(value)}
              >
                {value === "all" ? "todos" : value}
              </Button>
            ))}
            {people.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={person === item ? "secondary" : "outline"}
                onClick={() => setPerson(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[180px_140px_120px_1fr] border-b border-border/60 bg-muted/30 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
              <span>Data</span>
              <span>Tipo</span>
              <span>Pessoa</span>
              <span>Detalhes</span>
            </div>
            <div className="divide-y divide-border/60 text-sm text-muted-foreground">
              {filtered.length ? (
                filtered.map((item) => {
                  const actor = resolvePerson(item.payload_json);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[180px_140px_120px_1fr] items-start px-4 py-3"
                    >
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                      <span className="font-semibold text-foreground">{item.type}</span>
                      <span>{actor}</span>
                      {item.payload_json ? (
                        <pre className="max-h-32 overflow-auto rounded-xl bg-muted/40 p-2 text-[11px] text-muted-foreground">
                          {JSON.stringify(item.payload_json, null, 2)}
                        </pre>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  Nenhum evento registrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
