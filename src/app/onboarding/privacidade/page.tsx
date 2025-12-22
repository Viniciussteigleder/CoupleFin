"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/useAppStore";

const CONSENT_VERSION = "v1.0";

export default function PrivacidadePage() {
  const router = useRouter();
  const { updateConsent } = useAppStore();
  const [aiAutomation, setAiAutomation] = useState(true);

  const handleNext = () => {
    updateConsent({
      aiAutomation,
      consentVersion: CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    });
    router.push("/uploads");
  };

  return (
    <OnboardingShell
      step={7}
      title="Privacidade e consentimento"
      description="Transparência total sobre como seus dados são usados."
      backHref="/onboarding/ritual"
      onNext={handleNext}
      nextLabel="Ir para uploads"
    >
      <div className="space-y-5 text-sm text-muted-foreground">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <p className="font-semibold text-foreground">O que muda com a automação?</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Sugestões automáticas de categoria.</li>
            <li>Insights e resumos do mês.</li>
            <li>Menos itens na fila de revisão.</li>
          </ul>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3">
          <div>
            <p className="font-semibold text-foreground">Ativar automações da IA</p>
            <p className="text-xs text-muted-foreground">
              Você pode desligar a qualquer momento.
            </p>
          </div>
          <Switch checked={aiAutomation} onCheckedChange={setAiAutomation} />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/settings")}
        >
          Como seus dados são usados
        </Button>
      </div>
    </OnboardingShell>
  );
}
