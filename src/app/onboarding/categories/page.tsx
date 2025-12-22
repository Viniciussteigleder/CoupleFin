"use client";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const DEFAULT_CATEGORIES = [
  { id: "cat_rent", name: "Moradia", color: "#22c55e", icon: "home" },
  { id: "cat_food", name: "Mercado", color: "#60a5fa", icon: "shopping_cart" },
  { id: "cat_out", name: "Restaurantes", color: "#f97316", icon: "restaurant" },
  { id: "cat_trans", name: "Transporte", color: "#a78bfa", icon: "commute" },
  { id: "cat_health", name: "Saúde", color: "#f43f5e", icon: "medical_services" },
  { id: "cat_ent", name: "Lazer", color: "#eab308", icon: "confirmation_number" },
  { id: "cat_shop", name: "Compras", color: "#ec4899", icon: "shopping_bag" },
  { id: "cat_srv", name: "Serviços", color: "#64748b", icon: "work" },
];

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, hydrateFromSeed } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    // If store is empty, init with defaults. If has user input, load it.
    if (categories.length > 0) {
      setSelectedIds(categories.map(c => c.id));
    } else {
      setSelectedIds(DEFAULT_CATEGORIES.map(c => c.id));
    }
  }, [categories]);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleNext = () => {
    // Persist to store
    const selectedCats = DEFAULT_CATEGORIES.filter(c => selectedIds.includes(c.id));
    // We are mocking persistence by just updating the store directly
    // Ideally we would merge, but for onboarding simple overwrite is fine
    // Or we rely on `hydrateFromSeed` which expects a partial state.
    // We can simulate hydration for now.
    
    // Hack: directly update state via hydrateFromSeed for now as we don't have setCategories action
    hydrateFromSeed({ categories: selectedCats });
    router.push("/onboarding/budget");
  };

  return (
    <OnboardingShell
      step={2}
      title="Categorias"
      description="Selecione as categorias que fazem parte da vida do casal."
      backHref="/onboarding"
      onNext={handleNext}
      disableNext={selectedIds.length === 0}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DEFAULT_CATEGORIES.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all hover:bg-muted/50",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card text-muted-foreground opacity-80"
              )}
            >
              {isSelected && (
                <div className="absolute right-2 top-2 rounded-full bg-primary p-0.5 text-primary-foreground">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shadow-sm"
                style={{ backgroundColor: isSelected ? cat.color + "20" : undefined }}
              >
                  {/* Just use first letter if no icon, or material symbol logic if setup */}
                  <span className="text-lg font-semibold" style={{ color: isSelected ? cat.color : undefined }}>
                      {cat.name[0]}
                  </span>
              </div>
              <span className={cn("text-sm font-medium", isSelected && "text-foreground")}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </OnboardingShell>
  );
}
