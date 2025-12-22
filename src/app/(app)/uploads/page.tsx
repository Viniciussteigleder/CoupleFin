"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  date: ["date", "data", "transactiondate", "posteddate", "datum"],
  description: ["description", "merchant", "descricao", "historico", "memo", "beschreibung"],
  amount: ["amount", "valor", "value", "total", "amt", "betrag"],
};

type CsvRow = Record<string, string>;

type Mapping = {
  dateKey: string;
  descriptionKey: string;
  amountKey: string;
};

export default function UploadsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { categories, accounts, addTransactions, addUpload, uploads } = useAppStore();
  const [activeTab, setActiveTab] = useState<"csv" | "ocr">("csv");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [mappingFields, setMappingFields] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    dateKey: "",
    descriptionKey: "",
    amountKey: "",
  });
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [status, setStatus] = useState<"idle" | "reading" | "mapping" | "creating" | "done">("idle");

  const mockReceipt = {
    description: "Restaurante Exemplo",
    amount: -85.5,
    date: new Date().toISOString(),
  };

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
    setTimeout(() => setIsReviewOpen(true), 1200);
  };

  const handleConfirmOcr = (data: {
    description: string;
    amount: number;
    date: string;
    categoryId?: string;
    accountId?: string;
  }) => {
    const newTx = {
      id: crypto.randomUUID(),
      description: data.description,
      amount: data.amount,
      date: data.date,
      categoryId: data.categoryId,
      accountId: data.accountId,
      status: "pending" as const,
      source_upload_id: `upload_${Date.now()}`,
    };

    addTransactions([newTx]);
    addUpload({
      id: newTx.source_upload_id ?? crypto.randomUUID(),
      fileName: "recibo.jpg",
      type: "ocr",
      status: "done",
      createdAt: new Date().toISOString(),
      stats: { created: 1, duplicates: 0, review: 1 },
    });

    toast({
      title: "Sucesso!",
      description: "Transação enviada para a fila de confirmação.",
    });

    setTimeout(() => router.push("/confirm-queue"), 1000);
  };

  const detectMapping = (fields: string[]): Mapping | null => {
    const getKey = (key: keyof typeof headerAliases) =>
      fields.find((field) => headerAliases[key].includes(field));

    const dateKey = getKey("date");
    const descriptionKey = getKey("description");
    const amountKey = getKey("amount");

    if (!dateKey || !descriptionKey || !amountKey) return null;
    return { dateKey, descriptionKey, amountKey };
  };

  const handleCsvFile = (file: File) => {
    setStatus("reading");
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, "").replace(/_/g, ""),
      complete: (result) => {
        const fields = result.meta.fields ?? [];
        setMappingFields(fields);
        setParsedRows(result.data);

        const detected = detectMapping(fields);
        if (!detected) {
          setStatus("mapping");
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

  const finalizeImport = (map: Mapping, rows: CsvRow[]) => {
    const parsed = rows
      .map((row) => {
        const rawAmount = row[map.amountKey] ?? "0";
        const amount = parseCurrency(rawAmount);
        const date = row[map.dateKey];
        const description = row[map.descriptionKey];
        if (!date || !description) return null;
        return {
          id: crypto.randomUUID(),
          description,
          amount: amount > 0 ? -amount : amount,
          date: new Date(date).toISOString(),
          status: "pending" as const,
          source_upload_id: `upload_${Date.now()}`,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      description: string;
      amount: number;
      date: string;
      status: "pending";
      source_upload_id: string;
    }>;

    if (!parsed.length) {
      setStatus("idle");
      toast({
        title: "Nenhuma linha válida",
        description: "Não encontramos dados suficientes no CSV.",
      });
      return;
    }

    addTransactions(parsed);
    addUpload({
      id: parsed[0].source_upload_id,
      fileName: "importacao.csv",
      type: "csv",
      status: "done",
      createdAt: new Date().toISOString(),
      stats: { created: parsed.length, duplicates: 0, review: 0 },
    });

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
            Importe CSV ou recibos para criar transações.
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
            Nós lemos os dados para você (OCR)
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

      <OcrReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        categories={categories}
        accounts={accounts}
        initial={mockReceipt}
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
                    <SelectItem key={field} value={field}>
                      {field}
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
                    <SelectItem key={field} value={field}>
                      {field}
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
                    <SelectItem key={field} value={field}>
                      {field}
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
