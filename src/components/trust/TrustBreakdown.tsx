import { AlertTriangle, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { TrustProfile } from "@/lib/types";

export function TrustBreakdown({ trust }: { trust: TrustProfile }) {
  const rows = [
    { ok: true, label: `${trust.completedTransactions} completed transactions` },
    { ok: trust.fulfilmentRate >= 90, label: `${trust.fulfilmentRate}% successful fulfilment` },
    { ok: trust.verified, label: trust.verified ? "Verified identity" : "Identity not verified" },
    { ok: trust.rating >= 4, label: `${trust.rating}/5 average rating` },
    {
      ok: trust.cancelledOrders === 0,
      label: `${trust.cancelledOrders} cancelled orders (${trust.cancellationRate}% cancellation rate)`,
    },
    { ok: true, label: `${trust.successfulDeliveries} successful deliveries` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Trust score</span>
          <span className="font-semibold">{trust.score}/100</span>
        </div>
        <Progress value={trust.score} aria-label={`Trust score ${trust.score} of 100`} />
      </div>
      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-2">
            {r.ok ? (
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            )}
            <span className={r.ok ? "" : "text-muted-foreground"}>{r.label}</span>
          </li>
        ))}
      </ul>
      {trust.history.length > 0 && (
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trust history
          </p>
          <ul className="space-y-1.5 text-xs">
            {trust.history
              .slice()
              .reverse()
              .map((h, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3">
                  <span>{h.reason}</span>
                  <span className="shrink-0 font-semibold">{h.score}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
