"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, Account } from "@/lib/store/useAppStore";
import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  accounts: Account[];
  initial: { description: string; amount: number; date: string };
  onConfirm: (data: {
    description: string;
    amount: number;
    date: string;
    categoryId?: string;
    accountId?: string;
  }) => void;
};

export function OcrReviewDialog({ open, onOpenChange, categories, accounts, initial, onConfirm }: Props) {
  const [description, setDescription] = useState(initial.description);
  const [amount, setAmount] = useState(String(Math.abs(initial.amount)));
  const [date, setDate] = useState(initial.date.split('T')[0]); // Simple YYYY-MM-DD
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [accountId, setAccountId] = useState<string | undefined>();

  useEffect(() => {
     if(open) {
         setDescription(initial.description);
         setAmount(String(Math.abs(initial.amount)));
         setDate(initial.date.split('T')[0]);
         setCategoryId(undefined);
         setAccountId(undefined);
     }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revisar Leitura (OCR)</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label>Valor</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">€</span>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8" type="number" step="0.01" />
                </div>
             </div>
             <div className="grid gap-2">
                <Label>Data</Label>
                 <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
             </div>
          </div>

          <div className="grid gap-2">
            <Label>Categoria (opcional)</Label>
            <Select onValueChange={(v) => setCategoryId(v)} value={categoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Conta (opcional)</Label>
            <Select onValueChange={(v) => setAccountId(v)} value={accountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} {a.last4 ? `•••• ${a.last4}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm({
                description,
                amount: Number(amount) * -1, // Expense by default
                date: new Date(date).toISOString(),
                categoryId,
                accountId,
              });
              onOpenChange(false);
            }}
          >
            Confirmar e Enviar para Fila
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
