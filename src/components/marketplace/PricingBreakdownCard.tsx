import { ShieldCheck, Snowflake, Truck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingService } from "@/features/payments/PricingService";
import type { PricingBreakdown } from "@/types/domain";

interface PricingBreakdownCardProps {
  pricing: PricingBreakdown;
  className?: string;
}

export function PricingBreakdownCard({ pricing, className }: PricingBreakdownCardProps) {
  return (
    <Card
      className={`overflow-hidden border border-border/80 bg-card p-4 sm:p-5 shadow-xs ${className || ""}`}
    >
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-display text-base font-bold text-foreground">
          Transparent Fee Breakdown
        </h3>
        <Badge
          variant="outline"
          className="text-xs font-semibold bg-primary/10 text-primary border-primary/20"
        >
          <ShieldCheck className="mr-1 size-3.5" /> 100% Escrow Protected
        </Badge>
      </div>

      <div className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Produce Subtotal</span>
          <span className="font-semibold text-foreground">
            {PricingService.formatNaira(pricing.produceSubtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Truck className="size-3.5 text-primary" />
            Logistics & Freight
            {pricing.isColdChain && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-200"
              >
                <Snowflake className="mr-1 size-2.5" /> Cold-Chain
              </Badge>
            )}
          </span>
          <span className="font-semibold text-foreground">
            {PricingService.formatNaira(pricing.logisticsFee)}
          </span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="size-3.5 text-gold" />
            Agrolink Platform Fee (1.0%)
          </span>
          <span className="font-semibold text-foreground">
            {PricingService.formatNaira(pricing.platformFee)}
          </span>
        </div>

        <div className="border-t pt-3 flex items-center justify-between text-base font-bold text-foreground">
          <span>Total Escrow Commitment</span>
          <span className="text-lg text-primary">
            {PricingService.formatNaira(pricing.totalAmount)}
          </span>
        </div>
      </div>

      <p className="mt-3 rounded-xl bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        🔒 Buyer payment is held securely in escrow. Payout to farmer and transporter is disbursed
        only after verified physical delivery and OTP confirmation.
      </p>
    </Card>
  );
}
