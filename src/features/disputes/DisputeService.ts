// =============================================================================
// AGROLINK DISPUTE RESOLUTION SERVICE
// Fair counterparty arbitration, evidence review, and settlement outcomes
// =============================================================================

import type {
  Dispute,
  DisputeReason,
  DisputeResolution,
  DisputeStatus,
  Order,
} from "@/types/domain";

export class DisputeService {
  /**
   * Creates a formal dispute for an order or delivery.
   */
  public static openDispute(input: {
    order: Order;
    claimantId: string;
    respondentId: string;
    reason: DisputeReason;
    description: string;
    evidenceUrls?: string[] | undefined;
  }): Dispute {
    if (!input.description || input.description.trim().length < 10) {
      throw new Error(
        "Please provide a detailed description (at least 10 characters) explaining the issue.",
      );
    }

    const dispute: Dispute = {
      id: `disp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId: input.order.id,
      shipmentId: input.order.shipmentId,
      claimantId: input.claimantId,
      respondentId: input.respondentId,
      reason: input.reason,
      description: input.description.trim(),
      evidenceUrls: input.evidenceUrls || [],
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return dispute;
  }

  /**
   * Admin resolution of a dispute with calculated settlement.
   */
  public static resolveDispute(
    dispute: Dispute,
    order: Order,
    input: {
      resolution: DisputeResolution;
      reviewerId: string;
      resolutionNotes: string;
      partialRefundAmount?: number | undefined;
    },
  ): { dispute: Dispute; refundAmount: number; nextOrderStatus: Order["status"] } {
    let refundAmount = 0;
    let nextOrderStatus: Order["status"] = "COMPLETED";

    switch (input.resolution) {
      case "REFUND":
        refundAmount = order.pricing.totalAmount;
        nextOrderStatus = "CANCELLED";
        break;
      case "PARTIAL_REFUND":
        refundAmount = Math.min(
          order.pricing.totalAmount,
          input.partialRefundAmount || Math.round(order.pricing.produceSubtotal * 0.5),
        );
        nextOrderStatus = "COMPLETED";
        break;
      case "NO_REFUND":
        refundAmount = 0;
        nextOrderStatus = "COMPLETED";
        break;
      case "REPLACEMENT":
      case "MANUAL_RESOLUTION":
        refundAmount = 0;
        nextOrderStatus = "COMPLETED";
        break;
    }

    const resolved: Dispute = {
      ...dispute,
      status: "RESOLVED",
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
      refundAmount,
      reviewerId: input.reviewerId,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { dispute: resolved, refundAmount, nextOrderStatus };
  }
}
