"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { parseAmount, toAmount, toAmountCf } from "@/lib/utils/money";
import { normalizeDate } from "@/lib/utils/dates";

const headerAliases = {
  date: ["date", "data", "transactiondate", "posteddate"],
  merchant: ["description", "merchant", "descricao", "historico", "memo"],
  amount: ["amount", "valor", "value", "total", "amt"],
};

type ParsedRow = {
  date: string;
  merchant: string;
  amount: number;
};

export function CsvImport() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const handleFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.toLowerCase().replace(/\s+/g, "").replace(/_/g, ""),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const getKey = (key: keyof typeof headerAliases) =>
          headers.find((header) => headerAliases[key].includes(header));

        const dateKey = getKey("date");
        const merchantKey = getKey("merchant");
        const amountKey = getKey("amount");

        if (!dateKey || !merchantKey || !amountKey) {
          setError(
            "Nao foi possivel mapear colunas. Esperado: date, description/merchant, amount."
          );
          setRows([]);
          return;
        }

        const parsed: ParsedRow[] = [];

        result.data.forEach((row) => {
          const amountValue = parseAmount(row[amountKey] ?? "");
          const normalizedDate = normalizeDate(row[dateKey] ?? "");
          if (!normalizedDate || !row[merchantKey] || amountValue === null) {
            return;
          }

          parsed.push({
            date: normalizedDate,
            merchant: row[merchantKey],
            amount: amountValue,
          });
        });

        if (!parsed.length) {
          setError("Nenhuma linha valida encontrada no CSV.");
        }

        setRows(parsed);
      },
      error: () => setError("Falha ao ler o arquivo CSV."),
    });
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const payload = rows.map((row) => ({
        amount: toAmount(row.amount),
        amount_cf: toAmountCf(row.amount),
        merchant: row.merchant,
        date: row.date,
        status: "pending",
        source: "csv",
      }));

      const { data, error: insertError } = await supabase
        .from("transactions")
        .insert(payload)
        .select("id");

      if (insertError) {
        throw insertError;
      }

      const insertedIds = data?.map((item) => item.id) ?? [];

      const { data: rules } = await supabase
        .from("rules")
        .select("id, keyword, category_id")
        .not("category_id", "is", null);

      if (insertedIds.length && rules?.length) {
        for (const rule of rules) {
          const { data: updated } = await supabase
            .from("transactions")
            .update({ category_id: rule.category_id })
            .in("id", insertedIds)
            .ilike("merchant", `%${rule.keyword}%`)
            .select("id");

          if (updated?.length) {
            await supabase.from("transaction_events").insert({
              type: "rule_applied_new",
              entity_id: rule.id,
              payload_json: { count: updated.length, keyword: rule.keyword },
            });
          }
        }
      }

      await supabase.from("transaction_events").insert({
        type: "import_csv",
        entity_id: data?.[0]?.id ?? null,
        payload_json: {
          fileName,
          count: payload.length,
        },
      });

      setRows([]);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "pending"] });
    } catch {
      setError("Falha ao importar. Verifique o CSV e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="w-full text-sm"
          />
          <Button onClick={handleImport} disabled={!rows.length || loading}>
            {loading ? "Importando..." : "Importar"}
          </Button>
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {rows.length ? (
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">
              {rows.length} linhas detectadas. Preview abaixo:
            </p>
            <div className="mt-3 space-y-2 text-sm">
              {preview.map((row, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate">{row.merchant}</span>
                  <span>R$ {row.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
