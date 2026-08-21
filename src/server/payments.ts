// =============================================================================
// AGROLINK BACKEND PAYMENTS & ESCROW ENGINE
// Server-Side Escrow Locking, Fee Calculation, Settlement & Dispute Resolution
// =============================================================================

import { db, type DBOrder, type DBDelivery, type DBPayment } from "./db";

export class PaymentsController {
  /**
   * Create an Order with Server-Side Escrow Lock
   */
  static createEscrowOrder(
    buyerId: string,
    data: {
      produceId: string;
      quantityKg: number;
      urgency: "Standard" | "Urgent" | "Cold Chain Refrigerated";
    },
  ): {
    success: boolean;
    data?: { order: DBOrder; delivery: DBDelivery; payment: DBPayment };
    error?: string;
  } {
    const produce = db.produce.get(data.produceId);
    if (!produce || !produce.is_available) {
      return { success: false, error: "This produce listing is no longer available." };
    }

    if (data.quantityKg <= 0 || data.quantityKg > produce.available_quantity_kg) {
      return {
        success: false,
        error: `Invalid quantity. Available harvest: ${produce.available_quantity_kg.toLocaleString()}kg.`,
      };
    }

    const buyer = db.users.get(buyerId);
    if (!buyer) {
      return { success: false, error: "Buyer profile not found." };
    }

    // 1. Server-Side Calculations (Never trust client prices or fees)
    const qty = Math.round(data.quantityKg);
    const produceSubtotal = qty * produce.price_per_kg;

    // Delivery Fee algorithm based on urgency and bulk weight
    const baseHaulageRatePerKg = 40; // ₦40 per kg base freight
    const urgencySurcharge =
      data.urgency === "Cold Chain Refrigerated" ? 35_000 : data.urgency === "Urgent" ? 25_000 : 0;

    const deliveryFee = Math.round(qty * baseHaulageRatePerKg + urgencySurcharge);
    const platformFee = Math.max(200, Math.round(produceSubtotal * 0.01));
    const totalEscrowAmount = produceSubtotal + deliveryFee + platformFee;

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const orderNumber = `AGRO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryId = `del-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const paymentRef = `ESCROW-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // 2. Create Order Record
    const newOrder: DBOrder = {
      id: orderId,
      order_number: orderNumber,
      produce_id: produce.id,
      buyer_id: buyerId,
      farmer_id: produce.farmer_id,
      quantity_kg: qty,
      unit_price_per_kg: produce.price_per_kg,
      produce_subtotal: produceSubtotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      total_escrow_amount: totalEscrowAmount,
      escrow_status: "funded_in_escrow",
      order_status: "Accepted",
      delivery_urgency: data.urgency,
      delivery_id: deliveryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 3. Create Corresponding Delivery Dispatch Record for Transporters
    const newDelivery: DBDelivery = {
      id: deliveryId,
      order_id: orderId,
      pickup_location: {
        label: produce.location_name,
        lat: produce.latitude,
        lng: produce.longitude,
      },
      dropoff_location: {
        label: buyer.location_name,
        lat: buyer.latitude,
        lng: buyer.longitude,
      },
      corridor_name: `${produce.location_name} -> ${buyer.location_name} Corridor`,
      distance_km: 840,
      delivery_fee: deliveryFee,
      status: "Pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 4. Create Payment Audit Record
    const newPayment: DBPayment = {
      id: `pay-${Date.now()}`,
      order_id: orderId,
      payer_id: buyerId,
      recipient_farmer_id: produce.farmer_id,
      reference: paymentRef,
      amount: totalEscrowAmount,
      channel: "escrow_direct_debit",
      status: "successful",
      escrow_locked_at: new Date().toISOString(),
      metadata: {
        orderNumber,
        produceName: produce.name,
        quantityKg: qty,
        deliveryUrgency: data.urgency,
      },
      created_at: new Date().toISOString(),
    };

    // 5. Deduct Produce Available Stock
    produce.available_quantity_kg -= qty;
    if (produce.available_quantity_kg <= 0) {
      produce.is_available = false;
    }
    produce.updated_at = new Date().toISOString();

    // 6. Commit to Database
    db.orders.set(newOrder.id, newOrder);
    db.deliveries.set(newDelivery.id, newDelivery);
    db.payments.set(newPayment.id, newPayment);
    db.produce.set(produce.id, produce);

    db.logAudit(buyerId, "ESCROW_LOCKED", "orders", orderId, {
      amount: totalEscrowAmount,
      produceSubtotal,
      deliveryFee,
      reference: paymentRef,
    });

    return {
      success: true,
      data: {
        order: newOrder,
        delivery: newDelivery,
        payment: newPayment,
      },
    };
  }

  /**
   * Release Escrow to Farmer & Transporter upon Buyer Delivery Confirmation
   */
  static releaseEscrow(actorId: string, orderId: string): { success: boolean; error?: string } {
    const order = db.orders.get(orderId);
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.buyer_id !== actorId && actorId !== "u-admin-1") {
      return { success: false, error: "Only the purchasing buyer or an Admin can release escrow." };
    }

    if (order.escrow_status !== "funded_in_escrow") {
      return {
        success: false,
        error: `Escrow cannot be released from status: ${order.escrow_status}`,
      };
    }

    order.escrow_status = "disbursed";
    order.order_status = "Completed";
    order.updated_at = new Date().toISOString();

    // Update Delivery Status to Delivered if not already
    if (order.delivery_id) {
      const delivery = db.deliveries.get(order.delivery_id);
      if (delivery) {
        delivery.status = "Delivered";
        delivery.actual_arrival = new Date().toISOString();
        delivery.updated_at = new Date().toISOString();
        db.deliveries.set(delivery.id, delivery);
      }
    }

    // Update Trust Profiles
    const farmerTrust = db.trustProfiles.get(order.farmer_id);
    if (farmerTrust) {
      farmerTrust.completed_transactions += 1;
      farmerTrust.successful_deliveries += 1;
      farmerTrust.score = Math.min(100, farmerTrust.score + 1);
      farmerTrust.history.unshift({
        date: new Date().toISOString().slice(0, 10),
        score: farmerTrust.score,
        reason: `Completed escrow fulfillment for Order #${order.order_number}`,
      });
      farmerTrust.updated_at = new Date().toISOString();
    }

    const buyerTrust = db.trustProfiles.get(order.buyer_id);
    if (buyerTrust) {
      buyerTrust.completed_transactions += 1;
      buyerTrust.score = Math.min(100, buyerTrust.score + 1);
      buyerTrust.updated_at = new Date().toISOString();
    }

    db.orders.set(order.id, order);

    db.logAudit(actorId, "ESCROW_DISBURSED", "orders", order.id, {
      totalAmount: order.total_escrow_amount,
      farmerPayout: order.produce_subtotal,
      transporterPayout: order.delivery_fee,
    });

    return { success: true };
  }

  /**
   * Raise a Dispute on an Escrow-locked Order
   */
  static disputeOrder(
    actorId: string,
    orderId: string,
    reason: string,
  ): { success: boolean; error?: string } {
    const order = db.orders.get(orderId);
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    order.escrow_status = "disputed";
    order.cancellation_reason = reason;
    order.updated_at = new Date().toISOString();

    db.orders.set(order.id, order);
    db.logAudit(actorId, "ORDER_DISPUTED", "orders", order.id, { reason });

    return { success: true };
  }
}
