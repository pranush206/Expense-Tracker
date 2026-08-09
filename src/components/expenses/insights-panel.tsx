import { Sparkles, TrendingDown, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildInsights } from "@/lib/expenses/analytics";
import type { Budgets, Expense } from "@/lib/expenses/types";

export function InsightsPanel({
  expenses,
  budgets,
}: {
  expenses: Expense[];
  budgets: Budgets;
}) {
  const insights = buildInsights(expenses, budgets);
  const iconFor = {
    positive: TrendingDown,
    warning: TrendingUp,
    danger: AlertTriangle,
    neutral: Lightbulb,
  } as const;
  const toneClass = {
    positive: "text-success bg-success/12",
    warning: "text-warning bg-warning/15",
    danger: "text-destructive bg-destructive/12",
    neutral: "text-accent bg-accent/12",
  } as const;

  return (
    <div className="glass-card animate-rise p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="gradient-brand-bg grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">AI insights</h3>
          <p className="text-xs text-muted-foreground">Patterns detected in your spending</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((i, idx) => {
          const Icon = iconFor[i.tone];
          return (
            <div
              key={i.id}
              className="animate-rise flex gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <span className={cn("h-fit shrink-0 rounded-xl p-2", toneClass[i.tone])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{i.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{i.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}