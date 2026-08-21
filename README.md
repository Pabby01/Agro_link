# AGROLINK

> **"The trusted network moving food from farm to market."**

Agrolink is an intelligent, trusted agricultural supply-chain and transaction network connecting **Farmers**, **Commercial Buyers**, and **Logistics Transporters** across Nigeria and West Africa.

---

## 🌾 Core Product Loop

```
  DISCOVER  ──>  VERIFY  ──>  MATCH  ──>  MOVE  ──>  DELIVER  ──>  BUILD TRUST
 (Marketplace)   (KYB / CAC)  (Smart Route) (Telematics) (OTP POD)  (Reputation Index)
```

1. **Discover**: Buyers discover graded bulk farm commodities directly from verified agrarian clusters.
2. **Verify**: Farmers, buyers, and transporters undergo tiered business identity verification (KYC/KYB).
3. **Match**: Orders automatically match freight transporters operating on northern haulage corridors.
4. **Move**: GPS tracking and cold-chain temperature telemetry preserve food quality and reduce post-harvest waste.
5. **Deliver**: Multi-party Proof of Pickup and Proof of Delivery (POD) via 6-digit OTP codes and weighbridge receipts.
6. **Build Trust**: An open, measurable trust engine updates counterparty reputation scores based on completed milestones.

---

## 🏛️ Modular Domain Architecture

The application is structured into clean, domain-oriented feature modules separated from the UI presentation layer:

```
src/
├── features/
│   ├── trust/          # Transparent reputation scoring engine & event ledger
│   ├── payments/       # Transparent pricing service (Produce + Freight + 1% Platform Fee)
│   ├── orders/         # Strict 15-stage order lifecycle state machine & transition rules
│   ├── shipments/      # Proof of Pickup & Proof of Delivery (POD) with discrepancy detection
│   ├── disputes/       # Counterparty arbitration, evidence review, and escrow settlement
│   ├── verification/   # Tier 1-3 KYC/KYB document verification workflows
│   ├── audit/          # Immutable centralized audit trail logging
│   └── ai/             # Grounded agricultural intelligence & deterministic fallback
├── types/
│   └── domain.ts       # Typed domain entities (User, ProduceListing, Order, Shipment, Dispute, etc.)
├── server/
│   ├── router.ts       # High-performance REST API router
│   ├── db.ts           # Relational persistent store & realistic seed dataset
│   ├── auth.ts         # PBKDF2 cryptographic authentication & session management
│   ├── ai.ts           # Dual-engine grounded AI (Gemini 2.5 Flash + Database heuristics)
│   └── logistics.ts    # Interstate freight matching & cold-chain telemetry
├── components/         # Reusable atomic UI & domain components
└── routes/             # TanStack SSR / Client file-based routes
```

---

## 🔄 Order Lifecycle State Machine

Agrolink enforces strict server-side order lifecycle validation:

```
[DRAFT] ──> [PENDING] ──> [CONFIRMED] ──> [PAYMENT_PENDING] ──> [PAID]
                                                                    │
   ┌────────────────────────────────────────────────────────────────┘
   ▼
[TRANSPORT_REQUIRED] ──> [TRANSPORT_ASSIGNED] ──> [PICKUP_PENDING] ──> [IN_TRANSIT]
                                                                            │
   ┌────────────────────────────────────────────────────────────────────────┘
   ▼
[DELIVERED] ──> [BUYER_CONFIRMED] ──> [COMPLETED] (Escrow Released + Trust Bonus)
     │
     └──> [DISPUTED] ──> [ADMIN ARBITRATION] ──> (Full / Partial Escrow Refund)
```

---

## 🛡️ Transparent Trust Scoring Model

Unlike black-box rating systems, Agrolink calculates reputation using a transparent, measurable formula:

$$\text{Trust Score} = \text{Clamp}_{0}^{100}\Big(70 + \text{Bonuses} - \text{Penalties}\Big)$$

| Factor                    | Weight / Value | Description                                                            |
| :------------------------ | :------------: | :--------------------------------------------------------------------- |
| **Base Score**            |   `+70 pts`    | Starting score for active onboarded users                              |
| **Business Verification** |   `+15 pts`    | Tier-2/3 CAC registration and verified credentials                     |
| **Fulfilled Transaction** | `+2 pts / tx`  | Awarded upon successful buyer OTP receipt confirmation (capped at +20) |
| **High Market Rating**    |    `+3 pts`    | Counterparty rating $\ge 4.5 \big/ 5.0$                                |
| **Low Market Rating**     |    `-8 pts`    | Counterparty rating $\le 2.5 \big/ 5.0$                                |
| **Order Cancellation**    |   `-10 pts`    | Penalty for unexcused post-confirmation cancellations                  |
| **Unresolved Dispute**    |   `-15 pts`    | Penalty when weighbridge shortages or bad quality are confirmed        |
| **Late Delivery**         |    `-5 pts`    | Severe unexcused transit delays exceeding window                       |

---

## 💰 Transparent Platform Revenue Model

Agrolink does not act as a custodian of user funds or take hidden currency spreads:

1. **1.0% Platform Fee**: Transparently calculated on gross produce subtotal upon successful escrow settlement.
2. **Logistics Matching Commission**: 2–3% fee on return-haul interstate freight and reefer bookings.
3. **Tier-3 Fleet Compliance**: Institutional vetting and automated telematics integration for enterprise buyers.

---

## 🧪 Automated Testing & Verification

Run the comprehensive domain unit test suite:

```bash
npm test
```

### Verified Test Suites:

- ✅ **Order State Machine**: Linear progression, illegal skip rejection, and role permissions.
- ✅ **Pricing Service**: Exact produce subtotal, distance freight scaling, cold-chain multipliers, and 1% platform fee.
- ✅ **Trust Score Service**: Formula accuracy, event logging, and [0, 100] boundary clamping.
- ✅ **Shipment & Proof of Delivery**: Gate pickup, OTP validation, and quantity shortage discrepancy detection.
- ✅ **Dispute Resolution**: Evidence submission and partial/full refund settlements.
- ✅ **Centralized Audit Logging**: Metadata logging and sensitive token sanitization.

---

## ⚖️ Compliance & Hackathon Prototype Disclaimer

> **IMPORTANT LEGAL & COMPLIANCE NOTICE**:
> Agrolink's verification, payment, privacy, escrow, and governance modules are prototype workflows designed for hackathon demonstration and technical validation. Production deployment requires formal legal, regulatory, privacy, payment, agricultural, and security review appropriate to the markets and products supported (including NDPC data protection, CAC corporate registries, and licensed payment provider integrations). Agrolink does not claim official regulatory certifications unless an authorized production integration is explicitly configured.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
```

Open `http://localhost:8080` to explore Agrolink.
