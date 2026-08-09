import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category, type Expense } from "@/lib/expenses/types";
import { localDateString, localTimeString } from "@/lib/expenses/format";
import { useExpenses } from "@/lib/expenses/store";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80, "Keep the title under 80 chars"),
  category: z.enum(CATEGORIES),
  amount: z.number().positive("Amount must be greater than 0").max(10_000_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a valid time"),
  notes: z.string().trim().max(300, "Notes must be under 300 chars"),
});

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Expense | null | undefined;
};

export function ExpenseDialog({ open, onOpenChange, editing }: Props) {
  const { addExpense, updateExpense } = useExpenses();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(localDateString());
  const [time, setTime] = useState(localTimeString());
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setCategory(editing.category);
      setAmount(String(editing.amount));
      setDate(editing.date);
      setTime(editing.time);
      setNotes(editing.notes ?? "");
    } else {
      const now = new Date();
      setTitle("");
      setCategory("Food");
      setAmount("");
      setDate(localDateString(now));
      setTime(localTimeString(now));
      setNotes("");
    }
    setErrors({});
  }, [open, editing]);

  const submit = () => {
    const parsed = schema.safeParse({
      title,
      category,
      amount: Number(amount),
      date,
      time,
      notes,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        next[String(i.path[0])] = i.message;
      });
      setErrors(next);
      return;
    }
    const value = parsed.data;
    if (editing) {
      updateExpense(editing.id, value);
      toast.success("Expense updated", { description: `${value.title} · ${value.category}` });
    } else {
      addExpense(value);
      toast.success("Expense added", { description: `${value.title} · ${value.date} ${value.time}` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editing ? "Edit expense" : "Add expense"}
          </DialogTitle>
          <DialogDescription>
            Date and time are filled from your device calendar and can be adjusted.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Expense title</Label>
            <Input
              id="title"
              value={title}
              maxLength={80}
              placeholder="Campus canteen lunch"
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors["title"] && <p className="text-xs text-destructive">{errors["title"]}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                placeholder="120"
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors["amount"] && <p className="text-xs text-destructive">{errors["amount"]}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors["date"] && <p className="text-xs text-destructive">{errors["date"]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              {errors["time"] && <p className="text-xs text-destructive">{errors["time"]}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              maxLength={300}
              placeholder="Optional details"
              onChange={(e) => setNotes(e.target.value)}
            />
            {errors["notes"] && <p className="text-xs text-destructive">{errors["notes"]}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gradient-brand-bg text-primary-foreground">
            {editing ? "Save changes" : "Add expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}