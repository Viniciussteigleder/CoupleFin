"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import { parseAmount, toAmountCf } from "@/lib/utils/money";
import { normalizeDate } from "@/lib/utils/dates";

const headerAliases = {
  date: ["date", "data", "transactiondate", "posteddate", "datum", "buchungsdatum"],
  merchant: [
    "description",
    "merchant",
    "descricao",
    "historico",
    "memo",
    "beschreibung",
    "erscheintaufihrerabrechnungals",
  ],
  amount: ["amount", "valor", "value", "total", "amt", "betrag"],
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
        const isCardStatement =
          headers.includes("betrag") && headers.some((header) => header.includes("konto#"));

        result.data.forEach((row) => {
          const rawAmount = row[amountKey] ?? "";
          const amountValue = parseAmount(rawAmount);
          const normalizedDate = normalizeDate(row[dateKey] ?? "");
          if (!normalizedDate || !row[merchantKey] || amountValue === null) {
            return;
          }

          const rawText = String(rawAmount).trim();
          const signedAmount = rawText.startsWith("-") || rawText.startsWith("+")
            ? amountValue
            : isCardStatement
              ? -Math.abs(amountValue)
              : amountValue;

          parsed.push({
            date: normalizedDate,
            merchant: row[merchantKey],
            amount: signedAmount,
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
      const payload = rows.map((row) => ({
        merchant: row.merchant,
        amount: toAmountCf(row.amount),
        date: row.date,
      }));

      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          source: "OTHER",
          rows: payload,
          rawRows: rows.map((row) => ({
            date: row.date,
            merchant: row.merchant,
            amount: String(row.amount),
          })),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error || "Falha ao importar CSV.");
      }

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
    <div className="space-y-4">
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
    </div>
  );
}
