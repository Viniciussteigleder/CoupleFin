"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type ImportSummary = {
  total: number;
  duplicates: number;
  inserted: number;
};

export function CsvImport() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const queryClient = useQueryClient();

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const handleFile = (file: File) => {
    setError(null);
    setSummary(null);
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
    setSummary(null);

    try {
      const payload = rows.map((row) => ({
        merchant: row.merchant,
        amount: toAmountCf(row.amount), // Send the signed float amount
        date: row.date,
      }));

      const response = await fetch("/api/transactions/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: payload,
          fileName: fileName
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload");
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setSummary(result.summary);
      setRows([]);
      setFileName(null);
      
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      
    } catch {
      setError("Falha ao importar. Verifique o arquivo e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-soft">
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
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <Button onClick={handleImport} disabled={!rows.length || loading}>
            {loading ? "Importando..." : "Importar"}
          </Button>
        </div>
        
        {error ? <p className="text-sm text-red-500 font-medium">{error}</p> : null}
        
        {summary ? (
             <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                <p className="font-semibold mb-1">Importação concluída!</p>
                <ul className="text-sm space-y-1 list-disc list-inside opacity-90">
                    <li>Total processado: {summary.total}</li>
                    <li>Novas transações: {summary.inserted}</li>
                    <li>Duplicatas detectadas: {summary.duplicates}</li>
                </ul>
             </div>
        ) : null}

        {rows.length ? (
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground font-medium mb-3">
              {rows.length} linhas detectadas. Preview:
            </p>
            <div className="space-y-2 text-sm">
              {preview.map((row, index) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
                  <span className="truncate flex-1 pr-4">{row.merchant}</span>
                  <span className={row.amount < 0 ? "text-red-500 font-mono" : "text-green-600 font-mono"}>
                    {row.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
            {rows.length > 5 && (
                 <p className="text-xs text-center text-muted-foreground mt-2 italic">
                    ...e mais {rows.length - 5} linhas
                 </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
