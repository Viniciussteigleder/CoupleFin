import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const defaultCategories = [
  "Mercado",
  "Restaurantes",
  "Transporte",
  "Moradia",
  "Lazer",
];

export function CategoryPicker({
  value,
  options = defaultCategories,
  onSelect,
}: {
  value?: string | null;
  options?: string[];
  onSelect?: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((category) => (
        <Button
          key={category}
          type="button"
          size="sm"
          variant={value === category ? "default" : "outline"}
          className={cn(value === category && "text-primary-foreground")}
          onClick={() => onSelect?.(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
