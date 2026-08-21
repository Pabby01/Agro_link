// =============================================================================
// AGROLINK PAYMENT PROVIDER ABSTRACTION
// Modular escrow and transaction settlements
// =============================================================================

import type { PaymentTransaction, PaymentStatus } from "@/types/domain";

export interface CreatePaymentInput {
  orderId: string;
  payerId: string;
  amount: number;
}

export interface PaymentProvider {
  name: string;
  initiateEscrowPayment(input: CreatePaymentInput): Promise<PaymentTransaction>;
  verifyPayment(transactionReference: string): Promise<{ success: boolean; status: PaymentStatus }>;
  disburseEscrow(
    paymentId: string,
    recipientId: string,
    amount: number,
  ): Promise<{ success: boolean; reference: string }>;
  refundBuyer(
    paymentId: string,
    amount: number,
    reason: string,
  ): Promise<{ success: boolean; reference: string }>;
}

export class MockPaymentProvider implements PaymentProvider {
  name = "MockPaymentProvider";

  async initiateEscrowPayment(input: CreatePaymentInput): Promise<PaymentTransaction> {
    const reference = `REF-ESC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const payment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      orderId: input.orderId,
      payerId: input.payerId,
      amount: input.amount,
      currency: "NGN",
      provider: "MockPaymentProvider",
      transactionReference: reference,
      status: "SUCCESSFUL", // Mock instant simulated authorization
      escrowStatus: "funded_in_escrow",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    return payment;
  }

  async verifyPayment(
    transactionReference: string,
  ): Promise<{ success: boolean; status: PaymentStatus }> {
    return {
      success: true,
      status: transactionReference.startsWith("REF-ESC") ? "SUCCESSFUL" : "PENDING",
    };
  }

  async disburseEscrow(
    paymentId: string,
    recipientId: string,
    amount: number,
  ): Promise<{ success: boolean; reference: string }> {
    return {
      success: true,
      reference: `DISB-${paymentId}-${recipientId}-${Date.now()}`,
    };
  }

  async refundBuyer(
    paymentId: string,
    amount: number,
    reason: string,
  ): Promise<{ success: boolean; reference: string }> {
    return {
      success: true,
      reference: `REFUND-${paymentId}-${Date.now()}`,
    };
  }
}
