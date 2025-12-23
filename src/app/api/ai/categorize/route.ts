import { NextResponse } from "next/server";
import { aiPromptsEnterprise } from "@/lib/ai/promptsEnterprise";
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
  zahlung: "Pagamento Cartao fechamento",
  lastschrift: "Pagamento Cartao fechamento",
  "american express": "Pagamento Cartao fechamento",
  "deutsche kreditbank": "Pagamento Cartao fechamento",
  "zahlung erhalten": "Pagamento Cartao fechamento",
};

type CategorizeRequest = {
  categories?: Array<{ id: string; name: string }>;
  taxonomy?: {
    categories: Array<{
      id: string;
      name?: string;
      categoriaI?: string;
      categoriaII?: string;
      type?: "Despesa" | "Receita";
      fixedVar?: "Fixo" | "Variavel";
    }>;
  };
  rows: Array<{ description: string; amount: number; date: string; source?: string }>;
};

type KeywordRule = {
  type: "Despesa" | "Receita";
  fixedVar: "Fixo" | "Variavel";
  categoryI: string;
  categoryII: string;
  keywords: string[];
};

type CategoryInput = {
  id: string;
  name?: string;
  categoriaI?: string;
  categoriaII?: string;
  type?: "Despesa" | "Receita";
  fixedVar?: "Fixo" | "Variavel";
};

const fallbackRules: KeywordRule[] = categoryRules.map((rule) => ({
  type: rule.type,
  fixedVar: rule.fixed,
  categoryI: rule.categoryI,
  categoryII: rule.categoryII,
  keywords: rule.keywords,
}));

const loadCategoryRules = async (): Promise<KeywordRule[]> => {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fallbackRules;

    const { data: membership } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const coupleId = membership?.couple_id;
    if (!coupleId) return fallbackRules;

    const { data: rules } = await supabase
      .from("category_keywords")
      .select("category_i, category_ii, keywords, type, fixed_var")
      .eq("couple_id", coupleId);

    if (rules?.length) {
      return rules.map((rule) => ({
        type: (rule.type as "Despesa" | "Receita") ?? "Despesa",
        fixedVar: (rule.fixed_var as "Fixo" | "Variavel") ?? "Variavel",
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
          type: rule.type,
          fixed_var: rule.fixed,
          keywords: rule.keywords,
        }))
      );
    }
  } catch {
    return fallbackRules;
  }

  return fallbackRules;
};

const resolveCategory = (
  categories: Array<{ id: string; name: string }>,
  name?: string | null
) => {
  if (!name) return null;
  const normalized = normalizeText(name);
  return categories.find((cat) => normalizeText(cat.name) === normalized) ?? null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CategorizeRequest;
  const rawCategories = (body.taxonomy?.categories ??
    body.categories ??
    []) as CategoryInput[];
  const categories = rawCategories
    .map((cat) => ({
      id: cat.id,
      name: cat.name ?? cat.categoriaI ?? cat.categoriaII ?? "",
    }))
    .filter((cat) => Boolean(cat.name));
  const rows = body.rows ?? [];

  if (!categories.length || !rows.length) {
    return NextResponse.json({ ok: true, data: { assignments: [] } });
  }

  const rules = await loadCategoryRules();
  const taxonomy = {
    categories: rawCategories.map((cat) => ({
      id: cat.id,
      name: cat.name ?? cat.categoriaI ?? cat.categoriaII ?? "",
      categoriaI: cat.categoriaI ?? cat.name ?? "",
      categoriaII: cat.categoriaII ?? "",
      type: cat.type ?? "Despesa",
      fixedVar: cat.fixedVar ?? "Variavel",
    })),
  };

  const aiPrompt = aiPromptsEnterprise.categorize_v2;
  const aiResult = await callOpenAI([
    { role: "system", content: aiPrompt.system },
    {
      role: "user",
      content: aiPrompt.user({
        taxonomy,
        referenceRules: rules.map((rule) => ({
          type: rule.type,
          fixedVar: rule.fixedVar,
          categoriaI: rule.categoryI,
          categoriaII: rule.categoryII,
          keywords: rule.keywords,
        })),
        rows: rows.map((row, index) => ({
          index,
          description: row.description,
          amount: row.amount,
          date: row.date,
          source: row.source,
        })),
      }),
    },
  ]);

  if (aiResult?.assignments?.length) {
    const assignments = aiResult.assignments.map((assignment: Record<string, unknown>) => {
      const rawCategoryId = typeof assignment.categoryId === "string" ? assignment.categoryId : null;
      const categoryId = rawCategoryId && categories.some((cat) => cat.id === rawCategoryId)
        ? rawCategoryId
        : null;
      const canonical = assignment.canonical as {
        type?: string;
        fixedVar?: string;
        categoriaI?: string | null;
        categoriaII?: string | null;
      } | undefined;
      const fallbackCategory =
        resolveCategory(categories, canonical?.categoriaII ?? null) ??
        resolveCategory(categories, canonical?.categoriaI ?? null) ??
        null;
      const resolvedCategoryId = categoryId ?? fallbackCategory?.id ?? null;
      return {
        index: Number(assignment.index),
        categoryId: resolvedCategoryId,
        confidence: typeof assignment.confidence === "number" ? assignment.confidence : 0.5,
        categoryName: canonical?.categoriaI ?? null,
        subcategoryName: canonical?.categoriaII ?? null,
        mappedBy: assignment.mappedBy ?? (resolvedCategoryId ? "FALLBACK" : "NULL"),
        needsUserReview:
          typeof assignment.needsUserReview === "boolean"
            ? assignment.needsUserReview
            : typeof assignment.confidence === "number"
            ? assignment.confidence < 0.7
            : true,
        signals: Array.isArray(assignment.signals) ? assignment.signals : [],
        rationale: typeof assignment.rationale === "string" ? assignment.rationale : "",
        canonical: canonical ?? null,
      };
    });
    return NextResponse.json({ ok: true, data: { assignments } });
  }

  const assignments = rows.map((row, index) => {
    const description = normalizeText(row.description);

    const matchedRule = rules.find((rule) =>
      rule.keywords.some((keyword) => description.includes(normalizeText(keyword)))
    );

    if (matchedRule) {
      const category =
        resolveCategory(categories, matchedRule.categoryII) ??
        resolveCategory(categories, matchedRule.categoryI);
      return {
        index,
        categoryId: category?.id ?? null,
        confidence: category ? 0.7 : 0.3,
        rationale: `rule:${matchedRule.categoryI}/${matchedRule.categoryII}`,
        categoryName: matchedRule.categoryI,
        subcategoryName: matchedRule.categoryII,
        mappedBy: category ? "EXACT" : "NULL",
        needsUserReview: !category,
        canonical: {
          type: matchedRule.type,
          fixedVar: matchedRule.fixedVar,
          categoriaI: matchedRule.categoryI,
          categoriaII: matchedRule.categoryII,
        },
      };
    }

    const match = Object.keys(fallbackKeywordMap).find((key) => description.includes(key));
    const targetName = match ? fallbackKeywordMap[match] : null;
    const category = targetName ? resolveCategory(categories, targetName) : null;
    return {
      index,
      categoryId: category?.id ?? null,
      confidence: category ? 0.5 : 0.2,
      rationale: category ? `keyword:${match}` : "no-match",
      categoryName: targetName ?? null,
      subcategoryName: null,
      mappedBy: category ? "FALLBACK" : "NULL",
      needsUserReview: !category,
      canonical: {
        type: "Unknown",
        fixedVar: "Unknown",
        categoriaI: targetName,
        categoriaII: null,
      },
    };
  });

  return NextResponse.json({ ok: true, data: { assignments } });
}
