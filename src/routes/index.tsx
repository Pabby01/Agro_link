import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Sprout,
  ShoppingBasket,
  Truck,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Search,
  Check,
  Compass,
  ArrowUpRight,
  Activity,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiquidCard } from "@/components/ui/LiquidCard";
import { TrustScore } from "@/components/trust/TrustScore";
import { TrustBreakdown } from "@/components/trust/TrustBreakdown";
import { AgroMap } from "@/components/map/AgroMap";
import { NetworkHero } from "@/components/landing/NetworkHero";
import { HeroBackgroundCarousel } from "@/components/landing/HeroBackgroundCarousel";
import { useApp } from "@/lib/store";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import type { TrustProfile } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agrolink — The Trusted Network Moving Food from Farm to Market" },
      {
        name: "description",
        content:
          "Agrolink connects farmers, buyers and transporters in one intelligent agricultural supply-chain network.",
      },
      {
        property: "og:title",
        content: "Agrolink — The Trusted Network Moving Food from Farm to Market",
      },
      {
        property: "og:description",
        content:
          "Agrolink connects farmers, buyers and transporters in one intelligent agricultural supply-chain network.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { state } = useApp();

  // Selected sample profile for Section 4 (Trust)
  const [selectedTrustRole, setSelectedTrustRole] = useState<"farmer" | "buyer" | "transporter">(
    "farmer",
  );

  const farmerTrust: TrustProfile = state.trust.find((t) => t.userId === "u-farmer-1") ?? {
    userId: "u-farmer-1",
    score: 92,
    level: "High Trust",
    rating: 4.8,
    completedTransactions: 48,
    fulfilmentRate: 97,
    successfulDeliveries: 47,
    cancelledOrders: 2,
    cancellationRate: 4,
    verified: true,
    history: [
      { date: "2026-08-14", score: 92, reason: "On-time haulage completion" },
      { date: "2026-08-01", score: 90, reason: "Verified farm gate inspection" },
    ],
  };

  const buyerTrust: TrustProfile = state.trust.find((t) => t.userId === "u-buyer-1") ?? {
    userId: "u-buyer-1",
    score: 88,
    level: "Trusted",
    rating: 4.6,
    completedTransactions: 36,
    fulfilmentRate: 94,
    successfulDeliveries: 35,
    cancelledOrders: 2,
    cancellationRate: 5,
    verified: true,
    history: [
      { date: "2026-08-12", score: 88, reason: "Prompt delivery receipt confirmation" },
      { date: "2026-07-28", score: 86, reason: "Direct escrow payment cleared" },
    ],
  };

  const transporterTrust: TrustProfile = state.trust.find(
    (t) => t.userId === "u-transporter-1",
  ) ?? {
    userId: "u-transporter-1",
    score: 95,
    level: "High Trust",
    rating: 4.9,
    completedTransactions: 62,
    fulfilmentRate: 99,
    successfulDeliveries: 61,
    cancelledOrders: 1,
    cancellationRate: 1,
    verified: true,
    history: [
      { date: "2026-08-15", score: 95, reason: "Zero cargo loss across Kano-Lagos corridor" },
      { date: "2026-08-05", score: 94, reason: "On-time arrival within 24h window" },
    ],
  };

  const activeTrustProfile =
    selectedTrustRole === "farmer"
      ? farmerTrust
      : selectedTrustRole === "buyer"
        ? buyerTrust
        : transporterTrust;

  return (
    <div className="flex flex-col gap-20 pb-24 sm:gap-28 overflow-hidden">
      {/* ========================================================================= */}
      {/* SECTION 1 — HERO                                                          */}
      {/* ========================================================================= */}
      <section className="relative isolate overflow-hidden border-b border-border/70 py-16 sm:py-24">
        {/* Full-width Responsive Agricultural Carousel Background */}
        <HeroBackgroundCarousel />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6 rounded-3xl bg-background/60 p-6 sm:p-8 backdrop-blur-xs border border-border/40 shadow-xs"
            >


              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance"
              >
                The trusted network moving food from farm to market.
              </motion.h1>

              {/* Supporting Copy */}
              <motion.p
                variants={fadeInUp}
                className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                Agrolink connects farmers, buyers, and transporters in one intelligent network —
                helping agricultural goods move faster, safer, and smarter.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl px-7 font-bold shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
                >
                  <Link to="/marketplace">
                    Explore Agrolink
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-6 font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 transition-transform hover:scale-105"
                >
                  <Link to="/insights">
                    <Sparkles className="mr-2 size-4" />
                    AI Crop Scanner
                  </Link>
                </Button>
              </motion.div>

              {/* Trust & Network Indicator Badges */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-3 gap-4 border-t pt-6 sm:max-w-md"
              >
                <div>
                  <p className="font-display text-2xl font-bold sm:text-3xl text-foreground">97%</p>
                  <p className="text-xs text-muted-foreground">Fulfilment Rate</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold sm:text-3xl text-foreground">
                    100%
                  </p>
                  <p className="text-xs text-muted-foreground">Verified Profiles</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold sm:text-3xl text-foreground">
                    3-Way
                  </p>
                  <p className="text-xs text-muted-foreground">Trust Feedback</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Interactive 3D Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="relative w-full"
            >
              <NetworkHero />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — THE PROBLEM                                                   */}
      {/* ========================================================================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-3 uppercase tracking-wider font-bold text-primary">
            The Supply-Chain Challenge
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Food doesn't just need to be produced. It needs to move.
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Agricultural supply chains suffer from poor trust, fragmented coordination, and
            inefficient transit routes.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Farmers Problem Card with Liquid Fill Feedback */}
          <motion.div variants={fadeInUp}>
            <LiquidCard
              variant="success"
              className="h-full p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] border-t-4 border-t-success"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-success/15 text-success">
                <Sprout className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">Farmers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                "Finding reliable buyers and transportation."
              </p>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed border-t pt-3">
                Facing unpredictable farm gate prices, spoilage while waiting for haulage, and risk
                of unverified buyers defaulting.
              </p>
            </LiquidCard>
          </motion.div>

          {/* Buyers Problem Card with Liquid Fill Feedback */}
          <motion.div variants={fadeInUp}>
            <LiquidCard
              variant="primary"
              className="h-full p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] border-t-4 border-t-primary"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <ShoppingBasket className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">Buyers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                "Finding reliable suppliers and predictable fulfilment."
              </p>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed border-t pt-3">
                Dealing with middlemen price gouging, uncertain produce quality grades, and blind
                transit delays.
              </p>
            </LiquidCard>
          </motion.div>

          {/* Transporters Problem Card with Liquid Fill Feedback */}
          <motion.div variants={fadeInUp}>
            <LiquidCard
              variant="gold"
              className="h-full p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] border-t-4 border-t-gold"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-gold/25 text-gold-foreground">
                <Truck className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">Transporters</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                "Finding profitable loads and avoiding empty trips."
              </p>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed border-t pt-3">
                Lacking visibility on return hauls, resulting in deadhead miles, idle fleet
                capacity, and delayed payments.
              </p>
            </LiquidCard>
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* SECTION 3 — THE AGROLINK FLOW (WITH WATER-POURING CARDS)                  */}
      {/* ========================================================================= */}
      <section id="flow" className="border-y border-border/70 bg-card/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <Badge variant="secondary" className="mb-2 font-bold uppercase tracking-wider">
              The Complete Product Loop
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One network. From harvest to delivery.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Every step is designed to keep agricultural trade transparent, coordinated, and
              secure. Tap or hover over any step.
            </p>
          </motion.div>

          {/* 6-Step Visual Loop with Liquid Pouring Feedback */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Step 1 */}
            <motion.div variants={fadeInUp}>
              <LiquidCard
                variant="primary"
                className="h-full p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-primary/50">01</span>
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Search className="size-4" />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground uppercase tracking-wide">
                  DISCOVER
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Find available produce and haulage opportunities with live transparent pricing and
                  location coordinates.
                </p>
              </LiquidCard>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp}>
              <LiquidCard
                variant="emerald"
                className="h-full p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-emerald-600/60">
                    02
                  </span>
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
                    <ShieldCheck className="size-4" />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground uppercase tracking-wide">
                  VERIFY
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Understand who you are transacting with through verified identity, fulfilment
                  history, and peer ratings.
                </p>
              </LiquidCard>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp}>
              <LiquidCard
                variant="accent"
                className="h-full p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-accent/70">03</span>
                  <span className="grid size-9 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                    <Layers className="size-4" />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground uppercase tracking-wide">
                  MATCH
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Connect the right farmer, buyer and transporter into one direct, binding trade
                  contract.
                </p>
              </LiquidCard>
            </motion.div>

            {/* Step 4 */}
            <motion.div variants={fadeInUp}>
              <LiquidCard
                variant="gold"
                className="h-full p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-gold/70">04</span>
                  <span className="grid size-9 place-items-center rounded-xl bg-gold/25 text-gold-foreground">
                    <Truck className="size-4" />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground uppercase tracking-wide">
                  MOVE
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Coordinate the farm gate pickup, load inspection, and route dispatch along major
                  interstate corridors.
                </p>
              </LiquidCard>
            </motion.div>

            {/* Step 5 */}
            <motion.div variants={fadeInUp}>
              <LiquidCard
                variant="blue"
                className="h-full p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-blue-500/50">05</span>
                  <span className="grid size-9 place-items-center rounded-xl bg-blue-500/15 text-blue-600">
                    <Compass className="size-4" />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground uppercase tracking-wide">
                  DELIVER
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Track the shipment milestone by milestone and confirm quality handover at the
                  destination market.
                </p>
              </LiquidCard>
            </motion.div>

            {/* Step 6 */}
            <motion.div variants={fadeInUp}>
              <LiquidCard
                variant="success"
                className="h-full p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] border-success/40 bg-success/5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-success">06</span>
                  <span className="grid size-9 place-items-center rounded-xl bg-success text-success-foreground">
                    <Check className="size-4" />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground uppercase tracking-wide">
                  BUILD TRUST
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Mutual feedback and successful contract completion automatically strengthen each
                  participant's reputation.
                </p>
              </LiquidCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 — TRUST (CORE DIFFERENTIATOR)                                  */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <Badge variant="outline" className="font-bold text-primary">
              The Trust System
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Know who you're doing business with.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Every farmer, buyer and transporter builds a reputation through real marketplace
              activity. Trust is not an admin badge — it is a live, cross-cutting score that lets
              you evaluate counterparties before transacting.
            </p>

            {/* 3 Role Selection Cards */}
            <div className="space-y-3 pt-2">
              {/* Farmer Tab */}
              <div
                onClick={() => setSelectedTrustRole("farmer")}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] ${
                  selectedTrustRole === "farmer"
                    ? "border-success bg-success/10 ring-2 ring-success/25"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-success/20 text-success font-bold">
                    AF
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-foreground">Abdul Farms (Farmer)</h4>
                    <p className="text-xs text-muted-foreground">
                      Kano · 48 completed transactions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-success">92</span>
                  <Badge variant="secondary" className="text-[10px]">
                    High Trust
                  </Badge>
                </div>
              </div>

              {/* Buyer Tab */}
              <div
                onClick={() => setSelectedTrustRole("buyer")}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] ${
                  selectedTrustRole === "buyer"
                    ? "border-primary bg-primary/10 ring-2 ring-primary/25"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary font-bold">
                    FM
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-foreground">
                      FreshMart Retail (Buyer)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Lagos · 36 completed transactions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-primary">88</span>
                  <Badge variant="secondary" className="text-[10px]">
                    Trusted
                  </Badge>
                </div>
              </div>

              {/* Transporter Tab */}
              <div
                onClick={() => setSelectedTrustRole("transporter")}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] ${
                  selectedTrustRole === "transporter"
                    ? "border-gold bg-gold/15 ring-2 ring-gold/30"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-gold/25 text-gold-foreground font-bold">
                    SH
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-foreground">
                      SwiftHaul Logistics (Transporter)
                    </h4>
                    <p className="text-xs text-muted-foreground">Abuja · 62 completed deliveries</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-gold-foreground">95</span>
                  <Badge variant="secondary" className="text-[10px]">
                    High Trust
                  </Badge>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="rounded-xl font-bold">
              <Link to="/marketplace">
                Explore Verified Network
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          {/* Interactive Trust Breakdown Inspector */}
          <div>
            <Card className="gap-0 p-6 shadow-[var(--shadow-lift)] border-border/90 bg-card">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold">Real Reputation Breakdown</h3>
                  <p className="text-xs text-muted-foreground">
                    Calculated across identity, fulfilment, and mutual ratings
                  </p>
                </div>
                <TrustScore trust={activeTrustProfile} size="md" />
              </div>
              <div className="pt-4">
                <TrustBreakdown trust={activeTrustProfile} />
              </div>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* SECTION 5 — LOGISTICS LAYER WITH REAL MAP & MOVING VEHICLES (UBER STYLE) */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-2 font-bold uppercase tracking-wider">
            Live Moving Logistics Layer
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Don't just find a buyer. Move the produce.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base leading-relaxed">
            Agrolink connects agricultural demand with live transportation opportunities, reducing
            friction and improving vehicle utilisation.
          </p>

          {/* Visual Step Indicator */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-muted/60 px-4 py-2 text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1 text-success">
              <MapPin className="size-3.5" /> Farmer Location
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="flex items-center gap-1 text-primary">
              <CheckCircle2 className="size-3.5" /> Scheduled Pickup
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="flex items-center gap-1 text-gold-foreground">
              <Truck className="size-3.5" /> Transporter Transit
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="flex items-center gap-1 text-accent-foreground">
              <ShoppingBasket className="size-3.5" /> Buyer Delivery
            </span>
          </div>
        </div>

        {/* Real Interactive Map with Live Moving Cars, Trucks, and Bikes */}
        <div className="mt-10">
          <AgroMap />
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* SECTION 6 — EMBEDDED AI DECISION LAYER                                   */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-background p-6 shadow-[var(--shadow-lift)] sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-gold-foreground">
                <Sparkles className="size-3.5" />
                Agrolink Intelligence
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Intelligence that helps every transaction move smarter.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Turning live marketplace demand and freight availability into direct pricing,
                vetting, and route suggestions.
              </p>
              <div className="pt-2">
                <Button asChild size="lg" className="rounded-xl font-bold">
                  <Link to="/insights">
                    Try Agrolink AI
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Realistic AI Chat UI Example */}
            <div className="space-y-3 rounded-2xl border border-border/90 bg-card/95 p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b pb-3 text-xs font-semibold text-muted-foreground">
                <span className="size-2 rounded-full bg-success animate-pulse" />
                Live Decision Support
              </div>

              {/* User message */}
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-xs sm:text-sm text-primary-foreground">
                "My tomatoes have been listed for five days. What should I do?"
              </div>

              {/* AI message */}
              <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-sm border bg-muted/40 p-3.5 text-xs sm:text-sm">
                <p className="leading-relaxed text-foreground">
                  Demand appears stronger in nearby markets. Consider adjusting the price slightly
                  and prioritising delivery within the next 48 hours.
                </p>
                <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                  <span className="text-[11px] text-muted-foreground">Recommendation ready</span>
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="rounded-lg text-xs font-bold"
                  >
                    <Link to="/insights">View recommendation</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* ========================================================================= */}
      {/* SECTION 7 — MEASURABLE IMPACT (WITH LIQUID CARDS)                         */}
      {/* ========================================================================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-2 font-bold uppercase tracking-wider text-primary">
            Long-Term Value
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Less friction. Less waste. Better economics.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Engineered to transform agricultural movement across Africa. Tap any pillar below.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={fadeInUp}>
            <LiquidCard
              variant="success"
              className="h-full p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] cursor-pointer"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-success/15 text-success">
                <Sprout className="size-5" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">
                Market Access
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Designed to improve direct buyer reach for regional producers without middleman
                deductions.
              </p>
            </LiquidCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <LiquidCard
              variant="primary"
              className="h-full p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] cursor-pointer"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">Trust</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Designed to increase contract reliability through verified identities and 3-way
                performance scores.
              </p>
            </LiquidCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <LiquidCard
              variant="gold"
              className="h-full p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] cursor-pointer"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gold/25 text-gold-foreground">
                <Truck className="size-5" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">
                Transport Efficiency
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Designed to reduce empty return hauls and match loads with active interstate
                corridor carriers.
              </p>
            </LiquidCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <LiquidCard
              variant="accent"
              className="h-full p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] cursor-pointer"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                <Zap className="size-5" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">
                Produce Movement
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Designed to reduce farm-to-table transit time and minimize post-harvest spoilage.
              </p>
            </LiquidCard>
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* SECTION 8 — FINAL CALL TO ACTION                                          */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="border-t border-border/70 bg-primary text-primary-foreground py-16 sm:py-24"
      >
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Move food. Build trust. Reduce waste.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80 sm:text-lg leading-relaxed">
            One network connecting the people who grow, buy and move Africa's food.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-xl px-8 font-bold text-primary shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
            >
              <Link to="/marketplace">
                Explore Agrolink
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 font-semibold transition-transform hover:scale-105"
            >
              <Link to="/auth">Choose Demo Role</Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
