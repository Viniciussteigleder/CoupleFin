"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function GoalsPage() {
  const { goals } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-xl font-semibold md:text-2xl">Metas</h1>
           <p className="text-sm text-muted-foreground">
            Transforme o aprendizado em plano do mês.
           </p>
        </div>
        <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Meta
        </Button>
      </div>

      <Card className="rounded-2xl border-border/60 p-5">
        <CardTitle className="text-base">Sugestão inteligente</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Com base na média dos últimos 3 meses, sugerimos poupar € 300 este mês.
        </p>
        <Button variant="outline" className="mt-4">Aplicar sugestão</Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {goals.map(goal => {
             const pct = Math.min(100, (goal.current / goal.target) * 100);
             return (
                 <Card key={goal.id} className="rounded-2xl">
                     <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{goal.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                 € {goal.current} / € {goal.target}
                            </p>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-2">
                         <Progress value={pct} className="h-3" />
                         <p className="text-right text-xs text-muted-foreground">{Math.round(pct)}% concluído</p>
                     </CardContent>
                 </Card>
             );
         })}
         {goals.length === 0 && (
             <Card className="col-span-full rounded-2xl border-border/60 p-6 text-sm text-muted-foreground">
                 Nenhuma meta definida. Comece com uma meta simples para o mes.
             </Card>
         )}
      </div>
    </div>
  );
}
