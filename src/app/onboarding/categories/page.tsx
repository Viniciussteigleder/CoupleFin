"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useAppStore, type Category } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat_rent", name: "Moradia", color: "#22c55e", icon: "home" },
  { id: "cat_food", name: "Mercado", color: "#60a5fa", icon: "shopping_cart" },
  { id: "cat_out", name: "Restaurantes", color: "#f97316", icon: "restaurant" },
  { id: "cat_trans", name: "Transporte", color: "#a78bfa", icon: "commute" },
  { id: "cat_health", name: "Saúde", color: "#f43f5e", icon: "medical_services" },
  { id: "cat_ent", name: "Lazer", color: "#eab308", icon: "confirmation_number" },
  { id: "cat_shop", name: "Compras", color: "#ec4899", icon: "shopping_bag" },
  { id: "cat_srv", name: "Serviços", color: "#64748b", icon: "work" },
];

const ICON_OPTIONS = [
  "home",
  "shopping_cart",
  "restaurant",
  "commute",
  "medical_services",
  "confirmation_number",
  "shopping_bag",
  "work",
  "flight",
  "child_friendly",
  "pets",
  "payments",
];

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, setCategories, addCategory } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_OPTIONS[0]);

  const allCategories = useMemo(() => {
    const merged: Category[] = [...DEFAULT_CATEGORIES];
    categories.forEach((cat) => {
      if (!merged.find((item) => item.id === cat.id)) {
        merged.push(cat);
      }
    });
    return merged;
  }, [categories]);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedIds(categories.map((c) => c.id));
    } else {
      setSelectedIds(DEFAULT_CATEGORIES.map((c) => c.id));
    }
  }, [categories]);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
      return;
    }

    if (selectedIds.length >= 8) return;
    setSelectedIds([...selectedIds, id]);
  };

  const handleCreateCategory = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = `cat_${trimmed.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    const newCategory = {
      id,
      name: trimmed,
      color: "#16a34a",
      icon: newIcon,
    };

    addCategory(newCategory);
    setSelectedIds((prev) => [...prev, id]);
    setNewName("");
    setNewIcon(ICON_OPTIONS[0]);
    setIsDialogOpen(false);
  };

  const handleNext = () => {
    const selectedCats = allCategories.filter((cat) => selectedIds.includes(cat.id));
    setCategories(selectedCats);
    trackEvent("onboarding_categories_selected_count", {
      count: selectedIds.length,
    });
    router.push("/onboarding/budget");
  };

  return (
    <OnboardingShell
      step={2}
      title="Categorias"
      description="Selecione como vocês pensam o orçamento."
      backHref="/onboarding"
      onNext={handleNext}
      disableNext={selectedIds.length === 0}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Para manter simples, recomendamos até 8 categorias.</span>
          <span className="font-semibold text-foreground">{selectedIds.length}/8</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allCategories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            const disabled = !isSelected && selectedIds.length >= 8;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                disabled={disabled}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground",
                  disabled && "opacity-40"
                )}
              >
                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full bg-primary p-0.5 text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shadow-sm"
                  style={{ backgroundColor: isSelected ? `${cat.color}20` : undefined }}
                >
                  <span className="material-symbols-outlined text-base" style={{ color: isSelected ? cat.color : undefined }}>
                    {cat.icon ?? "category"}
                  </span>
                </div>
                <span className={cn("text-sm font-medium", isSelected && "text-foreground")}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => {
            trackEvent("create_category_clicked");
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Criar categoria
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Ex: Assinaturas"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ícone</label>
              <Select value={newIcon} onValueChange={setNewIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">{icon}</span>
                        {icon}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateCategory} disabled={!newName.trim()}>
              Salvar categoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </OnboardingShell>
  );
}
