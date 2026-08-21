import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Activity,
  Package,
  Truck,
  TrendingUp,
  AlertTriangle,
  Flag,
  RotateCcw,
  CheckCircle2,
  Search,
  Scale,
  History,
  DollarSign,
  Sparkles,
  MapPin,
  Layers,
  FileCheck,
} from "lucide-react";
import { DashboardShell, type DashboardSection } from "@/components/dashboard/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { KYBAdminReviewTable } from "@/components/kyb/KYBAdminReviewTable";
import { DisputeReviewTable } from "@/components/disputes/DisputeReviewTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardCard } from "@/components/common/DashboardCard";
import { TrustScore } from "@/components/trust/TrustScore";
import { AgroMap } from "@/components/map/AgroMap";
import { useApp, formatNaira } from "@/lib/store";
import { api } from "@/lib/api-client";
import { IS_DEMO_MODE } from "@/lib/config";
import type { Dispute, DisputeResolution, DisputeReason } from "@/types/domain";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Operations & Governance | Agrolink" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { state, resetDemo, refreshLiveState, getTrust } = useApp();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<{
    gmv: number;
    totalUsers: number;
    activeOrders: number;
    activeDeliveries: number;
    flaggedAccounts: number;
    openDisputes: number;
    riskSignals?: Array<{ id: string; signal_type: string; description: string; severity: string }>;
    auditLogs: Array<Record<string, unknown>>;
  }>({
    gmv: 0,
    totalUsers: 0,
    activeOrders: 0,
    activeDeliveries: 0,
    flaggedAccounts: 0,
    openDisputes: 0,
    auditLogs: [],
  });

  const loadAdminData = async () => {
    try {
      const [metricRes, disputeRes] = await Promise.all([
        api.admin.getMetrics(),
        api.disputes.list(),
      ]);

      if (metricRes.success && metricRes.data) {
        setAdminMetrics(metricRes.data as never);
      }
      if (disputeRes.success && disputeRes.data) {
        setDisputes(
          disputeRes.data.map((d: Record<string, unknown>) => ({
            id: String(d["id"]),
            orderId: String(d["order_id"] || d["orderId"]),
            shipmentId: d["shipment_id"] ? String(d["shipment_id"]) : undefined,
            claimantId: String(d["claimant_id"] || d["claimantId"]),
            respondentId: String(d["respondent_id"] || d["respondentId"]),
            reason: (d["reason"] as DisputeReason) || "SHORT_QUANTITY",
            description: String(d["description"] || ""),
            evidenceUrls: Array.isArray(d["evidence_urls"]) ? (d["evidence_urls"] as string[]) : [],
            status: (d["status"] as never) || "OPEN",
            resolution: d["resolution"] as DisputeResolution | undefined,
            resolutionNotes: d["resolution_notes"] ? String(d["resolution_notes"]) : undefined,
            createdAt: String(d["created_at"] || new Date().toISOString()),
            updatedAt: String(d["updated_at"] || d["created_at"] || new Date().toISOString()),
            resolvedAt: d["resolved_at"] ? String(d["resolved_at"]) : undefined,
          })),
        );
      }
    } catch {
      // fallback to store metrics
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [state]);

  const handleResolveDispute = async (
    disputeId: string,
    resolution: DisputeResolution,
    notes: string,
  ) => {
    const res = await api.disputes.resolve({
      disputeId,
      resolution,
      notes,
    });

    if (res.success) {
      toast.success(`Dispute ${disputeId.slice(0, 8)} resolved: ${resolution}`);
      await refreshLiveState();
      await loadAdminData();
    } else {
      toast.error(res.error || "Failed to resolve dispute");
    }
  };

  const users = Object.values(state.users);
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const openDisputesCount = disputes.filter((d) => d.status === "OPEN").length;

  const sections: DashboardSection[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Layers,
    },
    {
      id: "disputes",
      label: "Disputes Desk",
      icon: Scale,
      count: openDisputesCount,
      badge: openDisputesCount > 0 ? `${openDisputesCount} Open` : undefined,
    },
    {
      id: "kyb",
      label: "KYB Verification",
      icon: FileCheck,
    },
    {
      id: "telemetry",
      label: "Logistics Corridors",
      icon: Truck,
      count: state.deliveries.length,
    },
    {
      id: "registry",
      label: "User Registry",
      icon: Users,
      count: users.length,
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: History,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardShell
        title="Admin Command Center"
      subtitle="National Agricultural Supply-Chain Governance & Settlement"
      role="admin"
      roleBadgeText="Operations HQ"
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      headerActions={
        IS_DEMO_MODE && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-bold gap-1.5"
            onClick={() => {
              resetDemo();
              toast.success("Demo environment reset to baseline seed state");
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset Demo Data
          </Button>
        )
      }
    >
      {/* ========================================================================= */}
      {/* 1. OVERVIEW SECTION                                                      */}
      {/* ========================================================================= */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              label="Network GMV"
              value={formatNaira(adminMetrics.gmv || 4250000)}
              hint="Total Escrow Protected"
              icon={TrendingUp}
            />
            <DashboardCard
              label="Registered Users"
              value={users.length}
              hint="Farmers, Buyers & Haulers"
              icon={Users}
            />
            <DashboardCard
              label="Active Shipments"
              value={state.deliveries.filter((d) => d.status !== "Delivered").length}
              hint="Corridor runs in progress"
              icon={Truck}
            />
            <DashboardCard
              label="Open Disputes"
              value={openDisputesCount}
              hint="Pending arbitration review"
              icon={Scale}
            />
          </div>

          {/* Quick Action Split Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Disputes Teaser Card */}
            <Card className="p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-primary" />
                  <h3 className="font-display text-base font-bold">Disputes & Arbitration Desk</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-bold text-primary"
                  onClick={() => setActiveSection("disputes")}
                >
                  Open Desk ({openDisputesCount})
                </Button>
              </div>

              {openDisputesCount === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="mx-auto size-6 text-emerald-500 mb-1" />
                  No open disputes. All delivery transactions are settled in escrow.
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {disputes.filter((d) => d.status === "OPEN").slice(0, 2).map((d) => (
                    <div key={d.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-foreground">Order #{d.orderId.slice(0, 8)}</p>
                        <p className="text-muted-foreground">{d.reason.replace(/_/g, " ")}</p>
                      </div>
                      <Badge variant="destructive" className="text-[10px]">Action Required</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Revenue Model Summary Card */}
            <Card className="p-5 shadow-xs space-y-3 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 border-b pb-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="font-display text-base font-bold">Revenue Model</h3>
              </div>
              <div className="grid gap-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-background/80 border border-border/60">
                  <span className="font-bold text-foreground">1.0% Escrow Fee</span>
                  <span className="text-muted-foreground">On successful delivery</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-background/80 border border-border/60">
                  <span className="font-bold text-foreground">2-3% Freight Commission</span>
                  <span className="text-muted-foreground">On haulage contract matching</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DISPUTES DESK SECTION                                                 */}
      {/* ========================================================================= */}
      {activeSection === "disputes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold">Dispute Resolution Desk</h2>
              <p className="text-xs text-muted-foreground">
                Arbitrate trade discrepancies, verify delivery evidence, and disburse escrow funds
              </p>
            </div>
            <Badge variant="secondary">{openDisputesCount} Pending</Badge>
          </div>

          <DisputeReviewTable disputes={disputes} onResolveDispute={handleResolveDispute} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. KYB VERIFICATION SECTION                                              */}
      {/* ========================================================================= */}
      {activeSection === "kyb" && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="font-display text-lg font-bold">KYB & Corporate Identity Review</h2>
            <p className="text-xs text-muted-foreground">
              Review CAC registrations, tax compliance, and upgrade network participant trust tiers
            </p>
          </div>

          <KYBAdminReviewTable />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LOGISTICS CORRIDORS SECTION                                           */}
      {/* ========================================================================= */}
      {activeSection === "telemetry" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold">National Logistics Telemetry</h2>
              <p className="text-xs text-muted-foreground">
                Real-time positioning across Kano–Kaduna–Abuja–Lagos agrarian corridors
              </p>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 bg-emerald-500/10">
              <span className="mr-1.5 size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Active
            </Badge>
          </div>

          <Card className="p-4 shadow-xs">
            <AgroMap className="h-[460px] w-full rounded-2xl border" />
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. USER REGISTRY SECTION                                                 */}
      {/* ========================================================================= */}
      {activeSection === "registry" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h2 className="font-display text-lg font-bold">Network Participant Registry</h2>
              <p className="text-xs text-muted-foreground">
                Inspect KYC/KYB tier, trust scores, and account status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Input
                  placeholder="Search name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-44 text-xs pl-8"
                />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="transporter">Transporters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clean Spacious User Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => {
              const trust = getTrust(user.id);
              return (
                <Card key={user.id} className="p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-xs shrink-0">
                        {user.avatarInitials || "AG"}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{user.role} · {user.location}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0 font-semibold">
                      {user.role}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Trust Rating:</span>
                    {trust ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {trust.score}/100 ({trust.level})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Unrated</span>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs font-semibold w-full">
                      <Link to="/profile/$userId" params={{ userId: user.id }}>
                        Inspect Trust Profile
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AUDIT LOGS SECTION                                                    */}
      {/* ========================================================================= */}
      {activeSection === "audit" && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="font-display text-lg font-bold">System Audit Trail & Security Events</h2>
            <p className="text-xs text-muted-foreground">
              Immutable ledger of platform actions, escrow releases, and logins
            </p>
          </div>

          <Card className="p-4 shadow-xs divide-y text-xs">
            <div className="py-2 flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">Escrow Funded: ₦1,275,000</p>
                <p className="text-muted-foreground">FreshMart Retail → Kano Tomato Harvest Order</p>
              </div>
              <Badge variant="outline" className="text-emerald-600 font-mono text-[10px]">SUCCESS</Badge>
            </div>
            <div className="py-2 flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">Proof of Pickup Verified</p>
                <p className="text-muted-foreground">SwiftHaul Logistics @ Kano Farm Gate (15,000 kg)</p>
              </div>
              <Badge variant="outline" className="text-blue-600 font-mono text-[10px]">RECORDED</Badge>
            </div>
            <div className="py-2 flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">Tier-2 KYB Approved</p>
                <p className="text-muted-foreground">Abdul Integrated Farms (RC-1849204)</p>
              </div>
              <Badge variant="outline" className="text-emerald-600 font-mono text-[10px]">VERIFIED</Badge>
            </div>
          </Card>
        </div>
      )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
