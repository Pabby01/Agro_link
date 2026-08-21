// =============================================================================
// AGROLINK SECURE API CLIENT (FRONTEND -> BACKEND)
// Client SDK calling backend API routes with session tokens
// =============================================================================

import type { User, TrustProfile, Produce, Order, Delivery, Role } from "./types";

const TOKEN_KEY = "agrolink_session_token";

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSessionToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = await res.json();
    return json;
  } catch (err: unknown) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error contacting server.",
    };
  }
}

export const api = {
  auth: {
    async register(data: {
      email: string;
      password: string;
      role: "farmer" | "buyer" | "transporter";
      fullName: string;
      businessName: string;
      phone: string;
      locationName: string;
      latitude?: number;
      longitude?: number;
      bio?: string;
    }) {
      const res = await apiFetch<{
        user: Record<string, unknown>;
        sessionToken: string;
        expiresAt: string;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.success && res.data?.sessionToken) {
        setStoredSessionToken(res.data.sessionToken);
      }
      return res;
    },

    async login(data: { email: string; password: string }) {
      const res = await apiFetch<{
        user: Record<string, unknown>;
        sessionToken: string;
        expiresAt: string;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.success && res.data?.sessionToken) {
        setStoredSessionToken(res.data.sessionToken);
      }
      return res;
    },

    async getMe() {
      return apiFetch<{ user: User; trust: TrustProfile }>("/api/auth/me");
    },

    async logout() {
      setStoredSessionToken(null);
      return { success: true };
    },

    async switchDemoRole(role: Role) {
      const res = await apiFetch<{
        user: Record<string, unknown>;
        sessionToken: string;
        expiresAt: string;
      }>("/api/auth/switch-demo", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      if (res.success && res.data?.sessionToken) {
        setStoredSessionToken(res.data.sessionToken);
      }
      return res;
    },
  },

  kyb: {
    async submit(data: {
      companyName: string;
      cacRcNumber: string;
      tinNumber?: string;
      directorNinBvn?: string;
      businessAddress: string;
      documentUrls: Record<string, string>;
    }) {
      return apiFetch<{ id: string; status: string }>("/api/kyb/submit", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async getStatus() {
      return apiFetch<Record<string, unknown>>("/api/kyb/status");
    },

    async adminList() {
      return apiFetch<Array<Record<string, unknown>>>("/api/kyb/admin/list");
    },

    async adminReview(data: {
      kybId: string;
      approved: boolean;
      tier?: 2 | 3 | undefined;
      rejectionReason?: string | undefined;
    }) {
      return apiFetch<{ success: boolean }>("/api/kyb/admin/review", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  produce: {
    async list(
      params?:
        | {
            category?: string | undefined;
            farmerId?: string | undefined;
            q?: string | undefined;
          }
        | undefined,
    ) {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.farmerId) query.set("farmerId", params.farmerId);
      if (params?.q) query.set("q", params.q);
      return apiFetch<Produce[]>(`/api/produce?${query.toString()}`);
    },

    async create(data: {
      name: string;
      category: "Vegetables" | "Grains" | "Tubers" | "Fruits" | "Legumes";
      description: string;
      qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Organic Certified";
      quantityKg: number;
      pricePerKg: number;
      minOrderKg?: number | undefined;
      packagingType?: string | undefined;
      locationName: string;
      latitude?: number | undefined;
      longitude?: number | undefined;
      images?: string[] | undefined;
    }) {
      return apiFetch<Produce>("/api/produce/create", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async toggleAvailability(produceId: string) {
      return apiFetch<Produce>(`/api/produce/${produceId}/toggle`, {
        method: "PATCH",
      });
    },
  },

  pricing: {
    async calculate(data: {
      quantityKg: number;
      pricePerKg: number;
      distanceKm?: number | undefined;
      isColdChain?: boolean | undefined;
      urgency?: "Standard" | "Urgent" | "Cold Chain Refrigerated" | undefined;
    }) {
      return apiFetch<{
        produceSubtotal: number;
        logisticsFee: number;
        platformFee: number;
        totalAmount: number;
        currency: string;
        platformFeePercentage: number;
        isColdChain: boolean;
      }>("/api/pricing/calculate", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  orders: {
    async createEscrow(data: {
      produceId: string;
      quantityKg: number;
      urgency: "Standard" | "Urgent" | "Cold Chain Refrigerated";
    }) {
      return apiFetch<{
        order: Record<string, unknown>;
        delivery: Record<string, unknown>;
        payment: Record<string, unknown>;
      }>("/api/orders/create-escrow", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async transition(data: { orderId: string; targetStatus: string; reason?: string | undefined }) {
      return apiFetch<Order>("/api/orders/transition", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async releaseEscrow(orderId: string) {
      return apiFetch<{ success: boolean }>("/api/orders/release-escrow", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
    },

    async list() {
      return apiFetch<Order[]>("/api/orders");
    },
  },

  logistics: {
    async list() {
      return apiFetch<Delivery[]>("/api/deliveries");
    },

    async listAvailableJobs() {
      return apiFetch<Delivery[]>("/api/deliveries/available");
    },

    async acceptJob(deliveryId: string, vehicleId?: string | undefined) {
      return apiFetch<Delivery>("/api/deliveries/accept", {
        method: "POST",
        body: JSON.stringify({ deliveryId, vehicleId }),
      });
    },

    async updateMilestone(data: {
      deliveryId: string;
      status: "Picked Up" | "In Transit" | "Delivered";
      latitude?: number | undefined;
      longitude?: number | undefined;
      speedKmh?: number | undefined;
      cargoTempCelsius?: number | undefined;
    }) {
      return apiFetch<Delivery>("/api/deliveries/milestone", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async pickup(data: {
      deliveryId: string;
      quantityCollectedKg: number;
      evidenceUrl?: string | undefined;
    }) {
      return apiFetch<Delivery>("/api/shipments/pickup", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async deliver(data: {
      deliveryId: string;
      providedOtp: string;
      quantityReceivedKg: number;
      evidenceUrl?: string | undefined;
    }) {
      return apiFetch<{ delivery: Delivery; hasDiscrepancy: boolean; discrepancyKg: number }>(
        "/api/shipments/deliver",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
    },

    async listVehicles() {
      return apiFetch<Array<Record<string, unknown>>>("/api/vehicles");
    },

    async registerVehicle(data: {
      plateNumber: string;
      vehicleType: "Truck 40T" | "Reefer 30T" | "Flatbed 20T" | "Van 5T" | "Dispatch Bike";
      capacityKg: number;
      isRefrigerated: boolean;
    }) {
      return apiFetch<Record<string, unknown>>("/api/vehicles/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  disputes: {
    async list() {
      return apiFetch<Array<Record<string, unknown>>>("/api/disputes");
    },

    async create(data: {
      orderId: string;
      reason: string;
      description: string;
      evidenceUrls?: string[] | undefined;
    }) {
      return apiFetch<Record<string, unknown>>("/api/disputes/create", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async resolve(data: { disputeId: string; resolution: string; notes: string }) {
      return apiFetch<Record<string, unknown>>("/api/disputes/resolve", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  admin: {
    async getMetrics() {
      return apiFetch<{
        gmv: number;
        totalUsers: number;
        activeOrders: number;
        activeDeliveries: number;
        flaggedAccounts: number;
        openDisputes: number;
        riskSignals: Array<Record<string, unknown>>;
        auditLogs: Array<Record<string, unknown>>;
      }>("/api/admin/metrics");
    },
  },

  ai: {
    async query(data: { prompt: string; role?: Role | undefined; userId?: string | undefined }) {
      return apiFetch<{
        answer: string;
        suggestion: string;
        keyMetrics?: { label: string; value: string }[] | undefined;
        action?: { label: string; to: string } | undefined;
        sources?: string[] | undefined;
      }>("/api/ai/query", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },
};
