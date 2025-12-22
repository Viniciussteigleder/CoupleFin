import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarioPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Calendario"
        subtitle="Visualize compromissos e gastos recorrentes." 
        action={<Button variant="outline">Adicionar evento</Button>}
      />

      <CalendarView />
    </div>
  );
}
