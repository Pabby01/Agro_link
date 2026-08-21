import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { KYBAdminReviewTable } from "@/components/kyb/KYBAdminReviewTable";
import { DisputeReviewTable } from "@/components/disputes/DisputeReviewTable";
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
} from "lucide-react";
import { Page, PageHeader } from "@/components/layout/AppShell";
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
import type { Dispute, DisputeResolution } from "@/types/domain";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Operations & Integrity Dashboard | Agrolink" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { state, resetDemo, refreshLiveState, getTrust } = useApp();
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
            reason: (d["reason"] as never) || "SHORT_QUANTITY",
            description: String(d["description"] || ""),
            evidenceUrls: Array.isArray(d["evidence_urls"]) ? (d["evidence_urls"] as string[]) : [],
            status: (d["status"] as never) || "OPEN",
            resolution: d["resolution"] as never,
            resolutionNotes: d["resolution_notes"] ? String(d["resolution_notes"]) : undefined,
            createdAt: String(d["created_at"] || new Date().toISOString()),
            updatedAt: String(d["updated_at"] || new Date().toISOString()),
          })),
        );
      }
    } catch {
      // Ignored in purely client mode
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const farmers = state.users.filter((u) => u.role === "farmer");
  const buyers = state.users.filter((u) => u.role === "buyer");
  const transporters = state.users.filter((u) => u.role === "transporter");

  const activeOrders = state.orders.filter(
    (o) => o.status !== "Completed" && o.status !== "Cancelled",
  );
  const activeDeliveries = state.deliveries.filter((d) => d.status !== "Delivered");
  const gmv = state.orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const avgTrust = Math.round(
    state.trust.reduce((sum, t) => sum + t.score, 0) / Math.max(1, state.trust.length),
  );

  const filteredUsers = state.users
    .filter((u) => (roleFilter === "All" ? true : u.role === roleFilter))
    .filter(
      (u) =>
        !searchQuery ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const handleResolveDispute = async (
    disputeId: string,
    resolution: DisputeResolution,
    notes: string,
  ) => {
    const res = await api.disputes.resolve({ disputeId, resolution, notes });
    if (res.success) {
      toast.success("Dispute arbitration executed. Escrow updated.");
      loadAdminData();
      refreshLiveState();
    }
  };

  return (
    <Page>
      <PageHeader
        title="Operations & Integrity Control"
        subtitle="Live oversight of national agricultural trade, user trust scores, active logistics, and risk management"
        actions={
          IS_DEMO_MODE ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetDemo();
                toast.success("All mock data reset to initial seeds");
              }}
            >
              <RotateCcw className="mr-1.5 size-4" />
              Reset State Seed
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await refreshLiveState();
                await loadAdminData();
                toast.success("Live network state synchronized");
              }}
            >
              <Activity className="mr-1.5 size-4 text-primary" />
              Sync Live Network
            </Button>
          )
        }
      />

      {/* KPI Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Gross Merchandise Value"
            value={formatNaira(adminMetrics.gmv || gmv)}
            hint="Total escrow trade processed"
            icon={DollarSign}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Network Participants"
            value={adminMetrics.totalUsers || state.users.length}
            hint={`${farmers.length} Farmers · ${buyers.length} Buyers · ${transporters.length} Haulers`}
            icon={Users}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Active Trade & Transit"
            value={activeDeliveries.length + activeOrders.length}
            hint={`${activeDeliveries.length} in transit · ${activeOrders.length} orders`}
            icon={Truck}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <DashboardCard
            label="Network Average Trust"
            value={`${avgTrust}/100`}
            hint="Grounded reputation index"
            icon={ShieldCheck}
          />
        </motion.div>
      </motion.div>

      {/* Risk Signals & Discrepancies Alert Bar */}
      {adminMetrics.riskSignals && adminMetrics.riskSignals.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-amber-900 dark:text-amber-300">
            <AlertTriangle className="size-4 text-amber-600" />
            Active Governance Risk Signals (Discrepancies & Anomaly Detections)
          </div>
          <div className="mt-2 space-y-1.5">
            {adminMetrics.riskSignals.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400"
              >
                <span>• {r.description}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold border-amber-400 bg-background/50"
                >
                  {r.severity} Risk Signal
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Governance Sections */}
      <div className="mt-8 space-y-8">
        {/* Dispute Resolution Queue */}
        <DisputeReviewTable disputes={disputes} onResolveDispute={handleResolveDispute} />

        {/* KYB / KYC Verification Review Table */}
        <KYBAdminReviewTable />

        {/* Live Agricultural Trade & Freight Corridor Map */}
        <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="font-display text-xl font-bold">National Logistics Telemetry</h2>
              <p className="text-xs text-muted-foreground">
                Real-time positioning across northern agrarian corridors (Kano–Kaduna–Abuja–Lagos)
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              Live Telemetry Active
            </Badge>
          </div>
          <div className="mt-4">
            <AgroMap className="h-[440px] w-full rounded-2xl border" />
          </div>
        </Card>

        {/* Platform Business Model & Revenue Transparency */}
        <Card className="gap-0 p-5 shadow-[var(--shadow-card)] border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-gold" />
            <h2 className="font-display text-lg font-bold">
              How Agrolink Generates Sustainable Revenue
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Clear, transparent monetization without acting as a custodian or taking hidden spreads:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-background/80 p-3.5 shadow-2xs">
              <p className="font-bold text-sm text-foreground">1.0% Transaction Fee</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Charged transparently to buyer/seller on successfully delivered and accepted escrow
                settlements.
              </p>
            </div>
            <div className="rounded-xl border bg-background/80 p-3.5 shadow-2xs">
              <p className="font-bold text-sm text-foreground">Logistics Freight Commission</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                2-3% platform matching fee on return-haul interstate logistics and cold-chain route
                contracts.
              </p>
            </div>
            <div className="rounded-xl border bg-background/80 p-3.5 shadow-2xs">
              <p className="font-bold text-sm text-foreground">Tier-3 KYB & Fleet Verification</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Corporate compliance verification and fleet telematics onboarding for institutional
                buyers.
              </p>
            </div>
          </div>
        </Card>

        {/* User Directory & Trust Inspection Table */}
        <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Network Participant Registry</h2>
              <p className="text-xs text-muted-foreground">
                Inspect KYC/KYB tier, trust scores, dispute records, and account flags
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Input
                  placeholder="Search name or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 text-xs pl-8"
                />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 text-xs w-32">
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

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Trust Metric</th>
                  <th className="py-3 px-4">Fulfilment</th>
                  <th className="py-3 px-4">Risk Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => {
                  const trust = getTrust(user.id);

                  return (
                    <tr key={user.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{user.name}</div>
                        <span className="text-xs text-muted-foreground">{user.phone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{user.location}</td>
                      <td className="py-3 px-4">
                        {trust && <TrustScore trust={trust} size="sm" />}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {trust ? (
                          <span>
                            {trust.completedTransactions} sales · {trust.fulfilmentRate}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {user.flagged ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 w-fit text-[11px]"
                          >
                            <AlertTriangle className="size-3" /> Flagged
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 w-fit text-[11px] text-success"
                          >
                            <CheckCircle2 className="size-3 text-success" /> Clear
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/profile/$userId" params={{ userId: user.id }}>
                            Inspect
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Centralized Audit Trail */}
        {adminMetrics.auditLogs && adminMetrics.auditLogs.length > 0 && (
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <History className="size-5 text-primary" />
                <div>
                  <h2 className="font-display text-lg font-bold">Immutable Audit Trail Log</h2>
                  <p className="text-xs text-muted-foreground">
                    Chronological ledger of orders, escrow locks, milestones, and dispute
                    determinations
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {adminMetrics.auditLogs.length} Events Recorded
              </Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Actor ID</th>
                    <th className="p-3">Event Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {adminMetrics.auditLogs.slice(0, 10).map((log, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {new Date(
                          String(log["created_at"] || log["timestamp"] || Date.now()),
                        ).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {String(log["action"] || "AUDIT_EVENT")}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold">
                        {String(log["target_entity"] || log["entityType"] || "Entity")}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {String(log["actor_id"] || log["actorId"] || "System")}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                        {JSON.stringify(log["details"] || log["metadata"] || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Page>
  );
}
