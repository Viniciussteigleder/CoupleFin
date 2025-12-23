"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function RuleNewPage() {
  const router = useRouter();
  const { categories, transactions, createRule } = useAppStore();
  const [pattern, setPattern] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [applyPast, setApplyPast] = useState(false);

  const relatedTransactions = useMemo(() => {
    const query = pattern.trim().toLowerCase();
    if (!query) return [];
    return transactions.filter((t) => t.description.toLowerCase().includes(query));
  }, [pattern, transactions]);

  const handleSave = async () => {
    if (!pattern || !categoryId) return;
    await createRule(pattern, categoryId, { applyPast });
    router.push("/rules");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Criar regra</h1>
        <p className="text-sm text-muted-foreground">
          Sempre que aparecer uma palavra-chave, categorizar automaticamente.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="rounded-2xl border-border/60 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Palavra-chave</label>
            <Input
              placeholder="Ex: uber, aluguel"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={categoryId === cat.id ? "default" : "outline"}
                  onClick={() => setCategoryId(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
            <div>
              <p className="font-semibold">Aplicar retroativo</p>
              <p className="text-xs text-muted-foreground">
                Atualiza transações antigas com o mesmo padrão.
              </p>
            </div>
            <Switch checked={applyPast} onCheckedChange={setApplyPast} />
          </div>
          <Button onClick={handleSave} disabled={!pattern || !categoryId}>
            Salvar regra
          </Button>
        </Card>

        <Card className="rounded-2xl border-border/60 p-6 space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Impacto estimado</p>
          <p className="text-2xl font-bold text-foreground">
            {relatedTransactions.length} transações
          </p>
          <p className="text-xs text-muted-foreground">
            Baseado na palavra-chave informada.
          </p>
          <div className="space-y-2">
            {relatedTransactions.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2 text-xs"
              >
                <span className="truncate">{t.description}</span>
                <span className="text-muted-foreground">
                  {new Date(t.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
