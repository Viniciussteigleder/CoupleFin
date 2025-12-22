import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { RitualStepper } from "@/components/ritual/RitualStepper";

export default function RitualPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ritual semanal"
        subtitle="Guia rapido para revisar gastos e alinhar metas." 
        action={<Button>Iniciar ritual</Button>}
      />
      <RitualStepper />
    </div>
  );
}
