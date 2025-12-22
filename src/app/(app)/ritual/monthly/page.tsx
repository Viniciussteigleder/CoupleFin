"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Correct hook

export default function MonthlyRitualPage() {
    const router = useRouter(); // Missing from previous weekly page, added here

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div>
            <h1 className="text-2xl font-bold">Ritual Mensal</h1>
            <p className="text-muted-foreground">O momento de grandes decisões.</p>
        </div>

        <Card className="p-8 text-center space-y-4">
            <h3 className="text-lg font-semibold">Em breve</h3>
            <p className="text-muted-foreground">
                O ritual mensal estará disponível no final do mês.
                Por enquanto, foquem no ritual semanal!
            </p>
            <Button onClick={() => router.push("/ritual/weekly")}>Ir para Ritual Semanal</Button>
        </Card>
    </div>
  );
}
