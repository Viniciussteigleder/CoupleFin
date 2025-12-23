"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Wallet, Banknote } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";

export default function AccountsPage() {
  const { accounts } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-xl font-semibold md:text-2xl">Contas</h1>
           <p className="text-sm text-muted-foreground">Gerencie cartões, saldos e projeções.</p>
        </div>
        <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Conta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {accounts.length ? accounts.map(acc => (
             <Card key={acc.id} className="rounded-2xl">
                 <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        {acc.type === "credit" && <CreditCard className="h-6 w-6" />}
                        {acc.type === "debit" && <Wallet className="h-6 w-6" />}
                        {acc.type === "cash" && <Banknote className="h-6 w-6" />}
                    </div>
                    <div>
                        <CardTitle className="text-base">{acc.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{acc.type}</p>
                    </div>
                 </CardHeader>
                 <CardContent className="space-y-2">
                     {acc.last4 && (
                         <p className="text-sm text-muted-foreground">Termina em •••• {acc.last4}</p>
                     )}
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Saldo inicial</span>
                       <span className="font-semibold">{formatCurrency(1250)}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Projeção semanal</span>
                       <span className="font-semibold">{formatCurrency(980)}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Fatura estimada</span>
                       <span className="font-semibold">{formatCurrency(420)}</span>
                     </div>
                     <Button variant="outline" size="sm">Ajustar saldo</Button>
                 </CardContent>
             </Card>
         )) : (
          <Card className="rounded-2xl border-border/60 p-6 text-sm text-muted-foreground">
            Nenhuma conta cadastrada. Importe um CSV para sugerirmos cartoes.
          </Card>
         )}
      </div>
    </div>
  );
}
