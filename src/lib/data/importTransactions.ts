import { ParsedTransactionRow } from "@/lib/csv/parseTransactionsCsv";
import { useAppStore } from "@/lib/store/useAppStore";

export type ImportSummary = {
  total: number;
  duplicates: number;
  inserted: number;
  rulesApplied: number;
};

export class ImportError extends Error {}

export const importTransactions = async (
  rows: ParsedTransactionRow[],
  fileName?: string
): Promise<ImportSummary> => {
  if (!rows.length) {
    throw new ImportError("Nenhuma linha para importar.");
  }

  const payload = rows.map((row) => ({
    merchant: row.description,
    amount: row.amount,
    date: row.date,
    currency: row.currency,
    categoryId: row.category1,
    sourceMeta: {
      currency: row.currency,
      category1: row.category1 ?? null,
      category2: row.category2 ?? null,
    },
  }));

  const rawRows = rows.map((row) => row.rawRow);
  const response = await fetch("/api/transactions/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: fileName ?? `import-${new Date().toISOString().slice(0, 10)}.csv`,
      rows: payload,
      rawRows,
    }),
  });

  const body = (await response.json()) as
    | ({ summary?: ImportSummary } & Record<string, unknown>)
    | { error?: string };

  if (!response.ok) {
    throw new ImportError((body as { error?: string }).error ?? "Falha ao importar CSV.");
  }

  const summary: ImportSummary = {
    total: rows.length,
    duplicates: (body as { summary?: ImportSummary }).summary?.duplicates ?? 0,
    inserted: (body as { summary?: ImportSummary }).summary?.inserted ?? 0,
    rulesApplied: (body as { summary?: ImportSummary }).summary?.rulesApplied ?? 0,
  };

  const fetchData = useAppStore.getState().fetchData;
  if (typeof fetchData === "function") {
    await fetchData();
  }

  return summary;
};
