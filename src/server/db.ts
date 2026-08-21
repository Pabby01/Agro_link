// =============================================================================
// AGROLINK BACKEND DATABASE & STATE LAYER
// Supabase PostgreSQL & Persistent Server-Side Relational Store
// =============================================================================

import { IS_DEMO_MODE } from "../lib/config";

export interface DBUser {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: "farmer" | "buyer" | "transporter" | "admin";
  full_name: string;
  business_name: string;
  phone: string;
  location_name: string;
  latitude: number;
  longitude: number;
  avatar_initials: string;
  bio: string;
  kyb_tier: number;
  is_verified: boolean;
  is_active: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBSession {
  id: string;
  user_id: string;
  token_hash: string;
  user_agent?: string | undefined;
  ip_address?: string | undefined;
  expires_at: string;
  created_at: string;
}

export interface DBKYBVerification {
  id: string;
  user_id: string;
  company_name: string;
  cac_rc_number: string;
  tin_number?: string | undefined;
  director_nin_bvn?: string | undefined;
  business_address: string;
  document_urls: Record<string, string>;
  status: "unsubmitted" | "pending_review" | "verified" | "rejected" | "action_required";
  rejection_reason?: string | undefined;
  reviewed_by?: string | undefined;
  reviewed_at?: string | undefined;
  created_at: string;
  updated_at: string;
}

export interface DBProduce {
  id: string;
  farmer_id: string;
  name: string;
  category: "Vegetables" | "Grains" | "Tubers" | "Fruits" | "Legumes";
  description: string;
  quality_grade: "Grade A" | "Grade B" | "Grade C" | "Organic Certified";
  quantity_kg: number;
  available_quantity_kg: number;
  price_per_kg: number;
  min_order_kg: number;
  harvest_date: string;
  packaging_type: string;
  location_name: string;
  latitude: number;
  longitude: number;
  images: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBOrder {
  id: string;
  order_number: string;
  produce_id: string;
  buyer_id: string;
  farmer_id: string;
  quantity_kg: number;
  unit_price_per_kg: number;
  produce_subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  total_escrow_amount: number;
  escrow_status: "unfunded" | "funded_in_escrow" | "disbursed" | "refunded" | "disputed";
  order_status:
    | "Pending"
    | "Accepted"
    | "Awaiting Pickup"
    | "In Transit"
    | "Delivered"
    | "Completed"
    | "Disputed"
    | "Cancelled";
  delivery_urgency: "Standard" | "Urgent" | "Cold Chain Refrigerated";
  delivery_id?: string | undefined;
  dispute_id?: string | undefined;
  otp_code?: string | undefined;
  cancellation_reason?: string | undefined;
  created_at: string;
  updated_at: string;
}

export interface DBDelivery {
  id: string;
  order_id: string;
  transporter_id?: string | undefined;
  vehicle_id?: string | undefined;
  pickup_location: { label: string; lat: number; lng: number };
  dropoff_location: { label: string; lat: number; lng: number };
  corridor_name: string;
  distance_km: number;
  delivery_fee: number;
  current_latitude?: number | undefined;
  current_longitude?: number | undefined;
  current_speed_kmh?: number | undefined;
  cargo_temp_celsius?: number | undefined;
  status: "Pending" | "Accepted" | "Picked Up" | "In Transit" | "Delivered" | "Disputed";
  pod_recipient_name?: string | undefined;
  pod_otp_code?: string | undefined;
  pod_signature_url?: string | undefined;
  quantity_collected_kg?: number | undefined;
  quantity_delivered_kg?: number | undefined;
  discrepancy_kg?: number | undefined;
  estimated_arrival?: string | undefined;
  actual_arrival?: string | undefined;
  created_at: string;
  updated_at: string;
}

export interface DBDispute {
  id: string;
  order_id: string;
  shipment_id?: string | undefined;
  claimant_id: string;
  respondent_id: string;
  reason:
    | "MISSING_GOODS"
    | "SHORT_QUANTITY"
    | "DAMAGED_GOODS"
    | "QUALITY_ISSUE"
    | "LATE_DELIVERY"
    | "NON_DELIVERY"
    | "PAYMENT_ISSUE"
    | "OTHER";
  description: string;
  evidence_urls: string[];
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED" | "ESCALATED";
  resolution?:
    "REFUND" | "PARTIAL_REFUND" | "NO_REFUND" | "REPLACEMENT" | "MANUAL_RESOLUTION" | undefined;
  resolution_notes?: string | undefined;
  refund_amount?: number | undefined;
  reviewer_id?: string | undefined;
  resolved_at?: string | undefined;
  created_at: string;
  updated_at: string;
}

export interface DBVehicle {
  id: string;
  transporter_id: string;
  plate_number: string;
  vehicle_type: "Truck 40T" | "Reefer 30T" | "Flatbed 20T" | "Van 5T" | "Dispatch Bike";
  capacity_kg: number;
  is_refrigerated: boolean;
  roadworthiness_cert_url?: string | undefined;
  is_active: boolean;
  created_at: string;
}

export interface DBTrustProfile {
  user_id: string;
  score: number;
  level: "High Trust" | "Trusted" | "Building Trust" | "New";
  rating: number;
  completed_transactions: number;
  successful_deliveries: number;
  cancelled_orders: number;
  fulfilment_rate: number;
  cancellation_rate: number;
  verified: boolean;
  history: { date: string; score: number; reason: string }[];
  updated_at: string;
}

export interface DBAuditLog {
  id: string;
  actor_id?: string | undefined;
  action: string;
  target_entity: string;
  target_id?: string | undefined;
  details: Record<string, unknown>;
  ip_address?: string | undefined;
  created_at: string;
}

export interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  action_url?: string | undefined;
  created_at: string;
}

export interface DBPayment {
  id: string;
  order_id: string;
  payer_id: string;
  recipient_farmer_id: string;
  recipient_transporter_id?: string | undefined;
  reference: string;
  amount: number;
  channel: string;
  status: "pending" | "successful" | "failed" | "refunded";
  escrow_locked_at?: string | undefined;
  escrow_released_at?: string | undefined;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DBRiskSignal {
  id: string;
  user_id: string;
  severity: "low" | "medium" | "high";
  signal_type:
    "REPEATED_CANCELLATION" | "DELIVERY_DISCREPANCY" | "HIGH_DISPUTE_RATE" | "EXPIRED_VERIFICATION";
  description: string;
  created_at: string;
}

// In-Memory Synchronized Relational Store (with initial seed data)
class BackendDatabase {
  users: Map<string, DBUser> = new Map();
  sessions: Map<string, DBSession> = new Map();
  kybVerifications: Map<string, DBKYBVerification> = new Map();
  produce: Map<string, DBProduce> = new Map();
  orders: Map<string, DBOrder> = new Map();
  deliveries: Map<string, DBDelivery> = new Map();
  disputes: Map<string, DBDispute> = new Map();
  vehicles: Map<string, DBVehicle> = new Map();
  trustProfiles: Map<string, DBTrustProfile> = new Map();
  notifications: Map<string, DBNotification> = new Map();
  riskSignals: DBRiskSignal[] = [];
  auditLogs: DBAuditLog[] = [];
  payments: Map<string, DBPayment> = new Map();

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const defaultPasswordHash = "c81308a3f81de408990c74fb553d100fbca5728a49f50e9ec195fa3fa7a9b0c7"; // 'Agrolink@2026'

    // Root Admin (Always Available for System Governance)
    const admin: DBUser = {
      id: "u-admin-1",
      email: "admin@agrolink.ng",
      password_hash: defaultPasswordHash,
      password_salt: "salt_admin_ops_2026",
      role: "admin",
      full_name: "Agrolink Operations Team",
      business_name: "Agrolink Governance HQ",
      phone: "+234 800 000 0000",
      location_name: "Abuja Command Center",
      latitude: 9.0765,
      longitude: 7.3986,
      avatar_initials: "AO",
      bio: "Compliance, KYB oversight, dispute resolution, and escrow settlement control.",
      kyb_tier: 3,
      is_verified: true,
      is_active: true,
      is_flagged: false,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-08-18T00:00:00Z",
    };
    this.users.set(admin.id, admin);

    this.trustProfiles.set(admin.id, {
      user_id: admin.id,
      score: 100,
      level: "High Trust",
      rating: 5.0,
      completed_transactions: 0,
      successful_deliveries: 0,
      cancelled_orders: 0,
      fulfilment_rate: 100,
      cancellation_rate: 0,
      verified: true,
      history: [{ date: "2026-01-01", score: 100, reason: "System administrator authority" }],
      updated_at: "2026-01-01T00:00:00Z",
    });

    // 1. Realistic Business Users
    const farmer: DBUser = {
      id: "u-farmer-1",
      email: "aisha@aishafarms.ng",
      password_hash: defaultPasswordHash,
      password_salt: "salt_farmer_kano_2026",
      role: "farmer",
      full_name: "Aisha Bello",
      business_name: "Aisha Farms Ltd",
      phone: "+234 803 111 2233",
      location_name: "Kano (Dawanau Agrarian Belt)",
      latitude: 12.0022,
      longitude: 8.592,
      avatar_initials: "AB",
      bio: "Producer of high-grade Roma tomatoes, yellow feed maize, and grain crops.",
      kyb_tier: 2,
      is_verified: true,
      is_active: true,
      is_flagged: false,
      created_at: "2026-01-10T08:00:00Z",
      updated_at: "2026-08-15T10:00:00Z",
    };

    const buyer: DBUser = {
      id: "u-buyer-1",
      email: "procurement@freshmart.ng",
      password_hash: defaultPasswordHash,
      password_salt: "salt_buyer_lagos_2026",
      role: "buyer",
      full_name: "Ngozi Eze",
      business_name: "FreshMart Foods Ltd",
      phone: "+234 802 222 3344",
      location_name: "Lagos (Mile 12 Commercial Hub)",
      latitude: 6.5244,
      longitude: 3.3792,
      avatar_initials: "FM",
      bio: "Wholesale food processor and supermarket fresh produce distributor across Lagos.",
      kyb_tier: 2,
      is_verified: true,
      is_active: true,
      is_flagged: false,
      created_at: "2026-02-14T09:00:00Z",
      updated_at: "2026-08-16T12:00:00Z",
    };

    const transporter: DBUser = {
      id: "u-transporter-1",
      email: "fleet@swifthaul.ng",
      password_hash: defaultPasswordHash,
      password_salt: "salt_transporter_abuja_2026",
      role: "transporter",
      full_name: "Tunde Bakare",
      business_name: "SwiftHaul Logistics Ltd",
      phone: "+234 809 333 4455",
      location_name: "Abuja FCT (Interstate Freight Terminal)",
      latitude: 9.0765,
      longitude: 7.3986,
      avatar_initials: "SH",
      bio: "Refrigerated cold-chain and flatbed heavy freight carrier across northern corridors.",
      kyb_tier: 3,
      is_verified: true,
      is_active: true,
      is_flagged: false,
      created_at: "2026-01-20T10:00:00Z",
      updated_at: "2026-08-18T08:00:00Z",
    };

    [farmer, buyer, transporter].forEach((u) => this.users.set(u.id, u));

    // 2. KYB Verifications
    this.kybVerifications.set("kyb-1", {
      id: "kyb-1",
      user_id: "u-farmer-1",
      company_name: "Aisha Farms Integrated Nigeria Ltd",
      cac_rc_number: "RC-1849204",
      tin_number: "TIN-92841029",
      business_address: "Plot 14, Dawanau Agricultural Export Zone, Kano",
      document_urls: { cac_cert: "https://agrolink.ng/docs/cac_aisha_farms.pdf" },
      status: "verified",
      reviewed_by: "u-admin-1",
      reviewed_at: "2026-01-15T12:00:00Z",
      created_at: "2026-01-11T09:00:00Z",
      updated_at: "2026-01-15T12:00:00Z",
    });

    this.kybVerifications.set("kyb-2", {
      id: "kyb-2",
      user_id: "u-buyer-1",
      company_name: "FreshMart Foods Nigeria Ltd",
      cac_rc_number: "RC-1492019",
      tin_number: "TIN-39201948",
      business_address: "KM 14 Ikorodu Road, Ketu, Lagos",
      document_urls: { cac_cert: "https://agrolink.ng/docs/cac_freshmart.pdf" },
      status: "verified",
      reviewed_by: "u-admin-1",
      reviewed_at: "2026-02-18T14:00:00Z",
      created_at: "2026-02-15T11:00:00Z",
      updated_at: "2026-02-18T14:00:00Z",
    });

    this.kybVerifications.set("kyb-3", {
      id: "kyb-3",
      user_id: "u-transporter-1",
      company_name: "SwiftHaul Logistics Nigeria Ltd",
      cac_rc_number: "RC-2049182",
      tin_number: "TIN-10492810",
      business_address: "Plot 88, Idu Industrial District, Abuja",
      document_urls: { cac_cert: "https://agrolink.ng/docs/cac_swifthaul.pdf" },
      status: "verified",
      reviewed_by: "u-admin-1",
      reviewed_at: "2026-01-25T16:00:00Z",
      created_at: "2026-01-22T08:00:00Z",
      updated_at: "2026-01-25T16:00:00Z",
    });

    // 3. Vehicles
    this.vehicles.set("v-1", {
      id: "v-1",
      transporter_id: "u-transporter-1",
      plate_number: "KJA-829-XA",
      vehicle_type: "Reefer 30T",
      capacity_kg: 30000,
      is_refrigerated: true,
      is_active: true,
      created_at: "2026-01-25T10:00:00Z",
    });

    this.vehicles.set("v-2", {
      id: "v-2",
      transporter_id: "u-transporter-1",
      plate_number: "ABJ-314-MK",
      vehicle_type: "Truck 40T",
      capacity_kg: 40000,
      is_refrigerated: false,
      is_active: true,
      created_at: "2026-02-01T10:00:00Z",
    });

    // 4. 10+ Realistic Agricultural Listings
    const listings: DBProduce[] = [
      {
        id: "prod-1",
        farmer_id: "u-farmer-1",
        name: "Fresh Roma Tomatoes",
        category: "Vegetables",
        description:
          "Firm red Roma tomatoes from Kano irrigation cluster. Packed in ventilated 50kg crates with low moisture loss.",
        quality_grade: "Grade A",
        quantity_kg: 15000,
        available_quantity_kg: 12000,
        price_per_kg: 850,
        min_order_kg: 100,
        harvest_date: "2026-08-16",
        packaging_type: "50kg Plastic Crates",
        location_name: "Kano (Dawanau Agrarian Belt)",
        latitude: 12.0022,
        longitude: 8.592,
        images: [
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-15T08:00:00Z",
        updated_at: "2026-08-15T08:00:00Z",
      },
      {
        id: "prod-2",
        farmer_id: "u-farmer-1",
        name: "Yellow Feed Maize",
        category: "Grains",
        description:
          "Sun-dried, cleaned yellow corn grains with moisture under 12%. Ready for industrial flour milling.",
        quality_grade: "Grade A",
        quantity_kg: 40000,
        available_quantity_kg: 35000,
        price_per_kg: 520,
        min_order_kg: 500,
        harvest_date: "2026-08-12",
        packaging_type: "100kg Poly Jute Bags",
        location_name: "Kano State",
        latitude: 12.0022,
        longitude: 8.592,
        images: [
          "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-13T10:00:00Z",
        updated_at: "2026-08-13T10:00:00Z",
      },
      {
        id: "prod-3",
        farmer_id: "u-farmer-1",
        name: "Benue White Yam Tubers",
        category: "Tubers",
        description:
          "Export-grade unbruised white yams from Zaki Biam farm gate. Heavy starch yield.",
        quality_grade: "Grade A",
        quantity_kg: 20000,
        available_quantity_kg: 18000,
        price_per_kg: 1100,
        min_order_kg: 50,
        harvest_date: "2026-08-14",
        packaging_type: "Bulk Bundles of 100",
        location_name: "Benue (Zaki Biam)",
        latitude: 7.5255,
        longitude: 9.6105,
        images: [
          "https://images.unsplash.com/photo-1596483785714-386d34b22c2a?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-14T11:00:00Z",
        updated_at: "2026-08-14T11:00:00Z",
      },
      {
        id: "prod-4",
        farmer_id: "u-farmer-1",
        name: "Sokoto Red Dry Onions",
        category: "Vegetables",
        description:
          "Cured, hard-skin red onions with high shelf-life. Inspected and bagged under Agrolink standard.",
        quality_grade: "Grade A",
        quantity_kg: 25000,
        available_quantity_kg: 25000,
        price_per_kg: 720,
        min_order_kg: 100,
        harvest_date: "2026-08-15",
        packaging_type: "100kg Ventilated Net Bags",
        location_name: "Sokoto State",
        latitude: 13.0609,
        longitude: 5.2476,
        images: [
          "https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-15T14:00:00Z",
        updated_at: "2026-08-15T14:00:00Z",
      },
      {
        id: "prod-5",
        farmer_id: "u-farmer-1",
        name: "Kaduna Orange Fleshed Sweet Potatoes",
        category: "Tubers",
        description:
          "Vitamin-A rich sweet potatoes from Zaria farmlands. Clean washed and sorted for bulk wholesale.",
        quality_grade: "Grade A",
        quantity_kg: 12000,
        available_quantity_kg: 12000,
        price_per_kg: 480,
        min_order_kg: 100,
        harvest_date: "2026-08-15",
        packaging_type: "50kg Jute Sacks",
        location_name: "Kaduna (Zaria)",
        latitude: 11.0855,
        longitude: 7.7199,
        images: [
          "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-15T15:00:00Z",
        updated_at: "2026-08-15T15:00:00Z",
      },
      {
        id: "prod-6",
        farmer_id: "u-farmer-1",
        name: "Kano Habanero Red Pepper (Ata Rodo)",
        category: "Vegetables",
        description:
          "Pungent, fresh red habanero peppers. Hand-picked at peak ripeness for urban culinary markets.",
        quality_grade: "Grade A",
        quantity_kg: 8000,
        available_quantity_kg: 7200,
        price_per_kg: 1450,
        min_order_kg: 50,
        harvest_date: "2026-08-16",
        packaging_type: "40kg Baskets with Banana Leaves",
        location_name: "Kano State",
        latitude: 12.0022,
        longitude: 8.592,
        images: [
          "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-16T09:00:00Z",
        updated_at: "2026-08-16T09:00:00Z",
      },
      {
        id: "prod-7",
        farmer_id: "u-farmer-1",
        name: "Oyo Organic Cassava Roots",
        category: "Tubers",
        description:
          "High-starch TME 419 cassava roots harvested fresh on order for garri and starch processors.",
        quality_grade: "Grade B",
        quantity_kg: 50000,
        available_quantity_kg: 50000,
        price_per_kg: 210,
        min_order_kg: 1000,
        harvest_date: "2026-08-17",
        packaging_type: "Loose Flatbed Haulage",
        location_name: "Oyo (Iseyin)",
        latitude: 7.9712,
        longitude: 3.6015,
        images: [
          "https://images.unsplash.com/photo-1596483785714-386d34b22c2a?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-17T07:00:00Z",
        updated_at: "2026-08-17T07:00:00Z",
      },
      {
        id: "prod-8",
        farmer_id: "u-farmer-1",
        name: "Plateau Irish Baking Potatoes",
        category: "Tubers",
        description:
          "Highland Jos Irish potatoes. Uniform medium size, dry skin, ideal for chips and restaurants.",
        quality_grade: "Grade A",
        quantity_kg: 18000,
        available_quantity_kg: 18000,
        price_per_kg: 950,
        min_order_kg: 100,
        harvest_date: "2026-08-16",
        packaging_type: "50kg Mesh Sacks",
        location_name: "Plateau (Jos)",
        latitude: 9.8965,
        longitude: 8.8583,
        images: [
          "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-16T11:00:00Z",
        updated_at: "2026-08-16T11:00:00Z",
      },
      {
        id: "prod-9",
        farmer_id: "u-farmer-1",
        name: "Benue Green Plantain Bunches",
        category: "Fruits",
        description:
          "Unripe green plantain bunches for chips production and food distribution hubs.",
        quality_grade: "Grade A",
        quantity_kg: 15000,
        available_quantity_kg: 15000,
        price_per_kg: 680,
        min_order_kg: 200,
        harvest_date: "2026-08-17",
        packaging_type: "Bulk Bunches",
        location_name: "Benue (Makurdi)",
        latitude: 7.7322,
        longitude: 8.5391,
        images: [
          "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-17T12:00:00Z",
        updated_at: "2026-08-17T12:00:00Z",
      },
      {
        id: "prod-10",
        farmer_id: "u-farmer-1",
        name: "Kaduna Cleaned Soybeans",
        category: "Legumes",
        description: "High-protein sorted soybeans with minimal foreign matter. High oil content.",
        quality_grade: "Grade A",
        quantity_kg: 30000,
        available_quantity_kg: 30000,
        price_per_kg: 640,
        min_order_kg: 500,
        harvest_date: "2026-08-14",
        packaging_type: "100kg Poly Bags",
        location_name: "Kaduna State",
        latitude: 10.5105,
        longitude: 7.4165,
        images: [
          "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop",
        ],
        is_available: true,
        created_at: "2026-08-14T14:00:00Z",
        updated_at: "2026-08-14T14:00:00Z",
      },
    ];

    listings.forEach((p) => this.produce.set(p.id, p));

    // 5. Trust Profiles (Aisha Farms: 92, FreshMart: 88, SwiftHaul: 95)
    this.trustProfiles.set("u-farmer-1", {
      user_id: "u-farmer-1",
      score: 92,
      level: "High Trust",
      rating: 4.85,
      completed_transactions: 42,
      successful_deliveries: 41,
      cancelled_orders: 1,
      fulfilment_rate: 98,
      cancellation_rate: 2,
      verified: true,
      history: [
        {
          date: "2026-08-16",
          score: 92,
          reason: "Completed 2,000kg Roma tomato delivery to Mile 12 Lagos",
        },
      ],
      updated_at: "2026-08-16T12:00:00Z",
    });

    this.trustProfiles.set("u-buyer-1", {
      user_id: "u-buyer-1",
      score: 88,
      level: "Trusted",
      rating: 4.75,
      completed_transactions: 28,
      successful_deliveries: 27,
      cancelled_orders: 1,
      fulfilment_rate: 96,
      cancellation_rate: 4,
      verified: true,
      history: [
        {
          date: "2026-08-15",
          score: 88,
          reason: "Prompt delivery receipt confirmation and escrow settlement",
        },
      ],
      updated_at: "2026-08-15T15:00:00Z",
    });

    this.trustProfiles.set("u-transporter-1", {
      user_id: "u-transporter-1",
      score: 95,
      level: "High Trust",
      rating: 4.92,
      completed_transactions: 54,
      successful_deliveries: 53,
      cancelled_orders: 1,
      fulfilment_rate: 98,
      cancellation_rate: 2,
      verified: true,
      history: [
        {
          date: "2026-08-17",
          score: 95,
          reason: "Zero spoilage cold-chain haulage on Kano-Lagos corridor",
        },
      ],
      updated_at: "2026-08-17T18:00:00Z",
    });

    // 6. Orders across Lifecycles
    const sampleOrders: DBOrder[] = [
      {
        id: "ord-1",
        order_number: "ORD-849201",
        produce_id: "prod-1",
        buyer_id: "u-buyer-1",
        farmer_id: "u-farmer-1",
        quantity_kg: 2000,
        unit_price_per_kg: 850,
        produce_subtotal: 1700000,
        delivery_fee: 94500,
        platform_fee: 17000,
        total_escrow_amount: 1811500,
        escrow_status: "funded_in_escrow",
        order_status: "In Transit",
        delivery_urgency: "Cold Chain Refrigerated",
        delivery_id: "del-1",
        otp_code: "849201",
        created_at: "2026-08-17T09:00:00Z",
        updated_at: "2026-08-17T14:30:00Z",
      },
      {
        id: "ord-2",
        order_number: "ORD-719302",
        produce_id: "prod-2",
        buyer_id: "u-buyer-1",
        farmer_id: "u-farmer-1",
        quantity_kg: 5000,
        unit_price_per_kg: 520,
        produce_subtotal: 2600000,
        delivery_fee: 175000,
        platform_fee: 26000,
        total_escrow_amount: 2801000,
        escrow_status: "disbursed",
        order_status: "Completed",
        delivery_urgency: "Standard",
        delivery_id: "del-2",
        otp_code: "719302",
        created_at: "2026-08-12T10:00:00Z",
        updated_at: "2026-08-15T18:00:00Z",
      },
      {
        id: "ord-3",
        order_number: "ORD-582019",
        produce_id: "prod-6",
        buyer_id: "u-buyer-1",
        farmer_id: "u-farmer-1",
        quantity_kg: 800,
        unit_price_per_kg: 1450,
        produce_subtotal: 1160000,
        delivery_fee: 45000,
        platform_fee: 11600,
        total_escrow_amount: 1216600,
        escrow_status: "funded_in_escrow",
        order_status: "Awaiting Pickup",
        delivery_urgency: "Standard",
        delivery_id: "del-3",
        otp_code: "582019",
        created_at: "2026-08-18T08:00:00Z",
        updated_at: "2026-08-18T10:00:00Z",
      },
      {
        id: "ord-4",
        order_number: "ORD-930182",
        produce_id: "prod-3",
        buyer_id: "u-buyer-1",
        farmer_id: "u-farmer-1",
        quantity_kg: 1500,
        unit_price_per_kg: 1100,
        produce_subtotal: 1650000,
        delivery_fee: 65000,
        platform_fee: 16500,
        total_escrow_amount: 1731500,
        escrow_status: "disputed",
        order_status: "Disputed",
        delivery_urgency: "Standard",
        delivery_id: "del-4",
        dispute_id: "disp-1",
        otp_code: "930182",
        created_at: "2026-08-14T11:00:00Z",
        updated_at: "2026-08-16T16:00:00Z",
      },
      {
        id: "ord-5",
        order_number: "ORD-449102",
        produce_id: "prod-4",
        buyer_id: "u-buyer-1",
        farmer_id: "u-farmer-1",
        quantity_kg: 3000,
        unit_price_per_kg: 720,
        produce_subtotal: 2160000,
        delivery_fee: 105000,
        platform_fee: 21600,
        total_escrow_amount: 2286600,
        escrow_status: "funded_in_escrow",
        order_status: "Pending",
        delivery_urgency: "Standard",
        otp_code: "449102",
        created_at: "2026-08-18T14:00:00Z",
        updated_at: "2026-08-18T14:00:00Z",
      },
    ];

    sampleOrders.forEach((o) => this.orders.set(o.id, o));

    // 7. Shipments
    const sampleDeliveries: DBDelivery[] = [
      {
        id: "del-1",
        order_id: "ord-1",
        transporter_id: "u-transporter-1",
        vehicle_id: "v-1",
        pickup_location: { label: "Aisha Farms Gate, Dawanau Kano", lat: 12.0022, lng: 8.592 },
        dropoff_location: { label: "FreshMart Mile 12 Depot, Lagos", lat: 6.5244, lng: 3.3792 },
        corridor_name: "Kano – Kaduna – Abuja – Ibadan – Lagos Corridor",
        distance_km: 980,
        delivery_fee: 94500,
        current_latitude: 9.0765,
        current_longitude: 7.3986,
        current_speed_kmh: 68,
        cargo_temp_celsius: 4.2,
        status: "In Transit",
        pod_otp_code: "849201",
        quantity_collected_kg: 2000,
        estimated_arrival: "2026-08-19T06:00:00Z",
        created_at: "2026-08-17T11:00:00Z",
        updated_at: "2026-08-18T12:00:00Z",
      },
      {
        id: "del-2",
        order_id: "ord-2",
        transporter_id: "u-transporter-1",
        vehicle_id: "v-2",
        pickup_location: { label: "Aisha Farms Gate, Kano", lat: 12.0022, lng: 8.592 },
        dropoff_location: { label: "FreshMart Central Silo, Lagos", lat: 6.5244, lng: 3.3792 },
        corridor_name: "Kano – Lagos Northern Rail/Road Route",
        distance_km: 980,
        delivery_fee: 175000,
        status: "Delivered",
        pod_recipient_name: "Ngozi Eze (FreshMart)",
        pod_otp_code: "719302",
        quantity_collected_kg: 5000,
        quantity_delivered_kg: 5000,
        discrepancy_kg: 0,
        actual_arrival: "2026-08-15T17:45:00Z",
        created_at: "2026-08-12T12:00:00Z",
        updated_at: "2026-08-15T18:00:00Z",
      },
      {
        id: "del-3",
        order_id: "ord-3",
        transporter_id: "u-transporter-1",
        vehicle_id: "v-1",
        pickup_location: { label: "Aisha Farms Gate, Kano", lat: 12.0022, lng: 8.592 },
        dropoff_location: { label: "FreshMart Ketu Hub, Lagos", lat: 6.5244, lng: 3.3792 },
        corridor_name: "Kano – Abuja – Lagos Express Corridor",
        distance_km: 980,
        delivery_fee: 45000,
        status: "Accepted",
        pod_otp_code: "582019",
        created_at: "2026-08-18T09:00:00Z",
        updated_at: "2026-08-18T10:00:00Z",
      },
      {
        id: "del-4",
        order_id: "ord-4",
        transporter_id: "u-transporter-1",
        vehicle_id: "v-2",
        pickup_location: { label: "Zaki Biam Yam Depot, Benue", lat: 7.5255, lng: 9.6105 },
        dropoff_location: { label: "FreshMart Ketu, Lagos", lat: 6.5244, lng: 3.3792 },
        corridor_name: "Benue – Enugu – Ore – Lagos Corridor",
        distance_km: 740,
        delivery_fee: 65000,
        status: "Disputed",
        pod_otp_code: "930182",
        quantity_collected_kg: 1500,
        quantity_delivered_kg: 1350,
        discrepancy_kg: 150,
        created_at: "2026-08-14T14:00:00Z",
        updated_at: "2026-08-16T16:00:00Z",
      },
    ];

    sampleDeliveries.forEach((d) => this.deliveries.set(d.id, d));

    // 8. 1 Active Dispute
    this.disputes.set("disp-1", {
      id: "disp-1",
      order_id: "ord-4",
      shipment_id: "del-4",
      claimant_id: "u-buyer-1",
      respondent_id: "u-farmer-1",
      reason: "SHORT_QUANTITY",
      description:
        "Physical weighbridge inspection at FreshMart Ketu terminal showed 1,350 kg received instead of 1,500 kg ordered (150 kg shortage). Requesting partial escrow refund.",
      evidence_urls: ["https://agrolink.ng/evidence/weighbridge_scale_receipt_ord4.jpg"],
      status: "OPEN",
      created_at: "2026-08-16T16:15:00Z",
      updated_at: "2026-08-16T16:15:00Z",
    });

    // 9. 1 Risk Signal
    this.riskSignals.push({
      id: "risk-1",
      user_id: "u-farmer-1",
      severity: "low",
      signal_type: "DELIVERY_DISCREPANCY",
      description:
        "150kg shortage discrepancy logged on Order #ORD-930182. Escrow held under arbitration.",
      created_at: "2026-08-16T16:20:00Z",
    });

    // 10. Audit Logs
    this.logAudit("u-buyer-1", "ORDER_CREATED", "Order", "ord-1", {
      produce: "Fresh Roma Tomatoes",
      qty: 2000,
    });
    this.logAudit("u-buyer-1", "PAYMENT_COMPLETED", "Payment", "pay-1", {
      amount: 1811500,
      escrow: "funded_in_escrow",
    });
    this.logAudit("u-transporter-1", "PICKUP_CONFIRMED", "Shipment", "del-1", {
      location: "Dawanau Kano",
      qty: 2000,
    });
  }

  logAudit(
    actorId: string | undefined,
    action: string,
    targetEntity: string,
    targetId?: string,
    details: Record<string, unknown> = {},
    ip?: string,
  ) {
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor_id: actorId,
      action,
      target_entity: targetEntity,
      target_id: targetId,
      details,
      ip_address: ip,
      created_at: new Date().toISOString(),
    });
  }
}

export const db = new BackendDatabase();
