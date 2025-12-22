import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmQueue } from "@/components/confirm/ConfirmQueue";
import { Button } from "@/components/ui/button";

export default function ConfirmarPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fila de confirmacao"
        subtitle="Revise transacoes pendentes, categorize e mescle duplicatas."
        action={<Button variant="outline">Adicionar manual</Button>}
      />
      <ConfirmQueue />
    </div>
  );
}
