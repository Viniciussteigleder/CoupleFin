import { createClient } from "@/lib/supabase/client";
import { Transaction } from "@/types/transactions";

interface TransactionRow {
  id: string;
  merchant: string | null;
  date: string;
  amount: number | string | null;
  amount_cf: number | string | null;
  status: string | null;
  category_id: string | null;
  account_id: string | null;
  categories?: { name: string } | null;
  accounts?: { name: string } | null;
}

function toNumber(value: number | string | null) {
  if (value === null || value === undefined) return 0;
  return typeof value === "string" ? Number(value) : value;
}

export async function fetchTransactions(params?: {
  status?: "pending" | "confirmed" | "duplicate";
}) {
  const supabase = createClient();
  const query = supabase
    .from("transactions")
    .select(
      "id, merchant, date, amount, amount_cf, status, category_id, account_id, categories(name), accounts(name)"
    )
    .order("date", { ascending: false });

  if (params?.status) {
    query.eq("status", params.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data as TransactionRow[]).map((row) => ({
    id: row.id,
    merchant: row.merchant ?? "Sem descricao",
    date: row.date,
    amount: toNumber(row.amount_cf ?? row.amount),
    status: (row.status ?? "pending") as Transaction["status"],
    category: row.categories?.name ?? null,
    categoryId: row.category_id ?? null,
    account: row.accounts?.name ?? null,
    accountId: row.account_id ?? null,
  }));
}
