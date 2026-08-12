import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { DEFAULT_BUDGETS, type Budgets, type Expense } from "./types";
import { useAuth } from "@/lib/auth/auth-context";
import { db, isFirebaseConfigured } from "@/lib/firebase";

type Store = {
  expenses: Expense[];
  budgets: Budgets;
  hydrated: boolean;
  addExpense: (e: Omit<Expense, "id" | "createdAt" | "userId" | "updatedAt">) => Promise<void>;
  updateExpense: (id: string, patch: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBudgets: (b: Partial<Budgets>) => Promise<void>;
  clearAll: () => Promise<void>;
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
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgetsState] = useState<Budgets>(DEFAULT_BUDGETS);
  const [hydrated, setHydrated] = useState(false);

  const isDemo = user?.uid === "demo-student-user";

  // Sync expenses and budgets
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setBudgetsState(DEFAULT_BUDGETS);
      setHydrated(true);
      return;
    }

    // Demo Mode -> LocalStorage persistence
    if (isDemo || !isFirebaseConfigured) {
      const demoKey = `sea-pro:expenses:${user.uid}`;
      const budgetKey = `sea-pro:budgets:${user.uid}`;
      setExpenses(safeRead<Expense[]>(demoKey, []));
      setBudgetsState({ ...DEFAULT_BUDGETS, ...safeRead<Partial<Budgets>>(budgetKey, {}) });
      setHydrated(true);
      return;
    }

    // Live Firebase -> Firestore persistence
    setHydrated(false);

    // 1. Subscribe to User Expenses Subcollection: /users/{user.uid}/expenses
    const expensesRef = collection(db, "users", user.uid, "expenses");
    const expensesQuery = query(expensesRef, orderBy("createdAt", "desc"));

    const unsubExpenses = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const loaded: Expense[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Expense);
        });
        setExpenses(loaded);
        setHydrated(true);
      },
      (err) => {
        console.warn("Firestore expenses fallback to local:", err);
        const demoKey = `sea-pro:expenses:${user.uid}`;
        setExpenses(safeRead<Expense[]>(demoKey, []));
        setHydrated(true);
      }
    );

    // 2. Subscribe to User Budget Settings: /users/{user.uid}/settings/budget
    const budgetDocRef = doc(db, "users", user.uid, "settings", "budget");
    const unsubBudget = onSnapshot(
      budgetDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setBudgetsState({ ...DEFAULT_BUDGETS, ...(docSnap.data() as Partial<Budgets>) });
        } else {
          setBudgetsState(DEFAULT_BUDGETS);
        }
      },
      (err) => {
        console.warn("Firestore budget fallback to local:", err);
      }
    );

    return () => {
      unsubExpenses();
      unsubBudget();
    };
  }, [user, isDemo]);

  // Persist demo mode changes to local storage
  useEffect(() => {
    if (!user || (!isDemo && isFirebaseConfigured)) return;
    try {
      localStorage.setItem(`sea-pro:expenses:${user.uid}`, JSON.stringify(expenses));
    } catch {
      /* ignore storage full */
    }
  }, [expenses, user, isDemo]);

  useEffect(() => {
    if (!user || (!isDemo && isFirebaseConfigured)) return;
    try {
      localStorage.setItem(`sea-pro:budgets:${user.uid}`, JSON.stringify(budgets));
    } catch {
      /* ignore */
    }
  }, [budgets, user, isDemo]);

  const addExpense = useCallback(
    async (e: Omit<Expense, "id" | "createdAt" | "userId" | "updatedAt">) => {
      if (!user) return;
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newExpense: Expense = {
        ...e,
        id,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      setExpenses((prev) => [newExpense, ...prev]);

      if (!isDemo && isFirebaseConfigured) {
        try {
          const expenseDocRef = doc(db, "users", user.uid, "expenses", id);
          await setDoc(expenseDocRef, newExpense);
        } catch (err) {
          console.error("Failed to add expense to Firestore:", err);
        }
      }
    },
    [user, isDemo]
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<Expense>) => {
      if (!user) return;
      const now = new Date().toISOString();
      const updatedPatch = { ...patch, updatedAt: now };

      setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedPatch } : item)));

      if (!isDemo && isFirebaseConfigured) {
        try {
          const expenseDocRef = doc(db, "users", user.uid, "expenses", id);
          await updateDoc(expenseDocRef, updatedPatch);
        } catch (err) {
          console.error("Failed to update expense in Firestore:", err);
        }
      }
    },
    [user, isDemo]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!user) return;

      setExpenses((prev) => prev.filter((item) => item.id !== id));

      if (!isDemo && isFirebaseConfigured) {
        try {
          const expenseDocRef = doc(db, "users", user.uid, "expenses", id);
          await deleteDoc(expenseDocRef);
        } catch (err) {
          console.error("Failed to delete expense from Firestore:", err);
        }
      }
    },
    [user, isDemo]
  );

  const setBudgets = useCallback(
    async (b: Partial<Budgets>) => {
      if (!user) return;

      setBudgetsState((prev) => ({ ...prev, ...b }));

      if (!isDemo && isFirebaseConfigured) {
        try {
          const budgetDocRef = doc(db, "users", user.uid, "settings", "budget");
          await setDoc(budgetDocRef, b, { merge: true });
        } catch (err) {
          console.error("Failed to save budget settings to Firestore:", err);
        }
      }
    },
    [user, isDemo]
  );

  const clearAll = useCallback(async () => {
    if (!user) return;
    setExpenses([]);
    if (!isDemo && isFirebaseConfigured) {
      for (const exp of expenses) {
        try {
          await deleteDoc(doc(db, "users", user.uid, "expenses", exp.id));
        } catch {
          /* ignore */
        }
      }
    }
  }, [user, expenses, isDemo]);

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
    [expenses, budgets, hydrated, addExpense, updateExpense, deleteExpense, setBudgets, clearAll]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpenseProvider");
  return ctx;
}