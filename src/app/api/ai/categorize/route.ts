import { NextResponse } from "next/server";
import { aiPrompts } from "@/lib/ai/prompts";
import { callOpenAI } from "@/lib/ai/openai";

const keywordMap: Record<string, string> = {
  mercado: "Mercado",
  supermercado: "Mercado",
  grocery: "Mercado",
  restaurante: "Restaurantes",
  ifood: "Restaurantes",
  uber: "Transporte",
  99: "Transporte",
  gasolina: "Transporte",
  farmacia: "Saúde",
  hospital: "Saúde",
  aluguel: "Moradia",
};

type CategorizeRequest = {
  categories: Array<{ id: string; name: string }>;
  rows: Array<{ description: string; amount: number; date: string }>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CategorizeRequest;
  const categories = body.categories ?? [];
  const rows = body.rows ?? [];

  if (!categories.length || !rows.length) {
    return NextResponse.json({ ok: true, data: { assignments: [] } });
  }

  const aiPrompt = aiPrompts.categorize;
  const aiResult = await callOpenAI([
    { role: "system", content: aiPrompt.system },
    { role: "user", content: aiPrompt.user({ categories, rows }) },
  ]);

  if (aiResult?.assignments?.length) {
    return NextResponse.json({ ok: true, data: aiResult });
  }

  const assignments = rows.map((row, index) => {
    const description = row.description.toLowerCase();
    const match = Object.keys(keywordMap).find((key) => description.includes(key));
    const targetName = match ? keywordMap[match] : null;
    const category = targetName
      ? categories.find((cat) => cat.name.toLowerCase() === targetName.toLowerCase())
      : null;
    return {
      index,
      categoryId: category?.id ?? null,
      confidence: category ? 0.5 : 0.2,
      rationale: category ? `keyword:${match}` : "no-match",
    };
  });

  return NextResponse.json({ ok: true, data: { assignments } });
}
