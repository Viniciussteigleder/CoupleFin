"use client";

import Link from "next/link";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RulesPage() {
  const { rules, categories } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Regras</h1>
          <p className="text-sm text-muted-foreground">
            Automatize categorias com palavras-chave.
          </p>
        </div>
        <Button asChild>
          <Link href="/rules/new">Nova regra</Link>
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          Nenhuma regra criada ainda.
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => {
            const category = categories.find((c) => c.id === rule.categoryId);
            return (
              <Card key={rule.id} className="rounded-2xl border-border/60 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Sempre que aparecer &quot;{rule.pattern}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Categoria: {category?.name ?? "Sem categoria"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold">
                      Prioridade: {rule.priority}
                    </span>
                    <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold">
                      {rule.applyPast ? "Retroativo" : "Somente novas"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">Editar</Button>
                  <Button size="sm" variant="ghost">Desativar</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
