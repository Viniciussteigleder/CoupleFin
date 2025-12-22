"use client";

import { useRouter } from "next/navigation";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/button";

export default function ExplicacaoPage() {
  const router = useRouter();

  return (
    <OnboardingShell
      step={4}
      title="Como funciona"
      description="Em poucos minutos você entende porque pedimos CSV e prints."
      backHref="/onboarding/budget"
      onNext={() => router.push("/onboarding/accounts")}
      nextLabel="Continuar"
    >
      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <ul className="list-disc space-y-2 pl-4 text-foreground/80">
            <li>Importamos seus dados para evitar digitação manual.</li>
            <li>Usamos IA para sugerir categorias com confiança.</li>
            <li>Você revisa apenas o que for incerto.</li>
          </ul>
        </div>
        <p>
          Sem surpresas: você sempre controla o que entra e pode apagar seus arquivos
          quando quiser.
        </p>
        <Button variant="outline" className="w-full" onClick={() => router.push("/uploads")}>
          Fazer upload agora
        </Button>
      </div>
    </OnboardingShell>
  );
}
