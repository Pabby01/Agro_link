import { useState } from "react";
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

interface KYBModalProps {
  currentTier?: number;
  isVerified?: boolean;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function KYBVerificationModal({
  currentTier = 1,
  isVerified = false,
  onSuccess,
  trigger,
}: KYBModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [cacRcNumber, setCacRcNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [directorNin, setDirectorNin] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [cacDocUrl, setCacDocUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !cacRcNumber || !businessAddress) {
      toast.error("Please fill in all mandatory KYB fields.");
      return;
    }

    setLoading(true);
    const res = await api.kyb.submit({
      companyName,
      cacRcNumber,
      tinNumber,
      directorNinBvn: directorNin,
      businessAddress,
      documentUrls: {
        cac_certificate: cacDocUrl || "https://agrolink.ng/uploads/cac_cert_sample.pdf",
      },
    });

    setLoading(false);
    if (res.success) {
      toast.success("KYB compliance documents submitted successfully! Admin review in progress.");
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(res.error || "Failed to submit KYB documents.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="font-semibold shadow-xs">
            <ShieldCheck className="mr-1.5 size-4 text-primary" />
            {isVerified ? "Upgrade Compliance Tier" : "Complete KYB Verification"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl font-bold">
                Enterprise KYB / KYC Verification
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Corporate Affairs Commission (CAC) & Anti-Money Laundering (AML) Compliance
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tier Info Card */}
        <div className="mt-3 rounded-xl border bg-muted/40 p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Current Status: Tier {currentTier}</span>
            <Badge variant={isVerified ? "default" : "secondary"}>
              {isVerified ? "Verified Corporate" : "Pending Tier 2 Verification"}
            </Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Tier 2 verification unlocks verified supplier badges, up to ₦50M escrow protection, and
            priority interstate corridor load matching.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Registered Company Name *</Label>
            <Input
              id="companyName"
              placeholder="e.g. Abdul Integrated Farms Ltd"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cacRc">CAC RC / BN Number *</Label>
              <Input
                id="cacRc"
                placeholder="e.g. RC-1849204"
                value={cacRcNumber}
                onChange={(e) => setCacRcNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tin">Tax ID Number (TIN)</Label>
              <Input
                id="tin"
                placeholder="e.g. TIN-92841029"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nin">Managing Director NIN or BVN (Encrypted)</Label>
            <div className="relative">
              <Input
                id="nin"
                placeholder="11-digit national identity number"
                value={directorNin}
                onChange={(e) => setDirectorNin(e.target.value)}
                className="pr-8"
              />
              <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Stored with AES-256 encryption for statutory AML audit compliance only.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Registered Office / Warehouse Address *</Label>
            <Input
              id="address"
              placeholder="e.g. Plot 14, Bompai Industrial Area, Kano"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="docUrl">CAC Certificate / Document Upload URL</Label>
            <Input
              id="docUrl"
              placeholder="https://.../cac_cert.pdf (or Supabase Storage document URL)"
              value={cacDocUrl}
              onChange={(e) => setCacDocUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-bold shadow-xs">
              {loading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
