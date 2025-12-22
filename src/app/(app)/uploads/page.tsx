"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Plus, Camera } from "lucide-react";
import { useState } from "react";
import { OcrReviewDialog } from "@/components/app/OcrReviewDialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function UploadsPage() {
  const { transactions, categories, accounts } = useAppStore();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Mock data for OCR simulation
  const mockReceipt = {
    description: "Restaurante Exemplo",
    amount: -85.50,
    date: new Date().toISOString(),
  };

  const startUpload = () => {
    // Simulate upload delay
    toast({ title: "Enviando arquivo...", duration: 2000 });
    setTimeout(() => {
        setIsReviewOpen(true);
    }, 1500);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConfirmOcr = (data: any) => {
     // Create pending transaction in store
     // We need to add "pending" logic. For now we append to queue.
     const newTx = {
         id: crypto.randomUUID(),
         ...data,
         status: "pending", // Important: goes to Confirm Queue
         source_upload_id: "upload_" + Date.now(),
     };
     
     // Hack: modify store directly via partial hydration since we don't have dedicated addAction yet in prototype
     // Ideally add `addTransaction` action to store.
     const currentTxs = useAppStore.getState().transactions;
     useAppStore.setState({ transactions: [newTx, ...currentTxs] });

     toast({
        title: "Sucesso!",
        description: "Transação enviada para a Fila de Confirmação.",
     });

     setTimeout(() => router.push("/confirm-queue"), 1000);
  };

  const uploads = transactions
    .filter(t => t.source_upload_id)
    .map(t => ({
        id: t.source_upload_id,
        date: t.date,
        items: 1, // simplified
        status: "processed"
    }));

  // Deduplicate uploads by ID
  const uniqueUploads = Array.from(new Map(uploads.map(item => [item.id, item])).values());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Uploads</h1>
          <p className="text-sm text-muted-foreground">
            Importe faturas ou recibos.
          </p>
        </div>
        <Button onClick={startUpload}>
            <Plus className="mr-2 h-4 w-4" /> Novo Upload
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={startUpload}>
             <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                 <Upload className="h-6 w-6" />
             </div>
             <h3 className="font-semibold">Importar CSV ou PDF</h3>
             <p className="text-sm text-muted-foreground mt-1">Fatura do cartão ou extrato bancário</p>
         </Card>

         <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={startUpload}>
             <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                 <Camera className="h-6 w-6" />
             </div>
             <h3 className="font-semibold">Foto de Recibo</h3>
             <p className="text-sm text-muted-foreground mt-1">Nós lemos os dados para você (OCR)</p>
         </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico</h3>
        {uniqueUploads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
                Nenhum upload recente.
            </div>
        )}
        {uniqueUploads.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">Upload #{u.id?.slice(-4)}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(u.date).toLocaleDateString()} • {u.items} itens
                        </p>
                    </div>
                </div>
                <div className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                    Processado
                </div>
            </div>
        ))}
      </div>

      <OcrReviewDialog 
        open={isReviewOpen} 
        onOpenChange={setIsReviewOpen}
        categories={categories}
        accounts={accounts}
        initial={mockReceipt} // This would come from API in real app
        onConfirm={handleConfirmOcr}
      />
    </div>
  );
}
