import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { RitualStepper } from "@/components/ritual/RitualStepper";
import Link from "next/link";

export default function RitualPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ritual semanal"
        subtitle="Guia rapido para revisar gastos e alinhar metas." 
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/ritual/mensal">Ritual mensal</Link>
            </Button>
            <Button asChild>
              <Link href="/ritual/semanal">Ritual semanal</Link>
            </Button>
          </div>
        }
      />
      <RitualStepper />
    </div>
  );
}
