"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function RuleWizard() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [applyPast, setApplyPast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  const handleSave = async () => {
    if (!keyword) return;
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rules")
        .insert({
          keyword,
          category_id: categoryId,
          apply_past: applyPast,
          type: "contains",
        })
        .select("id");

      if (error) throw error;

      await supabase.from("transaction_events").insert({
        type: "rule_created",
        entity_id: data?.[0]?.id ?? null,
        payload_json: { keyword, categoryId, applyPast },
      });

      if (applyPast && categoryId) {
        const { data: updated } = await supabase
          .from("transactions")
          .update({ category_id: categoryId })
          .ilike("merchant", `%${keyword}%`)
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
    <Card>
      <CardHeader>
        <CardTitle>Criar regra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        <Button onClick={handleSave} disabled={!keyword || saving}>
          {saving ? "Salvando..." : "Salvar regra"}
        </Button>
      </CardContent>
    </Card>
  );
}
