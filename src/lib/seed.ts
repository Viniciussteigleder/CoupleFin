import type {
  Account,
  Budget,
  Category,
  Goal,
  Transaction,
  Rule,
  AuditLog,
  UploadItem,
} from "@/lib/store/useAppStore";

export function buildSeed() {
  const categories: Category[] = [
    { id: "cat_rent", name: "Moradia", color: "#22c55e" }, // green
    { id: "cat_food", name: "Mercado", color: "#60a5fa" }, // blue
    { id: "cat_out", name: "Restaurantes", color: "#f97316" }, // orange
    { id: "cat_trans", name: "Transporte", color: "#a78bfa" }, // purple
    { id: "cat_health", name: "Saúde", color: "#f43f5e" }, // red
    { id: "cat_ent", name: "Lazer", color: "#eab308" }, // yellow
  ];

  const accounts: Account[] = [
    { id: "acc_nu", name: "Nubank", type: "credit", last4: "4421" },
    { id: "acc_itau", name: "Itaú", type: "debit", last4: "9182" },
    { id: "acc_cash", name: "Carteira", type: "cash" },
  ];

  const budgets: Budget[] = [
    { categoryId: "cat_food", monthlyLimit: 1200 },
    { categoryId: "cat_out", monthlyLimit: 700 },
    { categoryId: "cat_trans", monthlyLimit: 450 },
    { categoryId: "cat_rent", monthlyLimit: 2500 },
  ];

  const transactions: Transaction[] = [
    // Confirmed
    {
      id: "tx_1",
      date: new Date().toISOString(),
      description: "Supermercado Zaffari",
      amount: -243.55,
      categoryId: "cat_food",
      accountId: "acc_itau",
      status: "confirmed",
    },
    {
      id: "tx_old_1",
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      description: "Aluguel",
      amount: -2500.00,
      categoryId: "cat_rent",
      accountId: "acc_itau",
      status: "confirmed",
    },
    // Pending
    {
      id: "tx_2",
      date: new Date(Date.now() - 86400000).toISOString(),
      description: "Restaurante Xis do Centro",
      amount: -68.9,
      categoryId: "cat_out",
      accountId: "acc_nu",
      status: "pending",
    },
    {
      id: "tx_2b",
      date: new Date(Date.now() - 1.5 * 86400000).toISOString(),
      description: "Padaria da Esquina",
      amount: -15.50,
      accountId: "acc_nu",
      status: "pending", // Uncategorized
    },
    // Duplicates
    {
      id: "tx_3",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      description: "Uber *Trip",
      amount: -23.4,
      categoryId: "cat_trans",
      accountId: "acc_nu",
      status: "confirmed",
    },
    {
      id: "tx_4",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      description: "Uber *Trip",
      amount: -23.4,
      categoryId: "cat_trans",
      accountId: "acc_nu",
      status: "duplicate",
    },
  ];

  const goals: Goal[] = [{ id: "g1", name: "Viagem Fim de Ano", target: 6000, current: 1450 }];

  const rules: Rule[] = [
    {
      id: "rule_1",
      pattern: "uber",
      categoryId: "cat_trans",
      applyPast: true,
      priority: "high",
      createdAt: new Date().toISOString(),
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "log_1",
      actor: "Ana",
      action: "Importou CSV",
      entity: "uploads",
      details: "23 transações pendentes",
      createdAt: new Date().toISOString(),
    },
    {
      id: "log_2",
      actor: "João",
      action: "Criou regra",
      entity: "rules",
      details: "Uber → Transporte",
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
  ];

  const uploads: UploadItem[] = [
    {
      id: "upload_seed",
      fileName: "extrato_dezembro.csv",
      type: "csv",
      status: "done",
      createdAt: new Date().toISOString(),
      stats: { created: 23, duplicates: 2, review: 4 },
    },
  ];

  return { categories, accounts, budgets, transactions, goals, rules, auditLogs, uploads };
}
