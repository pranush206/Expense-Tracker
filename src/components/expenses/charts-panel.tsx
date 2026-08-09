import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { endOfWeek, startOfWeek } from "date-fns";
import { byCategory, dailyTotals, monthlyTotals, WEEK_OPTS } from "@/lib/expenses/analytics";
import { CATEGORY_META, type Expense } from "@/lib/expenses/types";
import { formatMoney } from "@/lib/expenses/format";

function ChartShell({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="glass-card lift animate-rise p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

export function ChartsPanel({
  expenses,
  currency,
}: {
  expenses: Expense[];
  currency: string;
}) {
  const now = new Date();
  const cats = useMemo(() => byCategory(expenses), [expenses]);
  const week = useMemo(
    () => dailyTotals(expenses, startOfWeek(now, WEEK_OPTS), endOfWeek(now, WEEK_OPTS)),
    [expenses],
  );
  const months = useMemo(() => monthlyTotals(expenses, now.getFullYear()), [expenses]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartShell title="Category split" subtitle="Where your money goes overall">
        {cats.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cats}
                dataKey="total"
                nameKey="category"
                innerRadius="52%"
                outerRadius="82%"
                paddingAngle={3}
                animationDuration={900}
                stroke="transparent"
              >
                {cats.map((c) => (
                  <Cell key={c.category} fill={CATEGORY_META[c.category].color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number, n) => [formatMoney(v, currency), n as string]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.map((c) => (
            <span key={c.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: CATEGORY_META[c.category].color }}
              />
              {c.category}
            </span>
          ))}
        </div>
      </ChartShell>

      <ChartShell title="This week" subtitle="Daily spending, Monday to Sunday" delay={80}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={week}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={44} />
            <Tooltip
              cursor={{ fill: "color-mix(in oklab, var(--primary) 10%, transparent)" }}
              contentStyle={tooltipStyle}
              formatter={(v: number) => [formatMoney(v, currency), "Spent"]}
            />
            <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="var(--chart-1)" animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Monthly trend"
        subtitle={`Spending across ${now.getFullYear()}`}
        delay={160}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={months}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={44} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [formatMoney(v, currency), "Spent"]}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--chart-2)"
              strokeWidth={3}
              dot={{ r: 3, fill: "var(--chart-2)" }}
              activeDot={{ r: 6 }}
              animationDuration={1100}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Category totals" subtitle="Ranked by amount spent" delay={240}>
        {cats.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...cats].sort((a, b) => b.total - a.total)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={92}
              />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--accent) 10%, transparent)" }}
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatMoney(v, currency), "Spent"]}
              />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} animationDuration={900}>
                {[...cats]
                  .sort((a, b) => b.total - a.total)
                  .map((c) => (
                    <Cell key={c.category} fill={CATEGORY_META[c.category].color} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartShell>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      Add expenses to see this chart.
    </div>
  );
}