import { ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, Star, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustScoreService } from "@/features/trust/TrustScoreService";
import type { TrustProfile } from "@/types/domain";

interface TrustBreakdownCardProps {
  trustProfile: TrustProfile;
  className?: string;
}

export function TrustBreakdownCard({ trustProfile, className }: TrustBreakdownCardProps) {
  const isHigh = trustProfile.score >= 90;
  const isTrusted = trustProfile.score >= 75;

  const badgeColor = isHigh
    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300"
    : isTrusted
      ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300"
      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300";

  return (
    <Card
      className={`overflow-hidden border border-border/80 bg-card p-4 sm:p-5 shadow-xs ${className || ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              Transparent Trust Model
            </h3>
            <p className="text-xs text-muted-foreground">
              Measurable score based on verified network events
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display text-2xl font-black text-foreground">
            {trustProfile.score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
          <div className="mt-0.5">
            <Badge variant="outline" className={`text-[10px] font-bold ${badgeColor}`}>
              {trustProfile.level}
            </Badge>
          </div>
        </div>
      </div>

      {/* Formula Breakdown */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">Base Network Score</span>
          <span className="font-mono font-bold text-foreground">
            +{TrustScoreService.BASE_SCORE}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-border/50">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-primary" />
            CAC / Business Identity Verification
          </span>
          <span className="font-mono font-bold text-emerald-600">
            {trustProfile.isVerified
              ? `+${TrustScoreService.VERIFICATION_BONUS}`
              : "+0 (Unverified)"}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-border/50">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="size-3.5 text-primary" />
            Fulfilled Contracts ({trustProfile.completedTransactions} completed)
          </span>
          <span className="font-mono font-bold text-emerald-600">
            +
            {Math.min(
              20,
              trustProfile.completedTransactions * TrustScoreService.SUCCESSFUL_TRANSACTION_BONUS,
            )}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-border/50">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Star className="size-3.5 text-gold" />
            Market Rating ({trustProfile.rating.toFixed(1)} / 5.0)
          </span>
          <span className="font-mono font-bold text-emerald-600">
            {trustProfile.rating >= 4.5 && trustProfile.completedTransactions > 0
              ? `+${TrustScoreService.HIGH_RATING_BONUS}`
              : "+0"}
          </span>
        </div>

        {trustProfile.cancelledOrders > 0 && (
          <div className="flex items-center justify-between py-1 border-b border-border/50 text-destructive">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              Order Cancellations ({trustProfile.cancelledOrders} records)
            </span>
            <span className="font-mono font-bold">
              -{trustProfile.cancelledOrders * TrustScoreService.CANCELLATION_PENALTY}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-sm font-bold text-foreground">
          <span>Net Resulting Reputation</span>
          <span className="font-display text-primary">{trustProfile.score} / 100</span>
        </div>
      </div>

      {/* Recent Trust Events */}
      {trustProfile.history && trustProfile.history.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-2">
            <History className="size-3.5" />
            Recent Reputation Activity
          </div>
          <ul className="space-y-1.5">
            {trustProfile.history.slice(0, 3).map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-[11px]"
              >
                <span className="text-muted-foreground">{e.reason}</span>
                <span
                  className={`font-mono font-bold ${
                    e.scoreDelta > 0
                      ? "text-emerald-600"
                      : e.scoreDelta < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {e.scoreDelta > 0
                    ? `+${e.scoreDelta}`
                    : e.scoreDelta === 0
                      ? "0"
                      : `${e.scoreDelta}`}{" "}
                  pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
