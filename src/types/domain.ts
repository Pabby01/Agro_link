// =============================================================================
// AGROLINK DOMAIN MODEL & CORE BUSINESS ENTITIES
// "The trusted network moving food from farm to market."
// =============================================================================

export type Role = "farmer" | "buyer" | "transporter" | "admin";

export type VerificationStatus = "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";

export type KYBTier = 1 | 2 | 3; // Tier 1: Phone/ID, Tier 2: CAC/TIN, Tier 3: Physical/Fleet

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  businessName: string;
  phone: string;
  locationName: string;
  coords: { lat: number; lng: number };
  avatarInitials: string;
  bio: string;
  kybTier: KYBTier;
  isVerified: boolean;
  isActive: boolean;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Verification {
  id: string;
  userId: string;
  companyName: string;
  cacRcNumber: string;
  tinNumber: string;
  businessAddress: string;
  documentUrls: Record<string, string>;
  status: VerificationStatus;
  reviewerId?: string | undefined;
  reviewedAt?: string | undefined;
  rejectionReason?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// MARKETPLACE & PRODUCE
// -----------------------------------------------------------------------------

export type ProduceCategory = "Vegetables" | "Grains" | "Tubers" | "Fruits" | "Legumes";
export type QualityGrade = "Grade A" | "Grade B" | "Grade C" | "Organic Certified";

export interface ProduceListing {
  id: string;
  farmerId: string;
  name: string;
  category: ProduceCategory;
  qualityGrade: QualityGrade;
  quantityKg: number;
  pricePerKg: number;
  minOrderKg: number;
  packagingType: string;
  locationName: string;
  coords: { lat: number; lng: number };
  description: string;
  images: string[];
  isAvailable: boolean;
  harvestDate: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// ORDER STATE MACHINE
// -----------------------------------------------------------------------------

export type OrderStatus =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "TRANSPORT_REQUIRED"
  | "TRANSPORT_ASSIGNED"
  | "PICKUP_PENDING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "BUYER_CONFIRMED"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED"
  | "FAILED";

export interface PricingBreakdown {
  produceSubtotal: number;
  logisticsFee: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
  platformFeePercentage: number;
  isColdChain: boolean;
}

export interface Order {
  id: string;
  buyerId: string;
  farmerId: string;
  listingId: string;
  quantityKg: number;
  unitPricePerKg: number;
  pricing: PricingBreakdown;
  status: OrderStatus;
  paymentId?: string | undefined;
  shipmentId?: string | undefined;
  disputeId?: string | undefined;
  cancellationReason?: string | undefined;
  otpCode?: string | undefined; // 6-digit delivery confirmation OTP
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// PAYMENTS & ESCROW
// -----------------------------------------------------------------------------

export type PaymentStatus =
  "INITIATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED" | "DISPUTED";

export interface PaymentTransaction {
  id: string;
  orderId: string;
  payerId: string;
  amount: number;
  currency: "NGN";
  provider: "MockPaymentProvider" | "Paystack" | "Flutterwave";
  transactionReference: string;
  status: PaymentStatus;
  escrowStatus: "unfunded" | "funded_in_escrow" | "disbursed" | "refunded" | "disputed";
  createdAt: string;
  completedAt?: string | undefined;
}

// -----------------------------------------------------------------------------
// LOGISTICS & SHIPMENTS
// -----------------------------------------------------------------------------

export type ShipmentStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "PICKUP_PENDING"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "DISPUTED";

export interface Shipment {
  id: string;
  orderId: string;
  transporterId?: string | undefined;
  vehicleId?: string | undefined;
  pickupLocation: { label: string; lat: number; lng: number };
  dropoffLocation: { label: string; lat: number; lng: number };
  corridorName: string;
  distanceKm: number;
  fee: number;
  isRefrigerated: boolean;
  status: ShipmentStatus;
  currentLatitude?: number | undefined;
  currentLongitude?: number | undefined;
  estimatedDeliveryTime?: string | undefined;
  actualPickupTime?: string | undefined;
  actualDeliveryTime?: string | undefined;
  proofOfPickup?: ProofOfPickup | undefined;
  proofOfDelivery?: ProofOfDelivery | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface ProofOfPickup {
  shipmentId: string;
  confirmedByTransporter: boolean;
  confirmedByFarmer: boolean;
  quantityCollectedKg: number;
  timestamp: string;
  location: string;
  evidenceUrl?: string | undefined;
}

export interface ProofOfDelivery {
  shipmentId: string;
  confirmedByTransporter: boolean;
  confirmedByBuyer: boolean;
  quantityReceivedKg: number;
  discrepancyKg: number;
  timestamp: string;
  location: string;
  evidenceUrl?: string | undefined;
  otpVerified: boolean;
  verificationMethod: "OTP" | "DIGITAL_SIGNATURE" | "MANUAL_INSPECTION";
}

// -----------------------------------------------------------------------------
// DISPUTE SYSTEM
// -----------------------------------------------------------------------------

export type DisputeReason =
  | "MISSING_GOODS"
  | "DAMAGED_GOODS"
  | "SHORT_QUANTITY"
  | "LATE_DELIVERY"
  | "NON_DELIVERY"
  | "PAYMENT_ISSUE"
  | "QUALITY_ISSUE"
  | "OTHER";

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED" | "ESCALATED";

export type DisputeResolution =
  "REFUND" | "PARTIAL_REFUND" | "NO_REFUND" | "REPLACEMENT" | "MANUAL_RESOLUTION";

export interface Dispute {
  id: string;
  orderId: string;
  shipmentId?: string | undefined;
  claimantId: string;
  respondentId: string;
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: DisputeResolution | undefined;
  resolutionNotes?: string | undefined;
  refundAmount?: number | undefined;
  reviewerId?: string | undefined;
  resolvedAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// TRUST & REPUTATION
// -----------------------------------------------------------------------------

export type TrustLevel = "High Trust" | "Trusted" | "Building Trust" | "New";

export type TrustEventType =
  | "TRANSACTION_COMPLETED"
  | "DELIVERY_COMPLETED"
  | "ORDER_CANCELLED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "POSITIVE_REVIEW"
  | "NEGATIVE_REVIEW"
  | "VERIFICATION_COMPLETED"
  | "LATE_DELIVERY";

export interface TrustEvent {
  id: string;
  userId: string;
  type: TrustEventType;
  scoreDelta: number;
  resultingScore: number;
  reason: string;
  referenceId?: string | undefined;
  timestamp: string;
}

export interface TrustProfile {
  userId: string;
  score: number;
  level: TrustLevel;
  rating: number;
  completedTransactions: number;
  successfulDeliveries: number;
  successfulOrders: number;
  cancelledOrders: number;
  fulfilmentRate: number;
  cancellationRate: number;
  disputeRate: number;
  lateRate: number;
  isVerified: boolean;
  history: TrustEvent[];
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// AUDIT & NOTIFICATIONS
// -----------------------------------------------------------------------------

export type AuditAction =
  | "ACCOUNT_CREATED"
  | "VERIFICATION_SUBMITTED"
  | "VERIFICATION_REVIEWED"
  | "LISTING_CREATED"
  | "LISTING_UPDATED"
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_COMPLETED"
  | "SHIPMENT_ASSIGNED"
  | "PICKUP_CONFIRMED"
  | "DELIVERY_CONFIRMED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "TRUST_SCORE_CHANGED"
  | "ADMIN_INTERVENTION";

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: Role;
  action: AuditAction;
  entityType:
    "User" | "ProduceListing" | "Order" | "Payment" | "Shipment" | "Dispute" | "Verification";
  entityId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  actionUrl?: string | undefined;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// AI CROP INTELLIGENCE & MESSAGES
// -----------------------------------------------------------------------------

export type NigerianLanguage = "en" | "yo" | "ig" | "ha";

export interface CropDiagnosis {
  id: string;
  cropName: string;
  condition: string;
  confidenceScore: number; // e.g. 94 (%)
  severity: "Low" | "Moderate" | "Severe";
  imageUrl?: string;
  description: string;
  likelyCauses: string[];
  recommendedActions: string[];
  preventiveMeasures: string[];
  nextBestAction: {
    label: string;
    actionType: "LIST_PRODUCE" | "FIND_BUYERS" | "FIND_TRANSPORT" | "VIEW_INVENTORY";
    targetUrl: string;
  };
  translations?: Record<NigerianLanguage, {
    condition: string;
    description: string;
    recommendedActions: string[];
  }>;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  language?: NigerianLanguage;
  cropContext?: string;
  timestamp: string;
}

// Aliases for compatibility
export type Listing = ProduceListing;
export type FarmerProfile = User;
export type BuyerProfile = User;
export type TransporterProfile = User;
export interface OrderItem {
  produceId: string;
  name: string;
  quantityKg: number;
  pricePerKg: number;
  totalPrice: number;
}
