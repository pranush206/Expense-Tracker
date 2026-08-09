import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_BUDGETS, type Budgets, type Expense } from "./types";

const EXPENSES_KEY = "sea-pro:expenses";
const BUDGETS_KEY = "sea-pro:budgets";

type Store = {
  expenses: Expense[];
  budgets: Budgets;
  hydrated: boolean;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setBudgets: (b: Partial<Budgets>) => void;
  clearAll: () => void;
};

const ExpenseContext = createContext<Store | null>(null);

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgetsState] = useState<Budgets>(DEFAULT_BUDGETS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setExpenses(safeRead<Expense[]>(EXPENSES_KEY, []));
    setBudgetsState({ ...DEFAULT_BUDGETS, ...safeRead<Partial<Budgets>>(BUDGETS_KEY, {}) });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch {
      /* storage full or unavailable */
    }
  }, [expenses, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch {
      /* ignore */
    }
  }, [budgets, hydrated]);

  const addExpense = useCallback((e: Omit<Expense, "id" | "createdAt">) => {
    setExpenses((prev) => [
      { ...e, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const updateExpense = useCallback((id: string, patch: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setBudgets = useCallback((b: Partial<Budgets>) => {
    setBudgetsState((prev) => ({ ...prev, ...b }));
  }, []);

  const clearAll = useCallback(() => setExpenses([]), []);

  const value = useMemo(
    () => ({
      expenses,
      budgets,
      hydrated,
      addExpense,
      updateExpense,
      deleteExpense,
      setBudgets,
      clearAll,
    }),
    [expenses, budgets, hydrated, addExpense, updateExpense, deleteExpense, setBudgets, clearAll],
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpenseProvider");
  return ctx;
}