import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Snowflake,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Page } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { TrustScore } from "@/components/trust/TrustScore";
import { TrustBreakdown } from "@/components/trust/TrustBreakdown";
import { ProduceImage } from "@/components/marketplace/ProduceImage";
import { PricingBreakdownCard } from "@/components/marketplace/PricingBreakdownCard";
import { PricingService } from "@/features/payments/PricingService";
import { formatNaira, timeAgo, useApp } from "@/lib/store";
import { api } from "@/lib/api-client";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { toast } from "sonner";
import type { Delivery } from "@/lib/types";

export const Route = createFileRoute("/marketplace/$produceId")({
  head: () => ({
    meta: [
      { title: "Produce Details — Agrolink Marketplace" },
      {
        name: "description",
        content:
          "See pricing, available quantity, farmer trust breakdown and place an order with delivery in one step.",
      },
      { property: "og:title", content: "Produce Details — Agrolink" },
      {
        property: "og:description",
        content: "Farmer trust breakdown, pricing and one-step ordering.",
      },
    ],
  }),
  component: ProduceDetail,
});

function ProduceDetail() {
  const { produceId } = Route.useParams();
  const { getProduce, getUser, getTrust, placeOrder } = useApp();
  const router = useRouter();
  const item = getProduce(produceId);
  const [quantity, setQuantity] = useState(100);
  const [urgency, setUrgency] = useState<"Standard" | "Urgent" | "Cold Chain Refrigerated">(
    "Standard",
  );
  const [submitting, setSubmitting] = useState(false);

  if (!item) {
    return (
      <Page>
        <h1 className="font-display text-2xl font-bold">Listing not found</h1>
        <p className="mt-2 text-muted-foreground">
          This listing may have been removed or the data was refreshed.
        </p>
        <Button asChild className="mt-4 font-bold">
          <Link to="/marketplace">Back to marketplace</Link>
        </Button>
      </Page>
    );
  }

  const farmer = getUser(item.farmerId);
  const trust = getTrust(item.farmerId);
  const qty = Number.isFinite(quantity) ? Math.max(1, Math.min(quantity, item.quantityKg)) : 1;

  const isColdChain = urgency === "Cold Chain Refrigerated";
  const pricing = PricingService.calculate({
    quantityKg: qty,
    pricePerKg: item.pricePerKg,
    urgency,
    isColdChain,
  });

  const submit = async () => {
    setSubmitting(true);
    const res = await api.orders.createEscrow({
      produceId: item.id,
      quantityKg: qty,
      urgency,
    });
    setSubmitting(false);

    if (!res.success) {
      // Fallback to local store if backend returned an error
      const order = placeOrder({ produceId: item.id, quantityKg: qty, urgency });
      if (!order) {
        toast.error("Could not place that order");
        return;
      }
    }

    toast.success(
      `Escrow commitment locked: ${PricingService.formatNaira(pricing.totalAmount)} for ${qty}kg ${item.name}`,
    );
    router.navigate({ to: "/dashboard/buyer" });
  };

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
        className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1.1fr]"
      >
        <motion.div variants={fadeInUp} className="space-y-6">
          <Card className="gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
            <ProduceImage
              name={item.name}
              category={item.category}
              src={item.image}
              className="h-64 w-full object-cover"
            />
            <div className="p-5">
              <h1 className="font-display text-3xl font-bold tracking-tight">{item.name}</h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" aria-hidden /> {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="size-3.5 text-primary" aria-hidden />{" "}
                  {item.quantityKg.toLocaleString()}kg available
                </span>
                <span>Listed {timeAgo(item.listedAt)}</span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Card>

          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Farmer details
                </p>
                <h2 className="font-display text-xl font-bold">{farmer?.name}</h2>
                <p className="text-xs text-muted-foreground">{farmer?.location}</p>
              </div>
              {trust && <TrustScore trust={trust} size="md" />}
            </div>
            {trust && (
              <div className="mt-4">
                <TrustBreakdown trust={trust} />
              </div>
            )}
          </Card>
        </motion.div>

        {/* Order Placement Card */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)] border-primary/30 bg-card">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-display text-lg font-bold">Place Order</h2>
                <p className="text-xs text-muted-foreground">
                  Direct contract with automated transporter dispatch
                </p>
              </div>
              <span className="text-right">
                <span className="font-display text-xl font-black text-foreground">
                  {formatNaira(item.pricePerKg)}
                </span>
                <span className="text-xs text-muted-foreground">/kg</span>
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label htmlFor="qty" className="font-bold">
                    Quantity (kg)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Max available: {item.quantityKg.toLocaleString()}kg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    max={item.quantityKg}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="font-bold shadow-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(item.quantityKg)}
                    className="shrink-0 text-xs font-semibold"
                  >
                    Max ({item.quantityKg}kg)
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-bold">Delivery Urgency & Fleet Selection</Label>
                <RadioGroup
                  value={urgency}
                  onValueChange={(v) =>
                    setUrgency(v as "Standard" | "Urgent" | "Cold Chain Refrigerated")
                  }
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  <Label
                    htmlFor="urgency-standard"
                    className={`flex cursor-pointer flex-col rounded-xl border p-3 text-xs transition-all ${
                      urgency === "Standard"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40 font-semibold"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="Standard" id="urgency-standard" />
                      <span className="flex items-center gap-1">
                        <Truck className="size-3.5 text-primary" />
                        Standard
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-muted-foreground">
                      24-48 hours transit
                    </span>
                  </Label>

                  <Label
                    htmlFor="urgency-urgent"
                    className={`flex cursor-pointer flex-col rounded-xl border p-3 text-xs transition-all ${
                      urgency === "Cold Chain Refrigerated" || urgency === "Urgent"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40 font-semibold"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="Cold Chain Refrigerated" id="urgency-urgent" />
                      <span className="flex items-center gap-1 text-primary">
                        <Snowflake className="size-3.5 text-blue-500" />
                        Cold-Chain Reefer
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-muted-foreground">
                      Temperature controlled
                    </span>
                  </Label>
                </RadioGroup>
              </div>

              <Separator />

              {/* Transparent Pricing Card */}
              <PricingBreakdownCard pricing={pricing} />

              <Button
                size="lg"
                className="w-full font-bold shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.02] text-base"
                onClick={submit}
                disabled={submitting || !item.available}
              >
                {submitting ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 size-5" />
                )}
                {item.available
                  ? `Commit ${PricingService.formatNaira(pricing.totalAmount)} to Escrow`
                  : "Produce Unavailable"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Page>
  );
}
