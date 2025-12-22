"use client";

import { Transaction, Category, Account } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
  onAction?: (action: "edit" | "confirm") => void;
  showCheckbox?: boolean;
}

export function TransactionItem({ 
    transaction, 
    category, 
    account, 
    onSelect, 
    selected = false,
    onAction,
    showCheckbox = false,
}: TransactionItemProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-[20px] bg-white p-3 hover:bg-muted/30 transition-all border border-transparent shadow-sm shadow-black/5", selected && "bg-muted/50 border-primary/20")}>
      {showCheckbox && (
          <Checkbox 
            checked={selected} 
            onCheckedChange={(c) => onSelect?.(transaction.id, c as boolean)} 
          />
      )}
      
      <div 
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold"
        style={{ color: category?.color, backgroundColor: category?.color ? category.color + "20" : undefined }}
      >
        {category ? category.name[0] : "?"}
      </div>

      <div className="flex-1 min-w-0">
         <div className="flex items-center justify-between">
            <p className="truncate font-medium text-sm">{transaction.description}</p>
            <p className={cn("font-semibold text-sm", transaction.amount < 0 ? "text-foreground" : "text-green-600")}>
                {transaction.amount < 0 ? "- " : "+ "}
                € {Math.abs(transaction.amount).toFixed(2)}
            </p>
         </div>
         <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{format(new Date(transaction.date), "dd/MM")}</span>
            <span>•</span>
            <span className="truncate max-w-[100px]">{category?.name || "Sem categoria"}</span>
            {account && (
                <>
                    <span>•</span>
                    <span className="truncate max-w-[80px]">{account.name}</span>
                </>
            )}
            {transaction.status === "pending" && (
                <Badge variant="outline" className="ml-auto text-[10px] h-5 px-1.5 border-orange-200 text-orange-600 bg-orange-50">
                    Pendente
                </Badge>
            )}
            {transaction.status === "duplicate" && (
                <Badge variant="outline" className="ml-auto text-[10px] h-5 px-1.5 border-yellow-200 text-yellow-600 bg-yellow-50">
                    Duplicata
                </Badge>
            )}
         </div>
      </div>

      {onAction && (
          <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAction("edit")}>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              {transaction.status === "pending" && (
                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-600" onClick={() => onAction("confirm")}>
                    <CheckCircle2 className="h-4 w-4" />
                 </Button>
              )}
          </div>
      )}
    </div>
  );
}
