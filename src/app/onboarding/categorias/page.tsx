import Link from "next/link";

import { Button } from "@/components/ui/button";

const categories = [
  { name: "Moradia", description: "Aluguel, condominio, luz e internet.", icon: "house", color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Supermercado", description: "Compras do mes e itens de limpeza.", icon: "shopping_cart", color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Transporte", description: "Combustivel, Uber, manutencao e IPVA.", icon: "directions_car", color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Saude", description: "Plano, farmacia e exames.", icon: "favorite", color: "text-rose-500", bg: "bg-rose-50" },
  { name: "Lazer", description: "Restaurantes, viagens e hobbies.", icon: "celebration", color: "text-violet-500", bg: "bg-violet-50" },
  { name: "Investimentos", description: "Reserva e aplicacoes.", icon: "trending_up", color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function CategoriasPage() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Configuracao
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          Vamos personalizar seu orcamento
        </h1>
        <p className="text-lg text-muted-foreground">
          Selecione as categorias principais. Voce podera editar isso mais tarde.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <label
            key={category.name}
            className="group relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.bg} ${category.color}`}>
                <span className="material-symbols-outlined text-2xl">{category.icon}</span>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary/50"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/onboarding/boas-vindas">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/orcamentos">Proximo passo</Link>
        </Button>
      </div>
    </div>
  );
}
