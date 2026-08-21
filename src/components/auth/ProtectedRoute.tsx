import { useEffect, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { IS_DEMO_MODE } from "@/lib/config";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { currentUser } = useApp();
  const router = useRouter();

  // In demo mode, routes are open for instant judging exploration
  if (IS_DEMO_MODE) {
    return <>{children}</>;
  }

  // In Live Data Mode: Check Authentication
  if (!currentUser) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-12">
        <Card className="w-full p-6 sm:p-8 text-center space-y-5 shadow-lg border-border/80 bg-card rounded-2xl">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Lock className="size-7" />
          </div>

          <div className="space-y-1.5">
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-xs">
              Live Database Mode
            </Badge>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Sign In Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              You need an authenticated session to access this dashboard. Please sign in or register
              a new account to continue.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full font-bold shadow-xs cursor-pointer"
              onClick={() => router.navigate({ to: redirectTo })}
            >
              Sign In / Register
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs cursor-pointer"
              onClick={() => router.navigate({ to: "/" })}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // In Live Data Mode: Check Role Authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role) && currentUser.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-12">
        <Card className="w-full p-6 sm:p-8 text-center space-y-5 shadow-lg border-border/80 bg-card rounded-2xl">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <ShieldAlert className="size-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Access Restricted
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Your logged-in account (<strong>{currentUser.name}</strong>, {currentUser.role}) does not have permission to view this section.
            </p>
          </div>

          <Button
            className="w-full font-bold shadow-xs cursor-pointer"
            onClick={() => {
              const home =
                currentUser.role === "farmer"
                  ? "/dashboard/farmer"
                  : currentUser.role === "buyer"
                    ? "/dashboard/buyer"
                    : currentUser.role === "transporter"
                      ? "/dashboard/transporter"
                      : "/admin";
              router.navigate({ to: home });
            }}
          >
            Go to My Dashboard
            <ArrowRight className="ml-1.5 size-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
