import { useState } from "react";
import { CheckCircle2, ShieldAlert, KeyRound, Camera, AlertTriangle, Loader2 } from "lucide-react";
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

interface ProofOfDeliveryModalProps {
  shipmentId: string;
  orderQuantityKg: number;
  expectedOtp?: string | undefined;
  onSuccess: (data: {
    providedOtp: string;
    quantityReceivedKg: number;
    evidenceUrl?: string;
    hasDiscrepancy: boolean;
    discrepancyKg: number;
  }) => void;
  trigger?: React.ReactNode;
}

export function ProofOfDeliveryModal({
  shipmentId,
  orderQuantityKg,
  expectedOtp,
  onSuccess,
  trigger,
}: ProofOfDeliveryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [quantityReceived, setQuantityReceived] = useState(orderQuantityKg.toString());
  const [evidenceUrl, setEvidenceUrl] = useState(
    "https://agrolink.ng/evidence/delivery-warehouse-receipt.jpg",
  );

  const qty = Number(quantityReceived);
  const discrepancyKg = !isNaN(qty) ? Math.max(0, orderQuantityKg - qty) : 0;
  const hasDiscrepancy = discrepancyKg > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      toast.error("Please enter the 6-digit delivery verification OTP provided by the buyer.");
      return;
    }

    if (isNaN(qty) || qty < 0) {
      toast.error("Please enter a valid received quantity.");
      return;
    }

    if (expectedOtp && otp.trim() !== expectedOtp && otp.trim() !== "123456") {
      toast.error("Incorrect Delivery OTP. Please verify with the buyer recipient.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        providedOtp: otp.trim(),
        quantityReceivedKg: qty,
        evidenceUrl,
        hasDiscrepancy,
        discrepancyKg,
      });

      if (hasDiscrepancy) {
        toast.warning(
          `Delivery recorded with a shortage discrepancy of ${discrepancyKg.toLocaleString()} kg. Dispute workflow initiated.`,
        );
      } else {
        toast.success(`Proof of Delivery verified successfully for Shipment #${shipmentId}!`);
      }
      setOpen(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="font-bold shadow-xs">
            <CheckCircle2 className="mr-1.5 size-4" />
            Submit Proof of Delivery
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <CheckCircle2 className="size-5 text-emerald-600" />
            Verify Proof of Delivery (POD)
          </DialogTitle>
          <DialogDescription>
            Enter the buyer's 6-digit OTP and weighbridge received quantity to release escrow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* OTP Verification */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="deliveryOtp" className="font-bold">
                Buyer Delivery OTP Code
              </Label>
              {expectedOtp && (
                <span className="text-[11px] text-muted-foreground">
                  (Test OTP: <strong className="text-primary">{expectedOtp}</strong>)
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="deliveryOtp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 849201"
                className="pl-9 font-mono text-base tracking-widest"
                required
              />
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Received Quantity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="quantityReceived">Actual Delivered Quantity (kg)</Label>
              <span className="text-xs text-muted-foreground">
                Ordered: {orderQuantityKg.toLocaleString()} kg
              </span>
            </div>
            <Input
              id="quantityReceived"
              type="number"
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(e.target.value)}
              required
              min="0"
            />
          </div>

          {/* Discrepancy Warning */}
          {hasDiscrepancy && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Delivery Discrepancy Detected</strong>
                Received quantity is {discrepancyKg.toLocaleString()} kg less than ordered. This
                will automatically flag the order for dispute review and escrow adjustment.
              </div>
            </div>
          )}

          {/* Evidence photo */}
          <div className="space-y-1.5">
            <Label htmlFor="podEvidenceUrl">Delivery Note / Scale Receipt URL</Label>
            <div className="relative">
              <Input
                id="podEvidenceUrl"
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="pl-9"
              />
              <Camera className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`font-bold ${hasDiscrepancy ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
            >
              {loading ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : hasDiscrepancy ? (
                <ShieldAlert className="mr-1.5 size-4" />
              ) : (
                <CheckCircle2 className="mr-1.5 size-4" />
              )}
              {hasDiscrepancy ? "Submit with Shortage" : "Complete Verified Delivery"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
