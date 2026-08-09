import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
  isSameDay,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Expense } from "@/lib/expenses/types";
import { formatMoney, localDateString } from "@/lib/expenses/format";
import { CATEGORY_ICONS } from "./expense-list";

export function CalendarPanel({
  expenses,
  currency,
}: {
  expenses: Expense[];
  currency: string;
}) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string>(() => localDateString());

  const { days, totals, max } = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const totalsMap = new Map<string, number>();
    expenses.forEach((e) => totalsMap.set(e.date, (totalsMap.get(e.date) ?? 0) + e.amount));
    const list: Date[] = [];
    for (let d = 1; d <= end.getDate(); d++) list.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    const monthMax = Math.max(
      1,
      ...list.map((d) => totalsMap.get(format(d, "yyyy-MM-dd")) ?? 0),
    );
    return { days: list, totals: totalsMap, max: monthMax, start };
  }, [cursor, expenses]);

  const leadingBlanks = (getDay(startOfMonth(cursor)) + 6) % 7;
  const dayExpenses = expenses
    .filter((e) => e.date === selected)
    .sort((a, b) => b.time.localeCompare(a.time));
  const dayTotal = dayExpenses.reduce((t, e) => t + e.amount, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="glass-card animate-rise p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="truncate text-lg font-semibold">{format(cursor, "MMMM yyyy")}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Previous year" onClick={() => setCursor(subMonths(cursor, 12))}>
              <span className="text-xs font-semibold">−1y</span>
            </Button>
            <Button size="icon" variant="ghost" aria-label="Previous month" onClick={() => setCursor(subMonths(cursor, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Next month" onClick={() => setCursor(addMonths(cursor, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Next year" onClick={() => setCursor(addMonths(cursor, 12))}>
              <span className="text-xs font-semibold">+1y</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`b-${i}`} />
          ))}
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const total = totals.get(key) ?? 0;
            const intensity = total / max;
            const isSelected = key === selected;
            const isToday = isSameDay(d, new Date());
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "relative aspect-square rounded-xl border border-transparent p-1 text-xs transition-all duration-200 hover:scale-[1.06] hover:border-primary/50",
                  isSelected && "border-primary ring-2 ring-primary/35",
                  isToday && !isSelected && "border-accent/60",
                )}
                style={{
                  background:
                    total > 0
                      ? `color-mix(in oklab, var(--primary) ${8 + intensity * 62}%, transparent)`
                      : "color-mix(in oklab, var(--muted) 55%, transparent)",
                }}
                aria-label={`${format(d, "dd MMM yyyy")} — ${formatMoney(total, currency)}`}
              >
                <span className="absolute top-1 left-1.5 font-semibold">{d.getDate()}</span>
                {total > 0 && (
                  <span className="absolute right-1 bottom-1 left-1 truncate text-[10px] font-semibold">
                    {formatMoney(Math.round(total), currency)}
                  </span>
                )}
                {intensity > 0.75 && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Low</span>
          <span className="h-2 flex-1 rounded-full bg-[linear-gradient(90deg,color-mix(in_oklab,var(--muted)_55%,transparent),var(--primary))]" />
          <span>High</span>
        </div>
      </div>

      <div className="glass-card animate-rise p-5" style={{ animationDelay: "80ms" }}>
        <h3 className="text-lg font-semibold">{format(parseISO(selected), "EEEE, dd MMM yyyy")}</h3>
        <p className="text-sm text-muted-foreground">
          {dayExpenses.length} transaction{dayExpenses.length === 1 ? "" : "s"} ·{" "}
          <span className="font-semibold text-foreground">{formatMoney(dayTotal, currency)}</span>
        </p>
        <div className="mt-4 space-y-2">
          {dayExpenses.length === 0 && (
            <p className="rounded-xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">
              No spending recorded on this day.
            </p>
          )}
          {dayExpenses.map((e) => {
            const Icon = CATEGORY_ICONS[e.category];
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-xl bg-muted/45 p-3 transition-colors hover:bg-muted/70"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.time} · {e.category}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {formatMoney(e.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}