export type Role = "farmer" | "buyer" | "transporter" | "admin";

export type TrustLevel = "High Trust" | "Trusted" | "Building Trust" | "New";

export interface TrustProfile {
  userId: string;
  score: number;
  level: TrustLevel;
  rating: number;
  completedTransactions: number;
  fulfilmentRate: number;
  successfulDeliveries: number;
  cancelledOrders: number;
  cancellationRate: number;
  verified: boolean;
  history: { date: string; score: number; reason: string }[];
}

export interface User {
  id: string;
  name: string;
  role: Role;
  location: string;
  coords: { lat: number; lng: number };
  joined: string;
  avatarInitials: string;
  bio: string;
  phone: string;
  flagged?: boolean | undefined;
}

export type ProduceCategory = "Vegetables" | "Grains" | "Tubers" | "Fruits" | "Legumes";

export interface Produce {
  id: string;
  farmerId: string;
  name: string;
  category: ProduceCategory;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  image: string;
  available: boolean;
  listedAt: string;
  description: string;
}

export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Awaiting Pickup"
  | "In Transit"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export interface Order {
  id: string;
  produceId: string;
  buyerId: string;
  farmerId: string;
  quantityKg: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  deliveryId?: string | undefined;
  ratedByBuyer?: boolean | undefined;
  ratedByFarmer?: boolean | undefined;
}

export type DeliveryStatus = "Pending" | "Accepted" | "Picked Up" | "In Transit" | "Delivered";

export interface Delivery {
  id: string;
  orderId: string;
  transporterId?: string | undefined;
  pickup: { label: string; lat: number; lng: number };
  destination: { label: string; lat: number; lng: number };
  distanceKm: number;
  fee: number;
  urgency: "Standard" | "Urgent" | "Cold Chain Refrigerated";
  status: DeliveryStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  tone: "info" | "success" | "warning";
}

export interface AIInsight {
  id: string;
  role: Role;
  question: string;
  answer: string;
  suggestion: string;
  action?: { label: string; to: string } | undefined;
}
