import { create } from "zustand";

interface TransactionState {
  selectedId: string | null;
  select: (id: string) => void;
  clear: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  clear: () => set({ selectedId: null }),
}));
