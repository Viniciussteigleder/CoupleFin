"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useAppStore } from "@/lib/store/useAppStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatAmount, parseCurrency } from "@/lib/formatCurrency";
import { trackEvent } from "@/lib/analytics";

const SUGGESTIONS: Record<string, number> = {
  cat_food: 900,
  cat_out: 450,
  cat_trans: 280,
  cat_rent: 1800,
};

export default function BudgetPage() {
  const router = useRouter();
  const { categories, budgets, hydrateFromSeed } = useAppStore();
  const [values, setValues] = useState<Record<string, string>>({});
  const [noLimit, setNoLimit] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialValues: Record<string, string> = {};
    const initialNoLimit: Record<string, boolean> = {};
    categories.forEach((category) => {
      const existing = budgets.find((b) => b.categoryId === category.id);
      initialValues[category.id] = existing ? formatAmount(existing.monthlyLimit) : "";
      initialNoLimit[category.id] = false;
    });
    setValues(initialValues);
    setNoLimit(initialNoLimit);
  }, [categories, budgets]);

  const totalDefined = useMemo(() => {
    return categories.reduce((sum, category) => {
      if (noLimit[category.id]) return sum;
      const raw = values[category.id] ?? "";
      return sum + parseCurrency(raw || "0");
    }, 0);
  }, [categories, noLimit, values]);

  const targetTotal = 4500;
  const remaining = Math.max(targetTotal - totalDefined, 0);

  const handleChange = (id: string, val: string) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  const adjustValue = (id: string, delta: number) => {
    const current = parseCurrency(values[id] || "0");
    const updated = Math.max(current + delta, 0);
    setValues((prev) => ({ ...prev, [id]: formatAmount(updated) }));
  };

  const handleSuggestion = () => {
    const suggested: Record<string, string> = {};
    categories.forEach((cat) => {
      const amount = SUGGESTIONS[cat.id] ?? 0;
      suggested[cat.id] = amount ? formatAmount(amount) : values[cat.id] || "";
    });
    setValues((prev) => ({ ...prev, ...suggested }));
    trackEvent("budget_suggestion_used");
  };

  const handleNext = () => {
    const newBudgets = Object.entries(values)
      .map(([categoryId, val]) => ({
        categoryId,
        monthlyLimit: parseCurrency(val || "0"),
      }))
      .filter((b) => b.monthlyLimit > 0);

    hydrateFromSeed({ budgets: newBudgets });
    trackEvent("onboarding_budget_defined_count", {
      count: newBudgets.length,
    });
    router.push("/onboarding/explicacao");
  };

  return (
    <OnboardingShell
      step={3}
      title="Orçamento Mensal"
      description="Defina limites rápidos e mantenha claro o restante do mês."
      backHref="/onboarding/categories"
      onNext={handleNext}
      footerSticky
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total definido</span>
            <span className="font-semibold">€ {formatAmount(totalDefined)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Restante sugerido</span>
            <span className="font-semibold text-emerald-600">€ {formatAmount(remaining)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Baseado em um mês típico de € {formatAmount(targetTotal)}.
          </p>
        </div>

        <Button variant="outline" onClick={handleSuggestion} className="w-full">
          Usar sugestão do app
        </Button>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-border/60 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground"
                    style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
                  >
                    {cat.name[0]}
                  </div>
                  <div>
                    <Label htmlFor={cat.id} className="text-base font-medium">
                      {cat.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">Limite mensal</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Sem limite</span>
                  <Switch
                    checked={noLimit[cat.id]}
                    onCheckedChange={(checked) =>
                      setNoLimit((prev) => ({ ...prev, [cat.id]: checked }))
                    }
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustValue(cat.id, -50)}
                  disabled={noLimit[cat.id]}
                >
                  -50
                </Button>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">€</span>
                  <Input
                    id={cat.id}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="pl-8 text-right"
                    value={values[cat.id] || ""}
                    onChange={(e) => handleChange(cat.id, e.target.value)}
                    disabled={noLimit[cat.id]}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustValue(cat.id, 50)}
                  disabled={noLimit[cat.id]}
                >
                  +50
                </Button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria selecionada. Volte e escolha algumas.
            </div>
          )}
        </div>
      </div>
    </OnboardingShell>
  );
}
