import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Package,
  ShoppingBasket,
  Truck,
  ExternalLink,
} from "lucide-react";
import { Page } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrustScore } from "@/components/trust/TrustScore";
import { TrustBreakdown } from "@/components/trust/TrustBreakdown";
import { ProduceCard } from "@/components/marketplace/ProduceCard";
import { useApp, formatNaira, timeAgo } from "@/lib/store";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({
    meta: [
      { title: `User Trust Profile — Agrolink` },
      {
        name: "description",
        content: "View verified user trust metrics and transaction history on Agrolink.",
      },
    ],
  }),
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { getUser, getTrust, state } = useApp();

  const user = getUser(userId);
  const trust = getTrust(userId);

  if (!user) {
    return (
      <Page>
        <h1 className="font-display text-2xl font-bold">Profile Not Found</h1>
        <p className="mt-2 text-muted-foreground">The requested user profile does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </Page>
    );
  }

  const farmerListings = state.produce.filter((p) => p.farmerId === user.id);
  const userOrders = state.orders.filter((o) => o.buyerId === user.id || o.farmerId === user.id);
  const userDeliveries = state.deliveries.filter((d) => d.transporterId === user.id);

  return (
    <Page>
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to marketplace
      </Link>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1.8fr]"
      >
        {/* Left Column: User Bio & Trust Breakdown */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground shadow-sm">
                  {user.avatarInitials}
                </span>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">{user.name}</h1>
                  <Badge variant="secondary" className="capitalize mt-1 font-semibold">
                    {user.role}
                  </Badge>
                </div>
              </div>
              {trust && <TrustScore trust={trust} size="sm" showLabel={false} />}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{user.bio}</p>

            <Separator className="my-4" />

            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">{user.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="size-3.5 text-primary" />
                <span>
                  Member since{" "}
                  {new Date(user.joined).toLocaleDateString("en-NG", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">{user.phone}</span>
              </p>
            </div>
          </Card>

          {trust && (
            <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold">Reputation Breakdown</h2>
                  <p className="text-xs text-muted-foreground">
                    End-to-end multi-factor trust score
                  </p>
                </div>
                <TrustScore trust={trust} size="md" />
              </div>
              <div className="pt-4">
                <TrustBreakdown trust={trust} />
              </div>
            </Card>
          )}
        </motion.div>

        {/* Right Column: Role Activity, Listings, or History */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Farmer's Active Listings */}
          {user.role === "farmer" && (
            <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold">Active Produce Harvests</h2>
                  <p className="text-xs text-muted-foreground">
                    Direct farm gate produce currently available for dispatch
                  </p>
                </div>
                <Badge variant="secondary">{farmerListings.length} Available</Badge>
              </div>

              {farmerListings.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No active listings available right now.
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {farmerListings.map((item) => (
                    <ProduceCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Transaction & Fulfilment History */}
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-display text-xl font-bold">Verified Transaction History</h2>
                <p className="text-xs text-muted-foreground">
                  Completed trades and logistics milestones
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-success border-success/40 bg-success/10 font-bold"
              >
                100% On-Chain Escrow Verified
              </Badge>
            </div>

            {user.role === "transporter" ? (
              <div className="mt-4 divide-y">
                {userDeliveries.map((del) => (
                  <div key={del.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">Delivery #{del.id}</p>
                      <p className="text-muted-foreground">Corridor Trip · {del.status}</p>
                    </div>
                    <span className="font-display font-bold text-success">
                      {formatNaira(del.fee)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 divide-y">
                {userOrders.map((ord) => (
                  <div key={ord.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">Order #{ord.id}</p>
                      <p className="text-muted-foreground">
                        {ord.quantityKg}kg · {ord.status}
                      </p>
                    </div>
                    <span className="font-display font-bold text-foreground">
                      {formatNaira(ord.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </Page>
  );
}
