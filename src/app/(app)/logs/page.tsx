import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LogList } from "@/components/logs/LogList";

export default function LogsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Logs"
        subtitle="Auditoria de atividades e automacoes."
        action={<Button variant="outline">Exportar</Button>}
      />
      <LogList />
    </div>
  );
}
