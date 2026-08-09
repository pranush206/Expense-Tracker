import { format, parseISO } from "date-fns";
import { CalendarClock, Flame, Gauge, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import { smartStats } from "@/lib/expenses/analytics";
import { CATEGORY_META, type Budgets, type Expense } from "@/lib/expenses/types";
import { formatMoney } from "@/lib/expenses/format";
import { cn } from "@/lib/utils";

function Tile({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}) {
  return (
    <div className="glass-card lift animate-rise p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        <p className="truncate text-xs font-medium tracking-wide uppercase">{label}</p>
      </div>
      <p className="font-display mt-2 truncate text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Comparison({
  label,
  current,
  previous,
  delta,
  currency,
  delay,
}: {
  label: string;
  current: number;
  previous: number;
  delta: number | null;
  currency: string;
  delay: number;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="glass-card lift animate-rise p-5" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold">{formatMoney(current, currency)}</span>
        {delta !== null && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              up ? "bg-destructive/12 text-destructive" : "bg-success/12 text-success",
            )}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(Math.round(delta))}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Previous period: {formatMoney(previous, currency)}
      </p>
    </div>
  );
}

export function AnalyticsPanel({
  expenses,
  budgets,
}: {
  expenses: Expense[];
  budgets: Budgets;
}) {
  const s = smartStats(expenses);
  const c = budgets.currency;
  const totalCats = s.categories.reduce((t, x) => t + x.total, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          icon={Flame}
          label="Highest spending day"
          value={s.highestDay ? formatMoney(s.highestDay.total, c) : "—"}
          sub={s.highestDay ? format(parseISO(s.highestDay.date), "EEEE, dd MMM yyyy") : "No data yet"}
        />
        <Tile
          icon={PieChart}
          label="Top category"
          value={s.topCategory ? s.topCategory.category : "—"}
          sub={s.topCategory ? `${formatMoney(s.topCategory.total, c)} this month` : "No data yet"}
          delay={70}
        />
        <Tile
          icon={Gauge}
          label="Average daily expense"
          value={formatMoney(Math.round(s.avgDaily), c)}
          sub="Month to date"
          delay={140}
        />
        <Tile
          icon={CalendarClock}
          label="Spending trend"
          value={
            s.monthDelta === null ? "Steady" : s.monthDelta >= 0 ? "Rising" : "Cooling down"
          }
          sub={
            s.monthDelta === null
              ? "Not enough history"
              : `${Math.abs(Math.round(s.monthDelta))}% vs last month`
          }
          delay={210}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Comparison
          label="Weekly comparison"
          current={s.thisWeek}
          previous={s.lastWeek}
          delta={s.weekDelta}
          currency={c}
          delay={0}
        />
        <Comparison
          label="Monthly comparison"
          current={s.thisMonth}
          previous={s.lastMonth}
          delta={s.monthDelta}
          currency={c}
          delay={80}
        />
      </div>

      <div className="glass-card animate-rise p-5">
        <h3 className="text-lg font-semibold">Category-wise analysis</h3>
        <p className="mb-4 text-xs text-muted-foreground">Share of this month's spending</p>
        {s.categories.length === 0 ? (
          <p className="rounded-xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">
            No expenses recorded this month.
          </p>
        ) : (
          <div className="space-y-3">
            {s.categories.map((cat, i) => {
              const pct = totalCats > 0 ? (cat.total / totalCats) * 100 : 0;
              return (
                <div key={cat.category} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{cat.category}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatMoney(cat.total, c)} · {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${pct}%`,
                        background: CATEGORY_META[cat.category].color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}