import { useState } from "react";
import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  RotateCcw,
  LogOut,
  UserCheck,
  Package,
  Truck,
  Building2,
  CheckCircle2,
  User,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { IS_DEMO_MODE } from "@/lib/config";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roleHome: Record<Role, string> = {
  farmer: "/dashboard/farmer",
  buyer: "/dashboard/buyer",
  transporter: "/dashboard/transporter",
  admin: "/admin",
};

// Public demo personas for Demo Mode only (Admin excluded from public switcher)
const publicDemoRoles: { role: Role; title: string; subtitle: string; icon: typeof UserCheck }[] = [
  {
    role: "farmer",
    title: "Abdul Farms (Kano)",
    subtitle: "Verified Producer · 92 Trust",
    icon: Package,
  },
  {
    role: "buyer",
    title: "FreshMart Retail (Lagos)",
    subtitle: "Commercial Buyer · 88 Trust",
    icon: ShoppingBag,
  },
  {
    role: "transporter",
    title: "SwiftHaul Logistics (Abuja)",
    subtitle: "Freight Transporter · 95 Trust",
    icon: Truck,
  },
];

export function MobileNav() {
  const { role, setRole, currentUser, getTrust, notificationsFor, resetDemo, logout } = useApp();
  const routerState = useRouterState();
  const router = useRouter();
  const currentPath = routerState.location.pathname;
  const [sheetOpen, setSheetOpen] = useState(false);

  const notifications = currentUser ? notificationsFor(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const userTrust = currentUser ? getTrust(currentUser.id) : null;

  const currentDashboardUrl = role ? roleHome[role] : "/auth";

  const handleRoleSwitch = (nextRole: Role) => {
    setRole(nextRole);
    setSheetOpen(false);
    toast.success(`Switched role to ${nextRole}`);
    router.navigate({ to: roleHome[nextRole] });
  };

  const navItems = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      isActive: currentPath === "/",
    },
    {
      to: "/marketplace",
      label: "Market",
      icon: ShoppingBag,
      isActive: currentPath.startsWith("/marketplace"),
    },
    {
      to: "/insights",
      label: "AI Crop",
      icon: Sparkles,
      isActive: currentPath.startsWith("/insights"),
      badge: "AI",
    },
    {
      to: currentDashboardUrl,
      label: role ? "Dashboard" : "Sign In",
      icon: LayoutDashboard,
      isActive: currentPath.startsWith("/dashboard") || currentPath.startsWith("/admin"),
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Application Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/80 bg-background/92 backdrop-blur-lg px-2 py-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer",
                  item.isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium",
                )}
              >
                <div className="relative">
                  <Icon className={cn("size-5 transition-transform", item.isActive && "scale-110")} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 grid size-3 place-items-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                      ★
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                {item.isActive && (
                  <motion.span
                    layoutId="mobileActiveTab"
                    className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* 5th Tab: Mobile Profile Drawer Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer",
                  sheetOpen
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium",
                )}
              >
                <div className="relative">
                  <ShieldCheck className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 grid size-3.5 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                  {currentUser || role ? "Profile" : "Account"}
                </span>
              </button>
            </SheetTrigger>

            <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] p-6 space-y-4">
              <SheetHeader className="text-left border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                      {currentUser?.avatarInitials || (role ? role[0]?.toUpperCase() : "U")}
                    </span>
                    <div>
                      <SheetTitle className="font-display text-base font-bold">
                        {currentUser?.name || (role ? `${role.toUpperCase()} Account` : "Guest User")}
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3" />
                        {currentUser?.location || "Nigeria"}
                      </p>
                    </div>
                  </div>
                  {userTrust && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-xs"
                    >
                      <ShieldCheck className="size-3.5 mr-1" /> {userTrust.score} Trust
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              {/* LIVE USER PROFILE VIEW (Locked in Live Mode) */}
              {currentUser ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border bg-muted/30 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Account Role:</span>
                      <Badge variant="secondary" className="capitalize font-bold text-[11px]">
                        {currentUser.role}
                      </Badge>
                    </div>
                    {currentUser.phone && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Verified Phone:</span>
                        <span className="font-medium text-foreground">{currentUser.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Database Sync:</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Live Supabase
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="w-full font-bold text-xs"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link to={role ? roleHome[role] : "/marketplace"}>
                        Open Dashboard
                        <ArrowRight className="ml-1.5 size-3" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full font-bold text-xs"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link to={`/profile/${currentUser.id}` as never}>
                        Trust Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : IS_DEMO_MODE ? (
                /* Demo Persona Switcher (Demo Mode Only — Farmer, Buyer, Transporter ONLY) */
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Switch Demo Persona (1-Tap):
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {publicDemoRoles.map((r) => {
                      const Icon = r.icon;
                      const isCurrent = role === r.role;

                      return (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => handleRoleSwitch(r.role)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer",
                            isCurrent
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border/80 bg-card hover:bg-muted/50",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "grid size-9 place-items-center rounded-xl",
                                isCurrent
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">{r.title}</p>
                              <p className="text-[11px] text-muted-foreground">{r.subtitle}</p>
                            </div>
                          </div>
                          {isCurrent && (
                            <CheckCircle2 className="size-4 text-primary shrink-0 mr-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="space-y-2 border-t pt-3">
                {currentUser || role ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-xs text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      setSheetOpen(false);
                      await logout();
                      toast.success("Signed out successfully");
                      router.navigate({ to: "/auth" });
                    }}
                  >
                    <LogOut className="size-3.5 mr-2" /> Sign Out
                  </Button>
                ) : (
                  <Button asChild size="sm" className="w-full justify-center text-xs font-semibold">
                    <Link to="/auth" onClick={() => setSheetOpen(false)}>
                      Sign In / Register
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
