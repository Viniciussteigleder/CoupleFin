import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/CalendarView";
import Link from "next/link";

export default function CalendarioPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Calendario"
        subtitle="Visualize compromissos e gastos recorrentes." 
        action={
          <Button asChild variant="outline">
            <Link href="/calendario/evento">Adicionar evento</Link>
          </Button>
        }
      />

      <CalendarView />
    </div>
  );
}
