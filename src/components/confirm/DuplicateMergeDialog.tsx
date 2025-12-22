"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transactions";

export function DuplicateMergeDialog({
  open,
  group,
  onOpenChange,
  onMerge,
  onKeepSeparate,
}: {
  open: boolean;
  group: Transaction[];
  onOpenChange: (open: boolean) => void;
  onMerge: () => void;
  onKeepSeparate: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Possiveis duplicatas</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          {group.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/60 bg-muted/30 p-3"
            >
              <p className="text-sm font-semibold text-foreground">
                {item.merchant}
              </p>
              <p className="text-xs">
                {item.date} · R$ {Math.abs(item.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={onMerge}>Mesclar</Button>
          <Button variant="outline" onClick={onKeepSeparate}>
            Manter separado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
