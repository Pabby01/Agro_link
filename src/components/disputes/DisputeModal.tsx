import { useState } from "react";
import { AlertCircle, FileWarning, UploadCloud, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { DisputeReason } from "@/types/domain";

interface DisputeModalProps {
  orderId: string;
  orderAmount: number;
  respondentName: string;
  onSubmitDispute: (data: {
    reason: DisputeReason;
    description: string;
    evidenceUrl?: string;
  }) => void;
  trigger?: React.ReactNode;
}

export function DisputeModal({
  orderId,
  orderAmount,
  respondentName,
  onSubmitDispute,
  trigger,
}: DisputeModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<DisputeReason>("SHORT_QUANTITY");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState(
    "https://agrolink.ng/evidence/dispute-inspection-1.jpg",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 10) {
      toast.error("Please provide at least 10 characters detailing the dispute reason.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmitDispute({
        reason,
        description: description.trim(),
        evidenceUrl,
      });
      toast.warning(
        `Dispute opened for Order #${orderId}. Escrow payout paused pending admin arbitration.`,
      );
      setOpen(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="mr-1.5 size-3.5" />
            Open Dispute
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg text-destructive">
            <FileWarning className="size-5" />
            Open Transaction Dispute
          </DialogTitle>
          <DialogDescription>
            Hold escrow settlement and request platform arbitration for Order #{orderId}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="rounded-xl border bg-muted/40 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">Counterparty: {respondentName}</p>
            <p className="text-muted-foreground">
              Escrow Amount Locked: ₦{orderAmount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="disputeReason">Reason for Dispute</Label>
            <Select value={reason} onValueChange={(val) => setReason(val as DisputeReason)}>
              <SelectTrigger id="disputeReason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHORT_QUANTITY">Short Quantity / Missing Crates</SelectItem>
                <SelectItem value="DAMAGED_GOODS">Damaged / Spoiled Produce</SelectItem>
                <SelectItem value="QUALITY_ISSUE">
                  Grade Mismatch (Below Promised Quality)
                </SelectItem>
                <SelectItem value="LATE_DELIVERY">Unreasonable Transit Delay</SelectItem>
                <SelectItem value="NON_DELIVERY">Non-Delivery / Cargo Missing</SelectItem>
                <SelectItem value="OTHER">Other Compliance Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="disputeDescription">Detailed Incident Description</Label>
            <Textarea
              id="disputeDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the exact issue, quantity discrepancies, or transit condition..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="disputeEvidence">Inspection Evidence / Photo URL</Label>
            <div className="relative">
              <Input
                id="disputeEvidence"
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="pl-9"
              />
              <UploadCloud className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="destructive" className="font-bold">
              {loading ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <AlertCircle className="mr-1.5 size-4" />
              )}
              Submit Dispute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
