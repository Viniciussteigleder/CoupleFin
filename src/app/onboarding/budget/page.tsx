"use client";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { Input } from "@/components/ui/input"; // Assuming input exists or I will use standard
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

export default function BudgetPage() {
  const router = useRouter();
  const { categories, budgets, hydrateFromSeed } = useAppStore();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Redirect if no categories
    if (categories.length === 0) {
      // router.replace("/onboarding/categories"); // Commented out to avoid loop during dev if mockstore is flaky
    }

    const initial: Record<string, string> = {};
    categories.forEach(c => {
        const existing = budgets.find(b => b.categoryId === c.id);
        if (existing) initial[c.id] = String(existing.monthlyLimit);
    });
    setValues(initial);
  }, [categories, budgets, router]);

  const handleChange = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }));
  };

  const handleNext = () => {
    const newBudgets = Object.entries(values)
        .map(([categoryId, val]) => ({
            categoryId,
            monthlyLimit: Number(val) || 0
        }))
        .filter(b => b.monthlyLimit > 0);
    
    hydrateFromSeed({ budgets: newBudgets });
    router.push("/onboarding/accounts");
  };

  return (
    <OnboardingShell
      step={3}
      title="Orçamento Mensal"
      description="Defina um limite ideal para cada categoria. Não precisa ser exato agora."
      backHref="/onboarding/categories"
      onNext={handleNext}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4 rounded-lg border p-3">
             <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground"
                style={{ color: cat.color, backgroundColor: cat.color + "20" }}
              >
                {cat.name[0]}
              </div>
              <div className="flex-1">
                  <Label htmlFor={cat.id} className="text-base font-medium">{cat.name}</Label>
              </div>
              <div className="w-32 relative">
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">€</span>
                  <Input
                    id={cat.id}
                    type="number"
                    placeholder="0,00"
                    className="pl-8 text-right"
                    value={values[cat.id] || ""}
                    onChange={(e) => handleChange(cat.id, e.target.value)}
                  />
              </div>
          </div>
        ))}
        {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                Nenhuma categoria selecionada. Volte e escolha algumas.
            </div>
        )}
      </div>
    </OnboardingShell>
  );
}
