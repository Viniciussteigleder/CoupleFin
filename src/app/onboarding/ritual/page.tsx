"use client";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function RitualPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [weeklyDay, setWeeklyDay] = useState("sunday");
  
  const handleFinish = async () => {
    // Determine user preference for ritual day
    // In MVP just mock saving this setting to user preferences or local storage/store
    // For now we just finish.

    toast({
        title: "Tudo pronto!",
        description: "Seu espaço está configurado. Vamos importar as primeiras transações.",
    });

    // Simulate small delay for UX
    await new Promise(r => setTimeout(r, 800));
    router.push("/dashboard");
  };

  return (
    <OnboardingShell
      step={5}
      title="Ritual do Casal"
      description="Reserve um momento sagrado na semana para alinhar as finanças sem briga."
      backHref="/onboarding/accounts"
      onNext={handleFinish}
      nextLabel="Finalizar e ir para o App"
    >
      <div className="space-y-6">
         <div className="space-y-3">
            <Label className="text-base">Qual o melhor dia para o Checkout Semanal?</Label>
            <p className="text-sm text-muted-foreground">
                Um encontro de 10-15 minutos para categorizar pendências e ver como foi a semana.
            </p>
            
            <Select value={weeklyDay} onValueChange={setWeeklyDay}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="friday">Sexta-feira (fechar a semana)</SelectItem>
                    <SelectItem value="saturday">Sábado (manhã tranquila)</SelectItem>
                    <SelectItem value="sunday">Domingo (planejar a próxima)</SelectItem>
                    <SelectItem value="monday">Segunda-feira (começar com tudo)</SelectItem>
                </SelectContent>
            </Select>
         </div>

         <div className="rounded-lg bg-secondary/50 p-4 border border-secondary text-sm">
             <p className="font-medium text-foreground">Como funciona:</p>
             <ul className="mt-2 list-disc pl-4 space-y-1 text-muted-foreground">
                 <li>Nós lembramos vocês no dia escolhido.</li>
                 <li>Vocês abrem o app juntos (ou sincronizados).</li>
                 <li>Revisam as pendências da semana.</li>
                 <li>Celebram as pequenas vitórias!</li>
             </ul>
         </div>
      </div>
    </OnboardingShell>
  );
}
