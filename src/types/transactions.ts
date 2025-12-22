export interface Transaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  status: "pending" | "confirmed" | "duplicate";
  category?: string | null;
  categoryId?: string | null;
  account?: string | null;
  accountId?: string | null;
}
