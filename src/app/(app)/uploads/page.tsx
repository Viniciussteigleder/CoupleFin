"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { Camera, FileText, Plus, Upload } from "lucide-react";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OcrReviewDialog } from "@/components/app/OcrReviewDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { parseCurrency } from "@/lib/formatCurrency";
import { trackEvent } from "@/lib/analytics";

const headerAliases = {
  date: [
    "date",
    "data",
    "transactiondate",
    "posteddate",
    "datum",
    "authorisedon",
    "processedon",
  ],
  description: [
    "description",
    "merchant",
    "descricao",
    "historico",
    "memo",
    "beschreibung",
    "keymmdesc",
    "keyamexdesc",
    "erscheintaufihrerabrechnungals",
    "betreff",
  ],
  amount: ["amount", "valor", "value", "total", "amt", "betrag", "weiteredetails"],
};

type CsvRow = Record<string, string>;

type Mapping = {
  dateKey: string;
  descriptionKey: string;
  amountKey: string;
};

type FieldOption = {
  key: string;
  label: string;
};

const normalizeHeader = (header: string) =>
  header.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");

const makeHeaderTransformer = () => {
  const counts = new Map<string, number>();
  return (header: string) => {
    const normalized = normalizeHeader(header);
    const count = (counts.get(normalized) ?? 0) + 1;
    counts.set(normalized, count);
    return count === 1 ? normalized : `${normalized}__${count}`;
  };
};

const detectMapping = (fields: string[], rows: CsvRow[] = []): Mapping | null => {
  const getKey = (key: keyof typeof headerAliases) =>
    fields.find((field) => headerAliases[key].includes(field));

  const preferredDesc = fields.find((field) => ["keymmdesc", "keyamexdesc"].includes(field));
  const descriptionKey = preferredDesc ?? getKey("description");

  const preferredDate = fields.find((field) =>
    ["authorisedon", "processedon", "datum", "date", "data"].includes(field)
  );
  const dateKey = preferredDate ?? getKey("date");

  const amountCandidates = fields.filter((field) =>
    headerAliases.amount.some((alias) => field.startsWith(alias))
  );
  const amountKey = amountCandidates.sort((a, b) => scoreAmountKey(b, rows) - scoreAmountKey(a, rows))[0];

  if (!dateKey || !descriptionKey || !amountKey) return null;
  return { dateKey, descriptionKey, amountKey };
};

const scoreAmountKey = (key: string, rows: CsvRow[]) => {
  let score = 0;
  rows.slice(0, 20).forEach((row) => {
    const value = row[key] ?? "";
    if (/[\\d]/.test(value)) score += 1;
    if (/[\\.,]\\d{1,2}/.test(value)) score += 2;
    if (/^-/.test(value.trim())) score += 1;
  });
  return score;
};

const parseDateValue = (raw: string) => {
  if (!raw) return null;
  if (/^\\d{4}-\\d{2}-\\d{2}/.test(raw)) {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const match = raw.match(/(\\d{1,2})[./-](\\d{1,2})[./-](\\d{2,4})/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    const date = new Date(`${year}-${month}-${day}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const findHeaderRowIndex = (rows: string[][]) => {
  let bestIndex = -1;
  let bestScore = 0;

  rows.slice(0, 10).forEach((row, index) => {
    const normalized = row.map((cell) => normalizeHeader(cell));
    const score = normalized.reduce((count, cell) => {
      const isMatch =
        headerAliases.date.includes(cell) ||
        headerAliases.description.includes(cell) ||
        headerAliases.amount.includes(cell);
      return count + (isMatch ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 2 ? bestIndex : -1;
};

export default function UploadsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { categories, accounts, addTransactions, addUpload, uploads } = useAppStore();
  const [activeTab, setActiveTab] = useState<"csv" | "ocr">("csv");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [ocrInitial, setOcrInitial] = useState({
    description: "",
    amount: 0,
    date: new Date().toISOString(),
  });
  const [ocrLoading, setOcrLoading] = useState(false);
  const ocrInputRef = useRef<HTMLInputElement | null>(null);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [mappingFields, setMappingFields] = useState<FieldOption[]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    dateKey: "",
    descriptionKey: "",
    amountKey: "",
  });
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [status, setStatus] = useState<"idle" | "reading" | "mapping" | "creating" | "done">("idle");

  const steps = useMemo(
    () => [
      { key: "reading", label: "Lendo arquivo..." },
      { key: "mapping", label: "Reconhecendo colunas..." },
      { key: "creating", label: "Criando transações..." },
      { key: "done", label: "Quase lá..." },
    ],
    []
  );

  const statusIndex = steps.findIndex((step) => step.key === status);

  const startUpload = () => {
    toast({ title: "Enviando arquivo...", duration: 1500 });
    if (activeTab === "ocr") {
      ocrInputRef.current?.click();
      return;
    }
    setTimeout(() => setIsReviewOpen(true), 1200);
  };

  const handleOcrFile = async (file: File) => {
    setOcrLoading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Falha ao ler imagem"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const json = await res.json();
      const data = json?.data ?? {};

      setOcrInitial({
        description: data.description || data.merchant || "",
        amount: data.amount ? Number(data.amount) * -1 : 0,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      });
    } catch {
      setOcrInitial({
        description: "",
        amount: 0,
        date: new Date().toISOString(),
      });
    } finally {
      setOcrLoading(false);
      setIsReviewOpen(true);
    }
  };

  const handleConfirmOcr = async (data: {
    description: string;
    amount: number;
    date: string;
    categoryId?: string;
    accountId?: string;
  }) => {
    try {
      const uploadId = await addUpload({
        id: crypto.randomUUID(),
        fileName: "recibo.jpg",
        type: "ocr",
        status: "done",
        createdAt: new Date().toISOString(),
        stats: { created: 1, duplicates: 0, review: 1 },
      });

      const newTx = {
        id: crypto.randomUUID(),
        description: data.description,
        amount: data.amount,
        date: data.date,
        categoryId: data.categoryId,
        accountId: data.accountId,
        status: "pending" as const,
        uploadId: uploadId ?? undefined,
      };

      await addTransactions([newTx], uploadId ?? undefined);
    } catch {
      toast({
        title: "Erro ao salvar OCR",
        description: "Não foi possível salvar esta transação.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso!",
      description: "Transação enviada para a fila de confirmação.",
    });

    setTimeout(() => router.push("/confirm-queue"), 1000);
  };

  const handleCsvFile = (file: File) => {
    setStatus("reading");
    const transformHeader = makeHeaderTransformer();
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader,
      complete: async (result) => {
        const fields = result.meta.fields ?? [];
        setParsedRows(result.data);

        if (fields.length <= 1) {
          Papa.parse<string[]>(file, {
            header: false,
            skipEmptyLines: true,
            complete: async (raw) => {
              const rows = raw.data as string[][];
              const headerIndex = findHeaderRowIndex(rows);
              if (headerIndex >= 0) {
                const headerTransform = makeHeaderTransformer();
                const headers = rows[headerIndex].map((cell) => headerTransform(cell));
                const dataRows = rows.slice(headerIndex + 1);
                const objects = dataRows.map((row) =>
                  headers.reduce<Record<string, string>>((acc, key, idx) => {
                    acc[key] = row[idx] ?? "";
                    return acc;
                  }, {})
                );
                setMappingFields(
                  headers.map((key, idx) => ({
                    key,
                    label: `${rows[headerIndex][idx] ?? key}${key.includes("__") ? ` (${key.split("__")[1]})` : ""}`,
                  }))
                );
                setParsedRows(objects);

                const detected = detectMapping(headers, objects);
                if (detected) {
                  setMapping(detected);
                  setStatus("creating");
                  setTimeout(() => finalizeImport(detected, objects), 400);
                  return;
                }
              }

              setStatus("mapping");
              setMappingOpen(true);
            },
          });
          return;
        }

        const rawHeaders = await new Promise<string[] | null>((resolve) => {
          Papa.parse<string[]>(file, {
            header: false,
            skipEmptyLines: true,
            complete: (raw) => {
              const rows = raw.data as string[][];
              const headerIndex = findHeaderRowIndex(rows);
              resolve(headerIndex >= 0 ? rows[headerIndex] : null);
            },
            error: () => resolve(null),
          });
        });

        const fieldOptions = fields.map((key, idx) => ({
          key,
          label: `${rawHeaders?.[idx] ?? key}${key.includes("__") ? ` (${key.split("__")[1]})` : ""}`,
        }));
        setMappingFields(fieldOptions);

        const detected = detectMapping(fields, result.data);
        if (!detected) {
          setStatus("mapping");
          try {
            const res = await fetch("/api/ai/csv-mapping", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fields, samples: result.data.slice(0, 10) }),
            });
            const json = await res.json();
                const mappingData = json?.data;
                if (
                  mappingData?.dateKey &&
                  mappingData?.descriptionKey &&
                  mappingData?.amountKey &&
                  (mappingData?.confidence ?? 0) >= 0.5
                ) {
              setMapping(mappingData);
              setStatus("creating");
              setTimeout(() => finalizeImport(mappingData, result.data), 400);
              return;
            }
          } catch {
            // fallback to manual mapping
          }

              setMappingOpen(true);
              return;
        }

        setMapping(detected);
        setStatus("creating");
        setTimeout(() => finalizeImport(detected, result.data), 400);
      },
      error: () => {
        setStatus("idle");
        toast({
          title: "Erro ao ler CSV",
          description: "Verifique o arquivo e tente novamente.",
          variant: "destructive",
        });
      },
    });
  };

  const finalizeImport = async (map: Mapping, rows: CsvRow[]) => {
    const parsed = rows
      .map((row) => {
        const rawAmount = row[map.amountKey] ?? "0";
        const fallbackAmount = row["weiteredetails"] ?? "";
        const amountValue = parseCurrency(rawAmount);
        const amount =
          map.amountKey === "betrag" && Math.abs(amountValue) >= 1000 && fallbackAmount
            ? parseCurrency(fallbackAmount)
            : amountValue;
        const dateRaw = row[map.dateKey];
        const parsedDate = parseDateValue(dateRaw ?? "");
        const description = row[map.descriptionKey];
        if (!parsedDate || !description) return null;
        const sourceMeta = {
          source: row.fonte ?? row.source ?? null,
          payment_type: row.paymenttype ?? null,
          status: row.status ?? null,
          key: row.keymm ?? row.keyamex ?? null,
          key_desc: row.keymmdesc ?? row.keyamexdesc ?? null,
          currency: row.currency ?? null,
          currency_foreign: row.currency__2 ?? null,
          amount_foreign: row.amountinforeigncurrency
            ? parseCurrency(row.amountinforeigncurrency)
            : null,
          exchange_rate: row.exchangerate ? parseCurrency(row.exchangerate) : null,
        };
        return {
          id: crypto.randomUUID(),
          description,
          amount: amount > 0 ? -amount : amount,
          date: parsedDate.toISOString(),
          status: "pending" as const,
          sourceMeta,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      description: string;
      amount: number;
      date: string;
      status: "pending";
    }>;

    if (!parsed.length) {
      setStatus("idle");
      toast({
        title: "Nenhuma linha válida",
        description: "Não encontramos dados suficientes no CSV.",
      });
      return;
    }

    let enriched = parsed;

    if (categories.length) {
      try {
        const res = await fetch("/api/ai/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categories: categories.map((cat) => ({ id: cat.id, name: cat.name })),
            rows: parsed.map((row) => ({
              description: row.description,
              amount: row.amount,
              date: row.date,
            })),
          }),
        });
        const json = await res.json();
        const assignments = json?.data?.assignments ?? [];
        enriched = parsed.map((row, index) => {
          const assignment = assignments.find((item: { index: number }) => item.index === index);
          if (assignment?.categoryId) {
            return { ...row, categoryId: assignment.categoryId };
          }
          return row;
        });
      } catch {
        // ignore AI failures
      }
    }

    try {
      const uploadId = await addUpload({
        id: crypto.randomUUID(),
        fileName: "importacao.csv",
        type: "csv",
        status: "done",
        createdAt: new Date().toISOString(),
        stats: { created: enriched.length, duplicates: 0, review: 0 },
      });

      await addTransactions(enriched, uploadId ?? undefined);
    } catch {
      setStatus("idle");
      toast({
        title: "Erro ao importar CSV",
        description: "Não foi possível salvar as transações.",
        variant: "destructive",
      });
      return;
    }

    setStatus("done");
    toast({
      title: "Importação concluída",
      description: `${parsed.length} transações foram criadas.`,
    });
    trackEvent("upload_csv_completed", { count: parsed.length });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Uploads</h1>
          <p className="text-sm text-muted-foreground">
            Importe CSV ou prints no celular para criar transações.
          </p>
        </div>
        <Button onClick={startUpload} className="gap-2">
          <Plus className="h-4 w-4" /> Novo upload
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === "csv" ? "default" : "outline"}
          onClick={() => setActiveTab("csv")}
        >
          CSV
        </Button>
        <Button
          variant={activeTab === "ocr" ? "default" : "outline"}
          onClick={() => setActiveTab("ocr")}
        >
          OCR
        </Button>
      </div>

      {activeTab === "csv" ? (
        <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Importar CSV</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste o arquivo ou selecione no seu computador.
          </p>
          <input
            type="file"
            accept=".csv"
            className="mt-4 text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleCsvFile(file);
            }}
          />
          {status !== "idle" && (
            <div className="mt-4 w-full space-y-2">
              <Progress value={Math.max((statusIndex + 1) * 25, 25)} />
              <p className="text-xs text-muted-foreground">
                {steps[Math.min(statusIndex, steps.length - 1)]?.label}
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card
          className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={startUpload}
        >
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Camera className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Foto de Recibo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {ocrLoading ? "Processando OCR..." : "Nós lemos os dados para você (OCR)"}
          </p>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico</h3>
        {uploads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
            Nenhum upload recente.
          </div>
        )}
        {uploads.map((upload) => (
          <Link
            key={upload.id}
            href={`/uploads/${upload.id}`}
            className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{upload.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(upload.createdAt).toLocaleDateString()} • {upload.stats?.created ?? 0} itens
                </p>
              </div>
            </div>
            <div className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
              {upload.status === "done" ? "Processado" : "Em andamento"}
            </div>
          </Link>
        ))}
      </div>

      <input
        ref={ocrInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleOcrFile(file);
        }}
      />

      <OcrReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        categories={categories}
        accounts={accounts}
        initial={ocrInitial}
        onConfirm={handleConfirmOcr}
      />

      <Dialog open={mappingOpen} onOpenChange={setMappingOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mapear colunas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Precisamos confirmar quais colunas representam data, descrição e valor.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Data</label>
              <Select value={mapping.dateKey} onValueChange={(value) => setMapping((prev) => ({ ...prev, dateKey: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {mappingFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Descrição</label>
              <Select value={mapping.descriptionKey} onValueChange={(value) => setMapping((prev) => ({ ...prev, descriptionKey: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {mappingFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Valor</label>
              <Select value={mapping.amountKey} onValueChange={(value) => setMapping((prev) => ({ ...prev, amountKey: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {mappingFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                setMappingOpen(false);
                setStatus("creating");
                setTimeout(() => finalizeImport(mapping, parsedRows), 300);
              }}
              disabled={!mapping.dateKey || !mapping.descriptionKey || !mapping.amountKey}
            >
              Confirmar mapeamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
