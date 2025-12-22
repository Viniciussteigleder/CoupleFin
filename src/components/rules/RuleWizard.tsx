"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface ImpactRow {
  id: string;
  merchant: string | null;
  date: string;
  amount_cf: number | string | null;
}

export function RuleWizard() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [applyPast, setApplyPast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const keywordValue = keyword.trim();
  const keywordLabel = keywordValue || "palavra-chave";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: impactPreview, isFetching: impactLoading } = useQuery({
    queryKey: ["rules", "impact", keywordValue],
    enabled: keywordValue.length >= 2,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error, count } = await supabase
        .from("transactions")
        .select("id, merchant, date, amount_cf", { count: "exact" })
        .ilike("merchant", `%${keywordValue}%`)
        .limit(5);
      if (error) throw error;
      return {
        count: count ?? 0,
        rows: (data as ImpactRow[]) ?? [],
      };
    },
  });

  const sampleRows = useMemo(() => impactPreview?.rows ?? [], [impactPreview]);
  const impactCount = impactPreview?.count ?? 0;

  const handleSave = async () => {
    if (!keywordValue) return;
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rules")
        .insert({
          keyword: keywordValue,
          category_id: categoryId,
          apply_past: applyPast,
          type: "contains",
        })
        .select("id");

      if (error) throw error;

      await supabase.from("transaction_events").insert({
        type: "rule_created",
        entity_id: data?.[0]?.id ?? null,
        payload_json: { keyword: keywordValue, categoryId, applyPast },
      });

      if (applyPast && categoryId) {
        const { data: updated } = await supabase
          .from("transactions")
          .update({ category_id: categoryId })
          .ilike("merchant", `%${keywordValue}%`)
          .select("id");

        await supabase.from("transaction_events").insert({
          type: "rule_applied_past",
          entity_id: data?.[0]?.id ?? null,
          payload_json: { count: updated?.length ?? 0 },
        });
      }

      setKeyword("");
      setCategoryId(null);
      setApplyPast(false);
      setMessage("Regra salva com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "pending"] });
    } catch {
      setMessage("Nao foi possivel salvar a regra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle>Configurar regra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Palavra-chave</label>
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Ex: mercado, uber, aluguel"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {categories.length ? (
              categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  size="sm"
                  variant={categoryId === category.id ? "default" : "outline"}
                  onClick={() => setCategoryId(category.id)}
                >
                  {category.name}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria encontrada.
              </p>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={applyPast}
            onChange={(event) => setApplyPast(event.target.checked)}
          />
          Aplicar em transacoes anteriores
        </label>

        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Impacto estimado
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {impactLoading
              ? "Calculando..."
              : `${impactCount} transacoes podem ser afetadas`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Baseado no termo &quot;{keywordLabel}&quot;.
          </p>
          <div className="mt-3 space-y-2">
            {sampleRows.length ? (
              sampleRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2 text-xs"
                >
                  <span className="truncate text-foreground">
                    {row.merchant ?? "Sem descricao"}
                  </span>
                  <span className="text-muted-foreground">{row.date}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                Digite uma palavra-chave para ver amostras.
              </p>
            )}
          </div>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        <Button onClick={handleSave} disabled={!keywordValue || saving}>
          {saving ? "Salvando..." : "Salvar regra"}
        </Button>
      </CardContent>
    </Card>
  );
}
