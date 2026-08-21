-- =============================================================================
-- AGROLINK ENTERPRISE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Production Schema for Multi-Participant Supply-Chain Network
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENUMS & CUSTOM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'transporter', 'admin');
CREATE TYPE trust_level AS ENUM ('High Trust', 'Trusted', 'Building Trust', 'New');
CREATE TYPE produce_category AS ENUM ('Vegetables', 'Grains', 'Tubers', 'Fruits', 'Legumes');
CREATE TYPE quality_grade AS ENUM ('Grade A', 'Grade B', 'Grade C', 'Organic Certified');
CREATE TYPE kyb_status AS ENUM ('unsubmitted', 'pending_review', 'verified', 'rejected', 'action_required');
CREATE TYPE escrow_status AS ENUM ('unfunded', 'funded_in_escrow', 'disbursed', 'refunded', 'disputed');
CREATE TYPE order_status AS ENUM ('Pending', 'Accepted', 'Awaiting Pickup', 'In Transit', 'Delivered', 'Completed', 'Cancelled');
CREATE TYPE delivery_status AS ENUM ('Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered');
CREATE TYPE vehicle_type AS ENUM ('Truck 40T', 'Reefer 30T', 'Flatbed 20T', 'Van 5T', 'Dispatch Bike');
CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded');

-- =============================================================================
-- 2. USERS TABLE (Custom Auth & Core Profile)
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'buyer',
    full_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL DEFAULT 9.0820,
    longitude NUMERIC(10, 6) NOT NULL DEFAULT 8.6753,
    avatar_initials TEXT NOT NULL DEFAULT 'AG',
    bio TEXT DEFAULT '',
    kyb_tier INT NOT NULL DEFAULT 1 CHECK (kyb_tier IN (1, 2, 3)),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================================================
-- 3. SESSIONS TABLE (Server-Side Session Store)
-- =============================================================================

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- =============================================================================
-- 4. KYB / KYC VERIFICATIONS (Governance & Compliance)
-- =============================================================================

CREATE TABLE IF NOT EXISTS kyb_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    cac_rc_number TEXT NOT NULL,
    tin_number TEXT,
    director_nin_bvn TEXT,
    business_address TEXT NOT NULL,
    document_urls JSONB NOT NULL DEFAULT '{}'::jsonb,
    status kyb_status NOT NULL DEFAULT 'pending_review',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kyb_status ON kyb_verifications(status);
CREATE INDEX idx_kyb_user_id ON kyb_verifications(user_id);

-- =============================================================================
-- 5. PRODUCE INVENTORY (Real Agricultural Listings)
-- =============================================================================

CREATE TABLE IF NOT EXISTS produce (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category produce_category NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    quality_grade quality_grade NOT NULL DEFAULT 'Grade A',
    quantity_kg NUMERIC(12, 2) NOT NULL CHECK (quantity_kg >= 0),
    available_quantity_kg NUMERIC(12, 2) NOT NULL CHECK (available_quantity_kg >= 0),
    price_per_kg NUMERIC(12, 2) NOT NULL CHECK (price_per_kg > 0),
    min_order_kg NUMERIC(12, 2) NOT NULL DEFAULT 10,
    harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    packaging_type TEXT NOT NULL DEFAULT '50kg Jute Bag',
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_produce_category ON produce(category);
CREATE INDEX idx_produce_farmer_id ON produce(farmer_id);
CREATE INDEX idx_produce_available ON produce(is_available);

-- =============================================================================
-- 6. VEHICLES TABLE (Transporter Fleet Assets)
-- =============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plate_number TEXT UNIQUE NOT NULL,
    vehicle_type vehicle_type NOT NULL DEFAULT 'Truck 40T',
    capacity_kg NUMERIC(12, 2) NOT NULL,
    is_refrigerated BOOLEAN NOT NULL DEFAULT false,
    roadworthiness_cert_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_transporter ON vehicles(transporter_id);

-- =============================================================================
-- 7. ORDERS & ESCROW CONTRACTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    produce_id UUID NOT NULL REFERENCES produce(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    farmer_id UUID NOT NULL REFERENCES users(id),
    quantity_kg NUMERIC(12, 2) NOT NULL CHECK (quantity_kg > 0),
    unit_price_per_kg NUMERIC(12, 2) NOT NULL,
    produce_subtotal NUMERIC(12, 2) NOT NULL,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_escrow_amount NUMERIC(12, 2) NOT NULL,
    escrow_status escrow_status NOT NULL DEFAULT 'unfunded',
    order_status order_status NOT NULL DEFAULT 'Pending',
    delivery_urgency TEXT NOT NULL DEFAULT 'Standard',
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(order_status);

-- =============================================================================
-- 8. PAYMENTS & ESCROW TRANSACTIONS (Backend-Only Auditable Logs)
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id),
    recipient_farmer_id UUID NOT NULL REFERENCES users(id),
    recipient_transporter_id UUID REFERENCES users(id),
    reference TEXT UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    channel TEXT NOT NULL DEFAULT 'bank_transfer_escrow',
    status payment_status NOT NULL DEFAULT 'pending',
    escrow_locked_at TIMESTAMPTZ,
    escrow_released_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_reference ON payments(reference);

-- =============================================================================
-- 9. DELIVERIES (Transit Corridors, GPS & Proof of Delivery)
-- =============================================================================

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transporter_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    pickup_location JSONB NOT NULL,
    dropoff_location JSONB NOT NULL,
    corridor_name TEXT NOT NULL DEFAULT 'Kano - Lagos Interstate Corridor',
    distance_km NUMERIC(8, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    current_latitude NUMERIC(10, 6),
    current_longitude NUMERIC(10, 6),
    current_speed_kmh NUMERIC(5, 2) DEFAULT 0,
    cargo_temp_celsius NUMERIC(4, 1),
    status delivery_status NOT NULL DEFAULT 'Pending',
    pod_recipient_name TEXT,
    pod_otp_code TEXT,
    pod_signature_url TEXT,
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_transporter ON deliveries(transporter_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- =============================================================================
-- 10. RATINGS & TRUST SYSTEM (3-Way Evaluation)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT DEFAULT '',
    dimension_quality INT CHECK (dimension_quality BETWEEN 1 AND 5),
    dimension_timeliness INT CHECK (dimension_timeliness BETWEEN 1 AND 5),
    dimension_communication INT CHECK (dimension_communication BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ratings_to_user ON ratings(to_user_id);

CREATE TABLE IF NOT EXISTS trust_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 80 CHECK (score BETWEEN 0 AND 100),
    level trust_level NOT NULL DEFAULT 'Building Trust',
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.50,
    completed_transactions INT NOT NULL DEFAULT 0,
    successful_deliveries INT NOT NULL DEFAULT 0,
    cancelled_orders INT NOT NULL DEFAULT 0,
    fulfilment_rate NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    cancellation_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    verified BOOLEAN NOT NULL DEFAULT false,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 11. AUDIT LOGS (Compliance, AML & Administrative Trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =============================================================================
-- 12. DATABASE FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_produce_updated_at BEFORE UPDATE ON produce FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_kyb_updated_at BEFORE UPDATE ON kyb_verifications FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Auto-deduct inventory when order is Accepted
CREATE OR REPLACE FUNCTION handle_order_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status = 'Accepted' AND OLD.order_status = 'Pending' THEN
        UPDATE produce
        SET available_quantity_kg = available_quantity_kg - NEW.quantity_kg,
            is_available = CASE WHEN (available_quantity_kg - NEW.quantity_kg) > 0 THEN true ELSE false END
        WHERE id = NEW.produce_id;
    ELSIF NEW.order_status = 'Cancelled' AND OLD.order_status IN ('Pending', 'Accepted') THEN
        UPDATE produce
        SET available_quantity_kg = available_quantity_kg + NEW.quantity_kg,
            is_available = true
        WHERE id = NEW.produce_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_inventory AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION handle_order_inventory();
