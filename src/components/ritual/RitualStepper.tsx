"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const steps = [
  {
    title: "Rever acordo anterior",
    description: "Retome o combinado da semana passada e marque o que foi cumprido.",
    highlight: "Combinado: reduzir delivery para 2x/semana",
  },
  {
    title: "Ajustar metas da semana",
    description: "Acerte limites e prioridades com base no fluxo atual.",
    highlight: "Meta sugerida: economizar R$ 300 ate domingo",
  },
  {
    title: "Novo acordo",
    description: "Registre o novo combinado do casal para a proxima semana.",
    highlight: "Ex: levar almoco 3x na semana",
  },
];

export function RitualStepper() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem("ritualStep");
    const parsed = stored ? Number(stored) : 0;
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed < steps.length) {
      setActiveStep(parsed);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ritualStep", String(activeStep));
  }, [activeStep]);

  const logEvent = async (type: string, payload: Record<string, unknown>) => {
    const supabase = createClient();
    await supabase.from("transaction_events").insert({
      type,
      payload_json: payload,
    });
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      await logEvent("ritual_started", { step: 1 });
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    await logEvent("ritual_completed", { steps: steps.length });
    setActiveStep(0);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle>Ritual semanal guiado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`rounded-2xl border p-4 transition ${
                index === activeStep
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/60 bg-background"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
              <p className="mt-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {step.highlight}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleBack} disabled={activeStep === 0}>
            Voltar
          </Button>
          <Button onClick={handleNext}>
            {activeStep === steps.length - 1 ? "Finalizar" : "Proximo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
