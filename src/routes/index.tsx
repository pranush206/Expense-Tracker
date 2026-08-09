import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarDays,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LineChart,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Sun,
  Wallet,
  CalendarRange,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenses } from "../lib/expenses/store";
import { totalsFor } from "@/lib/expenses/analytics";
import { exportExcel, exportPdf } from "@/lib/expenses/export";
import type { Expense } from "@/lib/expenses/types";
import { StatCard } from "@/components/expenses/stat-card";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ChartsPanel } from "@/components/expenses/charts-panel";
import { CalendarPanel } from "@/components/expenses/calendar-panel";
import { AnalyticsPanel } from "@/components/expenses/analytics-panel";
import { InsightsPanel } from "@/components/expenses/insights-panel";
import { AlertStack, BudgetPanel, useBudgetAlerts } from "@/components/expenses/budget-panel";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Expense Analyzer Pro — Track, Budget & Save" },
      {
        name: "description",
        content:
          "Track daily student spending, set daily/weekly/monthly budgets, view animated charts, calendar heatmaps and AI insights.",
      },
      { property: "og:title", content: "Student Expense Analyzer Pro" },
      {
        property: "og:description",
        content:
          "Track daily student spending, set budgets, and get AI-powered insights on where your money goes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { expenses, budgets, deleteExpense, hydrated } = useExpenses();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const totals = useMemo(() => totalsFor(expenses), [expenses]);
  const alerts = useBudgetAlerts(totals);

  const remaining = budgets.monthly - totals.month;
  const savingsRate =
    budgets.monthly > 0 ? Math.max(0, (remaining / budgets.monthly) * 100) : 0;
  const c = budgets.currency;

  const openAdd = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setOpen(true);
  };
  const remove = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted");
  };

  const doExport = (kind: "pdf" | "excel") => {
    if (expenses.length === 0) {
      toast.error("Nothing to export yet");
      return;
    }
    try {
      if (kind === "pdf") exportPdf(expenses, c);
      else exportExcel(expenses);
      toast.success(`Report exported as ${kind === "pdf" ? "PDF" : "Excel"}`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <header className="animate-rise flex flex-wrap items-center justify-end gap-2">
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" aria-label="Export PDF" onClick={() => doExport("pdf")}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Export Excel"
            onClick={() => doExport("excel")}
          >
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
          <Button onClick={openAdd} className="gradient-brand-bg text-primary-foreground shadow-[var(--shadow-glow)]">
            <Plus className="mr-1.5 h-4 w-4" /> Add expense
          </Button>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        <AlertStack alerts={alerts} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Today"
            value={totals.today}
            prefix={c}
            icon={Wallet}
            accent="primary"
            hint={`Daily limit ${c}${budgets.daily}`}
            progress={budgets.daily ? (totals.today / budgets.daily) * 100 : 0}
          />
          <StatCard
            label="This week"
            value={totals.week}
            prefix={c}
            icon={CalendarRange}
            accent="accent"
            hint={`Weekly limit ${c}${budgets.weekly}`}
            progress={budgets.weekly ? (totals.week / budgets.weekly) * 100 : 0}
            delay={70}
          />
          <StatCard
            label="This month"
            value={totals.month}
            prefix={c}
            icon={CalendarCheck}
            accent="warning"
            hint={`Monthly limit ${c}${budgets.monthly}`}
            progress={budgets.monthly ? (totals.month / budgets.monthly) * 100 : 0}
            delay={140}
          />
          <StatCard
            label="This year"
            value={totals.year}
            prefix={c}
            icon={TrendingUp}
            accent="success"
            hint={`${expenses.length} transaction${expenses.length === 1 ? "" : "s"} tracked`}
            delay={210}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Remaining budget"
            value={remaining}
            prefix={c}
            icon={PiggyBank}
            accent={remaining < 0 ? "destructive" : "success"}
            hint="Left for this month"
          />
          <StatCard
            label="Savings rate"
            value={Math.round(savingsRate)}
            suffix="%"
            icon={LineChart}
            accent="accent"
            hint="Share of monthly budget unspent"
            progress={savingsRate}
            delay={70}
          />
        </section>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="glass-card flex h-auto w-full flex-wrap justify-start gap-1 p-1.5">
            <TabsTrigger value="overview" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5">
              <Receipt className="h-4 w-4" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <LineChart className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <CalendarDays className="h-4 w-4" /> Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-5 focus-visible:outline-none">
            <InsightsPanel expenses={expenses} budgets={budgets} />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="glass-card animate-rise p-5">
                <h2 className="text-lg font-semibold">Recent transactions</h2>
                <p className="mb-4 text-xs text-muted-foreground">Your latest 6 expenses</p>
                {hydrated && (
                  <ExpenseList
                    expenses={[...expenses]
                      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
                      .slice(0, 6)}
                    currency={c}
                    onEdit={openEdit}
                    onDelete={remove}
                    compact
                  />
                )}
              </div>
              <BudgetPanel totals={totals} />
            </div>
            <ChartsPanel expenses={expenses} currency={c} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-5 focus-visible:outline-none">
            <div className="glass-card animate-rise p-5">
              <h2 className="mb-4 text-lg font-semibold">All expenses</h2>
              <ExpenseList
                expenses={expenses}
                currency={c}
                onEdit={openEdit}
                onDelete={remove}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-5 space-y-5 focus-visible:outline-none">
            <AnalyticsPanel expenses={expenses} budgets={budgets} />
            <ChartsPanel expenses={expenses} currency={c} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-5 focus-visible:outline-none">
            <CalendarPanel expenses={expenses} currency={c} />
          </TabsContent>
        </Tabs>
      </div>

      <Button
        onClick={openAdd}
        aria-label="Quick add expense"
        className="gradient-brand-bg fixed right-5 bottom-5 z-40 h-14 w-14 rounded-full text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-110 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ExpenseDialog open={open} onOpenChange={setOpen} editing={editing} />

      <footer className="mt-10 pb-16 text-center text-xs text-muted-foreground sm:pb-0">
        Data is stored privately on this device · {expenses.length} expenses tracked
      </footer>
    </main>
  );
}
