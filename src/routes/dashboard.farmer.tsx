import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sprout,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sparkles,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Eye,
  Building2,
  Truck,
  Leaf,
  Layers,
} from "lucide-react";
import { DashboardShell, type DashboardSection } from "@/components/dashboard/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TrustScore } from "@/components/trust/TrustScore";
import { TrustBreakdownCard } from "@/components/trust/TrustBreakdownCard";
import { ProduceImage } from "@/components/marketplace/ProduceImage";
import { KYBVerificationModal } from "@/components/kyb/KYBVerificationModal";
import { ProduceUploadModal } from "@/components/marketplace/ProduceUploadModal";
import { CropScanner } from "@/components/ai/CropScanner";
import { useApp, formatNaira, timeAgo } from "@/lib/store";
import { fadeInUp, staggerContainer } from "@/lib/animations";
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
    toggleListing,
    setOrderStatus,
  } = useApp();

  const [activeSection, setActiveSection] = useState<string>("overview");

  const farmerId = currentUser?.id ?? "u-farmer-1";
  const farmer = currentUser ??
    getUser(farmerId) ?? {
      id: farmerId,
      name: "Abdul Farms",
      role: "farmer" as const,
      businessName: "Abdul Farms Enterprise",
      location: "Kano State",
      coords: { lat: 12.0022, lng: 8.592 },
      avatar: "AF",
      phone: "+234 800 000 0000",
      bio: "Commercial tomato and grain producer.",
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

  const sections: DashboardSection[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Layers,
    },
    {
      id: "listings",
      label: "My Listings",
      icon: Package,
      count: myListings.length,
    },
    {
      id: "orders",
      label: "Incoming Orders",
      icon: Clock,
      count: pendingOrders.length,
      badge: pendingOrders.length > 0 ? `${pendingOrders.length} New` : undefined,
    },
    {
      id: "trust",
      label: "Trust & KYB",
      icon: ShieldCheck,
      badge: trust ? `${trust.score} Score` : undefined,
    },
    {
      id: "crop-doctor",
      label: "AI Crop Doctor",
      icon: Sparkles,
      highlight: true,
      badge: "AI Vision",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["farmer"]}>
      <DashboardShell
        title={farmer.name}
      subtitle={`${farmer.location} · Commercial Producer Hub`}
      role="farmer"
      roleBadgeText="Farmer"
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <KYBVerificationModal currentTier={2} isVerified={trust?.verified ?? true} />
          <ProduceUploadModal />
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
                    Trust Rating
                  </p>
                  <p className="mt-0.5 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {trust.score}/100
                  </p>
                  <p className="text-xs text-muted-foreground">{trust.level} · {trust.rating}★</p>
                </div>
                <TrustScore trust={trust} size="sm" showLabel={false} />
              </Card>
            )}
            <DashboardCard
              label="Active Produce"
              value={myListings.length}
              hint={`${myListings.reduce((sum, p) => sum + p.quantityKg, 0).toLocaleString()} kg in stock`}
              icon={Package}
            />
            <DashboardCard
              label="Pending Orders"
              value={pendingOrders.length}
              hint={`${pendingOrders.reduce((sum, o) => sum + o.quantityKg, 0).toLocaleString()} kg awaiting dispatch`}
              icon={Clock}
            />
            <DashboardCard
              label="Fulfill Revenue"
              value={formatNaira(totalRevenue)}
              hint={`${completedOrders.length} fulfilled orders`}
              icon={TrendingUp}
            />
          </div>

          {/* Quick Action Split Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Orders Teaser */}
            <Card className="p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-display text-base font-bold">Active Orders Queue</h3>
                  <p className="text-xs text-muted-foreground">Buyers awaiting your fulfillment</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-bold text-primary"
                  onClick={() => setActiveSection("orders")}
                >
                  View All ({pendingOrders.length})
                </Button>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No active orders right now. New buyer purchase orders will appear here automatically.
                </div>
              ) : (
                <div className="divide-y">
                  {pendingOrders.slice(0, 3).map((order) => {
                    const buyer = getUser(order.buyerId);
                    const produceItem = state.produce.find((p) => p.id === order.produceId);
                    return (
                      <div key={order.id} className="flex items-center justify-between py-2.5 text-xs">
                        <div>
                          <p className="font-bold text-foreground">
                            {order.quantityKg}kg {produceItem?.name ?? "Produce"}
                          </p>
                          <p className="text-muted-foreground">
                            Buyer: {buyer?.name} ({buyer?.location})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status} />
                          <span className="font-bold text-foreground font-mono">
                            {formatNaira(order.totalPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* AI Crop Doctor Teaser */}
            <Card className="p-5 shadow-xs space-y-3 bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                  <Leaf className="size-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    AI Crop Doctor & Vision
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Diagnose leaf pathogens & protect market yields
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan your crop photos for instant disease detection in English, Yorùbá, Hausa, or Igbo,
                with direct linkage to listing your harvest in the marketplace.
              </p>
              <Button
                size="sm"
                className="w-full font-bold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setActiveSection("crop-doctor")}
              >
                <Sparkles className="mr-1.5 size-3.5" />
                Open AI Crop Scanner
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MY LISTINGS SECTION                                                   */}
      {/* ========================================================================= */}
      {activeSection === "listings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold">Produce Inventory & Stock</h2>
              <p className="text-xs text-muted-foreground">
                Manage your active agricultural catalog and farm gate pricing per kg
              </p>
            </div>
            <ProduceUploadModal />
          </div>

          {myListings.length === 0 ? (
            <Card className="p-10 text-center text-xs text-muted-foreground">
              You have no active listings. Click <strong>+ Add Produce Listing</strong> above to post your harvest.
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myListings.map((item) => (
                <Card key={item.id} className="p-4 shadow-xs space-y-3">
                  <div className="flex gap-3">
                    <ProduceImage
                      name={item.name}
                      category={item.category}
                      className="size-16 rounded-xl object-cover shrink-0 border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm truncate text-foreground">{item.name}</h4>
                        <Badge variant={item.available ? "outline" : "secondary"} className="text-[10px] shrink-0">
                          {item.available ? "Live" : "Paused"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.category} · {item.location}</p>
                      <p className="font-display text-sm font-bold text-primary mt-1">
                        {formatNaira(item.pricePerKg)}/kg
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                    <span>Stock: <strong className="text-foreground">{item.quantityKg.toLocaleString()}kg</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        toggleListing(item.id);
                        toast.success(`Updated availability for ${item.name}`);
                      }}
                      className="flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {item.available ? (
                        <>
                          <ToggleRight className="size-4 text-emerald-600" /> Mark Paused
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="size-4" /> Mark Active
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INCOMING ORDERS SECTION                                               */}
      {/* ========================================================================= */}
      {activeSection === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold">Buyer Order Queue</h2>
              <p className="text-xs text-muted-foreground">
                Accept incoming purchase contracts and notify haulers when cargo is packed
              </p>
            </div>
            <Badge variant="secondary">{pendingOrders.length} Active</Badge>
          </div>

          {pendingOrders.length === 0 ? (
            <Card className="p-10 text-center text-xs text-muted-foreground">
              No pending buyer orders at this moment.
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => {
                const buyer = getUser(order.buyerId);
                const buyerTrust = getTrust(order.buyerId);
                const produceItem = state.produce.find((p) => p.id === order.produceId);
                const delivery = state.deliveries.find((d) => d.id === order.deliveryId);

                return (
                  <Card key={order.id} className="p-4 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {order.quantityKg}kg {produceItem?.name ?? "Produce"}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Buyer: <strong>{buyer?.name}</strong> ({buyer?.location}) · {timeAgo(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-base font-bold text-foreground">
                          {formatNaira(order.totalPrice)}
                        </span>
                        {buyerTrust && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <ShieldCheck className="size-3" /> {buyerTrust.score} Trust ({buyerTrust.level})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      {delivery && (
                        <span className="text-muted-foreground">
                          Corridor: <strong>{delivery.status}</strong> ({delivery.distanceKm}km)
                        </span>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        {order.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setOrderStatus(order.id, "Accepted");
                                toast.success(`Order accepted`);
                              }}
                            >
                              Accept Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setOrderStatus(order.id, "Cancelled");
                                toast.warning(`Order declined`);
                              }}
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {order.status === "Accepted" && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                              setOrderStatus(order.id, "Awaiting Pickup");
                              toast.success(`Produce marked ready for hauler pickup`);
                            }}
                          >
                            <Package className="mr-1.5 size-3.5" />
                            Mark Ready for Hauler Pickup
                          </Button>
                        )}

                        {order.status === "Awaiting Pickup" && (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                            Awaiting Transporter Arrival
                          </Badge>
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
      {/* 4. TRUST & KYB SECTION                                                    */}
      {/* ========================================================================= */}
      {activeSection === "trust" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold">Trust Profile & Governance</h2>
              <p className="text-xs text-muted-foreground">
                Your reputation metrics, fulfillment track record, and CAC verification
              </p>
            </div>
            <KYBVerificationModal currentTier={2} isVerified={trust?.verified ?? true} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {trust && <TrustBreakdownCard trustProfile={trust} />}

            <Card className="p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Building2 className="size-4 text-primary" />
                <h3 className="font-display text-base font-bold">Tier-2 KYB Enterprise Verification</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">CAC Registration:</span>
                  <strong className="text-foreground">RC-849201 (Verified)</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Tax Identification (TIN):</span>
                  <strong className="text-foreground">20489102-0001 (Active)</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground">Escrow Limit:</span>
                  <strong className="text-emerald-600 font-bold">₦25,000,000 / order</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AI CROP DOCTOR SECTION                                                 */}
      {/* ========================================================================= */}
      {activeSection === "crop-doctor" && (
        <div>
          <CropScanner />
        </div>
      )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
