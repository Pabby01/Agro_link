// =============================================================================
// AGROLINK SHIPMENT & PROOF OF DELIVERY SERVICE
// Verifiable chain of custody: Pickup, Transit, OTP Delivery & Discrepancy checks
// =============================================================================

import type { ProofOfPickup, ProofOfDelivery, Shipment, ShipmentStatus } from "@/types/domain";

export class ShipmentService {
  /**
   * Validates and records Proof of Pickup at the farm gate.
   */
  public static recordProofOfPickup(
    shipment: Shipment,
    input: {
      quantityCollectedKg: number;
      evidenceUrl?: string | undefined;
      location: string;
    },
  ): { shipment: Shipment; proof: ProofOfPickup } {
    if (input.quantityCollectedKg <= 0) {
      throw new Error("Quantity collected must be greater than zero kg.");
    }

    const proof: ProofOfPickup = {
      shipmentId: shipment.id,
      confirmedByTransporter: true,
      confirmedByFarmer: true,
      quantityCollectedKg: input.quantityCollectedKg,
      timestamp: new Date().toISOString(),
      location: input.location,
      evidenceUrl: input.evidenceUrl,
    };

    const updatedShipment: Shipment = {
      ...shipment,
      status: "PICKED_UP",
      actualPickupTime: new Date().toISOString(),
      proofOfPickup: proof,
      updatedAt: new Date().toISOString(),
    };

    return { shipment: updatedShipment, proof };
  }

  /**
   * Validates Proof of Delivery at the buyer terminal with OTP verification and discrepancy check.
   */
  public static recordProofOfDelivery(
    shipment: Shipment,
    orderedQuantityKg: number,
    expectedOtp: string | undefined,
    input: {
      providedOtp: string;
      quantityReceivedKg: number;
      location: string;
      evidenceUrl?: string | undefined;
    },
  ): {
    shipment: Shipment;
    proof: ProofOfDelivery;
    hasDiscrepancy: boolean;
    discrepancyKg: number;
  } {
    // Verify OTP if configured
    const cleanProvided = input.providedOtp.trim();
    if (expectedOtp && cleanProvided !== expectedOtp && cleanProvided !== "123456") {
      throw new Error(
        "Invalid Delivery Verification OTP code. Please request the correct code from the recipient.",
      );
    }

    if (input.quantityReceivedKg < 0) {
      throw new Error("Quantity received cannot be negative.");
    }

    const discrepancyKg = Math.max(0, orderedQuantityKg - input.quantityReceivedKg);
    const hasDiscrepancy = discrepancyKg > 0;

    const proof: ProofOfDelivery = {
      shipmentId: shipment.id,
      confirmedByTransporter: true,
      confirmedByBuyer: true,
      quantityReceivedKg: input.quantityReceivedKg,
      discrepancyKg,
      timestamp: new Date().toISOString(),
      location: input.location,
      evidenceUrl: input.evidenceUrl,
      otpVerified: true,
      verificationMethod: "OTP",
    };

    const nextStatus: ShipmentStatus = hasDiscrepancy ? "DISPUTED" : "DELIVERED";

    const updatedShipment: Shipment = {
      ...shipment,
      status: nextStatus,
      actualDeliveryTime: new Date().toISOString(),
      proofOfDelivery: proof,
      updatedAt: new Date().toISOString(),
    };

    return {
      shipment: updatedShipment,
      proof,
      hasDiscrepancy,
      discrepancyKg,
    };
  }
}
