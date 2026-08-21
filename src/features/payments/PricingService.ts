// =============================================================================
// AGROLINK TRANSPARENT PRICING SERVICE
// Dynamic produce + logistics + platform fee breakdown
// =============================================================================

import type { PricingBreakdown } from "@/types/domain";

export interface CalculatePriceInput {
  quantityKg: number;
  pricePerKg: number;
  distanceKm?: number | undefined;
  isColdChain?: boolean | undefined;
  urgency?: "Standard" | "Urgent" | "Cold Chain Refrigerated" | undefined;
}

export class PricingService {
  public static readonly PLATFORM_FEE_PERCENTAGE = 0.01; // 1% platform fee
  public static readonly BASE_PER_KG_FREIGHT_RATE = 35; // ₦35 per kg haulage
  public static readonly REFRIGERATED_MULTIPLIER = 1.35; // 35% cold-chain surcharge
  public static readonly URGENT_SURCHARGE = 15_000; // ₦15,000 priority dispatch

  /**
   * Calculates comprehensive, transparent fee breakdown.
   */
  public static calculate(input: CalculatePriceInput): PricingBreakdown {
    const qty = Math.max(1, input.quantityKg);
    const unitPrice = Math.max(0, input.pricePerKg);
    const produceSubtotal = Math.round(qty * unitPrice);

    // Logistics calculation based on weight, distance, and temperature control
    const distance = Math.max(25, input.distanceKm ?? 450); // Default Kano-Abuja-Lagos transit
    const isColdChain = input.isColdChain || input.urgency === "Cold Chain Refrigerated";

    let logistics = qty * this.BASE_PER_KG_FREIGHT_RATE;
    if (distance > 300) {
      logistics += (distance - 300) * 15; // Marginal long-haul transit adjustment
    }

    if (isColdChain) {
      logistics = Math.round(logistics * this.REFRIGERATED_MULTIPLIER);
    }

    if (input.urgency === "Urgent") {
      logistics += this.URGENT_SURCHARGE;
    }

    const logisticsFee = Math.max(5_000, Math.round(logistics));
    const platformFee = Math.max(200, Math.round(produceSubtotal * this.PLATFORM_FEE_PERCENTAGE));
    const totalAmount = produceSubtotal + logisticsFee + platformFee;

    return {
      produceSubtotal,
      logisticsFee,
      platformFee,
      totalAmount,
      currency: "NGN",
      platformFeePercentage: 1.0,
      isColdChain: Boolean(isColdChain),
    };
  }

  /**
   * Format any numeric amount to Nigerian Naira with standard formatting.
   */
  public static formatNaira(amount: number): string {
    return `₦${Math.round(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  }
}
