import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  accent = "primary",
  hint,
  progress,
  delay = 0,
}: {
  label: string;
  value: number;
  prefix?: string | undefined;
  suffix?: string | undefined;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "warning" | "success" | "destructive";
  hint?: string | undefined;
  progress?: number | undefined;
  delay?: number | undefined;
}) {
  const accentMap = {
    primary: "text-primary bg-primary/12",
    accent: "text-accent bg-accent/12",
    warning: "text-warning bg-warning/15",
    success: "text-success bg-success/12",
    destructive: "text-destructive bg-destructive/12",
  } as const;
  const barMap = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
    success: "bg-success",
    destructive: "bg-destructive",
  } as const;

  return (
    <div
      className="glass-card lift animate-rise relative overflow-hidden p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-display mt-2 truncate text-2xl font-bold sm:text-3xl">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </p>
          {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("shrink-0 rounded-2xl p-2.5", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-[width] duration-700", barMap[accent])}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}