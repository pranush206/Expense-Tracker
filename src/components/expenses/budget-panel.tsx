import { useEffect, useRef, useState } from "react";
import { AlertTriangle, BellRing, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/lib/expenses/store";
import { formatMoney } from "@/lib/expenses/format";

type Level = "safe" | "warning" | "urgent" | "exceeded";

function levelFor(pct: number): Level {
  if (pct > 100) return "exceeded";
  if (pct >= 100) return "urgent";
  if (pct >= 80) return "warning";
  return "safe";
}

export type Alert = { id: string; level: Level; title: string; message: string };

export function useBudgetAlerts(totals: { today: number; week: number; month: number }) {
  const { budgets } = useExpenses();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const seen = useRef<Record<string, Level>>({});

  useEffect(() => {
    const periods: { key: string; label: string; spent: number; limit: number }[] = [
      { key: "daily", label: "Daily", spent: totals.today, limit: budgets.daily },
      { key: "weekly", label: "Weekly", spent: totals.week, limit: budgets.weekly },
      { key: "monthly", label: "Monthly", spent: totals.month, limit: budgets.monthly },
    ];
    const next: Alert[] = [];
    periods.forEach((p) => {
      if (p.limit <= 0) return;
      const pct = (p.spent / p.limit) * 100;
      const level = levelFor(pct);
      if (level === "safe") {
        seen.current[p.key] = level;
        return;
      }
      const message =
        level === "exceeded"
          ? `You are ${formatMoney(p.spent - p.limit, budgets.currency)} over your ${p.label.toLowerCase()} limit.`
          : level === "urgent"
            ? `You've hit 100% of your ${p.label.toLowerCase()} budget.`
            : `You've used ${Math.round(pct)}% of your ${p.label.toLowerCase()} budget.`;
      const title =
        level === "exceeded"
          ? `${p.label} budget exceeded`
          : level === "urgent"
            ? `${p.label} budget reached`
            : `${p.label} budget warning`;
      next.push({ id: p.key, level, title, message });

      if (seen.current[p.key] !== level) {
        seen.current[p.key] = level;
        if (level === "warning") toast.warning(title, { description: message });
        else toast.error(title, { description: message });
        notifyBrowser(title, message);
      }
    });
    setAlerts(next);
  }, [totals.today, totals.week, totals.month, budgets]);

  return alerts;
}

function notifyBrowser(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, { body });
    } catch {
      /* some browsers require a service worker */
    }
  }
}

export function AlertStack({ alerts }: { alerts: Alert[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = alerts.filter((a) => !dismissed.includes(`${a.id}-${a.level}`));
  if (visible.length === 0) return null;

  const styles: Record<Level, string> = {
    safe: "",
    warning: "border-warning/50 bg-warning/12 text-warning-foreground",
    urgent: "border-destructive/50 bg-destructive/12",
    exceeded: "border-destructive bg-destructive/18",
  };

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div
          key={`${a.id}-${a.level}`}
          className={cn(
            "animate-rise flex items-start gap-3 rounded-2xl border p-3.5 backdrop-blur-md",
            styles[a.level],
          )}
        >
          {a.level === "warning" ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          ) : (
            <BellRing className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-destructive" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.message}</p>
          </div>
          <button
            className="shrink-0 rounded-lg p-1 opacity-60 transition hover:opacity-100"
            aria-label="Dismiss notification"
            onClick={() => setDismissed((d) => [...d, `${a.id}-${a.level}`])}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function BudgetPanel({ totals }: { totals: { today: number; week: number; month: number } }) {
  const { budgets, setBudgets } = useExpenses();
  const rows = [
    { key: "daily" as const, label: "Daily limit", spent: totals.today, limit: budgets.daily },
    { key: "weekly" as const, label: "Weekly limit", spent: totals.week, limit: budgets.weekly },
    { key: "monthly" as const, label: "Monthly limit", spent: totals.month, limit: budgets.monthly },
  ];

  return (
    <div className="glass-card animate-rise space-y-5 p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Budget management</h3>
      </div>
      {rows.map((r) => {
        const pct = r.limit > 0 ? (r.spent / r.limit) * 100 : 0;
        const level = levelFor(pct);
        const bar =
          level === "safe"
            ? "bg-primary"
            : level === "warning"
              ? "bg-warning"
              : "bg-destructive";
        return (
          <div key={r.key} className="space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <div className="min-w-0">
                <Label htmlFor={`b-${r.key}`} className="text-xs text-muted-foreground">
                  {r.label}
                </Label>
                <p className="truncate text-sm font-semibold">
                  {formatMoney(r.spent, budgets.currency)} of{" "}
                  {formatMoney(r.limit, budgets.currency)}
                </p>
              </div>
              <Input
                id={`b-${r.key}`}
                className="h-9 w-28 shrink-0"
                inputMode="numeric"
                value={r.limit}
                onChange={(e) => setBudgets({ [r.key]: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-[width] duration-700", bar)}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">{Math.round(pct)}% used</p>
          </div>
        );
      })}
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          if (!("Notification" in window)) {
            toast.error("Browser notifications aren't supported here");
            return;
          }
          const p = await Notification.requestPermission();
          toast[p === "granted" ? "success" : "warning"](
            p === "granted" ? "Browser alerts enabled" : "Browser alerts blocked",
          );
        }}
      >
        <BellRing className="mr-2 h-4 w-4" /> Enable browser alerts
      </Button>
    </div>
  );
}