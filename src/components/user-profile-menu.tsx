import { LogOut, User as UserIcon, Shield, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserProfileMenu() {
  const { user, signOutUser } = useAuth();

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "Student User";
  const email = user.email || "No email";
  const photoUrl = user.photoURL || undefined;

  // Generate 2-letter initials fallback
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SU";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2.5 rounded-full px-2 py-1 h-10 border-border/60 hover:bg-accent/40"
        >
          <Avatar className="h-7 w-7 border border-primary/20">
            {photoUrl && <AvatarImage src={photoUrl} alt={displayName} />}
            <AvatarFallback className="gradient-brand-bg text-[10px] font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block text-xs font-semibold max-w-[120px] truncate">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 glass-card p-2">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-primary/30">
              {photoUrl && <AvatarImage src={photoUrl} alt={displayName} />}
              <AvatarFallback className="gradient-brand-bg text-xs font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5 overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{email}</span>
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/60" />
        <div className="px-2 py-1 text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-success shrink-0" />
          <span>Account: Isolated & Protected</span>
        </div>
        <DropdownMenuSeparator className="my-1 bg-border/60" />
        <DropdownMenuItem
          onClick={() => signOutUser()}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 font-medium"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
