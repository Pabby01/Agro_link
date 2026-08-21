import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Navigation,
  ArrowRight,
  Layers,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { DashboardShell, type DashboardSection } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TrustScore } from "@/components/trust/TrustScore";
import { KYBVerificationModal } from "@/components/kyb/KYBVerificationModal";
import { ProofOfPickupModal } from "@/components/logistics/ProofOfPickupModal";
import { ProofOfDeliveryModal } from "@/components/logistics/ProofOfDeliveryModal";
import { useApp, formatNaira, timeAgo } from "@/lib/store";
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
    setOrderStatus,
  } = useApp();

  const [activeSection, setActiveSection] = useState<string>("overview");

  const transporterId = currentUser?.id ?? "u-transporter-1";
  const transporter = currentUser ??
    getUser(transporterId) ?? {
      id: transporterId,
      name: "SwiftHaul Logistics",
      role: "transporter" as const,
      businessName: "SwiftHaul Logistics Fleet",
      location: "Abuja Transit Hub",
      coords: { lat: 9.0765, lng: 7.3986 },
      avatar: "SH",
      phone: "+234 800 000 0000",
      bio: "Refrigerated and heavy bulk agricultural haulage.",
      verified: true,
    };
  const trust = getTrust(transporterId);

  // Available open jobs (status Pending)
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

  const sections: DashboardSection[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Layers,
    },
    {
      id: "load-board",
      label: "Available Load Board",
      icon: Truck,
      count: openJobs.length,
      badge: openJobs.length > 0 ? `${openJobs.length} Jobs` : undefined,
    },
    {
      id: "active-runs",
      label: "Active Deliveries",
      icon: Navigation,
      count: activeDeliveries.length,
    },
    {
      id: "fleet-kyb",
      label: "Fleet & KYB",
      icon: ShieldCheck,
    },
  ];

  return (
    <DashboardShell
      title={transporter.name}
      subtitle={`${transporter.location} · Commercial Freight Fleet`}
      role="transporter"
      roleBadgeText="Transporter"
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <KYBVerificationModal currentTier={3} isVerified={transporter.verified} />
          <Badge
            variant="outline"
            className="text-emerald-600 border-emerald-500/40 bg-emerald-500/10 py-1 px-2.5 text-xs font-semibold"
          >
            <span className="mr-1.5 size-2 rounded-full bg-emerald-500 animate-pulse" />
            Fleet: Online
          </Badge>
        </div>
      }
    >
      {/* ========================================================================= */}
      {/* 1. OVERVIEW SECTION                                                      */}
      {/* ========================================================================= */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust && (
              <Card className="flex items-center justify-between p-4 shadow-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fleet Trust
                  </p>
                  <p className="mt-0.5 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {trust.score}/100
                  </p>
                  <p className="text-xs text-muted-foreground">{trust.level} · 99% On-Time</p>
                </div>
                <TrustScore trust={trust} size="sm" showLabel={false} />
              </Card>
            )}
            <DashboardCard
              label="Available Jobs"
              value={openJobs.length}
              hint={`${formatNaira(openJobs.reduce((s, j) => s + j.fee, 0))} potential freight`}
              icon={Truck}
            />
            <DashboardCard
              label="Active Shipments"
              value={activeDeliveries.length}
              hint="In-transit across corridors"
              icon={Clock}
            />
            <DashboardCard
              label="Disbursed Earnings"
              value={formatNaira(totalEarnings)}
              hint={`${completedDeliveries.length} trips delivered`}
              icon={DollarSign}
            />
          </div>

          {/* Quick Load Board Teaser */}
          <Card className="p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-display text-base font-bold">Open Corridor Load Board</h3>
                <p className="text-xs text-muted-foreground">Claim delivery contracts and dispatch trucks</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-bold text-primary"
                onClick={() => setActiveSection("load-board")}
              >
                View All ({openJobs.length})
              </Button>
            </div>

            {openJobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No open delivery jobs right now. New farmer harvest orders will appear here automatically.
              </div>
            ) : (
              <div className="divide-y">
                {openJobs.slice(0, 2).map((job) => {
                  const relatedOrder = state.orders.find((o) => o.id === job.orderId);
                  const farmer = relatedOrder ? getUser(relatedOrder.farmerId) : null;
                  return (
                    <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {job.pickup.label} → {job.destination.label} ({job.distanceKm}km)
                        </p>
                        <p className="text-muted-foreground">
                          Farmer: {farmer?.name} · Cargo: {relatedOrder?.quantityKg ?? "Bulk"}kg
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-bold text-emerald-600">
                          {formatNaira(job.fee)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            acceptDelivery(job.id, transporterId);
                            toast.success("Delivery contract accepted! Assigned to your fleet.");
                            setActiveSection("active-runs");
                          }}
                        >
                          Accept Job
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOAD BOARD SECTION                                                    */}
      {/* ========================================================================= */}
      {activeSection === "load-board" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold">National Freight Dispatch Board</h2>
              <p className="text-xs text-muted-foreground">
                Verified farm-to-market haulage contracts with guaranteed escrow payouts
              </p>
            </div>
            <Badge variant="secondary">{openJobs.length} Open Jobs</Badge>
          </div>

          {openJobs.length === 0 ? (
            <Card className="p-10 text-center text-xs text-muted-foreground">
              No open load board jobs available at this moment.
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {openJobs.map((job) => {
                const relatedOrder = state.orders.find((o) => o.id === job.orderId);
                const farmer = relatedOrder ? getUser(relatedOrder.farmerId) : null;
                const farmerTrust = farmer ? getTrust(farmer.id) : null;

                return (
                  <Card key={job.id} className="p-4 shadow-xs space-y-3">
                    <div className="flex justify-between items-start border-b pb-2.5">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {job.pickup.label} → {job.destination.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Distance: <strong>{job.distanceKm} km</strong>
                        </p>
                      </div>
                      <span className="font-display text-base font-bold text-emerald-600">
                        {formatNaira(job.fee)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Farmer: <strong>{farmer?.name}</strong></span>
                      {farmerTrust && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="size-3" /> {farmerTrust.score} Trust
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full font-bold shadow-xs"
                      onClick={() => {
                        acceptDelivery(job.id, transporterId);
                        toast.success("Delivery contract accepted!");
                        setActiveSection("active-runs");
                      }}
                    >
                      <Truck className="mr-1.5 size-3.5" />
                      Accept Delivery Contract
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVE RUNS SECTION                                                   */}
      {/* ========================================================================= */}
      {activeSection === "active-runs" && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="font-display text-lg font-bold">Active Corridor Deliveries</h2>
            <p className="text-xs text-muted-foreground">
              Record Proof of Pickup at farm gate and submit Proof of Delivery at buyer terminal
            </p>
          </div>

          {activeDeliveries.length === 0 ? (
            <Card className="p-10 text-center text-xs text-muted-foreground">
              No active shipments in transit right now. Accept a job from the Load Board to start.
            </Card>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => {
                const relatedOrder = state.orders.find((o) => o.id === delivery.orderId);
                const farmer = relatedOrder ? getUser(relatedOrder.farmerId) : null;
                const buyer = relatedOrder ? getUser(relatedOrder.buyerId) : null;

                return (
                  <Card key={delivery.id} className="p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">
                            {delivery.pickup.label} → {delivery.destination.label}
                          </h3>
                          <Badge variant="secondary" className="font-bold">{delivery.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Farmer: <strong>{farmer?.name}</strong> · Buyer: <strong>{buyer?.name}</strong>
                        </p>
                      </div>
                      <span className="font-display text-base font-bold text-emerald-600">
                        {formatNaira(delivery.fee)}
                      </span>
                    </div>

                    {/* Action Flow Steps */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Cargo: <strong>{relatedOrder?.quantityKg ?? 1000} kg</strong> · Corridor: <strong>{delivery.distanceKm} km</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {delivery.status === "Accepted" && (
                          <ProofOfPickupModal
                            deliveryId={delivery.id}
                            farmerName={farmer?.name || "Farmer"}
                            produceQuantityKg={relatedOrder?.quantityKg || 1000}
                            onSuccess={() => {
                              setDeliveryStatus(delivery.id, "Picked Up");
                              if (relatedOrder) setOrderStatus(relatedOrder.id, "In Transit");
                              toast.success("Proof of Pickup verified at farm gate!");
                            }}
                          />
                        )}

                        {delivery.status === "Picked Up" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              setDeliveryStatus(delivery.id, "In Transit");
                              toast.success("Shipment marked In Transit on corridor");
                            }}
                          >
                            <Navigation className="mr-1.5 size-3.5" />
                            Mark In Transit
                          </Button>
                        )}

                        {delivery.status === "In Transit" && (
                          <ProofOfDeliveryModal
                            shipmentId={delivery.id}
                            orderQuantityKg={relatedOrder?.quantityKg || 1000}
                            expectedOtp={relatedOrder?.otpCode || "849201"}
                            onSuccess={({ hasDiscrepancy }) => {
                              setDeliveryStatus(delivery.id, "Delivered");
                              if (relatedOrder) {
                                setOrderStatus(
                                  relatedOrder.id,
                                  hasDiscrepancy ? "Disputed" : "Delivered",
                                );
                              }
                              toast.success("Delivery completed and recorded!");
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FLEET & KYB SECTION                                                    */}
      {/* ========================================================================= */}
      {activeSection === "fleet-kyb" && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="font-display text-lg font-bold">Fleet Telemetry & Tier-3 KYB Verification</h2>
            <p className="text-xs text-muted-foreground">
              Commercial haulage license, cold-chain temperature sensors, and vehicle fleet registry
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="size-5 text-primary" />
                <h3 className="font-display text-base font-bold">Registered Fleet Vehicles</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-muted/40">
                  <span>Refrigerated Truck (30T):</span>
                  <strong className="text-foreground">KMC-849-XA (Active GPS)</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-muted/40">
                  <span>Heavy Bulk Flatbed (40T):</span>
                  <strong className="text-foreground">ABJ-201-TR (Available)</strong>
                </div>
              </div>
            </Card>

            <Card className="p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h3 className="font-display text-base font-bold">Tier-3 KYB Compliance</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Verified commercial interstate transit carrier with goods-in-transit insurance.
              </p>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 bg-emerald-500/10">
                Tier-3 Fleet Insured & Verified
              </Badge>
            </Card>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
