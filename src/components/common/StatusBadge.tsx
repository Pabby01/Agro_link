import { cn } from "@/lib/utils";
import type { DeliveryStatus, OrderStatus } from "@/lib/types";

const tones: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  Accepted: "bg-primary/10 text-primary",
  "Awaiting Pickup": "bg-gold/25 text-gold-foreground",
  "Picked Up": "bg-gold/25 text-gold-foreground",
  "In Transit": "bg-accent/25 text-accent-foreground",
  Delivered: "bg-success/15 text-success",
  Completed: "bg-success/15 text-success",
  Cancelled: "bg-destructive/12 text-destructive",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus | DeliveryStatus | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}
