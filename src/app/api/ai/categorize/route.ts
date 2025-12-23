import { NextResponse } from "next/server";
import { aiPrompts } from "@/lib/ai/prompts";
import { callOpenAI } from "@/lib/ai/openai";
import { categoryRules, normalizeText } from "@/lib/ai/categoryRules";
import { createClient as createServerClient } from "@/lib/supabase/server";

const fallbackKeywordMap: Record<string, string> = {
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

type KeywordRule = {
  categoryI: string;
  categoryII: string;
  keywords: string[];
};

const loadCategoryRules = async (): Promise<KeywordRule[]> => {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return categoryRules;

    const { data: membership } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const coupleId = membership?.couple_id;
    if (!coupleId) return categoryRules;

    const { data: rules } = await supabase
      .from("category_keywords")
      .select("category_i, category_ii, keywords")
      .eq("couple_id", coupleId);

    if (rules?.length) {
      return rules.map((rule) => ({
        categoryI: rule.category_i,
        categoryII: rule.category_ii ?? "",
        keywords: rule.keywords ?? [],
      }));
    }

    if (categoryRules.length) {
      await supabase.from("category_keywords").insert(
        categoryRules.map((rule) => ({
          couple_id: coupleId,
          category_i: rule.categoryI,
          category_ii: rule.categoryII,
          keywords: rule.keywords,
        }))
      );
    }
  } catch {
    return categoryRules;
  }

  return categoryRules;
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

  const rules = await loadCategoryRules();

  const assignments = rows.map((row, index) => {
    const description = normalizeText(row.description);

    const matchedRule = rules.find((rule) =>
      rule.keywords.some((keyword) => description.includes(normalizeText(keyword)))
    );

    if (matchedRule) {
      const category = categories.find(
        (cat) => normalizeText(cat.name) === normalizeText(matchedRule.categoryI)
      );
      return {
        index,
        categoryId: category?.id ?? null,
        confidence: category ? 0.7 : 0.3,
        rationale: `rule:${matchedRule.categoryI}/${matchedRule.categoryII}`,
        categoryName: matchedRule.categoryI,
        subcategoryName: matchedRule.categoryII,
      };
    }

    const match = Object.keys(fallbackKeywordMap).find((key) => description.includes(key));
    const targetName = match ? fallbackKeywordMap[match] : null;
    const category = targetName
      ? categories.find((cat) => normalizeText(cat.name) === normalizeText(targetName))
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
