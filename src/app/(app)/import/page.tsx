"use client";

import Link from "next/link";
import { type ChangeEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseTransactionsCsv, type ParsedTransactionRow } from "@/lib/csv/parseTransactionsCsv";
import { importTransactions, ImportError, type ImportSummary } from "@/lib/data/importTransactions";
import { t } from "@/lib/i18n/t";

type ImportState = "idle" | "parsing" | "preview" | "importing" | "success" | "error";

export default function ImportCsvPage() {
  const [status, setStatus] = useState<ImportState>("idle");
  const [parsedRows, setParsedRows] = useState<ParsedTransactionRow[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedTransactionRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const statusMessage = useMemo(() => {
    if (status === "idle") return t("import.status.idle");
    if (status === "parsing") return t("import.status.parsing");
    if (status === "preview") return t("import.status.preview");
    if (status === "importing") return t("import.status.importing");
    if (status === "success") return t("import.status.success");
    return t("import.status.error");
  }, [status]);

  const canConfirm = status === "preview" && parsedRows.length > 0;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("parsing");
    setErrors([]);
    setSummary(null);
    setMessage(null);

    try {
      const text = await file.text();
      const result = parseTransactionsCsv(text);
      setFileName(file.name);
      setErrors(result.errors);

      if (!result.rows.length) {
        setStatus("error");
        if (!result.errors.length) {
          setMessage(t("import.errors.noRows"));
        }
        return;
      }

      setParsedRows(result.rows);
      setPreviewRows(result.rows.slice(0, 20));
      setStatus("preview");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : t("import.errors.parse"));
    }
  };

  const handleImport = async () => {
    if (!parsedRows.length) return;

    setStatus("importing");
    setMessage(null);

    try {
      const summaryResult = await importTransactions(parsedRows, fileName);
      setSummary(summaryResult);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      if (err instanceof ImportError) {
        setMessage(err.message);
      } else if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage(t("import.errors.import"));
      }
    }
  };

  const resetFlow = () => {
    setStatus("idle");
    setParsedRows([]);
    setPreviewRows([]);
    setErrors([]);
    setSummary(null);
    setMessage(null);
    setFileName("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("import.kicker")}
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-foreground">
            {t("import.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("import.description")}
          </p>
        </div>

        <Card className="space-y-4 border-border/60 p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              {t("import.uploadLabel")}
            </label>
            <input
              type="file"
              accept=".csv"
              className="file:mr-4 file:rounded-full file:border-0 file:bg-muted/80 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">{statusMessage}</p>
            <Button variant="ghost" size="sm" onClick={resetFlow}>
              {t("import.reset")}
            </Button>
          </div>
        </Card>

        {message && (
          <Card className="rounded-xl border border-destructive/40 bg-destructive/10 text-sm text-destructive-foreground">
            <p>{message}</p>
          </Card>
        )}

        {errors.length > 0 && (
          <Card className="rounded-xl border border-amber-400/60 bg-amber-50 text-sm text-amber-900">
            <p className="font-semibold">
              {t("import.errors.parse")} ({errors.length}):
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Card>
        )}

        {previewRows.length > 0 && (
          <Card className="space-y-4 border-border/60 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {t("import.previewTitle")}
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("import.previewRows")} {previewRows.length}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">{fileName || "_"}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm text-foreground">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="w-1/4 pr-3">{t("import.table.date")}</th>
                    <th className="w-1/3 pr-3">{t("import.table.description")}</th>
                    <th className="w-1/6 pr-3">{t("import.table.amount")}</th>
                    <th className="w-1/6 pr-3">{t("import.table.currency")}</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={`${row.date}-${index}`} className="border-t border-border/40">
                      <td className="py-2 text-sm text-foreground">{row.date}</td>
                      <td className="py-2 text-sm text-foreground">{row.description}</td>
                      <td className="py-2 text-sm text-foreground">{row.amount.toFixed(2)}</td>
                      <td className="py-2 text-sm uppercase text-foreground">{row.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleImport} disabled={!canConfirm}>
              {status === "importing" ? t("import.importing") : t("import.confirmButton")}
            </Button>
            <Button variant="outline" onClick={resetFlow}>
              {t("import.selectAnother")}
            </Button>
          </div>
          </Card>
        )}

        {summary && (
          <Card className="rounded-xl border border-emerald-400/70 bg-emerald-50 text-sm text-emerald-900">
          <p className="font-semibold">{t("import.summary.title")}</p>
          <ul className="mt-2 space-y-1">
            <li>
              {t("import.summary.total")}: {summary.total}
            </li>
            <li>
              {t("import.summary.saved")}: {summary.inserted}
            </li>
            <li>
              {t("import.summary.duplicates")}: {summary.duplicates}
            </li>
            <li>
              {t("import.summary.rulesApplied")}: {summary.rulesApplied}
            </li>
          </ul>
        </Card>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/transactions">{t("import.links.transactions")}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">{t("import.links.dashboard")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
