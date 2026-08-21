import { Link } from "@tanstack/react-router";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProduceImage } from "./ProduceImage";
import { formatNaira, timeAgo, useApp } from "@/lib/store";
import type { Produce } from "@/lib/types";

export function ProduceCard({ item }: { item: Produce }) {
  const { getUser, getTrust } = useApp();
  const farmer = getUser(item.farmerId);
  const trust = getTrust(item.farmerId);

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {/* Image Container with compact height */}
      <div className="relative h-32 w-full overflow-hidden bg-muted sm:h-36">
        <ProduceImage
          name={item.name}
          category={item.category}
          src={item.image}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Category Pill Tag */}
        <span className="absolute left-2 top-2 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-xs shadow-2xs border border-border/50">
          {item.category}
        </span>

        {/* Farmer Mini Trust Badge */}
        {trust && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-xs shadow-2xs border border-emerald-500/30">
            <ShieldCheck className="size-3 text-emerald-400" />
            <span>{trust.score} Trust</span>
          </span>
        )}

        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-2xs">
            <Badge variant="destructive" className="text-xs font-bold shadow-xs">
              Sold Out
            </Badge>
          </div>
        )}
      </div>

      {/* Compact Content Area */}
      <div className="flex flex-1 flex-col p-3 space-y-2">
        <div>
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
            <span className="font-display font-extrabold text-sm text-primary shrink-0">
              {formatNaira(item.pricePerKg)}
              <span className="text-[10px] font-normal text-muted-foreground">/kg</span>
            </span>
          </div>

          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
            <MapPin className="size-3 shrink-0 text-primary/70" />
            <span className="truncate">{item.location}</span>
            <span className="shrink-0">· {item.quantityKg.toLocaleString()}kg</span>
          </p>
        </div>

        {/* Bottom Bar: Farmer + Order CTA */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
          <Link
            to="/profile/$userId"
            params={{ userId: item.farmerId }}
            className="truncate font-semibold text-muted-foreground hover:text-foreground hover:underline text-[11px]"
          >
            {farmer?.name ?? "Farmer"}
          </Link>

          <Button
            asChild
            size="sm"
            variant={item.available ? "default" : "outline"}
            className="h-7 px-2.5 rounded-lg text-xs font-bold shadow-2xs"
          >
            <Link to="/marketplace/$produceId" params={{ produceId: item.id }}>
              {item.available ? "Order" : "View"}
              <ArrowRight className="ml-1 size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
