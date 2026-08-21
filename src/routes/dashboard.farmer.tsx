import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { KYBVerificationModal } from "@/components/kyb/KYBVerificationModal";
import { ProduceUploadModal } from "@/components/marketplace/ProduceUploadModal";
import {
  Sprout,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Eye,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Sparkles,
  MapPin,
} from "lucide-react";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TrustScore } from "@/components/trust/TrustScore";
import { TrustBreakdownCard } from "@/components/trust/TrustBreakdownCard";
import { ProduceImage } from "@/components/marketplace/ProduceImage";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { useApp, formatNaira, timeAgo } from "@/lib/store";
import type { ProduceCategory } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/farmer")({
  head: () => ({
    meta: [{ title: "Farmer Dashboard — Abdul Farms | Agrolink" }],
  }),
  component: FarmerDashboard,
});

function FarmerDashboard() {
  const {
    state,
    currentUser,
    getTrust,
    getUser,
    createListing,
    toggleListing,
    setOrderStatus,
    refreshLiveState,
  } = useApp();

  const farmerId = currentUser?.id ?? "u-farmer-1";
  const farmer = currentUser ??
    getUser(farmerId) ?? {
      id: farmerId,
      name: "Commercial Farmer",
      role: "farmer" as const,
      businessName: "Agro Farm Enterprise",
      location: "Kano State",
      coords: { lat: 12.0022, lng: 8.592 },
      avatar: "CF",
      phone: "+234 800 000 0000",
      bio: "Commercial agricultural producer.",
      verified: true,
    };
  const trust = getTrust(farmerId);

  const myListings = state.produce.filter((p) => p.farmerId === farmerId);
  const myOrders = state.orders.filter((o) => o.farmerId === farmerId);

  const pendingOrders = myOrders.filter(
    (o) => o.status === "Pending" || o.status === "Accepted" || o.status === "Awaiting Pickup",
  );
  const completedOrders = myOrders.filter((o) => o.status === "Completed");

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // New listing dialog state
  const [openNewListing, setOpenNewListing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ProduceCategory>("Vegetables");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newLocation, setNewLocation] = useState(farmer.location);
  const [newDesc, setNewDesc] = useState("");

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newQty || !newPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    const created = createListing({
      name: newName,
      category: newCategory,
      quantityKg: Number(newQty),
      pricePerKg: Number(newPrice),
      location: newLocation || farmer.location,
      image: `/images/${newName.toLowerCase().includes("tomato") ? "tomatoes" : newName.toLowerCase().includes("maize") ? "maize" : "cassava"}.jpg`,
      description: newDesc || `Freshly harvested ${newName} from ${farmer.name}.`,
    });

    toast.success(`Published listing for ${created.name}`);
    setOpenNewListing(false);
    setNewName("");
    setNewQty("");
    setNewPrice("");
    setNewDesc("");
  };

  return (
    <Page>
      <PageHeader
        title="My Agrolink Network"
        subtitle={`${farmer.name} (${farmer.location}) · Manage produce listings, track buyer orders, and build your reputation.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
              <Link to="/insights">
                <Sparkles className="mr-1.5 size-4" />
                AI Crop Scanner
              </Link>
            </Button>
            <KYBVerificationModal
              currentTier={farmer.role === "farmer" ? 2 : 1}
              isVerified={true}
            />
            <ProduceUploadModal />
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
                <p className="text-xs text-muted-foreground">
                  {trust.level} · {trust.rating}★ Rating
                </p>
              </div>
              <TrustScore trust={trust} size="sm" showLabel={false} />
            </Card>
          </motion.div>
        )}
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Active Listings"
            value={myListings.length}
            hint={`${myListings.reduce((sum, p) => sum + p.quantityKg, 0).toLocaleString()}kg total stock`}
            icon={Package}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Pending Orders"
            value={pendingOrders.length}
            hint={`${pendingOrders.reduce((sum, o) => sum + o.quantityKg, 0).toLocaleString()}kg to fulfill`}
            icon={Clock}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Completed Revenue"
            value={formatNaira(totalRevenue)}
            hint={`${completedOrders.length} completed transactions`}
            icon={TrendingUp}
          />
        </motion.div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Orders & Inventory */}
        <div className="space-y-8">
          {/* Active Orders Queue */}
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-display text-xl font-bold">Incoming & Active Orders</h2>
                <p className="text-xs text-muted-foreground">
                  Review buyer trust, accept orders, and mark produce ready for hauler pickup
                </p>
              </div>
              <Badge variant="secondary">{pendingOrders.length} Active</Badge>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No active orders at the moment. New buyer orders will appear here automatically.
              </div>
            ) : (
              <div className="divide-y">
                {pendingOrders.map((order) => {
                  const buyer = getUser(order.buyerId);
                  const buyerTrust = getTrust(order.buyerId);
                  const produceItem = state.produce.find((p) => p.id === order.produceId);
                  const delivery = state.deliveries.find((d) => d.id === order.deliveryId);

                  return (
                    <div key={order.id} className="py-4 space-y-3 first:pt-4 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {order.quantityKg}kg of {produceItem?.name ?? "Produce"}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Ordered by{" "}
                            <span className="font-semibold text-foreground">
                              {buyer?.name ?? "Buyer"}
                            </span>{" "}
                            ({buyer?.location}) · {timeAgo(order.createdAt)}
                          </p>
                        </div>
                        <span className="font-display text-base font-bold">
                          {formatNaira(order.totalPrice)}
                        </span>
                      </div>

                      {/* Buyer Trust & Delivery Snippet */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Buyer Trust:</span>
                          {buyerTrust && (
                            <span className="font-semibold text-success flex items-center gap-1">
                              <ShieldCheck className="size-3.5" />
                              {buyerTrust.score} ({buyerTrust.level})
                            </span>
                          )}
                        </div>
                        {delivery && (
                          <div className="text-muted-foreground">
                            Haulage:{" "}
                            <span className="font-medium text-foreground">
                              {delivery.status} ({delivery.distanceKm}km)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons for Farmer */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {order.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setOrderStatus(order.id, "Accepted");
                                toast.success(`Order ${order.id} accepted`);
                              }}
                            >
                              Accept Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setOrderStatus(order.id, "Cancelled");
                                toast.warning(`Order ${order.id} declined`);
                              }}
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {order.status === "Accepted" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setOrderStatus(order.id, "Awaiting Pickup");
                              toast.success(
                                `Order ${order.id} marked as ready and awaiting hauler pickup`,
                              );
                            }}
                          >
                            Mark Ready for Pickup
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Manage Produce Listings */}
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-display text-xl font-bold">My Produce Inventory</h2>
                <p className="text-xs text-muted-foreground">
                  Manage active listings, toggle availability, and check prices
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {myListings.length} total
              </span>
            </div>

            <div className="mt-4 divide-y">
              {myListings.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <ProduceImage
                      name={item.name}
                      category={item.category}
                      src={item.image}
                      className="size-16 rounded-xl shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{item.name}</h3>
                        <Badge
                          variant={item.available ? "secondary" : "outline"}
                          className="text-[11px]"
                        >
                          {item.available ? "Live" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.quantityKg.toLocaleString()}kg remaining · Listed{" "}
                        {timeAgo(item.listedAt)}
                      </p>
                      <p className="mt-1 font-display text-sm font-bold text-primary">
                        {formatNaira(item.pricePerKg)}
                        <span className="text-xs font-normal text-muted-foreground">/kg</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toggleListing(item.id);
                        toast.info(
                          `${item.name} is now ${item.available ? "hidden" : "visible on marketplace"}`,
                        );
                      }}
                    >
                      {item.available ? (
                        <>
                          <ToggleRight className="mr-1.5 size-4 text-success" />
                          Available
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="mr-1.5 size-4 text-muted-foreground" />
                          Hidden
                        </>
                      )}
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/marketplace/$produceId" params={{ produceId: item.id }}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Trust Model, AI Assistant & Profile Stats */}
        <div className="space-y-6">
          {trust && (
            <TrustBreakdownCard
              trustProfile={{
                userId: farmer.id,
                score: trust.score,
                level: trust.level,
                rating: trust.rating,
                completedTransactions: trust.completedTransactions,
                successfulDeliveries: trust.successfulDeliveries,
                successfulOrders: trust.completedTransactions,
                cancelledOrders: trust.cancelledOrders,
                fulfilmentRate: trust.fulfilmentRate,
                cancellationRate: trust.cancellationRate,
                disputeRate: 0,
                lateRate: 0,
                isVerified: trust.verified,
                history: trust.history.map((h, i) => ({
                  id: `th-${i}`,
                  userId: farmer.id,
                  type: "TRANSACTION_COMPLETED",
                  scoreDelta: 2,
                  resultingScore: h.score,
                  reason: h.reason,
                  timestamp: h.date,
                })),
                updatedAt: new Date().toISOString(),
              }}
            />
          )}

          <AIAssistant role="farmer" />

          {/* Quick Profile Summary */}
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Farm Details</h3>
              <Button asChild variant="link" size="sm" className="p-0 h-auto">
                <Link to="/profile/$userId" params={{ userId: farmer.id }}>
                  Full Profile
                </Link>
              </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{farmer.bio}</p>
            <div className="mt-4 space-y-2 text-xs border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{farmer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Location:</span>
                <span className="font-medium">{farmer.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed Sales:</span>
                <span className="font-medium">{completedOrders.length} orders</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
