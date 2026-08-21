import { Link } from "@tanstack/react-router";
import { MapPin, ArrowRight } from "lucide-react";
import { LiquidCard } from "@/components/ui/LiquidCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustScore } from "@/components/trust/TrustScore";
import { ProduceImage } from "./ProduceImage";
import { formatNaira, timeAgo, useApp } from "@/lib/store";
import type { Produce } from "@/lib/types";

export function ProduceCard({ item }: { item: Produce }) {
  const { getUser, getTrust } = useApp();
  const farmer = getUser(item.farmerId);
  const trust = getTrust(item.farmerId);

  return (
    <LiquidCard
      variant={
        item.category === "Vegetables" ? "success" : item.category === "Grains" ? "gold" : "primary"
      }
      className="flex flex-col gap-0 p-0 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative overflow-hidden">
        <ProduceImage
          name={item.name}
          category={item.category}
          src={item.image}
          className="h-44 w-full"
        />
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-background/75 backdrop-blur-xs">
            <Badge variant="destructive" className="font-semibold">
              Sold Out / Unavailable
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight">{item.name}</h3>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{item.location}</span>
          <span className="shrink-0">· {timeAgo(item.listedAt)}</span>
        </p>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-foreground">
              {formatNaira(item.pricePerKg)}
            </span>
            <span className="text-xs text-muted-foreground">/kg</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {item.quantityKg.toLocaleString()}kg in stock
          </span>
        </div>

        <div className="mt-auto border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <Link
                to="/profile/$userId"
                params={{ userId: item.farmerId }}
                className="block truncate text-xs font-semibold text-foreground hover:underline"
              >
                {farmer?.name ?? "Farmer"}
              </Link>
              {trust && <TrustScore trust={trust} size="sm" showLabel={false} />}
            </div>
            <Button
              asChild
              size="sm"
              variant={item.available ? "default" : "outline"}
              className="rounded-lg font-semibold"
            >
              <Link to="/marketplace/$produceId" params={{ produceId: item.id }}>
                {item.available ? "Order" : "Details"}
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </LiquidCard>
  );
}
