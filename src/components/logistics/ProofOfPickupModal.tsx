import { useState } from "react";
import { PackageCheck, Camera, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProofOfPickupModalProps {
  shipmentId: string;
  orderQuantityKg: number;
  pickupLocation: string;
  onSuccess: (data: { quantityCollectedKg: number; evidenceUrl?: string }) => void;
  trigger?: React.ReactNode;
}

export function ProofOfPickupModal({
  shipmentId,
  orderQuantityKg,
  pickupLocation,
  onSuccess,
  trigger,
}: ProofOfPickupModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(orderQuantityKg.toString());
  const [evidenceUrl, setEvidenceUrl] = useState(
    "https://agrolink.ng/evidence/pickup-farm-gate-1.jpg",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid collected quantity.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ quantityCollectedKg: qty, evidenceUrl });
      toast.success(`Proof of Pickup logged for Shipment #${shipmentId}!`);
      setOpen(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="font-bold shadow-xs">
            <PackageCheck className="mr-1.5 size-4" />
            Confirm Farm Pickup
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <PackageCheck className="size-5 text-primary" />
            Capture Proof of Pickup
          </DialogTitle>
          <DialogDescription>
            Verify produce collection with the farmer at the designated farm gate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="rounded-xl border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <MapPin className="size-3.5 text-primary" />
              Pickup Gate: {pickupLocation}
            </div>
            <p className="text-muted-foreground">
              Order Target: {orderQuantityKg.toLocaleString()} kg
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pickupQuantity">Actual Quantity Collected (kg)</Label>
            <Input
              id="pickupQuantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evidenceUrl">Photo / Weighbridge Receipt URL</Label>
            <div className="relative">
              <Input
                id="evidenceUrl"
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="pl-9"
              />
              <Camera className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Transporter and Farmer joint confirmation required.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-bold">
              {loading ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <PackageCheck className="mr-1.5 size-4" />
              )}
              Submit Pickup Proof
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
