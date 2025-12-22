import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ConfirmQueue } from "@/components/confirm/ConfirmQueue";

export default function ConfirmarPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fila de confirmacao"
        subtitle="Revise transacoes pendentes, categorize e mescle duplicatas."
        action={<Button variant="secondary">Confirmar todas</Button>}
      />
      <ConfirmQueue />
    </div>
  );
}
