import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: "#22c55e",
  Mercado: "#60a5fa",
  Restaurantes: "#f97316",
  Transporte: "#a78bfa",
  Saúde: "#f43f5e",
  Lazer: "#eab308",
  Compras: "#ec4899",
  Serviços: "#64748b",
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const normalizeCategoryColor = (name: string, fallback?: string) =>
  fallback ?? CATEGORY_COLORS[name] ?? "#16a34a";

type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type BudgetRow = {
  category_id: string;
  amount: number | null;
  couple_id?: string | null;
};

type GoalRow = {
  id: string;
  name: string;
  target_amount: number | null;
  current_amount: number | null;
  deadline: string | null;
  couple_id?: string | null;
};

type RuleRow = {
  id: string;
  keyword: string;
  category_id: string | null;
  apply_past: boolean | null;
  created_at: string;
};

const buildCoupleName = (user: SupabaseUser) => {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return `Casal de ${fullName.trim().split(" ")[0]}`;
  }
  if (user.email) {
    return `Casal de ${user.email.split("@")[0]}`;
  }
  return "Casal";
};

const ensureCoupleId = async (supabase: ReturnType<typeof createClient>, user: SupabaseUser) => {
  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (member?.couple_id) return member.couple_id as string;

  const { data: couple, error: coupleError } = await supabase
    .from("couples")
    .insert({ name: buildCoupleName(user) })
    .select("id")
    .single();
  if (coupleError) throw coupleError;

  const { error: memberError } = await supabase.from("couple_members").insert({
    couple_id: couple.id,
    user_id: user.id,
    role: "admin",
  });
  if (memberError) throw memberError;

  return couple.id as string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string;
  couple_id?: string;
};

export type Account = {
  id: string;
  name: string;
  type: "credit" | "debit" | "cash";
  last4?: string;
  couple_id?: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
  accountId?: string;
  status?: "pending" | "confirmed" | "duplicate" | "archived";
  merchant?: string;
  couple_id?: string;
  source_upload_id?: string;
  uploadId?: string;
  sourceMeta?: Record<string, string | number | null>;
};

export type Budget = {
  categoryId: string;
  monthlyLimit: number;
  couple_id?: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  couple_id?: string;
};

export type Rule = {
  id: string;
  pattern: string;
  categoryId: string;
  applyPast: boolean;
  priority: "high" | "medium" | "low";
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  details?: string;
  createdAt: string;
};

export type UploadItem = {
  id: string;
  fileName: string;
  type: "csv" | "ocr";
  status: "reading" | "mapping" | "creating" | "done" | "error";
  createdAt: string;
  stats?: { created: number; duplicates: number; review: number };
};

export type CalendarEvent = {
  id: string;
  name: string;
  amount: number | null;
  type: "recurring" | "planned";
  frequency?: string | null;
  startDate: string;
  endDate?: string | null;
  nextOccurrence?: string | null;
  description?: string | null;
  categoryId?: string | null;
  status?: string | null;
  couple_id?: string;
};

export type RitualPreferences = {
  weeklyDay: string;
  weeklyTime: string;
  remindersEnabled: boolean;
};

export type ConsentSettings = {
  aiAutomation: boolean;
  consentVersion: string;
  acceptedAt: string;
};

interface AppState {
  coupleId: string | null;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  rules: Rule[];
  auditLogs: AuditLog[];
  uploads: UploadItem[];
  events: CalendarEvent[];
  ritualPreferences: RitualPreferences | null;
  consents: ConsentSettings | null;
  
  isLoading: boolean;
  error: string | null;

  // Actions
  hydrateFromSeed: (data: Partial<AppState>) => void;
  fetchData: () => Promise<void>;
  setCategories: (categories: Category[]) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  setAccounts: (accounts: Account[]) => Promise<void>;
  setBudgets: (budgets: Budget[]) => Promise<void>;
  addTransactions: (items: Transaction[], uploadId?: string) => Promise<void>;
  addUpload: (upload: UploadItem) => Promise<string | null>;
  addAuditLog: (log: AuditLog) => Promise<void>;
  addRule: (rule: Rule) => Promise<void>;
  addEvent: (event: CalendarEvent) => Promise<CalendarEvent | null>;
  updateRitualPreferences: (prefs: RitualPreferences) => Promise<void>;
  updateConsent: (consent: ConsentSettings) => Promise<void>;
  
  confirmTransactions: (ids: string[]) => Promise<void>;
  reopenTransactions: (ids: string[]) => Promise<void>;
  setTransactionCategory: (txId: string, catId: string) => Promise<void>;
  markDuplicate: (txId: string) => Promise<void>;
  createRule: (
    pattern: string,
    catId: string,
    options?: { applyPast?: boolean; priority?: Rule["priority"] }
  ) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  coupleId: null,
  categories: [],
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  rules: [],
  auditLogs: [],
  uploads: [],
  events: [],
  ritualPreferences: null,
  consents: null,
  isLoading: false,
  error: null,

  hydrateFromSeed: (data) => set((state) => ({ ...state, ...data })),

  setCategories: async (categories) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const payload = categories.map((cat) => ({
      id: isUuid(cat.id) ? cat.id : crypto.randomUUID(),
      name: cat.name,
      icon: cat.icon ?? "category",
      color: normalizeCategoryColor(cat.name, cat.color),
      type: "expense",
      couple_id: coupleId,
    }));

    const { data, error } = await supabase
      .from("categories")
      .upsert(payload, { onConflict: "id" })
      .select("id, name, icon, color, couple_id");
    if (error) throw error;

    set({
      coupleId,
      categories:
        data?.map((row) => ({
          id: row.id,
          name: row.name,
          icon: row.icon ?? "category",
          color: normalizeCategoryColor(row.name, row.color ?? undefined),
          couple_id: row.couple_id ?? undefined,
        })) ?? [],
    });
  },

  addCategory: async (category) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const payload = {
      id: isUuid(category.id) ? category.id : crypto.randomUUID(),
      name: category.name,
      icon: category.icon ?? "category",
      color: normalizeCategoryColor(category.name, category.color),
      type: "expense",
      couple_id: coupleId,
    };
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select("id, name, icon, color, couple_id")
      .single();
    if (error) throw error;

    set((state) => ({
      coupleId,
      categories: [
        ...state.categories,
        {
          id: data.id,
          name: data.name,
          icon: data.icon ?? "category",
          color: normalizeCategoryColor(data.name, data.color ?? undefined),
          couple_id: data.couple_id ?? undefined,
        },
      ],
    }));
  },

  setAccounts: async (accounts) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const payload = accounts.map((account) => ({
      id: isUuid(account.id) ? account.id : crypto.randomUUID(),
      name: account.name,
      kind: account.type,
      last4: account.last4 ?? null,
      couple_id: coupleId,
    }));

    const { data, error } = await supabase
      .from("accounts")
      .upsert(payload, { onConflict: "id" })
      .select("id, name, kind, last4, couple_id");
    if (error) throw error;

    set({
      coupleId,
      accounts:
        data?.map((row) => ({
          id: row.id,
          name: row.name,
          type: row.kind,
          last4: row.last4 ?? undefined,
          couple_id: row.couple_id ?? undefined,
        })) ?? [],
    });
  },

  setBudgets: async (budgets) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const payload = budgets.map((budget) => ({
      couple_id: coupleId,
      category_id: budget.categoryId,
      amount: budget.monthlyLimit,
      period: "monthly",
    }));

    if (payload.length) {
      const { error } = await supabase
        .from("budgets")
        .upsert(payload, { onConflict: "couple_id,category_id,period" });
      if (error) throw error;
    }

    set({ coupleId, budgets });
  },

  addTransactions: async (items, uploadId) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const payload = items.map((item) => {
      const amountCf = Number(item.amount);
      return {
        id: isUuid(item.id) ? item.id : crypto.randomUUID(),
        merchant: item.description,
        amount: Math.abs(amountCf),
        amount_cf: amountCf,
        date: new Date(item.date).toISOString().split("T")[0],
        category_id: item.categoryId ?? null,
        account_id: item.accountId ?? null,
        status: item.status ?? "pending",
        source: uploadId || item.uploadId || item.source_upload_id ? "csv" : "manual",
        couple_id: coupleId,
        upload_id: uploadId ?? item.uploadId ?? item.source_upload_id ?? null,
        source_meta: item.sourceMeta ?? null,
      };
    });

    const { data, error } = await supabase
      .from("transactions")
      .insert(payload)
      .select(
        "id, merchant, amount_cf, amount, date, category_id, account_id, status, couple_id, upload_id, source_meta"
      );
    if (error) throw error;

    const mapped =
      data?.map((row) => ({
        id: row.id,
        amount: Number(row.amount_cf ?? row.amount ?? 0),
        description: row.merchant ?? "Transação",
        date: new Date(row.date).toISOString(),
        categoryId: row.category_id ?? undefined,
        accountId: row.account_id ?? undefined,
        status: row.status ?? undefined,
        couple_id: row.couple_id ?? undefined,
        uploadId: row.upload_id ?? undefined,
        source_upload_id: row.upload_id ?? undefined,
        sourceMeta: row.source_meta ?? undefined,
      })) ?? [];

    set((state) => ({
      coupleId,
      transactions: [...mapped, ...state.transactions],
    }));
  },

  addUpload: async (upload) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const status =
      upload.status === "done"
        ? "processed"
        : upload.status === "error"
        ? "error"
        : "pending";

    const { data, error } = await supabase
      .from("uploads")
      .insert({
        filename: upload.fileName,
        url: `local://${upload.fileName}`,
        status,
        couple_id: coupleId,
        metadata: {
          type: upload.type,
          stats: upload.stats ?? null,
        },
      })
      .select("id, filename, status, created_at, metadata")
      .single();
    if (error) throw error;

    const mapped: UploadItem = {
      id: data.id,
      fileName: data.filename,
      type: (data.metadata?.type as UploadItem["type"]) ?? "csv",
      status: data.status === "processed" ? "done" : "creating",
      createdAt: data.created_at,
      stats: data.metadata?.stats ?? undefined,
    };

    set((state) => ({
      coupleId,
      uploads: [mapped, ...state.uploads],
    }));

    return data.id as string;
  },

  addAuditLog: async (log) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        couple_id: coupleId,
        actor_id: user.id,
        action: log.action,
        entity_type: log.entity,
        details: { text: log.details ?? null, actor: log.actor },
      })
      .select("id, created_at, action, entity_type, details")
      .single();
    if (error) throw error;

    set((state) => ({
      coupleId,
      auditLogs: [
        {
          id: data.id,
          actor: log.actor,
          action: data.action,
          entity: data.entity_type ?? "",
          details: data.details?.text ?? log.details,
          createdAt: data.created_at,
        },
        ...state.auditLogs,
      ],
    }));
  },

  addRule: async (rule) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const { data, error } = await supabase
      .from("rules")
      .insert({
        keyword: rule.pattern,
        category_id: rule.categoryId,
        apply_past: rule.applyPast,
        type: "contains",
        couple_id: coupleId,
      })
      .select("id, keyword, category_id, apply_past, created_at")
      .single();
    if (error) throw error;

    set((state) => ({
      coupleId,
      rules: [
        {
          id: data.id,
          pattern: data.keyword,
          categoryId: data.category_id ?? "",
          applyPast: data.apply_past ?? false,
          priority: rule.priority ?? "medium",
          createdAt: data.created_at,
        },
        ...state.rules,
      ],
    }));
  },

  addEvent: async (event) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const { data, error } = await supabase
      .from("events")
      .insert({
        couple_id: coupleId,
        name: event.name,
        amount: event.amount ?? null,
        type: event.type,
        frequency: event.frequency ?? null,
        start_date: event.startDate,
        end_date: event.endDate ?? null,
        next_occurrence: event.nextOccurrence ?? null,
        description: event.description ?? null,
        category_id: event.categoryId ?? null,
        status: event.status ?? "active",
      })
      .select(
        "id, name, amount, type, frequency, start_date, end_date, next_occurrence, description, category_id, status, couple_id"
      )
      .single();
    if (error) throw error;

    const mapped: CalendarEvent = {
      id: data.id,
      name: data.name,
      amount: data.amount,
      type: data.type,
      frequency: data.frequency,
      startDate: data.start_date,
      endDate: data.end_date,
      nextOccurrence: data.next_occurrence,
      description: data.description,
      categoryId: data.category_id,
      status: data.status,
      couple_id: data.couple_id,
    };

    set((state) => ({
      coupleId,
      events: [mapped, ...state.events],
    }));

    return mapped;
  },

  updateRitualPreferences: async (prefs) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    const existing = await supabase
      .from("ritual_preferences")
      .select("id")
      .eq("couple_id", coupleId)
      .maybeSingle();

    if (existing.data?.id) {
      await supabase
        .from("ritual_preferences")
        .update({
          weekly_day: prefs.weeklyDay,
          weekly_time: prefs.weeklyTime,
          reminders_enabled: prefs.remindersEnabled,
        })
        .eq("id", existing.data.id);
    } else {
      await supabase.from("ritual_preferences").insert({
        couple_id: coupleId,
        weekly_day: prefs.weeklyDay,
        weekly_time: prefs.weeklyTime,
        reminders_enabled: prefs.remindersEnabled,
      });
    }

    set({ coupleId, ritualPreferences: prefs });
  },

  updateConsent: async (consent) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
    await supabase.from("consents").insert({
      couple_id: coupleId,
      actor_id: user.id,
      ai_automation: consent.aiAutomation,
      consent_version: consent.consentVersion,
    });

    set({ coupleId, consents: consent });
  },

  fetchData: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false, coupleId: null });
        return;
      }

      const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);

      const [
        cats,
        accs,
        txs,
        buds,
        gs,
        rules,
        uploads,
        logs,
        ritual,
        consents,
        events,
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, icon, color, couple_id")
          .eq("couple_id", coupleId),
        supabase
          .from("accounts")
          .select("id, name, kind, last4, couple_id")
          .eq("couple_id", coupleId),
        supabase
          .from("transactions")
          .select(
            "id, merchant, amount_cf, amount, date, category_id, account_id, status, couple_id, upload_id, source_meta"
          )
          .eq("couple_id", coupleId)
          .order("date", { ascending: false }),
        supabase.from("budgets").select("*").eq("couple_id", coupleId),
        supabase.from("goals").select("*").eq("couple_id", coupleId),
        supabase.from("rules").select("*").eq("couple_id", coupleId),
        supabase
          .from("uploads")
          .select("id, filename, status, created_at, metadata")
          .eq("couple_id", coupleId)
          .order("created_at", { ascending: false }),
        supabase
          .from("audit_logs")
          .select("id, created_at, action, entity_type, details, actor_id")
          .eq("couple_id", coupleId)
          .order("created_at", { ascending: false }),
        supabase
          .from("ritual_preferences")
          .select("weekly_day, weekly_time, reminders_enabled")
          .eq("couple_id", coupleId)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("consents")
          .select("ai_automation, consent_version, created_at")
          .eq("couple_id", coupleId)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("events")
          .select(
            "id, name, amount, type, frequency, start_date, end_date, next_occurrence, description, category_id, status, couple_id"
          )
          .eq("couple_id", coupleId)
          .order("start_date", { ascending: true }),
      ]);

      const budgetRows = (buds.data ?? []) as BudgetRow[];
      const goalRows = (gs.data ?? []) as GoalRow[];
      const ruleRows = (rules.data ?? []) as RuleRow[];

      set({
        coupleId,
        categories:
          cats.data?.map((row) => ({
            id: row.id,
            name: row.name,
            icon: row.icon ?? "category",
            color: normalizeCategoryColor(row.name, row.color ?? undefined),
            couple_id: row.couple_id ?? undefined,
          })) ?? [],
        accounts:
          accs.data?.map((row) => ({
            id: row.id,
            name: row.name,
            type: row.kind,
            last4: row.last4 ?? undefined,
            couple_id: row.couple_id ?? undefined,
          })) ?? [],
        transactions:
          txs.data?.map((row) => ({
            id: row.id,
            amount: Number(row.amount_cf ?? row.amount ?? 0),
            description: row.merchant ?? "Transação",
            date: new Date(row.date).toISOString(),
            categoryId: row.category_id ?? undefined,
            accountId: row.account_id ?? undefined,
            status: row.status ?? undefined,
            couple_id: row.couple_id ?? undefined,
            uploadId: row.upload_id ?? undefined,
            source_upload_id: row.upload_id ?? undefined,
            sourceMeta: row.source_meta ?? undefined,
          })) ?? [],
        budgets: budgetRows.map((row) => ({
          categoryId: row.category_id,
          monthlyLimit: Number(row.amount ?? 0),
          couple_id: row.couple_id ?? undefined,
        })),
        goals: goalRows.map((row) => ({
          id: row.id,
          name: row.name,
          target: Number(row.target_amount ?? 0),
          current: Number(row.current_amount ?? 0),
          deadline: row.deadline ?? undefined,
          couple_id: row.couple_id ?? undefined,
        })),
        rules: ruleRows.map((row) => ({
          id: row.id,
          pattern: row.keyword,
          categoryId: row.category_id ?? "",
          applyPast: row.apply_past ?? false,
          priority: "medium",
          createdAt: row.created_at,
        })),
        uploads:
          uploads.data?.map((row) => ({
            id: row.id,
            fileName: row.filename,
            type: (row.metadata?.type as UploadItem["type"]) ?? "csv",
            status: row.status === "processed" ? "done" : "creating",
            createdAt: row.created_at,
            stats: row.metadata?.stats ?? undefined,
          })) ?? [],
        auditLogs:
          logs.data?.map((row) => ({
            id: row.id,
            actor:
              row.details?.actor ??
              (row.actor_id ? `user:${row.actor_id}` : "Sistema"),
            action: row.action,
            entity: row.entity_type ?? "",
            details:
              typeof row.details?.text === "string"
                ? row.details.text
                : row.details
                ? JSON.stringify(row.details)
                : undefined,
            createdAt: row.created_at,
          })) ?? [],
        ritualPreferences: ritual.data?.[0]
          ? {
              weeklyDay: ritual.data[0].weekly_day,
              weeklyTime: ritual.data[0].weekly_time,
              remindersEnabled: ritual.data[0].reminders_enabled,
            }
          : null,
        consents: consents.data?.[0]
          ? {
              aiAutomation: consents.data[0].ai_automation,
              consentVersion: consents.data[0].consent_version,
              acceptedAt: consents.data[0].created_at,
            }
          : null,
        events:
          events.data?.map((event) => ({
            id: event.id,
            name: event.name,
            amount: event.amount,
            type: event.type,
            frequency: event.frequency,
            startDate: event.start_date,
            endDate: event.end_date,
            nextOccurrence: event.next_occurrence,
            description: event.description,
            categoryId: event.category_id,
            status: event.status,
            couple_id: event.couple_id,
          })) ?? [],
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados";
      set({ error: message, isLoading: false });
    }
  },

  confirmTransactions: async (ids) => {
    // Optimistic update
    set((state) => ({
      transactions: state.transactions.map((t) =>
        ids.includes(t.id) ? { ...t, status: "confirmed" } : t
      ),
    }));

    // Async DB update
    const supabase = createClient();
    await supabase.from('transactions').update({ status: 'confirmed' }).in('id', ids);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
      await supabase.from("audit_logs").insert({
        couple_id: coupleId,
        actor_id: user.id,
        action: "Confirmou transações",
        entity_type: "transactions",
        details: { text: `${ids.length} itens confirmados` },
      });
      set((state) => ({
        auditLogs: [
          {
            id: crypto.randomUUID(),
            actor: "Sistema",
            action: "Confirmou transações",
            entity: "transactions",
            details: `${ids.length} itens confirmados`,
            createdAt: new Date().toISOString(),
          },
          ...state.auditLogs,
        ],
      }));
    }
  },

  reopenTransactions: async (ids) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        ids.includes(t.id) ? { ...t, status: "pending" } : t
      ),
    }));
    const supabase = createClient();
    await supabase.from('transactions').update({ status: 'pending' }).in('id', ids);
  },

  setTransactionCategory: async (txId, catId) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === txId ? { ...t, categoryId: catId } : t
      ),
    }));
    const supabase = createClient();
    await supabase.from('transactions').update({ category_id: catId }).eq('id', txId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
      await supabase.from("audit_logs").insert({
        couple_id: coupleId,
        actor_id: user.id,
        action: "Atualizou categoria",
        entity_type: "transactions",
        details: { text: `Transação ${txId}` },
      });
      set((state) => ({
        auditLogs: [
          {
            id: crypto.randomUUID(),
            actor: "Sistema",
            action: "Atualizou categoria",
            entity: "transactions",
            details: `Transação ${txId}`,
            createdAt: new Date().toISOString(),
          },
          ...state.auditLogs,
        ],
      }));
    }
  },

  markDuplicate: async (txId) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === txId ? { ...t, status: "duplicate" } : t
      ),
    }));
    const supabase = createClient();
    await supabase.from('transactions').update({ status: 'duplicate' }).eq('id', txId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const coupleId = await ensureCoupleId(supabase, user as SupabaseUser);
      await supabase.from("audit_logs").insert({
        couple_id: coupleId,
        actor_id: user.id,
        action: "Marcou duplicata",
        entity_type: "transactions",
        details: { text: `Transação ${txId}` },
      });
      set((state) => ({
        auditLogs: [
          {
            id: crypto.randomUUID(),
            actor: "Sistema",
            action: "Marcou duplicata",
            entity: "transactions",
            details: `Transação ${txId}`,
            createdAt: new Date().toISOString(),
          },
          ...state.auditLogs,
        ],
      }));
    }
  },

  createRule: async (pattern, catId, options) => {
    const newRule: Rule = {
      id: crypto.randomUUID(),
      pattern,
      categoryId: catId,
      applyPast: options?.applyPast ?? false,
      priority: options?.priority ?? "medium",
      createdAt: new Date().toISOString(),
    };

    await get().addRule(newRule);

    const supabase = createClient();
    if (newRule.applyPast) {
      await supabase
        .from("transactions")
        .update({ category_id: catId })
        .ilike("merchant", `%${pattern}%`)
        .eq("category_id", null);
    }
  },
}));
