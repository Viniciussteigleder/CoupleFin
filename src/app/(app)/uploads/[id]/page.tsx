"use client";

import { useParams, useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UploadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { uploads } = useAppStore();

  const upload = uploads.find((u) => u.id === params.id);

  if (!upload) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Upload não encontrado</h1>
        <Button onClick={() => router.push("/uploads")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Detalhe do upload</h1>
        <p className="text-sm text-muted-foreground">
          Transparência total sobre o que foi importado.
        </p>
      </div>

      <Card className="rounded-2xl border-border/60 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Arquivo</span>
          <span className="font-semibold text-foreground">{upload.fileName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className="font-semibold text-foreground">{upload.status}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Criadas</span>
          <span className="font-semibold text-foreground">{upload.stats?.created ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Para revisar</span>
          <span className="font-semibold text-foreground">{upload.stats?.review ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Duplicatas</span>
          <span className="font-semibold text-foreground">{upload.stats?.duplicates ?? 0}</span>
        </div>
      </Card>

      <Button onClick={() => router.push("/confirm-queue")}>Ver fila de revisão</Button>
    </div>
  );
}
