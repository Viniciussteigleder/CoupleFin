import { create } from "zustand";
import { createClient } from "@/lib/supabase";

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

interface AppState {
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  
  isLoading: boolean;
  error: string | null;

  // Actions
  hydrateFromSeed: (data: Partial<AppState>) => void;
  fetchData: () => Promise<void>;
  
  confirmTransactions: (ids: string[]) => Promise<void>;
  setTransactionCategory: (txId: string, catId: string) => Promise<void>;
  markDuplicate: (txId: string) => Promise<void>;
  createRule: (pattern: string, catId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  categories: [],
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  isLoading: false,
  error: null,

  hydrateFromSeed: (data) => set((state) => ({ ...state, ...data })),

  fetchData: async () => {
      set({ isLoading: true });
      const supabase = createClient();
      
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return; // Or handle auth error

          // Fetch couple_id for user
          const { data: member } = await supabase.from('couple_members').select('couple_id').eq('user_id', user.id).single();
          
          if (member?.couple_id) {
              const cid = member.couple_id;
              
              const [cats, accs, txs, buds, gs] = await Promise.all([
                  supabase.from('categories').select('*').eq('couple_id', cid),
                  supabase.from('accounts').select('*').eq('couple_id', cid),
                  supabase.from('transactions').select('*').eq('couple_id', cid).order('date', { ascending: false }),
                  supabase.from('budgets').select('*').eq('couple_id', cid),
                  supabase.from('goals').select('*').eq('couple_id', cid)
              ]);

              set({
                  categories: cats.data as Category[] || [],
                  accounts: accs.data as Account[] || [],
                  transactions: txs.data as Transaction[] || [],
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  budgets: (buds.data || []).map((b: any) => ({ categoryId: b.category_id, monthlyLimit: b.amount, couple_id: b.couple_id })),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  goals: (gs.data || []).map((g: any) => ({ id: g.id, name: g.name, target: g.target_amount, current: g.current_amount, deadline: g.deadline })), // map DB schema to store schema
                  isLoading: false
              });
          }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
          console.error("Fetch data error", err);
          set({ error: err.message, isLoading: false });
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
  },

  setTransactionCategory: async (txId, catId) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === txId ? { ...t, categoryId: catId } : t
      ),
    }));
    const supabase = createClient();
    await supabase.from('transactions').update({ category_id: catId }).eq('id', txId);
  },

  markDuplicate: async (txId) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === txId ? { ...t, status: "duplicate" } : t
      ),
    }));
    const supabase = createClient();
    await supabase.from('transactions').update({ status: 'duplicate' }).eq('id', txId);
  },

  createRule: async (pattern, catId) => {
    // Mock only for now as Rules logic is complex (needs backend trigger usually)
    console.log("Rule created", pattern, catId);
    // In real app: await supabase.from('rules').insert({...})
  },
}));
