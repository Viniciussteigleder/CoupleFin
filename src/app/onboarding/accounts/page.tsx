"use client";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useRouter } from "next/navigation";
import { useAppStore, Account } from "@/lib/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CreditCard, Wallet, Banknote } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AccountsPage() {
  const router = useRouter();
  const { accounts, hydrateFromSeed } = useAppStore();
  const [localAccounts, setLocalAccounts] = useState<Account[]>(accounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New account state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"credit" | "debit" | "cash">("credit");
  const [newLast4, setNewLast4] = useState("");

  const addAccount = () => {
    if (!newName) return;
    const newAcc: Account = {
      id: crypto.randomUUID(),
      name: newName,
      type: newType,
      last4: newLast4,
    };
    setLocalAccounts([...localAccounts, newAcc]);
    setNewName("");
    setNewType("credit");
    setNewLast4("");
    setIsDialogOpen(false);
  };

  const removeAccount = (id: string) => {
    setLocalAccounts(localAccounts.filter((a) => a.id !== id));
  };

  const handleNext = () => {
    hydrateFromSeed({ accounts: localAccounts });
    router.push("/onboarding/ritual");
  };

  return (
    <OnboardingShell
      step={4}
      title="Contas e Cartões"
      description="Quais contas vocês usam para os gastos do dia a dia?"
      backHref="/onboarding/budget"
      onNext={handleNext}
      nextLabel={localAccounts.length === 0 ? "Pular por enquanto" : "Continuar"}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2 border-dashed h-20 flex-col py-2" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-5 w-5" />
                <span>Manual</span>
            </Button>
            <Button variant="outline" className="flex-1 gap-2 border-dashed h-20 flex-col py-2" onClick={() => alert("Funcionalidade de OCR de cartão em breve!")}>
                <CreditCard className="h-5 w-5" />
                <span>Foto do Cartão</span>
            </Button>
        </div>

        {localAccounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between rounded-2xl border p-4 bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border">
                {acc.type === "credit" && <CreditCard className="h-5 w-5 text-primary" />}
                {acc.type === "debit" && <Wallet className="h-5 w-5 text-primary" />}
                {acc.type === "cash" && <Banknote className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{acc.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {acc.type} {acc.last4 ? `•••• ${acc.last4}` : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeAccount(acc.id)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        ))}

        {!isDialogOpen && localAccounts.length === 0 && (
            <div className="py-4 text-center">
                <p className="text-xs text-muted-foreground">
                    Você pode pular esta etapa. As contas serão identificadas automaticamente ao subir seus extratos ou recibos.
                </p>
            </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>Nova Conta</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da conta</Label>
                <Input
                  id="name"
                  placeholder="Ex: Nubank, Itaú, Carteira"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newType}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(v: any) => setNewType(v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit">Conta Corrente / Débito</SelectItem>
                    <SelectItem value="cash">Dinheiro / Carteira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last4">Últimos 4 dígitos (opcional)</Label>
                <Input
                  id="last4"
                  placeholder="Ex: 4821"
                  maxLength={4}
                  value={newLast4}
                  onChange={(e) => setNewLast4(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addAccount} disabled={!newName} className="w-full sm:w-auto rounded-xl">
                  Salvar Conta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </OnboardingShell>
  );
}
