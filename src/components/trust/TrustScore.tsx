import { BadgeCheck, ShieldAlert, ShieldCheck, Star, CheckCircle2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TrustProfile } from "@/lib/types";

const trustTone = (score: number) =>
  score >= 90
    ? {
        text: "text-success",
        ring: "border-success/50",
        chip: "bg-success/12 text-success",
        bg: "bg-success/10",
      }
    : score >= 75
      ? {
          text: "text-primary",
          ring: "border-primary/40",
          chip: "bg-primary/10 text-primary",
          bg: "bg-primary/10",
        }
      : score >= 50
        ? {
            text: "text-warning",
            ring: "border-warning/50",
            chip: "bg-warning/15 text-warning",
            bg: "bg-warning/10",
          }
        : {
            text: "text-destructive",
            ring: "border-destructive/50",
            chip: "bg-destructive/12 text-destructive",
            bg: "bg-destructive/10",
          };

interface Props {
  trust: TrustProfile;
  size?: "sm" | "md" | "lg";
  variant?: "inline" | "card" | "detailed";
  showLabel?: boolean;
  className?: string;
}

/**
 * Reusable TrustScore component used across the entire application:
 * - inline (compact badge or circular score with label)
 * - card (structured standalone trust card with key metrics)
 * - detailed (comprehensive trust score with complete transaction metrics)
 */
export function TrustScore({
  trust,
  size = "md",
  variant = "inline",
  showLabel = true,
  className,
}: Props) {
  const tone = trustTone(trust.score);

  if (variant === "card" || variant === "detailed") {
    return (
      <Card
        className={cn(
          "gap-0 p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)]",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-14 flex-col items-center justify-center rounded-full border-2 bg-card",
                tone.ring,
              )}
            >
              <span className={cn("font-display text-xl font-bold leading-none", tone.text)}>
                {trust.score}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                trust
              </span>
            </div>
            <div>
              <p className={cn("font-display text-base font-bold", tone.text)}>{trust.level}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {trust.verified ? (
                  <>
                    <BadgeCheck className="size-3.5 text-success" aria-hidden /> Verified Identity
                  </>
                ) : (
                  <>
                    <ShieldAlert className="size-3.5 text-warning" aria-hidden /> Unverified
                    Identity
                  </>
                )}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold">
            <Star className="size-3.5 fill-gold text-gold" />
            {trust.rating.toFixed(1)} / 5
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-muted/50 p-2.5">
            <span className="text-muted-foreground block text-[11px]">Fulfilment Rate</span>
            <span className="font-semibold text-sm text-foreground flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="size-3.5 text-success" />
              {trust.fulfilmentRate}%
            </span>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <span className="text-muted-foreground block text-[11px]">Completed Trades</span>
            <span className="font-semibold text-sm text-foreground flex items-center gap-1 mt-0.5">
              <TrendingUp className="size-3.5 text-primary" />
              {trust.completedTransactions} orders
            </span>
          </div>
        </div>

        {variant === "detailed" && (
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span>
              Successful Deliveries:{" "}
              <strong className="text-foreground font-semibold">
                {trust.successfulDeliveries}
              </strong>
            </span>
            <span>
              Cancellations:{" "}
              <strong className="text-foreground font-semibold">{trust.cancelledOrders}</strong>
            </span>
          </div>
        )}
      </Card>
    );
  }

  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
          tone.chip,
          className,
        )}
        title={`Trust score ${trust.score} — ${trust.level}`}
      >
        <ShieldCheck className="size-3" aria-hidden />
        {trust.score}
        {showLabel && <span className="hidden sm:inline font-medium">· {trust.level}</span>}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-full border-2 bg-card",
          tone.ring,
          size === "lg" ? "size-20" : "size-14",
        )}
        role="img"
        aria-label={`Trust score ${trust.score} out of 100, ${trust.level}`}
      >
        <span
          className={cn(
            "font-display font-bold leading-none",
            tone.text,
            size === "lg" ? "text-3xl" : "text-xl",
          )}
        >
          {trust.score}
        </span>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">trust</span>
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className={cn("font-semibold", tone.text)}>{trust.level}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {trust.verified ? (
              <>
                <BadgeCheck className="size-3.5 text-success" aria-hidden /> Verified identity
              </>
            ) : (
              <>
                <ShieldAlert className="size-3.5 text-warning" aria-hidden /> Unverified
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
