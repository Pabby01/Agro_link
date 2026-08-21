import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as seed from "./mock-data";
import { IS_DEMO_MODE } from "./config";
import { api, getStoredSessionToken, setStoredSessionToken } from "./api-client";
import type {
  Delivery,
  DeliveryStatus,
  Notification,
  Order,
  OrderStatus,
  Produce,
  Role,
  TrustProfile,
  User,
} from "./types";

const STORAGE_KEY = "agrolink.state.v1";
const ROLE_KEY = "agrolink.role.v1";

export interface AppState {
  users: User[];
  trust: TrustProfile[];
  produce: Produce[];
  orders: Order[];
  deliveries: Delivery[];
  notifications: Notification[];
}

const emptyState = (): AppState => ({
  users: [],
  trust: [],
  produce: [],
  orders: [],
  deliveries: [],
  notifications: [],
});

const freshState = (): AppState => {
  if (!IS_DEMO_MODE) {
    return emptyState();
  }
  return {
    users: structuredClone(seed.users),
    trust: structuredClone(seed.trustProfiles),
    produce: structuredClone(seed.produce),
    orders: structuredClone(seed.orders),
    deliveries: structuredClone(seed.deliveries),
    notifications: structuredClone(seed.notifications),
  };
};

export const demoUserByRole: Record<Role, string> = {
  farmer: "u-farmer-1",
  buyer: "u-buyer-1",
  transporter: "u-transporter-1",
  admin: "u-admin-1",
};

const levelFor = (score: number): TrustProfile["level"] =>
  score >= 90 ? "High Trust" : score >= 75 ? "Trusted" : score >= 50 ? "Building Trust" : "New";

interface Ctx {
  state: AppState;
  hydrated: boolean;
  role: Role | null;
  currentUser: User | null;
  isDemoMode: boolean;
  setRole: (role: Role | null) => void;
  setCurrentUser: (user: User | null) => void;
  resetDemo: () => void;
  logout: () => Promise<void>;
  refreshLiveState: () => Promise<void>;
  getUser: (id: string) => User | undefined;
  getTrust: (id: string) => TrustProfile | undefined;
  getProduce: (id: string) => Produce | undefined;
  createListing: (input: Omit<Produce, "id" | "listedAt" | "farmerId" | "available">) => Produce;
  toggleListing: (produceId: string) => void;
  placeOrder: (input: {
    produceId: string;
    quantityKg: number;
    urgency: Delivery["urgency"];
  }) => Order | null;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  acceptDelivery: (deliveryId: string) => void;
  setDeliveryStatus: (deliveryId: string, status: DeliveryStatus) => void;
  rateCounterparty: (orderId: string, targetUserId: string, rating: number) => void;
  markNotificationsRead: (userId: string) => void;
  notificationsFor: (userId: string) => Notification[];
}

const AppContext = createContext<Ctx | null>(null);

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(freshState);
  const [role, setRoleState] = useState<Role | null>(null);
  const [realUser, setRealUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Sync Live Data from Backend API
  const refreshLiveState = useCallback(async () => {
    const token = getStoredSessionToken();
    if (token) {
      const meRes = await api.auth.getMe();
      if (meRes.success && meRes.data?.user) {
        const u = meRes.data.user as unknown as Record<string, unknown>;
        const mappedUser: User = {
          id: String(u["id"] || "u-live"),
          name: String(u["full_name"] || u["name"] || "Live User"),
          role: (u["role"] as Role) || "farmer",
          location: String(u["location_name"] || u["location"] || "Nigeria"),
          coords: {
            lat: typeof u["latitude"] === "number" ? u["latitude"] : 9.082,
            lng: typeof u["longitude"] === "number" ? u["longitude"] : 8.6753,
          },
          joined: String(u["created_at"] || new Date().toISOString().split("T")[0]),
          avatarInitials: String(u["avatar_initials"] || u["avatarInitials"] || "AU"),
          phone: String(u["phone"] || ""),
          bio: String(u["bio"] || ""),
          flagged: Boolean(u["is_flagged"]),
        };
        setRealUser(mappedUser);
        setRoleState(mappedUser.role);

        if (meRes.data.trust) {
          const t = meRes.data.trust as unknown as Record<string, unknown>;
          const score = typeof t["score"] === "number" ? t["score"] : 80;
          const mappedTrust: TrustProfile = {
            userId: String(t["user_id"] || t["userId"] || mappedUser.id),
            score,
            level: (t["level"] as TrustProfile["level"]) || levelFor(score),
            rating: typeof t["rating"] === "number" ? t["rating"] : 5.0,
            completedTransactions:
              typeof t["completed_transactions"] === "number"
                ? t["completed_transactions"]
                : typeof t["completedTransactions"] === "number"
                  ? t["completedTransactions"]
                  : 0,
            successfulDeliveries:
              typeof t["successful_deliveries"] === "number"
                ? t["successful_deliveries"]
                : typeof t["successfulDeliveries"] === "number"
                  ? t["successfulDeliveries"]
                  : 0,
            cancelledOrders:
              typeof t["cancelled_orders"] === "number"
                ? t["cancelled_orders"]
                : typeof t["cancelledOrders"] === "number"
                  ? t["cancelledOrders"]
                  : 0,
            fulfilmentRate:
              typeof t["fulfilment_rate"] === "number"
                ? t["fulfilment_rate"]
                : typeof t["fulfilmentRate"] === "number"
                  ? t["fulfilmentRate"]
                  : 100,
            cancellationRate:
              typeof t["cancellation_rate"] === "number"
                ? t["cancellation_rate"]
                : typeof t["cancellationRate"] === "number"
                  ? t["cancellationRate"]
                  : 0,
            verified: typeof t["verified"] === "boolean" ? t["verified"] : true,
            history: Array.isArray(t["history"]) ? (t["history"] as TrustProfile["history"]) : [],
          };
          setState((s) => ({
            ...s,
            users: [mappedUser, ...s.users.filter((x) => x.id !== mappedUser.id)],
            trust: [mappedTrust, ...s.trust.filter((x) => x.userId !== mappedUser.id)],
          }));
        }
      }
    }

    // Fetch Live Produce
    const prodRes = await api.produce.list();
    if (prodRes.success && prodRes.data) {
      const mappedProduce: Produce[] = prodRes.data.map((rawItem) => {
        const p = rawItem as unknown as Record<string, unknown>;
        const images = Array.isArray(p["images"]) ? (p["images"] as string[]) : [];
        return {
          id: String(p["id"] || `prod-${Date.now()}`),
          farmerId: String(p["farmer_id"] || p["farmerId"] || "u-farmer-1"),
          name: String(p["name"] || "Agricultural Produce"),
          category: (p["category"] as Produce["category"]) || "Vegetables",
          pricePerKg:
            typeof p["price_per_kg"] === "number"
              ? p["price_per_kg"]
              : typeof p["pricePerKg"] === "number"
                ? p["pricePerKg"]
                : 500,
          quantityKg:
            typeof p["quantity_kg"] === "number"
              ? p["quantity_kg"]
              : typeof p["quantityKg"] === "number"
                ? p["quantityKg"]
                : 100,
          location: String(p["location_name"] || p["location"] || "Nigeria"),
          image: images[0] || String(p["image"] || "/images/tomatoes.jpg"),
          available:
            typeof p["is_available"] === "boolean"
              ? p["is_available"]
              : typeof p["available"] === "boolean"
                ? p["available"]
                : true,
          listedAt: String(p["created_at"] || p["listedAt"] || new Date().toISOString()),
          description: String(p["description"] || ""),
        };
      });
      setState((s) => ({
        ...s,
        produce: mappedProduce,
      }));
    }
  }, []);

  useEffect(() => {
    try {
      if (IS_DEMO_MODE) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...freshState(), ...(JSON.parse(raw) as AppState) });
        const savedRole = localStorage.getItem(ROLE_KEY) as Role | null;
        if (savedRole) setRoleState(savedRole);
      }
    } catch {
      /* fallback */
    }

    refreshLiveState();
    setHydrated(true);
  }, [refreshLiveState]);

  useEffect(() => {
    if (!hydrated || !IS_DEMO_MODE) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setRole = useCallback((next: Role | null) => {
    setRoleState(next);
    if (IS_DEMO_MODE) {
      if (next) localStorage.setItem(ROLE_KEY, next);
      else localStorage.removeItem(ROLE_KEY);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setStoredSessionToken(null);
    setRealUser(null);
    setRoleState(null);
    if (IS_DEMO_MODE) {
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
    setState(freshState());
  }, []);

  const resetDemo = useCallback(() => {
    setState(freshState());
    if (IS_DEMO_MODE) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const currentUser = useMemo(() => {
    if (!IS_DEMO_MODE) {
      return realUser;
    }
    return role ? (state.users.find((u) => u.id === demoUserByRole[role]) ?? null) : null;
  }, [role, realUser, state.users]);

  const notify = (
    list: Notification[],
    userId: string,
    title: string,
    body: string,
    tone: Notification["tone"] = "info",
  ): Notification[] => [
    {
      id: uid("n"),
      userId,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
      tone,
    },
    ...list,
  ];

  const value: Ctx = {
    state,
    hydrated,
    role,
    currentUser,
    isDemoMode: IS_DEMO_MODE,
    setRole,
    setCurrentUser: setRealUser,
    resetDemo,
    logout,
    refreshLiveState,
    getUser: (id) => state.users.find((u) => u.id === id),
    getTrust: (id) => state.trust.find((t) => t.userId === id),
    getProduce: (id) => state.produce.find((p) => p.id === id),

    createListing: (input) => {
      const farmerId = currentUser?.id ?? (IS_DEMO_MODE ? demoUserByRole.farmer : "u-farmer-1");
      const listing: Produce = {
        ...input,
        id: uid("p"),
        farmerId,
        available: true,
        listedAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        produce: [listing, ...s.produce],
        notifications: notify(
          s.notifications,
          farmerId,
          "Listing published",
          `${listing.name} (${listing.quantityKg}kg) is now live on the marketplace.`,
          "success",
        ),
      }));
      return listing;
    },

    toggleListing: (produceId) =>
      setState((s) => ({
        ...s,
        produce: s.produce.map((p) => (p.id === produceId ? { ...p, available: !p.available } : p)),
      })),

    placeOrder: ({ produceId, quantityKg, urgency }) => {
      const item = state.produce.find((p) => p.id === produceId);
      const buyerId = currentUser?.id ?? (IS_DEMO_MODE ? demoUserByRole.buyer : "u-buyer-1");
      if (!item) return null;
      const farmer = state.users.find((u) => u.id === item.farmerId);
      const buyer = state.users.find((u) => u.id === buyerId);
      const orderId = uid("o");
      const deliveryId = uid("d");
      const order: Order = {
        id: orderId,
        produceId,
        buyerId,
        farmerId: item.farmerId,
        quantityKg,
        totalPrice: quantityKg * item.pricePerKg,
        status: "Pending",
        createdAt: new Date().toISOString(),
        deliveryId,
      };
      const delivery: Delivery = {
        id: deliveryId,
        orderId,
        pickup: {
          label: `${farmer?.name ?? "Farm"}, ${item.location.split(",")[0]}`,
          lat: farmer?.coords.lat ?? 9.082,
          lng: farmer?.coords.lng ?? 8.6753,
        },
        destination: {
          label: `${buyer?.name ?? "Buyer"}, ${(buyer?.location ?? "Lagos").split(",")[0]}`,
          lat: buyer?.coords.lat ?? 6.5244,
          lng: buyer?.coords.lng ?? 3.3792,
        },
        distanceKm: Math.max(
          40,
          Math.round(
            Math.hypot(
              ((farmer?.coords.lat ?? 9) - (buyer?.coords.lat ?? 6.52)) * 111,
              ((farmer?.coords.lng ?? 8) - (buyer?.coords.lng ?? 3.38)) * 111,
            ),
          ),
        ),
        fee: Math.round(quantityKg * 40 + (urgency === "Urgent" ? 25_000 : 0)),
        status: "Pending",
        urgency,
        createdAt: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        produce: s.produce.map((p) =>
          p.id === produceId ? { ...p, quantityKg: Math.max(0, p.quantityKg - quantityKg) } : p,
        ),
        orders: [order, ...s.orders],
        deliveries: [delivery, ...s.deliveries],
        notifications: notify(
          notify(
            s.notifications,
            item.farmerId,
            "New order received",
            `A buyer ordered ${quantityKg}kg of ${item.name}.`,
            "info",
          ),
          buyerId,
          "Order placed in escrow",
          `₦${order.totalPrice.toLocaleString()} locked for ${item.name}.`,
          "success",
        ),
      }));
      return order;
    },

    setOrderStatus: (orderId, status) =>
      setState((s) => {
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) return s;
        const targetUserId = status === "Accepted" ? order.buyerId : order.farmerId;
        return {
          ...s,
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
          notifications: notify(
            s.notifications,
            targetUserId,
            `Order ${status.toLowerCase()}`,
            `Order #${orderId} was marked as ${status}.`,
            status === "Accepted" ? "success" : "info",
          ),
        };
      }),

    acceptDelivery: (deliveryId) =>
      setState((s) => {
        const transporterId =
          currentUser?.id ?? (IS_DEMO_MODE ? demoUserByRole.transporter : "u-transporter-1");
        const delivery = s.deliveries.find((d) => d.id === deliveryId);
        if (!delivery) return s;
        const order = s.orders.find((o) => o.id === delivery.orderId);
        return {
          ...s,
          deliveries: s.deliveries.map((d) =>
            d.id === deliveryId ? { ...d, transporterId, status: "Accepted" } : d,
          ),
          orders: s.orders.map((o) =>
            o.id === delivery.orderId ? { ...o, status: "In Transit" } : o,
          ),
          notifications: notify(
            notify(
              s.notifications,
              order?.buyerId ?? "",
              "Transporter assigned",
              "A verified transporter has accepted your delivery.",
              "info",
            ),
            transporterId,
            "Delivery job claimed",
            `Haulage job #${deliveryId} is now assigned to you.`,
            "success",
          ),
        };
      }),

    setDeliveryStatus: (deliveryId, status) =>
      setState((s) => {
        const delivery = s.deliveries.find((d) => d.id === deliveryId);
        if (!delivery) return s;
        const order = s.orders.find((o) => o.id === delivery.orderId);
        const nextOrderStatus: OrderStatus | undefined =
          status === "Delivered" ? "Delivered" : status === "In Transit" ? "In Transit" : undefined;
        return {
          ...s,
          deliveries: s.deliveries.map((d) => (d.id === deliveryId ? { ...d, status } : d)),
          orders: nextOrderStatus
            ? s.orders.map((o) =>
                o.id === delivery.orderId ? { ...o, status: nextOrderStatus } : o,
              )
            : s.orders,
          notifications: notify(
            s.notifications,
            order?.buyerId ?? "",
            `Shipment ${status.toLowerCase()}`,
            `Your delivery #${deliveryId} is now ${status.toLowerCase()}.`,
            status === "Delivered" ? "success" : "info",
          ),
        };
      }),

    rateCounterparty: (orderId, targetUserId, rating) =>
      setState((s) => {
        const order = s.orders.find((o) => o.id === orderId);
        const isBuyerRating = currentUser?.role === "buyer" || currentUser?.id === order?.buyerId;
        const trust = s.trust.map((t) => {
          if (t.userId !== targetUserId) return t;
          const currentTotal = t.rating * t.completedTransactions;
          const newCompleted = t.completedTransactions + 1;
          const newRating = Number(((currentTotal + rating) / newCompleted).toFixed(1));
          const scoreDelta = rating >= 4 ? 2 : rating <= 2 ? -5 : 0;
          const newScore = Math.max(0, Math.min(100, t.score + scoreDelta));
          return {
            ...t,
            score: newScore,
            rating: newRating,
            completedTransactions: newCompleted,
            level: levelFor(newScore),
            history: [
              {
                date: new Date().toISOString().split("T")[0]!,
                score: newScore,
                reason: `${rating}★ rating on order #${orderId}`,
              },
              ...t.history,
            ],
          };
        });
        return {
          ...s,
          trust,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "Completed",
                  ratedByBuyer: isBuyerRating ? true : o.ratedByBuyer,
                  ratedByFarmer: isBuyerRating ? o.ratedByFarmer : true,
                }
              : o,
          ),
          notifications: notify(
            s.notifications,
            targetUserId,
            "Your trust score was updated",
            `A ${rating}-star rating was recorded for order ${orderId}.`,
            "success",
          ),
        };
      }),

    markNotificationsRead: (userId) =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
      })),

    notificationsFor: (userId) =>
      state.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppStoreProvider");
  return ctx;
}

export const formatNaira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

export const timeAgo = (iso: string) => {
  const diff = Date.now() - +new Date(iso);
  const days = Math.floor(diff / 86_400_000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60_000);
  return mins > 0 ? `${mins}m ago` : "just now";
};
