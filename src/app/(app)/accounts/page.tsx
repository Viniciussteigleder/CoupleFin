"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Wallet, Banknote } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AccountsPage() {
  const { accounts } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-xl font-semibold md:text-2xl">Contas</h1>
           <p className="text-sm text-muted-foreground">Gerencie seus cartões e bancos.</p>
        </div>
        <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Conta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {accounts.map(acc => (
             <Card key={acc.id}>
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
                 <CardContent>
                     {acc.last4 && (
                         <p className="text-sm text-muted-foreground">Termina em •••• {acc.last4}</p>
                     )}
                     {/* Balance could be added here later */}
                 </CardContent>
             </Card>
         ))}
      </div>
    </div>
  );
}
