import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Scale,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Dispute, DisputeResolution } from "@/types/domain";

interface DisputeReviewTableProps {
  disputes: Dispute[];
  onResolveDispute: (
    disputeId: string,
    resolution: DisputeResolution,
    notes: string,
    partialRefund?: number,
  ) => void;
}

export function DisputeReviewTable({ disputes, onResolveDispute }: DisputeReviewTableProps) {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState<DisputeResolution>("PARTIAL_REFUND");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResolve = () => {
    if (!selectedDispute) return;
    if (!notes.trim()) {
      toast.error("Please add resolution audit notes.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onResolveDispute(selectedDispute.id, resolution, notes.trim());
      toast.success(`Dispute #${selectedDispute.id} resolved with ${resolution}. Escrow updated.`);
      setSelectedDispute(null);
      setNotes("");
    }, 400);
  };

  return (
    <Card className="overflow-hidden border border-border/80 bg-card shadow-xs">
      <div className="flex items-center justify-between border-b p-4 sm:p-5">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            Dispute Arbitration Queue
          </h3>
          <p className="text-xs text-muted-foreground">
            Review active counterparty delivery and payment discrepancies.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 border-amber-300 text-xs"
        >
          {disputes.filter((d) => d.status === "OPEN").length} Open Disputes
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">Dispute ID</th>
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Reason</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Created</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No disputes in the queue. All transactions operating smoothly.
                </td>
              </tr>
            ) : (
              disputes.map((d) => (
                <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono font-bold">{d.id}</td>
                  <td className="p-3.5 font-mono text-muted-foreground">{d.orderId}</td>
                  <td className="p-3.5">
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      {d.reason.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    {d.status === "OPEN" ? (
                      <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300">
                        <AlertTriangle className="mr-1 size-3" /> Open Review
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                        <CheckCircle2 className="mr-1 size-3" /> Resolved
                      </Badge>
                    )}
                  </td>
                  <td className="p-3.5 text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant={d.status === "OPEN" ? "default" : "outline"}
                      onClick={() => {
                        setSelectedDispute(d);
                        setNotes(d.resolutionNotes || "");
                      }}
                      className="text-xs font-semibold"
                    >
                      <Scale className="mr-1.5 size-3.5" />
                      {d.status === "OPEN" ? "Arbitrate" : "View"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Arbitration Modal */}
      {selectedDispute && (
        <Dialog
          open={Boolean(selectedDispute)}
          onOpenChange={(open) => !open && setSelectedDispute(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display text-lg">
                <Scale className="size-5 text-primary" />
                Arbitrate Dispute #{selectedDispute.id}
              </DialogTitle>
              <DialogDescription>
                Review evidence and issue binding escrow payout or refund determination.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="rounded-xl border bg-muted/40 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedDispute.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claimant:</span>
                  <span className="font-semibold text-foreground">
                    {selectedDispute.claimantId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <Badge variant="outline">{selectedDispute.reason.replace(/_/g, " ")}</Badge>
                </div>
                <div className="border-t pt-2">
                  <span className="font-semibold text-foreground block mb-1">
                    Claimant Statement:
                  </span>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{selectedDispute.description}"
                  </p>
                </div>
                {selectedDispute.evidenceUrls.length > 0 && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-muted-foreground">Evidence:</span>
                    {selectedDispute.evidenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-[11px]"
                      >
                        Inspection File #{idx + 1}
                        <ExternalLink className="size-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {selectedDispute.status === "OPEN" ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="arbitrationDecision">Arbitration Determination</Label>
                    <Select
                      value={resolution}
                      onValueChange={(val) => setResolution(val as DisputeResolution)}
                    >
                      <SelectTrigger id="arbitrationDecision">
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARTIAL_REFUND">
                          Partial Refund (Adjust for Shortage)
                        </SelectItem>
                        <SelectItem value="REFUND">Full Refund to Buyer</SelectItem>
                        <SelectItem value="NO_REFUND">
                          Dispute Rejected (Disburse to Seller)
                        </SelectItem>
                        <SelectItem value="REPLACEMENT">Require Produce Replacement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="arbitrationNotes">Resolution Notes & Findings</Label>
                    <Textarea
                      id="arbitrationNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detail the rationale for escrow adjustment, weighbridge findings, etc."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleResolve} disabled={loading} className="font-bold">
                      {loading ? (
                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="mr-1.5 size-4" />
                      )}
                      Execute Settlement
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <p className="font-bold">Settlement Executed: {selectedDispute.resolution}</p>
                  <p className="mt-1">{selectedDispute.resolutionNotes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
