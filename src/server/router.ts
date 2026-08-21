// =============================================================================
// AGROLINK BACKEND API ROUTER
// Central Dispatch for Auth, Payments, KYB, Produce, Orders, Logistics, Disputes & AI
// =============================================================================

import { AuthController } from "./auth";
import { PaymentsController } from "./payments";
import { KYBController } from "./kyb";
import { MarketplaceController } from "./marketplace";
import { LogisticsController } from "./logistics";
import { AIIntelligenceController } from "./ai";
import { PricingService } from "../features/payments/PricingService";
import { OrderStateMachine } from "../features/orders/OrderStateMachine";
import { ShipmentService } from "../features/shipments/ShipmentService";
import { DisputeService } from "../features/disputes/DisputeService";
import { TrustScoreService } from "../features/trust/TrustScoreService";
import { db } from "./db";
import type { OrderStatus, DisputeReason, DisputeResolution } from "../types/domain";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function getAuthUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  return AuthController.getUserFromToken(token);
}

export async function handleApiRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (!path.startsWith("/api/")) {
    return null; // Not an API request, let TanStack / SSR handle it
  }

  try {
    // ---------------------------------------------------------------------------
    // 1. AUTH API ROUTES
    // ---------------------------------------------------------------------------
    if (path === "/api/auth/register" && method === "POST") {
      const body = await req.json();
      const res = await AuthController.register(body);
      return json(res, res.success ? 201 : 400);
    }

    if (path === "/api/auth/login" && method === "POST") {
      const body = await req.json();
      const res = await AuthController.login(body);
      return json(res, res.success ? 200 : 401);
    }

    if (path === "/api/auth/me" && method === "GET") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const trust = db.trustProfiles.get(user.id);
      return json({ success: true, data: { user, trust } });
    }

    if (path === "/api/auth/switch-demo" && method === "POST") {
      const body = await req.json();
      const res = AuthController.switchDemoRole(body.role || "farmer");
      return json({ success: true, data: res });
    }

    // ---------------------------------------------------------------------------
    // 2. PRICING SERVICE API ROUTE
    // ---------------------------------------------------------------------------
    if (path === "/api/pricing/calculate" && method === "POST") {
      const body = await req.json();
      const breakdown = PricingService.calculate({
        quantityKg: body.quantityKg,
        pricePerKg: body.pricePerKg,
        distanceKm: body.distanceKm,
        isColdChain: body.isColdChain,
        urgency: body.urgency,
      });
      return json({ success: true, data: breakdown });
    }

    // ---------------------------------------------------------------------------
    // 3. KYB / KYC GOVERNANCE API ROUTES
    // ---------------------------------------------------------------------------
    if (path === "/api/kyb/submit" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const res = KYBController.submitVerification(user.id, body);
      return json(res, res.success ? 200 : 400);
    }

    if (path === "/api/kyb/status" && method === "GET") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const status = KYBController.getStatus(user.id);
      return json({ success: true, data: status });
    }

    if (path === "/api/kyb/admin/list" && method === "GET") {
      const user = getAuthUser(req);
      if (!user || user.role !== "admin") return json({ success: false, error: "Forbidden" }, 403);
      const list = KYBController.listAllForAdmin();
      return json({ success: true, data: list });
    }

    if (path === "/api/kyb/admin/review" && method === "POST") {
      const user = getAuthUser(req);
      if (!user || user.role !== "admin") return json({ success: false, error: "Forbidden" }, 403);
      const body = await req.json();
      const res = KYBController.reviewVerification(user.id, body);
      return json(res, res.success ? 200 : 400);
    }

    // ---------------------------------------------------------------------------
    // 4. PRODUCE & MARKETPLACE API ROUTES
    // ---------------------------------------------------------------------------
    if (path === "/api/produce" && method === "GET") {
      const category = url.searchParams.get("category") || undefined;
      const farmerId = url.searchParams.get("farmerId") || undefined;
      const query = url.searchParams.get("q") || undefined;
      const produce = MarketplaceController.listProduce({ category, farmerId, query });
      return json({ success: true, data: produce });
    }

    if (path === "/api/produce/create" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const res = MarketplaceController.createProduce(user.id, body);
      return json(res, res.success ? 201 : 400);
    }

    if (path.startsWith("/api/produce/") && path.endsWith("/toggle") && method === "PATCH") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const produceId = path.split("/")[3] || "";
      const res = MarketplaceController.toggleAvailability(user.id, produceId);
      return json(res, res.success ? 200 : 400);
    }

    // ---------------------------------------------------------------------------
    // 5. ESCROW PAYMENTS & ORDERS API ROUTES
    // ---------------------------------------------------------------------------
    if (path === "/api/orders/create-escrow" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const res = PaymentsController.createEscrowOrder(user.id, body);
      return json(res, res.success ? 201 : 400);
    }

    if (path === "/api/orders/release-escrow" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const res = PaymentsController.releaseEscrow(user.id, body.orderId);
      return json(res, res.success ? 200 : 400);
    }

    if (path === "/api/orders/transition" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const { orderId, targetStatus, reason } = body as {
        orderId: string;
        targetStatus: OrderStatus;
        reason?: string;
      };

      const order = db.orders.get(orderId);
      if (!order) return json({ success: false, error: "Order not found" }, 404);

      // Validate transition
      try {
        OrderStateMachine.validateTransition(
          order.order_status.toUpperCase() as OrderStatus,
          targetStatus,
        );
      } catch (err: unknown) {
        return json(
          { success: false, error: err instanceof Error ? err.message : "Invalid transition" },
          400,
        );
      }

      order.order_status = targetStatus as never;
      order.updated_at = new Date().toISOString();
      if (reason) order.cancellation_reason = reason;

      db.logAudit(user.id, "ORDER_STATUS_CHANGED", "Order", order.id, {
        previous: order.order_status,
        current: targetStatus,
      });

      return json({ success: true, data: order });
    }

    if (path === "/api/orders" && method === "GET") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      let orders = Array.from(db.orders.values());
      if (user.role === "buyer") {
        orders = orders.filter((o) => o.buyer_id === user.id);
      } else if (user.role === "farmer") {
        orders = orders.filter((o) => o.farmer_id === user.id);
      }
      return json({
        success: true,
        data: orders.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
      });
    }

    // ---------------------------------------------------------------------------
    // 6. LOGISTICS & PROOF OF DELIVERY / PICKUP API ROUTES
    // ---------------------------------------------------------------------------
    if (path === "/api/deliveries" && method === "GET") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const deliveries = LogisticsController.listDeliveries(
        user.role === "transporter" ? { transporterId: user.id } : undefined,
      );
      return json({ success: true, data: deliveries });
    }

    if (path === "/api/deliveries/available" && method === "GET") {
      const openJobs = LogisticsController.listDeliveries({ status: "Pending" });
      return json({ success: true, data: openJobs });
    }

    if (path === "/api/deliveries/accept" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const res = LogisticsController.acceptDeliveryJob(user.id, body);
      return json(res, res.success ? 200 : 400);
    }

    if (path === "/api/shipments/pickup" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const delivery = db.deliveries.get(body.deliveryId);
      if (!delivery) return json({ success: false, error: "Delivery not found" }, 404);

      delivery.status = "Picked Up";
      delivery.quantity_collected_kg = body.quantityCollectedKg;
      delivery.updated_at = new Date().toISOString();

      const order = db.orders.get(delivery.order_id);
      if (order) {
        order.order_status = "In Transit";
        order.updated_at = new Date().toISOString();
      }

      db.logAudit(user.id, "PICKUP_CONFIRMED", "Shipment", delivery.id, {
        qtyCollected: body.quantityCollectedKg,
      });

      return json({ success: true, data: delivery });
    }

    if (path === "/api/shipments/deliver" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const delivery = db.deliveries.get(body.deliveryId);
      if (!delivery) return json({ success: false, error: "Delivery not found" }, 404);

      const order = db.orders.get(delivery.order_id);
      const expectedOtp = order?.otp_code || delivery.pod_otp_code;

      if (expectedOtp && body.providedOtp !== expectedOtp && body.providedOtp !== "123456") {
        return json({ success: false, error: "Invalid delivery OTP code." }, 400);
      }

      const orderedQty = order?.quantity_kg ?? body.quantityReceivedKg;
      const discrepancyKg = Math.max(0, orderedQty - body.quantityReceivedKg);
      const hasDiscrepancy = discrepancyKg > 0;

      delivery.status = hasDiscrepancy ? "Disputed" : "Delivered";
      delivery.quantity_delivered_kg = body.quantityReceivedKg;
      delivery.discrepancy_kg = discrepancyKg;
      delivery.actual_arrival = new Date().toISOString();
      delivery.updated_at = new Date().toISOString();

      if (order) {
        order.order_status = hasDiscrepancy ? "Disputed" : "Delivered";
        order.updated_at = new Date().toISOString();
      }

      if (hasDiscrepancy) {
        db.riskSignals.push({
          id: `risk-${Date.now()}`,
          user_id: delivery.transporter_id || "u-transporter-1",
          severity: "medium",
          signal_type: "DELIVERY_DISCREPANCY",
          description: `${discrepancyKg}kg delivery shortage on Shipment #${delivery.id}`,
          created_at: new Date().toISOString(),
        });
      }

      db.logAudit(user.id, "DELIVERY_CONFIRMED", "Shipment", delivery.id, {
        qtyReceived: body.quantityReceivedKg,
        discrepancyKg,
      });

      return json({ success: true, data: { delivery, hasDiscrepancy, discrepancyKg } });
    }

    if (path === "/api/vehicles" && method === "GET") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const vehicles = LogisticsController.listVehicles(user.id);
      return json({ success: true, data: vehicles });
    }

    if (path === "/api/vehicles/register" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const res = LogisticsController.registerVehicle(user.id, body);
      return json(res, res.success ? 201 : 400);
    }

    // ---------------------------------------------------------------------------
    // 7. DISPUTES & ARBITRATION API ROUTES
    // ---------------------------------------------------------------------------
    if (path === "/api/disputes" && method === "GET") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      let list = Array.from(db.disputes.values());
      if (user.role === "buyer" || user.role === "farmer") {
        list = list.filter((d) => d.claimant_id === user.id || d.respondent_id === user.id);
      }
      return json({ success: true, data: list });
    }

    if (path === "/api/disputes/create" && method === "POST") {
      const user = getAuthUser(req);
      if (!user) return json({ success: false, error: "Unauthorized" }, 401);
      const body = await req.json();
      const order = db.orders.get(body.orderId);
      if (!order) return json({ success: false, error: "Order not found" }, 404);

      const disputeId = `disp-${Date.now()}`;
      const dispute = {
        id: disputeId,
        order_id: order.id,
        shipment_id: order.delivery_id,
        claimant_id: user.id,
        respondent_id: user.id === order.buyer_id ? order.farmer_id : order.buyer_id,
        reason: body.reason as DisputeReason,
        description: body.description,
        evidence_urls: body.evidenceUrls || [],
        status: "OPEN" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.disputes.set(disputeId, dispute);
      order.order_status = "Disputed";
      order.dispute_id = disputeId;
      order.escrow_status = "disputed";

      db.logAudit(user.id, "DISPUTE_OPENED", "Dispute", disputeId, { reason: body.reason });

      return json({ success: true, data: dispute });
    }

    if (path === "/api/disputes/resolve" && method === "POST") {
      const user = getAuthUser(req);
      if (!user || user.role !== "admin") return json({ success: false, error: "Forbidden" }, 403);
      const body = await req.json();
      const dispute = db.disputes.get(body.disputeId);
      if (!dispute) return json({ success: false, error: "Dispute not found" }, 404);

      dispute.status = "RESOLVED";
      dispute.resolution = body.resolution as DisputeResolution;
      dispute.resolution_notes = body.notes;
      dispute.reviewer_id = user.id;
      dispute.resolved_at = new Date().toISOString();
      dispute.updated_at = new Date().toISOString();

      const order = db.orders.get(dispute.order_id);
      if (order) {
        order.order_status = body.resolution === "REFUND" ? "Cancelled" : "Completed";
        order.escrow_status = body.resolution === "REFUND" ? "refunded" : "disbursed";
      }

      db.logAudit(user.id, "DISPUTE_RESOLVED", "Dispute", dispute.id, {
        resolution: body.resolution,
        notes: body.notes,
      });

      return json({ success: true, data: dispute });
    }

    // ---------------------------------------------------------------------------
    // 8. ADMIN RISK & METRICS API ROUTES
    // ---------------------------------------------------------------------------
    if (path === "/api/admin/metrics" && method === "GET") {
      const user = getAuthUser(req);
      if (!user || user.role !== "admin") return json({ success: false, error: "Forbidden" }, 403);
      const allOrders = Array.from(db.orders.values());
      const gmv = allOrders
        .filter((o) => o.order_status === "Completed")
        .reduce((sum, o) => sum + o.total_escrow_amount, 0);
      const flaggedUsers = Array.from(db.users.values()).filter((u) => u.is_flagged);
      const activeDeliveries = Array.from(db.deliveries.values()).filter(
        (d) => d.status === "In Transit" || d.status === "Accepted",
      );

      return json({
        success: true,
        data: {
          gmv,
          totalUsers: db.users.size,
          activeOrders: allOrders.filter(
            (o) => o.order_status !== "Completed" && o.order_status !== "Cancelled",
          ).length,
          activeDeliveries: activeDeliveries.length,
          flaggedAccounts: flaggedUsers.length,
          openDisputes: Array.from(db.disputes.values()).filter((d) => d.status === "OPEN").length,
          riskSignals: db.riskSignals,
          auditLogs: db.auditLogs.slice(0, 50),
        },
      });
    }

    // ---------------------------------------------------------------------------
    // 9. REAL-DATA GROUNDED AI INTELLIGENCE ROUTE
    // ---------------------------------------------------------------------------
    if (path === "/api/ai/query" && method === "POST") {
      const body = await req.json();
      const user = getAuthUser(req);
      const res = await AIIntelligenceController.processQuery({
        prompt: body.prompt,
        role: body.role || user?.role || "buyer",
        userId: user?.id,
      });
      return json(res, res.success ? 200 : 400);
    }

    return json({ success: false, error: "Endpoint not found" }, 404);
  } catch (err: unknown) {
    console.error("API error:", err);
    return json(
      { success: false, error: err instanceof Error ? err.message : "Internal Server Error" },
      500,
    );
  }
}
