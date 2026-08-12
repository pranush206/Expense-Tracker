export const CATEGORIES = [
  "Food",
  "Travel",
  "Education",
  "Shopping",
  "Entertainment",
  "Health",
  "Bills",
  "Others",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Expense = {
  id: string;
  userId?: string;
  title: string;
  category: Category;
  amount: number;
  /** local calendar date, yyyy-MM-dd */
  date: string;
  /** local time, HH:mm */
  time: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Budgets = {
  daily: number;
  weekly: number;
  monthly: number;
  currency: string;
};

export const DEFAULT_BUDGETS: Budgets = {
  daily: 500,
  weekly: 3000,
  monthly: 12000,
  currency: "₹",
};

export const CATEGORY_META: Record<Category, { color: string; icon: string }> = {
  Food: { color: "var(--chart-1)", icon: "UtensilsCrossed" },
  Travel: { color: "var(--chart-2)", icon: "Bus" },
  Education: { color: "var(--chart-3)", icon: "GraduationCap" },
  Shopping: { color: "var(--chart-4)", icon: "ShoppingBag" },
  Entertainment: { color: "var(--chart-5)", icon: "Clapperboard" },
  Health: { color: "var(--chart-6)", icon: "HeartPulse" },
  Bills: { color: "var(--chart-7)", icon: "ReceiptText" },
  Others: { color: "var(--chart-8)", icon: "Boxes" },
};