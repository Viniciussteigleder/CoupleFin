import { PageHeader } from "@/components/layout/PageHeader";
import { RuleList } from "@/components/rules/RuleList";
import { RuleWizard } from "@/components/rules/RuleWizard";

export default function RulesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Regras" subtitle="Automatize categorias com palavras-chave." />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <RuleWizard />
        <RuleList />
      </div>
    </div>
  );
}
