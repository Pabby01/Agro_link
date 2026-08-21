import { useMemo, useState, type ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Leaf, Menu, RotateCcw, ShieldCheck, User, LogOut, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-provider";
import { MobileNav } from "@/components/layout/MobileNav";
import { useApp, timeAgo } from "@/lib/store";
import { IS_DEMO_MODE } from "@/lib/config";
import type { Role, User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roleHome: Record<Role, string> = {
  farmer: "/dashboard/farmer",
  buyer: "/dashboard/buyer",
  transporter: "/dashboard/transporter",
  admin: "/admin",
};

const roleLabel: Record<Role, string> = {
  farmer: "Farmer",
  buyer: "Buyer",
  transporter: "Transporter",
  admin: "Admin",
};

// Public demo roles (Admin is NOT accessible via public demo switch)
const publicDemoRoles: Role[] = ["farmer", "buyer", "transporter"];

function navFor(role: Role | null, currentUser: UserType | null) {
  const base = [
    { to: "/", label: "Home" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/insights", label: "AI Insights" },
  ];
  if (!role) return base;

  const dashboardPath = roleHome[role];
  const profilePath = currentUser ? `/profile/${currentUser.id}` : `/profile/u-${role}-1`;

  return [
    { to: dashboardPath, label: "Dashboard" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/insights", label: "AI Insights" },
    { to: profilePath, label: "Trust Profile" },
  ];
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, currentUser, notificationsFor, markNotificationsRead, resetDemo, logout } =
    useApp();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);

  const links = useMemo(() => navFor(role, currentUser), [role, currentUser]);
  const notifications = currentUser ? notificationsFor(currentUser.id) : [];
  const unread = notifications.filter((n) => !n.read).length;

  const switchRole = (next: Role) => {
    setRole(next);
    toast.success(`Switched to ${roleLabel[next]} view`);
    router.navigate({ to: roleHome[next] });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" aria-hidden />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">Agrolink</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {role && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                  >
                    <Bell className="size-4" />
                    {unread > 0 && (
                      <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {unread}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <p className="text-sm font-semibold">Notifications</p>
                    {currentUser && unread > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationsRead(currentUser.id)}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet.
                      </li>
                    )}
                    {notifications.slice(0, 12).map((n) => (
                      <li
                        key={n.id}
                        className={cn(
                          "border-b px-3 py-2.5 last:border-0",
                          !n.read && "bg-muted/50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{n.title}</p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}

            <ThemeToggle />

            {currentUser || role ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex cursor-pointer">
                    {role && (
                      <Badge variant="secondary" className="mr-1.5 capitalize text-xs">
                        {roleLabel[role]}
                      </Badge>
                    )}
                    {currentUser?.name || "User Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* If user is authenticated or in live mode: Show only their account and options */}
                  {currentUser || !IS_DEMO_MODE ? (
                    <>
                      <DropdownMenuLabel className="font-bold">Signed in as</DropdownMenuLabel>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1">
                        <p className="font-semibold text-foreground text-sm">{currentUser?.name}</p>
                        <p className="text-[11px]">{currentUser?.location || "Verified Member"}</p>
                      </div>
                      {role && (
                        <DropdownMenuItem asChild>
                          <Link to={roleHome[role]} className="cursor-pointer">
                            Open Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {currentUser && (
                        <DropdownMenuItem asChild>
                          <Link to={`/profile/${currentUser.id}` as never} className="cursor-pointer">
                            My Trust Profile
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  ) : (
                    /* Demo Switcher for Unauthenticated Demo Mode Only (Admin Excluded) */
                    <>
                      <DropdownMenuLabel>Switch Demo Persona</DropdownMenuLabel>
                      {publicDemoRoles.map((r) => (
                        <DropdownMenuItem key={r} onSelect={() => switchRole(r)}>
                          {roleLabel[r]}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          resetDemo();
                          toast.success("Demo data reset");
                        }}
                      >
                        <RotateCcw className="mr-2 size-4" /> Reset demo data
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive font-medium cursor-pointer"
                    onSelect={async () => {
                      await logout();
                      toast.success("Signed out successfully");
                      router.navigate({ to: "/auth" });
                    }}
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign In / Register</Link>
              </Button>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6">
                <SheetTitle className="font-display text-lg">Agrolink</SheetTitle>
                <nav className="mt-6 flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      {l.label}
                    </Link>
                  ))}
                  {currentUser ? (
                    <button
                      type="button"
                      onClick={async () => {
                        setOpen(false);
                        await logout();
                        toast.success("Signed out successfully");
                        router.navigate({ to: "/auth" });
                      }}
                      className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Sign In / Register
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-1 pb-24 md:pb-0"
      >
        {children}
      </motion.main>

      {!isDashboard && (
        <footer className="border-t border-border/60 bg-muted/20 py-8 text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <p>© 2026 Agrolink — the trusted network moving food from farm to market.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              Live Production Network · Bank-grade Escrow & Tier-2 KYB Compliance.
            </p>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
}

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
