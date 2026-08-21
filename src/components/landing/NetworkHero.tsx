import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sprout,
  ShoppingBasket,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActiveNode {
  id: "farmer" | "transporter" | "buyer";
  name: string;
  role: string;
  location: string;
  trustScore: number;
  badge: string;
  status: string;
  detail: string;
}

const nodeData: Record<"farmer" | "transporter" | "buyer", ActiveNode> = {
  farmer: {
    id: "farmer",
    name: "Abdul Farms",
    role: "Verified Producer",
    location: "Kano, Northern Belt",
    trustScore: 92,
    badge: "1,200kg Roma Tomatoes Available",
    status: "Listing active & ready for dispatch",
    detail: "Direct harvest without intermediary brokers",
  },
  transporter: {
    id: "transporter",
    name: "SwiftHaul Logistics",
    role: "Verified Transporter",
    location: "Abuja Trade Gateway",
    trustScore: 95,
    badge: "Heavy Haulage Fleet Base",
    status: "En route along Kano-Lagos corridor",
    detail: "40-ton insured refrigerated capacity",
  },
  buyer: {
    id: "buyer",
    name: "FreshMart Retail",
    role: "Commercial Buyer",
    location: "Lagos Megacity Hub",
    trustScore: 88,
    badge: "300kg Order In Transit",
    status: "Escrow secured upon delivery verification",
    detail: "Weekly recurring agricultural demand",
  },
};

export function NetworkHero({ className }: { className?: string }) {
  const [activeNodeId, setActiveNodeId] = useState<"farmer" | "transporter" | "buyer">(
    "transporter",
  );
  const active = nodeData[activeNodeId];

  return (
    <div className={cn("relative w-full", className)}>
      {/* Background ambient glow circles */}
      <div
        className="pointer-events-none absolute -top-12 -left-12 size-72 rounded-full bg-success/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -right-12 size-80 rounded-full bg-gold/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Main Interactive Stage Container */}
      <div className="relative rounded-3xl border border-border/80 bg-card/85 p-4 sm:p-6 shadow-[var(--shadow-lift)] backdrop-blur-md">
        {/* Network Header Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-success" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Supply-Chain Network
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-primary" /> Discover
            <span className="text-border">→</span>
            <span className="inline-block size-2 rounded-full bg-gold" /> Move
            <span className="text-border">→</span>
            <span className="inline-block size-2 rounded-full bg-accent" /> Deliver
          </div>
        </div>

        {/* 3D Network Diagram (Desktop / Tablet SVG + Node Cards) */}
        <div className="relative my-4 min-h-[300px] w-full select-none sm:min-h-[340px]">
          {/* Animated Connecting SVG Lines */}
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 500 280"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="pathGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="pathGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="trustLoopGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.4" />
                <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Farmer to Transporter Line */}
            <path
              d="M 120 70 Q 250 50 250 140"
              fill="none"
              stroke="url(#pathGradLeft)"
              strokeWidth="2.5"
              strokeDasharray="6,6"
              className="animate-dash-flow"
            />

            {/* Transporter to Buyer Line */}
            <path
              d="M 250 140 Q 250 230 380 210"
              fill="none"
              stroke="url(#pathGradRight)"
              strokeWidth="2.5"
              strokeDasharray="6,6"
              className="animate-dash-flow"
            />

            {/* Trust Loop Return Arc (Buyer -> Farmer) */}
            <path
              d="M 380 210 Q 250 270 120 70"
              fill="none"
              stroke="url(#trustLoopGrad)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          </svg>

          {/* Node 1: FARMER (Top Left) */}
          <div
            onClick={() => setActiveNodeId("farmer")}
            className={cn(
              "absolute left-0 top-0 sm:left-2 sm:top-2 w-[180px] sm:w-[200px] cursor-pointer transition-all duration-300",
              "animate-float-slow hover:scale-105",
              activeNodeId === "farmer" && "z-20 scale-105",
            )}
          >
            <Card
              className={cn(
                "border p-3.5 shadow-md transition-colors",
                activeNodeId === "farmer"
                  ? "border-success bg-card ring-2 ring-success/30 shadow-[var(--shadow-lift)]"
                  : "border-border/70 bg-card/90 hover:border-success/60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-lg bg-success/15 text-success">
                  <Sprout className="size-4" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                  <ShieldCheck className="size-3" />
                  92 Trust
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-foreground truncate">Abdul Farms</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-2.5 text-primary" /> Kano (Farmer)
              </p>
              <div className="mt-2 flex items-center justify-between rounded bg-muted/60 px-2 py-1 text-[10px] font-medium text-foreground">
                <span>Tomatoes</span>
                <span className="font-bold text-primary">₦850/kg</span>
              </div>
            </Card>
          </div>

          {/* Node 2: TRANSPORTER (Center Hub) */}
          <div
            onClick={() => setActiveNodeId("transporter")}
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] sm:w-[210px] cursor-pointer transition-all duration-300",
              "hover:scale-105",
              activeNodeId === "transporter" && "z-20 scale-105",
            )}
          >
            <Card
              className={cn(
                "border p-3.5 shadow-md transition-colors",
                activeNodeId === "transporter"
                  ? "border-gold bg-card ring-2 ring-gold/40 shadow-[var(--shadow-lift)]"
                  : "border-border/70 bg-card/90 hover:border-gold/60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-lg bg-gold/25 text-gold-foreground">
                  <Truck className="size-4" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold-foreground">
                  <ShieldCheck className="size-3" />
                  95 Trust
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-foreground truncate">SwiftHaul Logistics</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-2.5 text-gold" /> Abuja Corridor
              </p>
              <div className="mt-2 flex items-center justify-between rounded bg-gold/15 px-2 py-1 text-[10px] font-semibold text-gold-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-gold animate-ping" />
                  In Transit
                </span>
                <span>300kg haul</span>
              </div>
            </Card>
          </div>

          {/* Node 3: BUYER (Bottom Right) */}
          <div
            onClick={() => setActiveNodeId("buyer")}
            className={cn(
              "absolute right-0 bottom-0 sm:right-2 sm:bottom-2 w-[180px] sm:w-[200px] cursor-pointer transition-all duration-300",
              "animate-float-delayed hover:scale-105",
              activeNodeId === "buyer" && "z-20 scale-105",
            )}
          >
            <Card
              className={cn(
                "border p-3.5 shadow-md transition-colors",
                activeNodeId === "buyer"
                  ? "border-accent bg-card ring-2 ring-accent/30 shadow-[var(--shadow-lift)]"
                  : "border-border/70 bg-card/90 hover:border-accent/60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-lg bg-accent/20 text-accent-foreground">
                  <ShoppingBasket className="size-4" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                  <ShieldCheck className="size-3" />
                  88 Trust
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-foreground truncate">FreshMart Retail</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-2.5 text-accent" /> Lagos (Buyer)
              </p>
              <div className="mt-2 flex items-center justify-between rounded bg-muted/60 px-2 py-1 text-[10px] font-medium text-foreground">
                <span>Contract</span>
                <span className="font-bold text-success">Fulfilled 97%</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Dynamic Detail Inspector Card below nodes */}
        <div className="mt-4 rounded-2xl border border-border/80 bg-muted/40 p-4 transition-all">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold capitalize text-foreground"
                >
                  {active.role}
                </Badge>
                <span className="font-display text-sm font-bold text-foreground">
                  {active.name}
                </span>
                <span className="text-xs text-muted-foreground">({active.location})</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {active.status} ·{" "}
                <span className="text-foreground font-medium">{active.detail}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                size="sm"
                variant="default"
                className="rounded-xl text-xs font-semibold"
              >
                <Link to="/marketplace">
                  Inspect Trade
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
