import { useState, useEffect } from "react";
import { ShieldCheck, Check, X, Eye, FileText, Building2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export interface KYBVerificationItem {
  id: string;
  user_id: string;
  company_name: string;
  cac_rc_number: string;
  tin_number?: string;
  director_nin_bvn?: string;
  business_address: string;
  document_urls: Record<string, string>;
  status: "unsubmitted" | "pending_review" | "verified" | "rejected" | "action_required";
  rejection_reason?: string;
  created_at: string;
}

export function KYBAdminReviewTable() {
  const [verifications, setVerifications] = useState<KYBVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKyb, setSelectedKyb] = useState<KYBVerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.kyb.adminList();
    if (res.success && res.data) {
      setVerifications(res.data as unknown as KYBVerificationItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (kybId: string, approved: boolean) => {
    setActionLoading(true);
    const payload: {
      kybId: string;
      approved: boolean;
      tier?: 2 | 3 | undefined;
      rejectionReason?: string | undefined;
    } = {
      kybId,
      approved,
      tier: 2,
    };
    if (!approved) {
      payload.rejectionReason = rejectReason || "Documents failed validation.";
    }
    const res = await api.kyb.adminReview(payload);

    setActionLoading(false);
    if (res.success) {
      toast.success(approved ? "KYB Verification Approved (Tier 2)" : "KYB Verification Rejected");
      setSelectedKyb(null);
      setRejectReason("");
      loadData();
    } else {
      toast.error(res.error || "Review action failed.");
    }
  };

  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            KYB / KYC Corporate Compliance Queue
          </h2>
          <p className="text-xs text-muted-foreground">
            Audit Nigerian Corporate Affairs Commission (CAC) and Tax filings before approving
            market escrow limits
          </p>
        </div>
        <Badge variant="secondary">{verifications.length} Total Submissions</Badge>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="pb-3 font-semibold">Company Name</th>
              <th className="pb-3 font-semibold">CAC RC Number</th>
              <th className="pb-3 font-semibold">Tax ID (TIN)</th>
              <th className="pb-3 font-semibold">Submitted</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {verifications.map((kyb) => (
              <tr key={kyb.id} className="hover:bg-muted/40 transition-colors">
                <td className="py-3 font-medium text-foreground">{kyb.company_name}</td>
                <td className="py-3 font-mono text-muted-foreground">{kyb.cac_rc_number}</td>
                <td className="py-3 font-mono text-muted-foreground">{kyb.tin_number || "—"}</td>
                <td className="py-3 text-muted-foreground">
                  {new Date(kyb.created_at).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <Badge
                    variant={
                      kyb.status === "verified"
                        ? "default"
                        : kyb.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize text-[10px]"
                  >
                    {kyb.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setSelectedKyb(kyb)}
                  >
                    <Eye className="mr-1 size-3.5" /> Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedKyb && (
        <Dialog open={!!selectedKyb} onOpenChange={() => setSelectedKyb(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold">
                Compliance Review: {selectedKyb.company_name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Verify statutory incorporation details against the corporate registry
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs pt-2">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-3">
                <div>
                  <span className="text-muted-foreground">CAC RC Number:</span>
                  <p className="font-mono font-bold">{selectedKyb.cac_rc_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax ID Number:</span>
                  <p className="font-mono font-bold">{selectedKyb.tin_number || "N/A"}</p>
                </div>
                <div className="col-span-2 pt-1 border-t">
                  <span className="text-muted-foreground">Registered Address:</span>
                  <p className="font-medium">{selectedKyb.business_address}</p>
                </div>
              </div>

              <div>
                <Label>Uploaded Statutory Documents:</Label>
                <div className="mt-1 space-y-1">
                  {Object.entries(selectedKyb.document_urls || {}).map(([key, url]) => (
                    <a
                      key={key}
                      href={url as string}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border p-2 text-primary hover:underline"
                    >
                      <FileText className="size-4" />
                      <span className="capitalize">{key.replace("_", " ")}</span>
                    </a>
                  ))}
                </div>
              </div>

              {selectedKyb.status === "pending_review" && (
                <div className="pt-2 border-t space-y-2">
                  <Label htmlFor="rej">Rejection Reason (if declining):</Label>
                  <Textarea
                    id="rej"
                    placeholder="e.g. CAC number does not match registered director name..."
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleReview(selectedKyb.id, false)}
                    >
                      <X className="mr-1 size-3.5" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      className="font-bold bg-success hover:bg-success/90 text-success-foreground"
                      onClick={() => handleReview(selectedKyb.id, true)}
                    >
                      <Check className="mr-1 size-3.5" /> Approve & Verify Tier 2
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
