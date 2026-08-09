import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
} from "date-fns";
import { CATEGORIES, type Category, type Expense } from "./types";

export const WEEK_OPTS = { weekStartsOn: 1 as const };

export function expenseDate(e: Expense): Date {
  return parseISO(`${e.date}T${e.time && e.time.length >= 4 ? e.time : "00:00"}:00`);
}

export function sum(list: Expense[]): number {
  return list.reduce((t, e) => t + (Number.isFinite(e.amount) ? e.amount : 0), 0);
}

export function inRange(list: Expense[], start: Date, end: Date): Expense[] {
  return list.filter((e) => {
    const d = expenseDate(e);
    return !Number.isNaN(d.getTime()) && isWithinInterval(d, { start, end });
  });
}

export function periodRange(period: "day" | "week" | "month" | "year", ref: Date) {
  switch (period) {
    case "day":
      return { start: startOfDayLocal(ref), end: endOfDayLocal(ref) };
    case "week":
      return { start: startOfWeek(ref, WEEK_OPTS), end: endOfWeek(ref, WEEK_OPTS) };
    case "month":
      return { start: startOfMonth(ref), end: endOfMonth(ref) };
    default:
      return { start: startOfYear(ref), end: endOfYear(ref) };
  }
}

export function startOfDayLocal(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}
export function endOfDayLocal(d: Date) {
  const n = new Date(d);
  n.setHours(23, 59, 59, 999);
  return n;
}

export function totalsFor(expenses: Expense[], now = new Date()) {
  const day = periodRange("day", now);
  const week = periodRange("week", now);
  const month = periodRange("month", now);
  const year = periodRange("year", now);
  return {
    today: sum(inRange(expenses, day.start, day.end)),
    week: sum(inRange(expenses, week.start, week.end)),
    month: sum(inRange(expenses, month.start, month.end)),
    year: sum(inRange(expenses, year.start, year.end)),
  };
}

export function byCategory(list: Expense[]) {
  const map = new Map<Category, number>();
  CATEGORIES.forEach((c) => map.set(c, 0));
  list.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
  return CATEGORIES.map((c) => ({ category: c, total: map.get(c) ?? 0 })).filter(
    (x) => x.total > 0,
  );
}

export function dailyTotals(list: Expense[], start: Date, end: Date) {
  const days = differenceInCalendarDays(end, start);
  const out: { date: Date; key: string; label: string; total: number }[] = [];
  for (let i = 0; i <= days; i++) {
    const d = addDays(start, i);
    const key = format(d, "yyyy-MM-dd");
    out.push({
      date: d,
      key,
      label: format(d, "EEE"),
      total: sum(list.filter((e) => e.date === key)),
    });
  }
  return out;
}

export function monthlyTotals(list: Expense[], year: number) {
  return Array.from({ length: 12 }, (_, m) => {
    const start = new Date(year, m, 1);
    const end = endOfMonth(start);
    return { label: format(start, "MMM"), total: sum(inRange(list, start, end)) };
  });
}

export function smartStats(expenses: Expense[], now = new Date()) {
  const month = periodRange("month", now);
  const monthList = inRange(expenses, month.start, month.end);
  const dayMap = new Map<string, number>();
  expenses.forEach((e) => dayMap.set(e.date, (dayMap.get(e.date) ?? 0) + e.amount));
  let highestDay: { date: string; total: number } | null = null;
  dayMap.forEach((total, date) => {
    if (!highestDay || total > highestDay.total) highestDay = { date, total };
  });
  const cats = byCategory(monthList).sort((a, b) => b.total - a.total);
  const daysElapsed = Math.max(1, now.getDate());
  const thisWeek = sum(inRange(expenses, ...rangeTuple(periodRange("week", now))));
  const lastWeekRef = subWeeks(now, 1);
  const lastWeek = sum(inRange(expenses, ...rangeTuple(periodRange("week", lastWeekRef))));
  const lastMonthRef = subMonths(now, 1);
  const lastMonth = sum(inRange(expenses, ...rangeTuple(periodRange("month", lastMonthRef))));
  const thisMonth = sum(monthList);
  return {
    highestDay: highestDay as { date: string; total: number } | null,
    topCategory: cats[0] ?? null,
    categories: cats,
    avgDaily: thisMonth / daysElapsed,
    thisWeek,
    lastWeek,
    weekDelta: pctDelta(thisWeek, lastWeek),
    thisMonth,
    lastMonth,
    monthDelta: pctDelta(thisMonth, lastMonth),
  };
}

function rangeTuple(r: { start: Date; end: Date }): [Date, Date] {
  return [r.start, r.end];
}

export function pctDelta(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export function categoryDelta(expenses: Expense[], category: Category, now = new Date()) {
  const w = periodRange("week", now);
  const lw = periodRange("week", subWeeks(now, 1));
  const cur = sum(inRange(expenses, w.start, w.end).filter((e) => e.category === category));
  const prev = sum(inRange(expenses, lw.start, lw.end).filter((e) => e.category === category));
  return { cur, prev, delta: pctDelta(cur, prev) };
}

export type Insight = {
  id: string;
  tone: "positive" | "warning" | "danger" | "neutral";
  title: string;
  detail: string;
};

export function buildInsights(
  expenses: Expense[],
  budgets: { daily: number; weekly: number; monthly: number; currency: string },
  now = new Date(),
): Insight[] {
  const out: Insight[] = [];
  const c = budgets.currency;
  const money = (n: number) => `${c}${Math.round(n).toLocaleString()}`;
  if (expenses.length === 0) {
    return [
      {
        id: "empty",
        tone: "neutral",
        title: "Start tracking to unlock insights",
        detail: "Add a few expenses and we'll analyse your spending patterns automatically.",
      },
    ];
  }

  const s = smartStats(expenses, now);

  if (s.weekDelta !== null) {
    const up = s.weekDelta >= 0;
    out.push({
      id: "week-trend",
      tone: up ? (s.weekDelta > 20 ? "warning" : "neutral") : "positive",
      title: `You spent ${Math.abs(Math.round(s.weekDelta))}% ${up ? "more" : "less"} this week`,
      detail: `${money(s.thisWeek)} this week vs ${money(s.lastWeek)} last week.`,
    });
  }

  for (const cat of ["Food", "Travel", "Shopping"] as Category[]) {
    const d = categoryDelta(expenses, cat, now);
    if (d.delta !== null && Math.abs(d.delta) >= 15 && d.cur > 0) {
      out.push({
        id: `cat-${cat}`,
        tone: d.delta > 0 ? "warning" : "positive",
        title: `${cat} spending ${d.delta > 0 ? "increased" : "dropped"} ${Math.abs(Math.round(d.delta))}%`,
        detail: `${money(d.cur)} this week compared to ${money(d.prev)} last week.`,
      });
    }
  }

  // Weekly burn-rate projection
  const weekStart = periodRange("week", now).start;
  const daysIn = Math.max(1, differenceInCalendarDays(now, weekStart) + 1);
  const burn = s.thisWeek / daysIn;
  if (budgets.weekly > 0 && burn > 0) {
    const remaining = budgets.weekly - s.thisWeek;
    const daysLeft = 7 - daysIn;
    if (remaining <= 0) {
      out.push({
        id: "week-exceeded",
        tone: "danger",
        title: "Weekly budget already exceeded",
        detail: `You are ${money(Math.abs(remaining))} over your ${money(budgets.weekly)} weekly limit.`,
      });
    } else {
      const daysToBust = Math.floor(remaining / burn);
      if (daysToBust <= daysLeft) {
        out.push({
          id: "week-projection",
          tone: "warning",
          title: `Likely to exceed your weekly budget in ${Math.max(1, daysToBust)} day${daysToBust === 1 ? "" : "s"}`,
          detail: `At ${money(burn)}/day you'll pass ${money(budgets.weekly)} before the week ends.`,
        });
      }
    }
  }

  if (s.topCategory) {
    const share = s.thisMonth > 0 ? (s.topCategory.total / s.thisMonth) * 100 : 0;
    out.push({
      id: "savings-op",
      tone: share > 40 ? "warning" : "neutral",
      title: `Savings opportunity in ${s.topCategory.category}`,
      detail: `${s.topCategory.category} is ${Math.round(share)}% of this month's spend. Cutting it by 15% saves about ${money(s.topCategory.total * 0.15)}.`,
    });
  }

  if (s.monthDelta !== null && s.monthDelta < 0) {
    out.push({
      id: "month-positive",
      tone: "positive",
      title: `Monthly spending down ${Math.abs(Math.round(s.monthDelta))}%`,
      detail: `Great pace — ${money(s.thisMonth)} so far vs ${money(s.lastMonth)} last month.`,
    });
  }

  return out.slice(0, 6);
}