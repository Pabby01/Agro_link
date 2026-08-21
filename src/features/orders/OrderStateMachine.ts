// =============================================================================
// AGROLINK ORDER STATE MACHINE
// Strict lifecycle transitions and transaction validation
// =============================================================================

import type { OrderStatus, Role } from "@/types/domain";

export class OrderStateMachine {
  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ["PENDING", "CANCELLED"],
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PAYMENT_PENDING", "CANCELLED", "DISPUTED"],
    PAYMENT_PENDING: ["PAID", "CANCELLED", "FAILED"],
    PAID: ["TRANSPORT_REQUIRED", "TRANSPORT_ASSIGNED", "DISPUTED"],
    TRANSPORT_REQUIRED: ["TRANSPORT_ASSIGNED", "DISPUTED", "CANCELLED"],
    TRANSPORT_ASSIGNED: ["PICKUP_PENDING", "DISPUTED", "CANCELLED"],
    PICKUP_PENDING: ["IN_TRANSIT", "DISPUTED"],
    IN_TRANSIT: ["DELIVERED", "DISPUTED"],
    DELIVERED: ["BUYER_CONFIRMED", "DISPUTED"],
    BUYER_CONFIRMED: ["COMPLETED", "DISPUTED"],
    COMPLETED: [], // Terminal
    DISPUTED: ["COMPLETED", "CANCELLED", "PAID"], // Resolution pathways
    CANCELLED: [], // Terminal
    FAILED: ["PAYMENT_PENDING", "CANCELLED"],
  };

  /**
   * Validates if a transition from current state to target state is legally allowed.
   */
  public static canTransition(current: OrderStatus, target: OrderStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  /**
   * Validates and asserts a transition, throwing error if illegal.
   */
  public static validateTransition(current: OrderStatus, target: OrderStatus): void {
    if (!this.canTransition(current, target)) {
      throw new Error(
        `Invalid order status transition from ${current} to ${target}. Allowed transitions: ${(this.VALID_TRANSITIONS[current] || []).join(", ") || "None"}`,
      );
    }
  }

  /**
   * Checks role permission to trigger a specific transition.
   */
  public static isRoleAuthorized(role: Role, target: OrderStatus): boolean {
    if (role === "admin") return true;

    switch (target) {
      case "CONFIRMED":
        return role === "farmer";
      case "PAID":
      case "BUYER_CONFIRMED":
      case "COMPLETED":
        return role === "buyer";
      case "TRANSPORT_ASSIGNED":
      case "IN_TRANSIT":
      case "DELIVERED":
        return role === "transporter";
      case "DISPUTED":
        return role === "buyer" || role === "farmer" || role === "transporter";
      case "CANCELLED":
        return role === "buyer" || role === "farmer";
      default:
        return false;
    }
  }

  /**
   * Generates a secure 6-digit delivery verification OTP.
   */
  public static generateDeliveryOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
