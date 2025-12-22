"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress"; // Reusing progress

export default function WeeklyRitualPage() {
  const { transactions } = useAppStore();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const pendingCount = transactions.filter(t => t.status === "pending").length;

  const steps = [
      {
          title: "Iniciar Ritual",
          content: (
              <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Prontos para fechar a semana?</h3>
                  <p className="text-muted-foreground">Este processo leva cerca de 5 minutos.</p>
                  <Button onClick={() => setStep(step + 1)}>Começar <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
          )
      },
      {
          title: "Pendências",
          content: (
              <div className="text-center space-y-4">
                   <h3 className="text-lg font-semibold">Zerar a Caixa de Entrada</h3>
                   <p className="text-muted-foreground">Vocês têm {pendingCount} transações pendentes.</p>
                   {pendingCount > 0 ? (
                       <Button onClick={() => router.push("/confirm-queue")}>Ir para Pendências</Button>
                   ) : (
                       <div className="flex flex-col items-center text-green-600 gap-2">
                           <CheckCircle2 className="h-8 w-8" />
                           <span>Tudo limpo!</span>
                           <Button variant="outline" onClick={() => setStep(step + 1)} className="mt-2">Próximo</Button>
                       </div>
                   )}
                   {pendingCount > 0 && (
                        <div className="bg-orange-50 text-orange-800 p-2 rounded text-sm mt-4">
                            Dica: Volte aqui depois de limpar a fila!
                        </div>
                   )}
              </div>
          )
      },
      {
          title: "Orçamento",
          content: (
              <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Como estamos no Mês?</h3>
                  <p className="text-muted-foreground">Dê uma olhada rápida no Dashboard para ver se estouraram algo.</p>
                  <Button variant="outline" onClick={() => router.push("/dashboard")}>Ver Dashboard</Button>
                  <div className="pt-4">
                     <Button onClick={() => setStep(step + 1)}>Continuar</Button>
                  </div>
              </div>
          )
      },
      {
          title: "Conclusão",
          content: (
              <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Parabéns!</h3>
                  <p className="text-muted-foreground">Ritual concluído. Aproveitem o fim de semana!</p>
                  <Button onClick={() => router.push("/dashboard")}>Voltar ao Início</Button>
              </div>
          )
      }
  ];

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
                <span>Ritual Semanal</span>
                <span>Passo {step + 1} de {steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 min-h-[300px] flex flex-col items-center justify-center">
             {currentStep.content}
        </Card>
    </div>
  );
}
