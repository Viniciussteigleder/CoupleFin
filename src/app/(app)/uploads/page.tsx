"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CsvImport } from "@/components/uploads/CsvImport";

const uploads = [
  {
    name: "activity (8).csv",
    type: "CSV",
    status: "Concluido",
    href: "/uploads/detalhe",
  },
  {
    name: "Recibo mercado.jpeg",
    type: "OCR",
    status: "Revisao necessaria",
    href: "/uploads/revisar-ocr",
  },
];

export default function UploadsPage() {
  const [tab, setTab] = useState<"csv" | "ocr">("csv");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Importar transacoes"
        subtitle="Importe extratos bancarios (CSV) ou notas fiscais para leitura OCR."
        action={
          <Button asChild variant="outline">
            <Link href="/uploads/detalhe">Ver historico</Link>
          </Button>
        }
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base text-muted-foreground">
              Uploads
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Arraste o arquivo ou selecione no seu computador.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === "csv" ? "secondary" : "outline"}
              onClick={() => setTab("csv")}
            >
              CSV
            </Button>
            <Button
              size="sm"
              variant={tab === "ocr" ? "secondary" : "outline"}
              onClick={() => setTab("ocr")}
            >
              OCR
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tab === "csv" ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">
                Extrato bancario (CSV)
              </p>
              <CsvImport />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
                Envie prints ou PDFs para extrair transacoes via OCR.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button>Selecionar imagens</Button>
                <Button variant="outline">Importar ultimo recibo</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Ultimos uploads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {uploads.map((upload) => (
            <div
              key={upload.name}
              className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-4 text-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{upload.name}</p>
                <p className="text-xs text-muted-foreground">Tipo: {upload.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    upload.status === "Concluido"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {upload.status}
                </span>
                <Button size="sm" variant="outline" asChild>
                  <Link href={upload.href}>Abrir</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
