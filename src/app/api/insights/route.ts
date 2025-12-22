import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Insight = {
  id: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  severity: "warning" | "tip" | "success";
};

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: true, data: [] });
  }

  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member?.couple_id) {
    return NextResponse.json({ ok: true, data: [] });
  }

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const [categories, budgets, transactions] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .eq("couple_id", member.couple_id),
    supabase.from("budgets").select("category_id, amount").eq("couple_id", member.couple_id),
    supabase
      .from("transactions")
      .select("id, merchant, amount_cf, amount, date, category_id")
      .eq("couple_id", member.couple_id),
  ]);

  const categoryMap = new Map<string, string>();
  (categories.data ?? []).forEach((cat) => categoryMap.set(cat.id, cat.name));

  const monthTransactions = (transactions.data ?? []).filter((tx) => {
    const date = new Date(tx.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  const totalsByCategory = new Map<string, number>();
  let totalIncome = 0;
  let totalExpense = 0;

  monthTransactions.forEach((tx) => {
    const amount = Number(tx.amount_cf ?? tx.amount ?? 0);
    if (amount > 0) totalIncome += amount;
    if (amount < 0) totalExpense += Math.abs(amount);
    if (tx.category_id) {
      totalsByCategory.set(
        tx.category_id,
        (totalsByCategory.get(tx.category_id) ?? 0) + Math.abs(amount)
      );
    }
  });

  const insights: Insight[] = [];

  const budgetWarning = (budgets.data ?? []).find((budget) => {
    const spent = totalsByCategory.get(budget.category_id) ?? 0;
    return budget.amount > 0 && spent >= budget.amount * 0.8;
  });

  if (budgetWarning) {
    const name = categoryMap.get(budgetWarning.category_id) ?? "Categoria";
    insights.push({
      id: "budget-warning",
      title: `${name} acima de 80% do orçamento`,
      body: `Você já usou a maior parte do budget de ${name}. Ajuste o limite ou reduza gastos nesta semana.`,
      cta: { label: "Ver transações", href: `/transactions?cat=${budgetWarning.category_id}` },
      severity: "warning",
    });
  }

  const merchantCounts = new Map<string, number>();
  monthTransactions.forEach((tx) => {
    if (!tx.merchant) return;
    const key = tx.merchant.toLowerCase();
    merchantCounts.set(key, (merchantCounts.get(key) ?? 0) + 1);
  });
  const repeatedMerchant = Array.from(merchantCounts.entries()).find(([, count]) => count >= 2);
  if (repeatedMerchant) {
    insights.push({
      id: "rule-suggestion",
      title: `Crie uma regra para ${repeatedMerchant[0]}`,
      body: "Você tem transações repetidas desse comerciante. Uma regra reduz a fila de revisão.",
      cta: { label: "Criar regra", href: `/rules/new?merchant=${repeatedMerchant[0]}` },
      severity: "tip",
    });
  }

  if (totalIncome - totalExpense > 0) {
    insights.push({
      id: "positive-balance",
      title: "Saldo positivo no mês",
      body: "Parabéns! O saldo do mês está positivo. Considere direcionar uma parte para metas.",
      cta: { label: "Ver metas", href: "/goals" },
      severity: "success",
    });
  }

  return NextResponse.json({ ok: true, data: insights.slice(0, 3) });
}
