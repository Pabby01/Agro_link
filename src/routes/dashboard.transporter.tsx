import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { KYBVerificationModal } from "@/components/kyb/KYBVerificationModal";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Navigation,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TrustScore } from "@/components/trust/TrustScore";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { AgroMap } from "@/components/map/AgroMap";
import { useApp, formatNaira, timeAgo } from "@/lib/store";
import { api } from "@/lib/api-client";
import { ProofOfPickupModal } from "@/components/logistics/ProofOfPickupModal";
import { ProofOfDeliveryModal } from "@/components/logistics/ProofOfDeliveryModal";
import type { DeliveryStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/transporter")({
  head: () => ({
    meta: [{ title: "Transporter Dashboard — SwiftHaul Logistics | Agrolink" }],
  }),
  component: TransporterDashboard,
});

function TransporterDashboard() {
  const {
    state,
    currentUser,
    getTrust,
    getUser,
    acceptDelivery,
    setDeliveryStatus,
    refreshLiveState,
  } = useApp();

  const transporterId = currentUser?.id ?? "u-transporter-1";
  const transporter = currentUser ??
    getUser(transporterId) ?? {
      id: transporterId,
      name: "Verified Freight Transporter",
      role: "transporter" as const,
      businessName: "Agro Haulage Logistics",
      location: "Abuja Transit Hub",
      coords: { lat: 9.0765, lng: 7.3986 },
      avatar: "VT",
      phone: "+234 800 000 0000",
      bio: "Interstate bulk food haulage fleet.",
      verified: true,
    };
  const trust = getTrust(transporterId);

  // Available open jobs (no transporter assigned or status Pending)
  const openJobs = state.deliveries.filter(
    (d) => d.status === "Pending" && (!d.transporterId || d.transporterId === transporterId),
  );

  // Active deliveries assigned to this transporter
  const activeDeliveries = state.deliveries.filter(
    (d) =>
      d.transporterId === transporterId &&
      (d.status === "Accepted" || d.status === "Picked Up" || d.status === "In Transit"),
  );

  // Completed deliveries
  const completedDeliveries = state.deliveries.filter(
    (d) => d.transporterId === transporterId && d.status === "Delivered",
  );

  const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.fee, 0);

  return (
    <Page>
      <PageHeader
        title="My Agrolink Network"
        subtitle={`${transporter.name} (${transporter.location}) · Find delivery opportunities, track shipments, and grow your reputation.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <KYBVerificationModal
              currentTier={transporter.role === "transporter" ? 3 : 1}
              isVerified={true}
            />
            <Badge
              variant="outline"
              className="text-success border-success/40 bg-success/10 py-1.5 px-3"
            >
              <span className="mr-1.5 size-2 rounded-full bg-success animate-pulse" />
              Fleet Status: Online & Available
            </Badge>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {trust && (
          <motion.div variants={fadeInUp}>
            <Card className="flex items-center justify-between gap-0 p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fleet Trust Score
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-success">
                  {trust.score}/100
                </p>
                <p className="text-xs text-muted-foreground">
                  {trust.level} · {trust.successfulDeliveries} On-Time Trips
                </p>
              </div>
              <TrustScore trust={trust} size="sm" showLabel={false} />
            </Card>
          </motion.div>
        )}
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Available Load Jobs"
            value={openJobs.length}
            hint={`₦${openJobs.reduce((s, j) => s + j.fee, 0).toLocaleString()} potential payouts`}
            icon={Truck}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Active In-Transit"
            value={activeDeliveries.length}
            hint="Live freight on the road"
            icon={Clock}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Completed Haulage"
            value={formatNaira(totalEarnings)}
            hint={`${completedDeliveries.length} delivered contracts`}
            icon={DollarSign}
          />
        </motion.div>
      </motion.div>

      {/* Main Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Active Trips & Available Jobs */}
        <div className="space-y-8">
          {/* Active Deliveries Stepper Manager */}
          {activeDeliveries.length > 0 && (
            <Card className="gap-0 p-5 shadow-[var(--shadow-lift)] border-primary/40">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-primary">
                    Active Delivery in Transit
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Advance shipment status as milestones are reached along the transit corridor
                  </p>
                </div>
                <Badge variant="default">{activeDeliveries.length} Active</Badge>
              </div>

              <div className="mt-4 divide-y">
                {activeDeliveries.map((delivery) => {
                  const order = state.orders.find((o) => o.id === delivery.orderId);
                  const produce = order
                    ? state.produce.find((p) => p.id === order.produceId)
                    : null;
                  const farmer = order ? getUser(order.farmerId) : null;
                  const buyer = order ? getUser(order.buyerId) : null;

                  return (
                    <div key={delivery.id} className="py-4 space-y-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">
                              {order?.quantityKg}kg {produce?.name ?? "Agricultural Freight"}
                            </span>
                            <StatusBadge status={delivery.status} />
                            {delivery.urgency === "Urgent" && (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1 text-[11px]"
                              >
                                <Flame className="size-3" /> Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Route:{" "}
                            <span className="font-semibold text-foreground">
                              {delivery.pickup.label}
                            </span>{" "}
                            →{" "}
                            <span className="font-semibold text-foreground">
                              {delivery.destination.label}
                            </span>{" "}
                            ({delivery.distanceKm}km)
                          </p>
                        </div>
                        <span className="font-display text-lg font-bold text-success">
                          {formatNaira(delivery.fee)}
                        </span>
                      </div>

                      {/* Transit Controls Stepper with Verifiable Proof of Pickup and Delivery */}
                      <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Verifiable Chain-of-Custody Actions
                          </p>
                          <span className="text-xs text-muted-foreground font-mono">
                            OTP Requirement: Active
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant={delivery.status === "Accepted" ? "default" : "outline"}
                            onClick={() => {
                              setDeliveryStatus(delivery.id, "Accepted");
                              toast.info("Status: Accepted (En route to pickup location)");
                            }}
                          >
                            1. Accepted
                          </Button>

                          <ProofOfPickupModal
                            shipmentId={delivery.id}
                            orderQuantityKg={order?.quantityKg || 1000}
                            pickupLocation={delivery.pickup.label}
                            onSuccess={async (data) => {
                              await api.logistics.pickup({
                                deliveryId: delivery.id,
                                quantityCollectedKg: data.quantityCollectedKg,
                                evidenceUrl: data.evidenceUrl,
                              });
                              setDeliveryStatus(delivery.id, "Picked Up");
                              refreshLiveState();
                            }}
                            trigger={
                              <Button
                                size="sm"
                                variant={delivery.status === "Picked Up" ? "default" : "outline"}
                              >
                                2. Confirm Farm Gate Pickup
                              </Button>
                            }
                          />

                          <Button
                            size="sm"
                            variant={delivery.status === "In Transit" ? "default" : "outline"}
                            onClick={() => {
                              setDeliveryStatus(delivery.id, "In Transit");
                              toast.info("Status: In Transit on Corridor Route");
                            }}
                          >
                            3. In Transit
                          </Button>

                          <ProofOfDeliveryModal
                            shipmentId={delivery.id}
                            orderQuantityKg={order?.quantityKg || 1000}
                            expectedOtp="849201"
                            onSuccess={async (data) => {
                              await api.logistics.deliver({
                                deliveryId: delivery.id,
                                providedOtp: data.providedOtp,
                                quantityReceivedKg: data.quantityReceivedKg,
                                evidenceUrl: data.evidenceUrl,
                              });
                              setDeliveryStatus(delivery.id, "Delivered");
                              refreshLiveState();
                            }}
                            trigger={
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                4. Verify Proof of Delivery (OTP)
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Available Delivery Jobs Feed */}
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-display text-xl font-bold">Available Delivery Jobs</h2>
                <p className="text-xs text-muted-foreground">
                  Pick up high-margin haulage jobs requested by verified buyers and farmers
                </p>
              </div>
              <Badge variant="secondary">{openJobs.length} Available</Badge>
            </div>

            {openJobs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No open delivery jobs currently awaiting dispatch. New orders appear immediately.
              </div>
            ) : (
              <div className="divide-y">
                {openJobs.map((job) => {
                  const order = state.orders.find((o) => o.id === job.orderId);
                  const produce = order
                    ? state.produce.find((p) => p.id === order.produceId)
                    : null;
                  const farmer = order ? getUser(order.farmerId) : null;
                  const farmerTrust = order ? getTrust(order.farmerId) : null;
                  const buyer = order ? getUser(order.buyerId) : null;
                  const buyerTrust = order ? getTrust(order.buyerId) : null;

                  return (
                    <div key={job.id} className="py-5 space-y-3 first:pt-4 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">
                              {job.pickup.label} → {job.destination.label}
                            </h3>
                            {job.urgency === "Urgent" ? (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1 text-[11px]"
                              >
                                <Flame className="size-3" /> Urgent Load
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[11px]">
                                Standard
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Freight: {order?.quantityKg.toLocaleString()}kg of{" "}
                            {produce?.name ?? "Produce"} · Distance: {job.distanceKm}km
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-display text-lg font-bold text-foreground">
                            {formatNaira(job.fee)}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            Guaranteed payout
                          </span>
                        </div>
                      </div>

                      {/* Counterparties Trust Badges */}
                      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 p-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Farmer:</span>
                          <span className="font-semibold text-foreground">{farmer?.name}</span>
                          {farmerTrust && <ShieldCheck className="size-3.5 text-success" />}
                        </div>
                        <span className="text-muted-foreground">·</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Buyer:</span>
                          <span className="font-semibold text-foreground">{buyer?.name}</span>
                          {buyerTrust && <ShieldCheck className="size-3.5 text-success" />}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          className="font-semibold"
                          onClick={() => {
                            acceptDelivery(job.id);
                            toast.success(
                              `Accepted haulage job ${job.id}! Pickup coordinates dispatched.`,
                            );
                          }}
                        >
                          Accept Delivery Job
                          <ArrowRight className="ml-1.5 size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: AI Assistant & Map Preview */}
        <div className="space-y-6">
          <AIAssistant role="transporter" />

          {/* Quick Fleet Profile */}
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Fleet Operations</h3>
              <Button asChild variant="link" size="sm" className="p-0 h-auto">
                <Link to="/profile/$userId" params={{ userId: transporter.id }}>
                  Full Profile
                </Link>
              </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{transporter.bio}</p>
            <div className="mt-4 space-y-2 text-xs border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium">{transporter.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fleet Base:</span>
                <span className="font-medium">{transporter.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fulfilled Trips:</span>
                <span className="font-medium">{completedDeliveries.length} completed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
