import type {
  User,
  Role,
  ProduceListing,
  Order,
  Shipment,
  TrustProfile,
  Dispute,
  CropDiagnosis,
  AIMessage,
  Notification,
  AuditLog,
  NigerianLanguage,
} from "@/types/domain";
import { getStoredSessionToken, setStoredSessionToken } from "@/lib/api-client";

// =============================================================================
// UNIFIED SERVICES LAYER (FRONTEND <-> BACKEND CONTRACT)
// Strictly follows the Hackathon backend API contract with graceful mock fallback
// =============================================================================

async function request<T>(
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
    const res = await fetch(endpoint, { ...options, headers });
    if (!res.ok && res.status >= 500) {
      throw new Error(`Server returned status ${res.status}`);
    }
    const json = await res.json();
    return json;
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Service request failed",
    };
  }
}

// -----------------------------------------------------------------------------
// 1. AUTH SERVICE
// POST /api/auth/login
// POST /api/auth/register
// -----------------------------------------------------------------------------
export const authService = {
  async login(credentials: { email: string; password: string }) {
    const res = await request<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res.success && res.data?.token) {
      setStoredSessionToken(res.data.token);
    }
    return res;
  },

  async register(data: {
    email: string;
    password: string;
    role: Role;
    fullName: string;
    businessName: string;
    phone: string;
    locationName: string;
  }) {
    const res = await request<{ user: User; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.token) {
      setStoredSessionToken(res.data.token);
    }
    return res;
  },

  async logout() {
    setStoredSessionToken(null);
    return { success: true };
  },
};

// -----------------------------------------------------------------------------
// 2. MARKETPLACE SERVICE
// GET /api/listings
// GET /api/listings/:id
// POST /api/listings
// -----------------------------------------------------------------------------
export const marketplaceService = {
  async getListings(params?: { category?: string; search?: string; available?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "All") query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.available !== undefined) query.set("available", String(params.available));

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<ProduceListing[]>(`/api/listings${qs}`);
  },

  async getListingById(id: string) {
    return request<ProduceListing>(`/api/listings/${id}`);
  },

  async createListing(data: Partial<ProduceListing>) {
    return request<ProduceListing>("/api/listings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// -----------------------------------------------------------------------------
// 3. ORDERS SERVICE
// POST /api/orders
// GET /api/orders
// GET /api/orders/:id
// PATCH /api/orders/:id/status
// -----------------------------------------------------------------------------
export const ordersService = {
  async createOrder(data: {
    listingId: string;
    buyerId: string;
    farmerId: string;
    quantityKg: number;
    requireTransport?: boolean;
    deliveryAddress?: string;
  }) {
    return request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getOrders(params?: { role?: Role; userId?: string }) {
    const query = new URLSearchParams();
    if (params?.role) query.set("role", params.role);
    if (params?.userId) query.set("userId", params.userId);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<Order[]>(`/api/orders${qs}`);
  },

  async getOrderById(id: string) {
    return request<Order>(`/api/orders/${id}`);
  },

  async updateOrderStatus(id: string, status: string, notes?: string) {
    return request<Order>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  },

  async confirmDelivery(id: string, otpCode?: string, rating?: number) {
    return request<Order>(`/api/orders/${id}/confirm-delivery`, {
      method: "POST",
      body: JSON.stringify({ otpCode, rating }),
    });
  },
};

// -----------------------------------------------------------------------------
// 4. TRANSPORT & DELIVERY SERVICE
// GET /api/shipments
// POST /api/shipments
// PATCH /api/shipments/:id/status
// POST /api/shipments/:id/pickup
// POST /api/shipments/:id/delivery
// -----------------------------------------------------------------------------
export const transportService = {
  async getShipments(params?: { transporterId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.transporterId) query.set("transporterId", params.transporterId);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<Shipment[]>(`/api/shipments${qs}`);
  },

  async acceptShipment(shipmentId: string, transporterId: string) {
    return request<Shipment>(`/api/shipments/${shipmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "ASSIGNED", transporterId }),
    });
  },

  async recordPickup(
    shipmentId: string,
    data: {
      quantityCollectedKg: number;
      location: string;
      notes?: string;
      evidenceUrl?: string;
    },
  ) {
    return request<Shipment>(`/api/shipments/${shipmentId}/pickup`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async recordDelivery(
    shipmentId: string,
    data: {
      quantityReceivedKg: number;
      location: string;
      otpCode?: string;
      evidenceUrl?: string;
      verificationMethod?: "OTP" | "DIGITAL_SIGNATURE" | "MANUAL_INSPECTION";
    },
  ) {
    return request<Shipment>(`/api/shipments/${shipmentId}/delivery`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// -----------------------------------------------------------------------------
// 5. TRUST SERVICE
// GET /api/users/:id/trust
// -----------------------------------------------------------------------------
export const trustService = {
  async getTrust(userId: string) {
    return request<TrustProfile>(`/api/users/${userId}/trust`);
  },
};

// -----------------------------------------------------------------------------
// 6. DISPUTES SERVICE
// POST /api/orders/:id/disputes
// GET /api/disputes
// -----------------------------------------------------------------------------
export const disputeService = {
  async createDispute(
    orderId: string,
    data: {
      claimantId: string;
      reason: string;
      description: string;
      expectedKg?: number;
      receivedKg?: number;
      evidenceUrls?: string[];
    },
  ) {
    return request<Dispute>(`/api/orders/${orderId}/disputes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getDisputes() {
    return request<Dispute[]>("/api/disputes");
  },
};

// -----------------------------------------------------------------------------
// 7. AI CROP INTELLIGENCE SERVICE
// POST /api/ai/crop-diagnosis
// POST /api/ai/ask
// -----------------------------------------------------------------------------
export const aiService = {
  async diagnoseCrop(data: {
    cropName?: string;
    imageBase64?: string;
    imageUrl?: string;
    notes?: string;
    language?: NigerianLanguage;
  }) {
    return request<CropDiagnosis>("/api/ai/crop-diagnosis", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async ask(data: {
    question: string;
    language?: NigerianLanguage;
    cropDiagnosisContext?: string;
    role?: Role;
  }) {
    return request<AIMessage>("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// -----------------------------------------------------------------------------
// 8. NOTIFICATIONS SERVICE
// GET /api/notifications
// -----------------------------------------------------------------------------
export const notificationService = {
  async getNotifications(userId?: string) {
    const qs = userId ? `?userId=${userId}` : "";
    return request<Notification[]>(`/api/notifications${qs}`);
  },
};

// -----------------------------------------------------------------------------
// 9. ADMIN SERVICE
// GET /api/admin/overview
// GET /api/admin/risk-signals
// GET /api/admin/audit-logs
// -----------------------------------------------------------------------------
export const adminService = {
  async getOverview() {
    return request<{
      totalFarmers: number;
      totalBuyers: number;
      totalTransporters: number;
      activeOrders: number;
      activeShipments: number;
      openDisputes: number;
      avgTrustScore: number;
      escrowLockedAmount: number;
    }>("/api/admin/overview");
  },

  async getRiskSignals() {
    return request<
      Array<{
        id: string;
        signalType: string;
        severity: "HIGH" | "MEDIUM" | "LOW";
        description: string;
        userId?: string;
        orderId?: string;
      }>
    >("/api/admin/risk-signals");
  },

  async getAuditLogs() {
    return request<AuditLog[]>("/api/admin/audit-logs");
  },
};
