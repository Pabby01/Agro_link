-- =============================================================================
-- AGROLINK SEED DATA (SUPABASE POSTGRESQL)
-- Seed Data for Farmers, Buyers, Transporters, Listings & Governance
-- =============================================================================

-- 1. SEED USERS (Password for all demo accounts: 'Agrolink@2026')
-- Precomputed PBKDF2 / SHA-256 hash
INSERT INTO users (id, email, password_hash, password_salt, role, full_name, business_name, phone, location_name, latitude, longitude, avatar_initials, bio, kyb_tier, is_verified)
VALUES
('a0000001-0000-0000-0000-000000000001', 'abdul@agrolink.ng', 'c81308a3f81de408990c74fb553d100fbca5728a49f50e9ec195fa3fa7a9b0c7', 'salt_farmer_kano_2026', 'farmer', 'Alhaji Abdul Ibrahim', 'Abdul Integrated Farms', '+234 803 111 2233', 'Kano State', 12.0022, 8.5920, 'AF', 'Commercial producer of Roma tomatoes, yellow maize, dry onions, and sorghum. Certified organic and GAP compliant.', 2, true),
('a0000002-0000-0000-0000-000000000002', 'buyer@freshmart.ng', 'c81308a3f81de408990c74fb553d100fbca5728a49f50e9ec195fa3fa7a9b0c7', 'salt_buyer_lagos_2026', 'buyer', 'Ngozi Eze & Partners', 'FreshMart Retail & Processing', '+234 802 222 3344', 'Lagos (Mile 12)', 6.5244, 3.3792, 'FM', 'National FMCG distributor and wholesale aggregator supplying 42 retail supermarkets across Southwestern Nigeria.', 2, true),
('a0000003-0000-0000-0000-000000000003', 'haulage@swifthaul.ng', 'c81308a3f81de408990c74fb553d100fbca5728a49f50e9ec195fa3fa7a9b0c7', 'salt_transporter_abuja_2026', 'transporter', 'Tunde Bakare', 'SwiftHaul Cold-Chain Logistics', '+234 809 333 4455', 'Abuja FCT', 9.0765, 7.3986, 'SH', 'Specialized temperature-controlled agricultural haulage operator with 18 reefer trucks along the Kano-Lagos corridor.', 3, true),
('a0000004-0000-0000-0000-000000000004', 'admin@agrolink.ng', 'c81308a3f81de408990c74fb553d100fbca5728a49f50e9ec195fa3fa7a9b0c7', 'salt_admin_ops_2026', 'admin', 'Agrolink Compliance & Risk', 'Agrolink Operations HQ', '+234 800 000 0000', 'Abuja National Command', 9.0765, 7.3986, 'AO', 'National agricultural supply-chain governance, dispute arbitration, KYB verification, and escrow settlement control.', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED KYB VERIFICATIONS
INSERT INTO kyb_verifications (id, user_id, company_name, cac_rc_number, tin_number, business_address, status, document_urls, reviewed_at)
VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Abdul Integrated Farms Ltd', 'RC-1849204', 'TIN-92841029', 'Plot 14, Bompai Industrial Area, Kano', 'verified', '{"cac_cert": "https://agrolink.ng/docs/cac_abdul.pdf", "farm_title": "https://agrolink.ng/docs/c_of_o.pdf"}'::jsonb, NOW()),
('b0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', 'FreshMart Retail & Logistics Nigeria Ltd', 'RC-1492019', 'TIN-39201948', 'KM 14 Ikorodu Road, Ketu, Lagos', 'verified', '{"cac_cert": "https://agrolink.ng/docs/cac_freshmart.pdf", "tax_clearance": "https://agrolink.ng/docs/tcc.pdf"}'::jsonb, NOW()),
('b0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', 'SwiftHaul Freight Carriers Ltd', 'RC-2049182', 'TIN-10492810', 'Plot 88, Idu Industrial District, Abuja', 'verified', '{"cac_cert": "https://agrolink.ng/docs/cac_swifthaul.pdf", "git_insurance": "https://agrolink.ng/docs/git_policy.pdf"}'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. SEED VEHICLES
INSERT INTO vehicles (id, transporter_id, plate_number, vehicle_type, capacity_kg, is_refrigerated)
VALUES
('v0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'KJA-829-XA', 'Reefer 30T', 30000, true),
('v0000002-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003', 'ABJ-314-MK', 'Truck 40T', 40000, false),
('v0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', 'KAN-552-TR', 'Van 5T', 5000, false)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED PRODUCE LISTINGS
INSERT INTO produce (id, farmer_id, name, category, description, quality_grade, quantity_kg, available_quantity_kg, price_per_kg, min_order_kg, packaging_type, location_name, latitude, longitude, images)
VALUES
('p0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Fresh Roma Tomatoes', 'Vegetables', 'Vine-ripened, firm-grade red tomatoes harvested in Kano farm cluster. Low moisture content suitable for long-distance haulage.', 'Grade A', 15000, 14200, 850, 100, '50kg Plastic Crates', 'Kano State', 12.0022, 8.5920, ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop']),
('p0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Yellow Feed Maize', 'Grains', 'Double-cleaned dry yellow corn with moisture level under 12%. Perfect for industrial milling and feed formulation.', 'Grade A', 40000, 38000, 520, 500, '100kg Poly Jute Bags', 'Kano State', 12.0022, 8.5920, ARRAY['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop']),
('p0000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Benue White Yam Tubers', 'Tubers', 'Premium dry export-grade white yams from Zaki Biam farm gate. Minimum 3kg per tuber.', 'Grade A', 20000, 19500, 1100, 50, 'Bulk Bundles of 100', 'Benue (Zaki Biam)', 7.5255, 9.6105, ARRAY['https://images.unsplash.com/photo-1596483785714-386d34b22c2a?w=800&auto=format&fit=crop']),
('p0000004-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Sokoto Red Dry Onions', 'Vegetables', 'Cured, hard-skin red onions with high shelf-life. Inspected and bagged under Agrolink standard.', 'Grade A', 25000, 25000, 720, 100, '100kg Ventilated Net Bags', 'Sokoto State', 13.0609, 5.2476, ARRAY['https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop'])
ON CONFLICT (id) DO NOTHING;

-- 5. SEED TRUST PROFILES
INSERT INTO trust_profiles (user_id, score, level, rating, completed_transactions, successful_deliveries, cancelled_orders, fulfilment_rate, cancellation_rate, verified, history)
VALUES
('a0000001-0000-0000-0000-000000000001', 94, 'High Trust', 4.90, 48, 47, 1, 98.00, 2.00, true, '[{"date": "2026-08-15", "score": 94, "reason": "Consistent Grade A tomato batch delivery to Lagos"}]'::jsonb),
('a0000002-0000-0000-0000-000000000002', 91, 'High Trust', 4.80, 36, 35, 1, 97.00, 3.00, true, '[{"date": "2026-08-12", "score": 91, "reason": "Prompt delivery receipt confirmation and escrow clearance"}]'::jsonb),
('a0000003-0000-0000-0000-000000000003', 96, 'High Trust', 4.95, 62, 61, 1, 99.00, 1.00, true, '[{"date": "2026-08-16", "score": 96, "reason": "Zero cargo loss across Kano-Lagos corridor on Reefer fleet"}]'::jsonb)
ON CONFLICT (user_id) DO NOTHING;
