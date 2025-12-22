import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { RuleList } from "@/components/rules/RuleList";
import { RuleWizard } from "@/components/rules/RuleWizard";
import { Button } from "@/components/ui/button";

export default function RulesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Regras"
        subtitle="Automatize categorias com palavras-chave."
        action={
          <Button asChild variant="outline">
            <Link href="/rules/nova">Nova regra</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <RuleWizard />
        <RuleList />
      </div>
    </div>
  );
}
