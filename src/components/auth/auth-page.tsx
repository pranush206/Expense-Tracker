import { useState } from "react";
import {
  Wallet,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  PiggyBank,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoogleSignInModal } from "./google-sign-in-modal";

export function AuthPage() {
  const {
    signInWithGoogle,
    signInWithGoogleAccount,
    signInWithEmail,
    signUpWithEmail,
    signInAsDemoUser,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleGoogleSignIn = async () => {
    clearError();
    setLoadingGoogle(true);
    try {
      const success = await signInWithGoogle();
      if (!success) {
        // Show interactive Google Sign-In Account Chooser modal
        setGoogleModalOpen(true);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs["email"] = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs["email"] = "Please enter a valid email address";
    }

    if (!password) {
      errs["password"] = "Password is required";
    } else if (password.length < 6) {
      errs["password"] = "Password must be at least 6 characters";
    }

    if (mode === "register") {
      if (!displayName.trim()) {
        errs["displayName"] = "Full name is required";
      }
      if (password !== confirmPassword) {
        errs["confirmPassword"] = "Passwords do not match";
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await (mode === "login"
        ? signInWithEmail(email, password)
        : signUpWithEmail(email, password, displayName));
    } finally {
      setSubmitting(false);
    }
  };

  const copyEnvSnippet = () => {
    const snippet = `VITE_FIREBASE_API_KEY=your-actual-api-key\nVITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=your-project-id\nVITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app\nVITE_FIREBASE_MESSAGING_SENDER_ID=123456789012\nVITE_FIREBASE_APP_ID=1:123456789012:web:abcdef12345`;
    navigator.clipboard.writeText(snippet);
    toast.success(".env template snippet copied to clipboard");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Branding Hero */}
          <div className="space-y-6 lg:col-span-6 xl:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Student Finance Suite</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="gradient-brand-bg flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Wallet className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Student Expense <span className="gradient-text">Analyzer Pro</span>
                </h1>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                Track daily expenses, set budget guards, view intelligent spending heatmaps, and master your student finances with ease.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="glass-card flex items-start gap-3 p-3.5 transition-transform hover:scale-[1.02]">
                <div className="rounded-xl bg-primary/15 p-2 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold">Student-Centric Budgets</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Custom daily, weekly & monthly limits for campus life.
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start gap-3 p-3.5 transition-transform hover:scale-[1.02]">
                <div className="rounded-xl bg-accent/15 p-2 text-accent">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold">Visual Analytics</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Interactive charts, heatmaps & category breakdowns.
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start gap-3 p-3.5 transition-transform hover:scale-[1.02]">
                <div className="rounded-xl bg-success/15 p-2 text-success">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold">Real-Time Sync</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Instant sync across devices with secure cloud storage.
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start gap-3 p-3.5 transition-transform hover:scale-[1.02]">
                <div className="rounded-xl bg-warning/15 p-2 text-warning">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold">Isolated User Data</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Your financial records are isolated & secured by account UID.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="glass-card animate-rise p-6 sm:p-8">
              <div className="mb-6 space-y-1 text-center">
                <h2 className="font-display text-xl font-bold">Welcome back</h2>
                <p className="text-xs text-muted-foreground">
                  Sign in with Google or Email to access your personal dashboard
                </p>
              </div>

              {/* Instant Demo Mode Quick Action */}
              <div className="mb-5 rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                  <Zap className="h-4 w-4 fill-primary" />
                  <span>Instant Demo Mode</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  Want to explore the app right now without configuring Firebase keys?
                </p>
                <Button
                  type="button"
                  onClick={signInAsDemoUser}
                  className="gradient-brand-bg mt-2.5 h-9 w-full text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Enter Dashboard as Demo Student
                </Button>
              </div>

              {/* Error Display Banner */}
              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-snug">{error}</p>
                    <button
                      onClick={() => setShowGuide(true)}
                      className="inline-flex items-center gap-1 text-[11px] underline font-semibold hover:opacity-80"
                    >
                      How to set up Google Auth in Firebase
                    </button>
                  </div>
                </div>
              )}

              {/* Google Authentication Button */}
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loadingGoogle || submitting}
                  className="lift flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-card text-card-foreground font-medium shadow-sm hover:bg-accent/10 hover:border-primary/40"
                >
                  {loadingGoogle ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                  )}
                  <span>Sign in with Google</span>
                </Button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Or email authentication
                  </div>
                </div>

                {/* Email / Password Tabs */}
                <Tabs
                  value={mode}
                  onValueChange={(v) => {
                    setMode(v as "login" | "register");
                    setFormErrors({});
                    clearError();
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-xl">
                    <TabsTrigger value="login" className="rounded-lg text-xs font-semibold">
                      Log In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="rounded-lg text-xs font-semibold">
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                    {mode === "register" && (
                      <div className="space-y-1 text-left">
                        <Label htmlFor="name" className="text-xs font-medium">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Alex Student"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="pl-9 text-xs"
                          />
                        </div>
                        {formErrors["displayName"] && (
                          <p className="text-[11px] text-destructive">{formErrors["displayName"]}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1 text-left">
                      <Label htmlFor="email" className="text-xs font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="alex@university.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 text-xs"
                        />
                      </div>
                      {formErrors["email"] && (
                        <p className="text-[11px] text-destructive">{formErrors["email"]}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <Label htmlFor="pass" className="text-xs font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="pass"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-9 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {formErrors["password"] && (
                        <p className="text-[11px] text-destructive">{formErrors["password"]}</p>
                      )}
                    </div>

                    {mode === "register" && (
                      <div className="space-y-1 text-left">
                        <Label htmlFor="confirmPass" className="text-xs font-medium">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPass"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-9 text-xs"
                          />
                        </div>
                        {formErrors["confirmPassword"] && (
                          <p className="text-[11px] text-destructive">{formErrors["confirmPassword"]}</p>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting || loadingGoogle}
                      className="gradient-brand-bg h-11 w-full text-primary-foreground font-semibold shadow-[var(--shadow-glow)] mt-2"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      <span>{mode === "login" ? "Sign In to Dashboard" : "Create Student Account"}</span>
                    </Button>
                  </form>
                </Tabs>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowGuide(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>How to set up Google Auth in Firebase</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      <GoogleSignInModal
        open={googleModalOpen}
        onOpenChange={setGoogleModalOpen}
        onSelectAccount={(acc) => {
          signInWithGoogleAccount(acc.name, acc.email, acc.avatar);
          toast.success(`Signed in as ${acc.name}`);
        }}
      />

      {/* Dialog Guide: Step-by-Step Google Auth Firebase Setup */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Setting Up Firebase Google Auth
            </DialogTitle>
            <DialogDescription className="text-xs">
              Follow these 4 simple steps to connect live Google Sign-In with your project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs text-foreground py-2">
            {/* Step 1 */}
            <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/30 p-3">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Step 1: Create a Firebase Project</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Go to the{" "}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-medium inline-flex items-center gap-0.5"
                >
                  Firebase Console <ExternalLink className="h-3 w-3 inline" />
                </a>{" "}
                and click <strong>Add project</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/30 p-3">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Step 2: Enable Google Sign-In</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                In Firebase Console, go to <strong>Authentication</strong> → <strong>Sign-in method</strong> → Click <strong>Add new provider</strong> → Choose <strong>Google</strong> and enable it.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/30 p-3">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Step 3: Add Authorized Domain</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Under <strong>Authentication</strong> → <strong>Settings</strong> → <strong>Authorized domains</strong>, add <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">localhost</code> and your IP address (e.g. <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">192.168.1.8</code>).
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/30 p-3">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Step 4: Save Keys into .env</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Go to <strong>Project Settings</strong> → <strong>General</strong> → <strong>Web Apps</strong> → Copy your Web App config into a <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">.env</code> file in your project root.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={copyEnvSnippet}
                className="w-full mt-2 text-[11px] gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy .env Template Snippet</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
