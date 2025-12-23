"use client";

import { useMemo, useState } from "react";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const people = ["Todos", "Sistema"];

export default function AuditPage() {
  const { auditLogs } = useAppStore();
  const [query, setQuery] = useState("");
  const [person, setPerson] = useState("Todos");

  const filtered = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesQuery = query
        ? log.action.toLowerCase().includes(query.toLowerCase()) ||
          (log.details ?? "").toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesPerson = person === "Todos" ? true : log.actor === person;
      return matchesQuery && matchesPerson;
    });
  }, [auditLogs, person, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Logs de Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Veja quem mudou o quê e quando.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar por ação ou detalhe"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {people.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={person === item ? "default" : "outline"}
              onClick={() => setPerson(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      <Card className="rounded-2xl border-border/60 p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhum evento registrado.
          </div>
        ) : (
          <div className="divide-y divide-border/60 text-sm">
            {filtered.map((log) => (
              <div key={log.id} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{log.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{log.actor} • {log.entity}</p>
                {log.details ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {log.details}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
