import { NextResponse } from "next/server";
import { withLatency } from "@/lib/mockLatency";

export async function GET() {
  const insights = await withLatency(
    () => [
      {
        id: "i1",
        title: "Restaurantes acima do orçamento",
        body: "Você já usou ~80% do budget de Restaurantes. Quer ajustar o orçamento ou reduzir 1 saída nesta semana?",
        cta: { label: "Ver transações", href: "/transactions?cat=cat_out" },
        severity: "warning",
      },
      {
        id: "i2",
        title: "Crie uma regra para Uber",
        body: "Você tem transações repetidas de Uber. Crie uma regra para categorizar automaticamente como Transporte.",
        cta: { label: "Criar regra", href: "/transactions?search=uber" },
        severity: "tip",
      },
      {
        id: "i3",
        title: "Meta de Viagem no caminho",
        body: "Vocês economizaram € 400 a mais que o previsto este mês. Parabéns!",
        cta: { label: "Ver metas", href: "/goals" },
        severity: "success",
      }
    ],
    800
  );

  return NextResponse.json({ ok: true, data: insights });
}
