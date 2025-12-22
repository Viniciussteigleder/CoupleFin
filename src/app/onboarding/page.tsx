"use client";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <OnboardingShell
      step={1}
      totalSteps={7}
      title="Bem-vindos"
      description="Vamos configurar o Couple Budget Coach para vocês em poucos minutos."
      onNext={() => router.push("/onboarding/categories")}
      nextLabel="Começar"
    >
      <div className="space-y-4 text-center">
         <p className="text-sm text-muted-foreground">
            O que vamos fazer:
         </p>
         <ul className="text-sm text-foreground/80 space-y-2 text-left list-disc list-inside bg-muted/30 p-4 rounded-lg">
            <li>Definir categorias de gastos</li>
            <li>Configurar orçamentos mensais</li>
            <li>Entender como a importação funciona</li>
            <li>Revisar cartões detectados</li>
            <li>Estabelecer o ritual do casal</li>
            <li>Confirmar privacidade</li>
         </ul>
      </div>
    </OnboardingShell>
  );
}
