import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingBasket,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  ShieldCheck,
  Package,
  MapPin,
  Sparkles,
  Layers,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { DashboardShell, type DashboardSection } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TrustScore } from "@/components/trust/TrustScore";
import { DisputeModal } from "@/components/disputes/DisputeModal";
import { KYBVerificationModal } from "@/components/kyb/KYBVerificationModal";
import { useApp, formatNaira, timeAgo } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { Order } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/buyer")({
  head: () => ({
    meta: [{ title: "Buyer Dashboard — FreshMart Retail | Agrolink" }],
  }),
  component: BuyerDashboard,
});

function BuyerDashboard() {
  const {
    state,
    currentUser,
    getTrust,
    getUser,
    rateCounterparty,
    refreshLiveState,
  } = useApp();

  const [activeSection, setActiveSection] = useState<string>("overview");

  const buyerId = currentUser?.id ?? "u-buyer-1";
  const buyer = currentUser ??
    getUser(buyerId) ?? {
      id: buyerId,
      name: "FreshMart Retail",
      role: "buyer" as const,
      businessName: "FreshMart Distribution Hub",
      location: "Lagos State",
      coords: { lat: 6.5244, lng: 3.3792 },
      avatar: "FM",
      phone: "+234 800 000 0000",
      bio: "Wholesale food distributor and supermarket supplier.",
      verified: true,
    };
  const trust = getTrust(buyerId);

  const myOrders = state.orders.filter((o) => o.buyerId === buyerId);
  const activeOrders = myOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled");
  const completedOrders = myOrders.filter((o) => o.status === "Completed");
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Rating Modal State
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [farmerRating, setFarmerRating] = useState(5);
  const [transporterRating, setTransporterRating] = useState(5);

  const handleRateSubmit = () => {
    if (!ratingOrder) return;
    rateCounterparty(ratingOrder.id, ratingOrder.farmerId, farmerRating);

    const delivery = state.deliveries.find((d) => d.id === ratingOrder.deliveryId);
    if (delivery?.transporterId) {
      rateCounterparty(ratingOrder.id, delivery.transporterId, transporterRating);
    }

    toast.success("Ratings submitted and trust scores updated (+2 pts)!");
    setRatingOrder(null);
  };

  const sections: DashboardSection[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Layers,
    },
    {
      id: "deliveries",
      label: "Active Deliveries",
      icon: Truck,
      count: activeOrders.length,
      badge: activeOrders.length > 0 ? "Tracking" : undefined,
    },
    {
      id: "orders",
      label: "Order History",
      icon: Clock,
      count: completedOrders.length,
    },
    {
      id: "disputes",
      label: "Disputes & Escrow",
      icon: Scale,
    },
  ];

  return (
    <DashboardShell
      title={buyer.name}
      subtitle={`${buyer.location} · Commercial Food Distribution`}
      role="buyer"
      roleBadgeText="Buyer"
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <KYBVerificationModal currentTier={2} isVerified={trust?.verified ?? true} />
          <Button asChild size="sm" className="font-semibold shadow-xs">
            <Link to="/marketplace">
              <ShoppingBasket className="mr-1.5 size-4" />
              Browse Marketplace
            </Link>
          </Button>
        </div>
      }
    >
      {/* ========================================================================= */}
      {/* 1. OVERVIEW SECTION                                                      */}
      {/* ========================================================================= */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* KPI Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust && (
              <Card className="flex items-center justify-between p-4 shadow-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Buyer Trust
                  </p>
                  <p className="mt-0.5 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {trust.score}/100
                  </p>
                  <p className="text-xs text-muted-foreground">{trust.level} · Verified</p>
                </div>
                <TrustScore trust={trust} size="sm" showLabel={false} />
              </Card>
            )}
            <DashboardCard
              label="Active Shipments"
              value={activeOrders.length}
              hint={`${activeOrders.reduce((sum, o) => sum + o.quantityKg, 0).toLocaleString()} kg in transit`}
              icon={Truck}
            />
            <DashboardCard
              label="Completed Orders"
              value={completedOrders.length}
              hint={`${completedOrders.reduce((sum, o) => sum + o.quantityKg, 0).toLocaleString()} kg fulfilled`}
              icon={CheckCircle2}
            />
            <DashboardCard
              label="Total Purchased"
              value={formatNaira(totalSpent)}
              hint="100% Bank Escrow Protected"
              icon={Package}
            />
          </div>

          {/* Quick Active Deliveries Teaser */}
          <Card className="p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-display text-base font-bold">Active Deliveries & Cargo In Transit</h3>
                <p className="text-xs text-muted-foreground">Track shipments and inspect delivery OTP codes</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-bold text-primary"
                onClick={() => setActiveSection("deliveries")}
              >
                View Details ({activeOrders.length})
              </Button>
            </div>

            {activeOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active in-transit shipments right now. Browse the marketplace to place a new order.
              </div>
            ) : (
              <div className="divide-y">
                {activeOrders.slice(0, 2).map((order) => {
                  const farmer = getUser(order.farmerId);
                  const produceItem = state.produce.find((p) => p.id === order.produceId);
                  return (
                    <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {order.quantityKg}kg {produceItem?.name ?? "Produce"}
                        </p>
                        <p className="text-muted-foreground">
                          From: <strong>{farmer?.name}</strong> ({farmer?.location})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-primary text-sm">
                          {formatNaira(order.totalPrice)}
                        </span>
                        <StatusBadge status={order.status} />
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
      {/* 2. ACTIVE DELIVERIES SECTION                                             */}
      {/* ========================================================================= */}
      {activeSection === "deliveries" && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="font-display text-lg font-bold">Active Deliveries & Tracking</h2>
            <p className="text-xs text-muted-foreground">
              Verify cargo arrival, provide OTP to transporter, and release escrow
            </p>
          </div>

          {activeOrders.length === 0 ? (
            <Card className="p-10 text-center text-xs text-muted-foreground">
              You have no active orders in transit.
            </Card>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const farmer = getUser(order.farmerId);
                const produceItem = state.produce.find((p) => p.id === order.produceId);
                const delivery = state.deliveries.find((d) => d.id === order.deliveryId);
                const transporter = delivery?.transporterId ? getUser(delivery.transporterId) : null;
                const isDelivered = order.status === "Delivered";

                return (
                  <Card key={order.id} className="p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">
                            {order.quantityKg.toLocaleString()}kg {produceItem?.name ?? "Produce"}
                          </h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Farmer: <strong>{farmer?.name}</strong> ({farmer?.location}) · {timeAgo(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-base font-bold text-primary">
                          {formatNaira(order.totalPrice)}
                        </p>
                        {delivery && (
                          <p className="text-[11px] text-muted-foreground">
                            Haulage: {formatNaira(delivery.fee)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Verification OTP Code Box */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        <span className="text-foreground">
                          Delivery Verification OTP:{" "}
                          <strong className="font-mono text-sm tracking-widest text-primary">
                            849201
                          </strong>
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        Share with driver upon physical weight verification
                      </span>
                    </div>

                    {/* Milestone Progress Stepper */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="rounded-lg p-2 bg-primary text-primary-foreground font-semibold">
                        1. Placed
                      </div>
                      <div className={`rounded-lg p-2 font-semibold ${order.status !== "Pending" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        2. Packed
                      </div>
                      <div className={`rounded-lg p-2 font-semibold ${order.status === "In Transit" || order.status === "Delivered" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        3. In Transit
                      </div>
                      <div className={`rounded-lg p-2 font-semibold ${order.status === "Delivered" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                        4. Delivered
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                      {delivery && (
                        <span className="text-xs text-muted-foreground">
                          Corridor: {delivery.pickup.label} → {delivery.destination.label} ({delivery.distanceKm}km)
                        </span>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <DisputeModal
                          orderId={order.id}
                          orderAmount={order.totalPrice}
                          respondentName={farmer?.name || "Farmer"}
                          onSubmitDispute={async (data) => {
                            await api.disputes.create({
                              orderId: order.id,
                              reason: data.reason,
                              description: data.description,
                              evidenceUrls: data.evidenceUrl ? [data.evidenceUrl] : [],
                            });
                            refreshLiveState();
                          }}
                        />

                        {isDelivered && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            onClick={() => setRatingOrder(order)}
                          >
                            <Star className="mr-1.5 size-3.5" />
                            Confirm Cargo & Rate Counterparties
                          </Button>
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
      {/* 3. ORDER HISTORY SECTION                                                 */}
      {/* ========================================================================= */}
      {activeSection === "orders" && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="font-display text-lg font-bold">Fulfilled Purchases History</h2>
            <p className="text-xs text-muted-foreground">
              Past completed contracts with verified farmers and haulers
            </p>
          </div>

          {completedOrders.length === 0 ? (
            <Card className="p-10 text-center text-xs text-muted-foreground">
              No completed order history yet.
            </Card>
          ) : (
            <div className="divide-y rounded-2xl border bg-card p-4">
              {completedOrders.map((order) => {
                const farmer = getUser(order.farmerId);
                const produceItem = state.produce.find((p) => p.id === order.produceId);
                return (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 font-bold">
                        <CheckCircle2 className="size-4" />
                      </span>
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {order.quantityKg.toLocaleString()}kg {produceItem?.name ?? "Produce"}
                        </p>
                        <p className="text-muted-foreground">
                          Farmer: {farmer?.name} ({farmer?.location}) · {timeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground">
                        {formatNaira(order.totalPrice)}
                      </span>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                        Fulfilled
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DISPUTES & ESCROW SECTION                                             */}
      {/* ========================================================================= */}
      {activeSection === "disputes" && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="font-display text-lg font-bold">Escrow Protection & Dispute Resolution</h2>
            <p className="text-xs text-muted-foreground">
              Every Agrolink purchase is backed by locked bank escrow until physical weighbridge sign-off
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h3 className="font-display text-base font-bold">How Escrow Protects You</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When you place an order, funds are held safely in Agrolink Escrow. If there is a cargo shortage
                or quality mismatch, you can open an instant dispute for a partial or full refund before funds are disbursed.
              </p>
            </Card>

            <Card className="p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="size-5 text-primary" />
                <h3 className="font-display text-base font-bold">Open Disputes Desk</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Have a discrepancy on an active delivery? Open your active delivery card and tap <strong>Open Dispute</strong>.
              </p>
              <Button size="sm" variant="outline" onClick={() => setActiveSection("deliveries")}>
                View Active Shipments
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Counterparty Rating Dialog */}
      <Dialog open={!!ratingOrder} onOpenChange={(o) => !o && setRatingOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Rate Your Counterparties
            </DialogTitle>
            <DialogDescription className="text-xs">
              Your feedback updates the public Trust Score of the farmer and hauler.
            </DialogDescription>
          </DialogHeader>

          {ratingOrder && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2 rounded-xl border p-3 bg-muted/30 text-xs">
                <p className="font-bold">Farmer: {getUser(ratingOrder.farmerId)?.name}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFarmerRating(s)}
                      className={`text-base cursor-pointer ${s <= farmerRating ? "text-amber-500" : "text-muted-foreground/40"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setRatingOrder(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleRateSubmit}>
                  Submit Ratings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
