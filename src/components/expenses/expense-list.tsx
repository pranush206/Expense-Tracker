import { useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  Pencil,
  Search,
  Trash2,
  UtensilsCrossed,
  Bus,
  GraduationCap,
  ShoppingBag,
  Clapperboard,
  HeartPulse,
  ReceiptText,
  Boxes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_META, type Category, type Expense } from "@/lib/expenses/types";
import { expenseDate } from "@/lib/expenses/analytics";
import { formatMoney } from "@/lib/expenses/format";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Food: UtensilsCrossed,
  Travel: Bus,
  Education: GraduationCap,
  Shopping: ShoppingBag,
  Entertainment: Clapperboard,
  Health: HeartPulse,
  Bills: ReceiptText,
  Others: Boxes,
};

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "category";

export function ExpenseList({
  expenses,
  currency,
  onEdit,
  onDelete,
  compact = false,
}: {
  expenses: Expense[];
  currency: string;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("date-desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = expenses.filter((e) => {
      if (q && !`${e.title} ${e.notes ?? ""} ${e.category}`.toLowerCase().includes(q)) return false;
      if (category !== "all" && e.category !== category) return false;
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      return true;
    });
    return list.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return expenseDate(a).getTime() - expenseDate(b).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return expenseDate(b).getTime() - expenseDate(a).getTime();
      }
    });
  }, [expenses, query, category, from, to, sort]);

  const total = filtered.reduce((t, e) => t + e.amount, 0);

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search expenses…"
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger>
              <ArrowDownWideNarrow className="mr-1 h-4 w-4 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="amount-desc">Amount: high to low</SelectItem>
              <SelectItem value="amount-asc">Amount: low to high</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!compact && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} transaction{filtered.length === 1 ? "" : "s"} ·{" "}
          <span className="font-semibold text-foreground">{formatMoney(total, currency)}</span>
        </p>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            No expenses match your filters yet.
          </div>
        )}
        {filtered.map((e, i) => {
          const Icon = CATEGORY_ICONS[e.category];
          return (
            <div
              key={e.id}
              className="glass-card animate-rise group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3.5 transition-colors hover:border-primary/40 sm:p-4"
              style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in oklab, ${CATEGORY_META[e.category].color} 18%, transparent)`,
                  color: CATEGORY_META[e.category].color,
                }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{e.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {format(expenseDate(e), "dd MMM yyyy · HH:mm")} · {e.category}
                  {e.notes ? ` · ${e.notes}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <Badge variant="secondary" className="font-display text-sm font-bold">
                  {formatMoney(e.amount, currency)}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-60 transition-opacity hover:opacity-100"
                  aria-label={`Edit ${e.title}`}
                  onClick={() => onEdit(e)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive opacity-60 transition-opacity hover:opacity-100"
                  aria-label={`Delete ${e.title}`}
                  onClick={() => onDelete(e.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}