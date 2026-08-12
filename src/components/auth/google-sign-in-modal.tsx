import { useState } from "react";
import { Plus, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GoogleAccount = {
  name: string;
  email: string;
  avatar: string;
};

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    name: "Pranush (Student)",
    email: "pranush.student@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Alex Smith",
    email: "alex.smith@university.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAccount: (account: GoogleAccount) => void;
};

export function GoogleSignInModal({ open, onOpenChange, onSelectAccount }: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [signingIn, setSigningIn] = useState<string | null>(null);

  const handleSelect = (acc: GoogleAccount) => {
    setSigningIn(acc.email);
    setTimeout(() => {
      onSelectAccount(acc);
      setSigningIn(null);
      onOpenChange(false);
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const acc: GoogleAccount = {
      name: customName.trim() || customEmail.split("@")[0] || "User",
      email: customEmail.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`,
    };
    handleSelect(acc);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md p-6 glass-card border-primary/20">
        <DialogHeader className="space-y-2 text-center sm:text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B7.137 8.92 4 10.3 4 12s.92 3.08 2.59 4.27l3.69-2.86z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>
          <DialogTitle className="font-display text-xl font-bold">
            Sign in with Google
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose an account to continue to <strong>Student Expense Analyzer Pro</strong>
          </DialogDescription>
        </DialogHeader>

        {!customMode ? (
          <div className="mt-4 space-y-3">
            {PRESET_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelect(acc)}
                disabled={Boolean(signingIn)}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-border/80 bg-card/60 p-3 text-left transition-all hover:bg-accent/20 hover:border-primary/40 focus:outline-none"
              >
                <img
                  src={acc.avatar}
                  alt={acc.name || "Google Avatar"}
                  className="h-10 w-10 rounded-full object-cover border border-primary/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{acc.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{acc.email}</p>
                </div>
                {signingIn === acc.email ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : (
                  <Check className="h-4 w-4 opacity-0 group-hover:opacity-100 text-primary shrink-0" />
                )}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className="flex w-full items-center gap-3.5 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-3 text-left transition-colors hover:bg-accent/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">Use another account</p>
                <p className="text-[11px] text-muted-foreground">Enter custom Google email</p>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3 text-left">
            <div className="space-y-1">
              <Label htmlFor="cname" className="text-xs font-medium">
                Full Name
              </Label>
              <Input
                id="cname"
                placeholder="e.g. Jordan Lee"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cemail" className="text-xs font-medium">
                Google Email Address
              </Label>
              <Input
                id="cemail"
                type="email"
                required
                placeholder="jordan@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCustomMode(false)}
                className="w-1/2 text-xs"
              >
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gradient-brand-bg w-1/2 text-xs text-primary-foreground font-semibold"
              >
                Sign In
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
