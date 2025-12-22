"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/useAppStore";
import { useToast } from "@/components/ui/use-toast";

export default function RitualPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { updateRitualPreferences } = useAppStore();
  const [weeklyDay, setWeeklyDay] = useState("sunday");
  const [weeklyTime, setWeeklyTime] = useState("20:00");
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const handleFinish = async () => {
    updateRitualPreferences({
      weeklyDay,
      weeklyTime,
      remindersEnabled,
    });

    toast({
      title: "Preferências salvas",
      description: "Você pode ajustar no app quando quiser.",
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/onboarding/privacidade");
  };

  return (
    <OnboardingShell
      step={6}
      title="Ritual do Casal"
      description="Defina um hábito semanal de 10 minutos."
      backHref="/onboarding/accounts"
      onNext={handleFinish}
      nextLabel="Continuar"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Qual o melhor dia para o ritual semanal?</Label>
          <Select value={weeklyDay} onValueChange={setWeeklyDay}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friday">Sexta-feira</SelectItem>
              <SelectItem value="saturday">Sábado</SelectItem>
              <SelectItem value="sunday">Domingo</SelectItem>
              <SelectItem value="monday">Segunda-feira</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Horário sugerido</Label>
          <Select value={weeklyTime} onValueChange={setWeeklyTime}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18:00">18:00</SelectItem>
              <SelectItem value="19:00">19:00</SelectItem>
              <SelectItem value="20:00">20:00</SelectItem>
              <SelectItem value="21:00">21:00</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Ativar lembretes</p>
            <p className="text-xs text-muted-foreground">Email ou push conforme disponível.</p>
          </div>
          <Switch checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
        </div>

        <div className="rounded-lg border border-secondary bg-secondary/50 p-4 text-sm">
          <p className="font-medium text-foreground">Como funciona:</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
            <li>O app prepara as pendências e duplicatas.</li>
            <li>Vocês resolvem em 10 minutos.</li>
            <li>Saem com um combinado para a semana.</li>
          </ul>
        </div>
      </div>
    </OnboardingShell>
  );
}
