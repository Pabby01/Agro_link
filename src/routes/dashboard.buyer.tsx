import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { KYBVerificationModal } from "@/components/kyb/KYBVerificationModal";
import { DisputeModal } from "@/components/disputes/DisputeModal";
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
} from "lucide-react";
import { Page, PageHeader } from "@/components/layout/AppShell";
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
import { ProduceImage } from "@/components/marketplace/ProduceImage";
import { AIAssistant } from "@/components/ai/AIAssistant";
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
  const { state, currentUser, getTrust, getUser, rateCounterparty, refreshLiveState } = useApp();

  const buyerId = currentUser?.id ?? "u-buyer-1";
  const buyer = currentUser ??
    getUser(buyerId) ?? {
      id: buyerId,
      name: "Verified Commercial Buyer",
      role: "buyer" as const,
      businessName: "Agro Distribution Hub",
      location: "Lagos State",
      coords: { lat: 6.5244, lng: 3.3792 },
      avatar: "VB",
      phone: "+234 800 000 0000",
      bio: "Wholesale food distributor and commodity buyer.",
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

    // Rate Farmer
    rateCounterparty(ratingOrder.id, ratingOrder.farmerId, farmerRating);

    // Rate Transporter if assigned
    const delivery = state.deliveries.find((d) => d.id === ratingOrder.deliveryId);
    if (delivery?.transporterId) {
      rateCounterparty(ratingOrder.id, delivery.transporterId, transporterRating);
    }

    toast.success("Ratings submitted and trust scores updated!");
    setRatingOrder(null);
  };

  return (
    <Page>
      <PageHeader
        title="My Agrolink Network"
        subtitle={`${buyer.name} (${buyer.location}) · Discover trusted suppliers, track orders, and manage deliveries.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
              <Link to="/insights">
                <Sparkles className="mr-1.5 size-4" />
                AI Intelligence Hub
              </Link>
            </Button>
            <KYBVerificationModal currentTier={buyer.role === "buyer" ? 2 : 1} isVerified={true} />
            <Button asChild className="font-semibold shadow-xs">
              <Link to="/marketplace">
                <ShoppingBasket className="mr-1.5 size-4" />
                Browse Marketplace
              </Link>
            </Button>
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
                  Trust Score
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-success">
                  {trust.score}/100
                </p>
                <p className="text-xs text-muted-foreground">{trust.level} · Verified Buyer</p>
              </div>
              <TrustScore trust={trust} size="sm" showLabel={false} />
            </Card>
          </motion.div>
        )}
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Active Orders"
            value={activeOrders.length}
            hint={`${activeOrders.reduce((sum, o) => sum + o.quantityKg, 0).toLocaleString()}kg in transit/pending`}
            icon={Clock}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Completed Orders"
            value={completedOrders.length}
            hint={`${completedOrders.reduce((sum, o) => sum + o.quantityKg, 0).toLocaleString()}kg delivered`}
            icon={CheckCircle2}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Total Purchases"
            value={formatNaira(totalSpent)}
            hint="Direct farm gate value"
            icon={Package}
          />
        </motion.div>
      </motion.div>

      {/* Active Orders Tracker */}
      <div className="mt-8 space-y-8">
        <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Active Orders & Delivery Tracking</h2>
              <p className="text-xs text-muted-foreground">
                Track real-time shipment milestones from farm gate to your warehouse
              </p>
            </div>
            <Badge variant="secondary">{activeOrders.length} Active</Badge>
          </div>

          {activeOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <p>You have no active orders in transit.</p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/marketplace">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {activeOrders.map((order) => {
                const farmer = getUser(order.farmerId);
                const farmerTrust = getTrust(order.farmerId);
                const produceItem = state.produce.find((p) => p.id === order.produceId);
                const delivery = state.deliveries.find((d) => d.id === order.deliveryId);
                const transporter = delivery?.transporterId
                  ? getUser(delivery.transporterId)
                  : null;
                const transporterTrust = delivery?.transporterId
                  ? getTrust(delivery.transporterId)
                  : null;

                const isDelivered =
                  delivery?.status === "Delivered" || order.status === "Delivered";

                return (
                  <div key={order.id} className="py-6 space-y-4 first:pt-4 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {produceItem && (
                          <ProduceImage
                            name={produceItem.name}
                            category={produceItem.category}
                            src={produceItem.image}
                            className="size-16 rounded-xl shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">
                              {order.quantityKg.toLocaleString()}kg {produceItem?.name ?? "Produce"}
                            </h3>
                            <StatusBadge status={delivery?.status ?? order.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Supplier:{" "}
                            <span className="font-semibold text-foreground">{farmer?.name}</span> (
                            {farmer?.location}) · Order ID: {order.id}
                          </p>
                          <p className="mt-1 font-display text-sm font-bold text-primary">
                            {formatNaira(order.totalPrice)}
                            {delivery && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (+{formatNaira(delivery.fee)} haulage)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Complete / Rate button if delivered */}
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
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

                        {isDelivered && !order.ratedByBuyer && (
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            onClick={() => setRatingOrder(order)}
                          >
                            <Star className="mr-1.5 size-4" />
                            Confirm & Rate Counterparties
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Delivery OTP Badge */}
                    <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs">
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
                        Provide this code to the driver upon physical cargo inspection
                      </span>
                    </div>

                    {/* Milestone Progress Stepper */}
                    <div className="rounded-xl border bg-muted/40 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Shipment Milestones
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div
                          className={`rounded-lg p-2.5 font-medium ${
                            order.status !== "Cancelled"
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted"
                          }`}
                        >
                          1. Order Placed
                        </div>
                        <div
                          className={`rounded-lg p-2.5 font-medium ${
                            order.status === "Awaiting Pickup" ||
                            order.status === "In Transit" ||
                            order.status === "Delivered" ||
                            order.status === "Completed"
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          2. Farmer Ready
                        </div>
                        <div
                          className={`rounded-lg p-2.5 font-medium ${
                            order.status === "In Transit" ||
                            order.status === "Delivered" ||
                            order.status === "Completed"
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          3. In Transit
                        </div>
                        <div
                          className={`rounded-lg p-2.5 font-medium ${
                            order.status === "Delivered" || order.status === "Completed"
                              ? "bg-success text-success-foreground font-semibold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          4. Delivered
                        </div>
                      </div>

                      {delivery && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                          <span>
                            Route: {delivery.pickup.label} → {delivery.destination.label} (
                            {delivery.distanceKm}km)
                          </span>
                          {transporter && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Truck className="size-3.5 text-primary" />
                              Hauler: {transporter.name} ({transporterTrust?.score} Trust)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Completed Orders History */}
        <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Past Completed Purchases</h2>
              <p className="text-xs text-muted-foreground">
                History of fulfilled contracts with verified farmer counterparties
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {completedOrders.length} completed
            </span>
          </div>

          <div className="mt-4 divide-y">
            {completedOrders.map((order) => {
              const farmer = getUser(order.farmerId);
              const produceItem = state.produce.find((p) => p.id === order.produceId);

              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-success/15 text-success font-semibold">
                      <CheckCircle2 className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-sm">
                        {order.quantityKg.toLocaleString()}kg of {produceItem?.name ?? "Produce"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Farmer: {farmer?.name} ({farmer?.location}) · {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="font-display font-bold text-sm">
                      {formatNaira(order.totalPrice)}
                    </span>
                    <Badge variant="outline" className="text-success border-success/40">
                      Fulfilled
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Counterparty Rating Dialog */}
      <Dialog open={!!ratingOrder} onOpenChange={(o) => !o && setRatingOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Rate Your Counterparties</DialogTitle>
            <DialogDescription>
              Your rating updates the trust scores of the farmer and transporter across the network.
            </DialogDescription>
          </DialogHeader>

          {ratingOrder && (
            <div className="space-y-6 pt-2">
              {/* Rate Farmer */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/30">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm">
                    Farmer: {getUser(ratingOrder.farmerId)?.name}
                  </p>
                  <span className="text-xs text-muted-foreground">Produce Quality & Grade</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFarmerRating(star)}
                      className="p-1 text-gold hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`size-6 ${
                          star <= farmerRating ? "fill-gold text-gold" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm">{farmerRating}/5 Stars</span>
                </div>
              </div>

              {/* Rate Transporter */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/30">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm">Transporter Logistics</p>
                  <span className="text-xs text-muted-foreground">Timeliness & Care</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTransporterRating(star)}
                      className="p-1 text-gold hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`size-6 ${
                          star <= transporterRating
                            ? "fill-gold text-gold"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm">{transporterRating}/5 Stars</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRatingOrder(null)}>
                  Cancel
                </Button>
                <Button onClick={handleRateSubmit} className="font-bold">
                  Submit Ratings & Complete Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}
