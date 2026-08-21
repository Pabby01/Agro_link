import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sprout,
  ShoppingBasket,
  Truck,
  ShieldCheck,
  Leaf,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  MapPin,
} from "lucide-react";
import { LiquidCard } from "@/components/ui/LiquidCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api-client";
import { IS_DEMO_MODE } from "@/lib/config";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import type { Role } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Account & Authentication — Agrolink" },
      {
        name: "description",
        content:
          "Sign in or register a new verified account on Agrolink for farmers, buyers, and transporters.",
      },
      { property: "og:title", content: "Account & Authentication — Agrolink" },
      {
        property: "og:description",
        content: "Custom secure auth and verified supply-chain onboarding.",
      },
    ],
  }),
  component: AuthPage,
});

const demoRoles: {
  role: Role;
  name: string;
  icon: typeof Sprout;
  blurb: string;
  home: string;
  variant: "success" | "primary" | "gold" | "blue";
}[] = [
  {
    role: "farmer",
    name: "Abdul Farms (Kano)",
    icon: Sprout,
    blurb:
      "List produce, accept buyer orders, coordinate pickups, and grow your verified trust score.",
    home: "/dashboard/farmer",
    variant: "success",
  },
  {
    role: "buyer",
    name: "FreshMart Retail (Lagos)",
    icon: ShoppingBasket,
    blurb:
      "Browse verified farmers, order produce, manage cold-chain deliveries, and rate suppliers.",
    home: "/dashboard/buyer",
    variant: "primary",
  },
  {
    role: "transporter",
    name: "SwiftHaul Logistics (Abuja)",
    icon: Truck,
    blurb:
      "Pick up profitable haulage jobs, update live GPS corridor transit status, and build fleet trust.",
    home: "/dashboard/transporter",
    variant: "gold",
  },
  {
    role: "admin",
    name: "Agrolink Operations",
    icon: ShieldCheck,
    blurb:
      "Monitor national supply corridors, platform GMV, trust score integrity, and flagged accounts.",
    home: "/admin",
    variant: "blue",
  },
];

function AuthPage() {
  const { setRole, refreshLiveState } = useApp();
  const router = useRouter();

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [regFullName, setRegFullName] = useState("");
  const [regBusinessName, setRegBusinessName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"farmer" | "buyer" | "transporter">("farmer");
  const [regPhone, setRegPhone] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await api.auth.login({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);

    if (res.success && res.data?.user) {
      const user = res.data.user as { role: Role; full_name?: string };
      setRole(user.role);
      await refreshLiveState();
      toast.success(`Welcome back, ${user.full_name || "Partner"}!`);
      const targetHome =
        user.role === "farmer"
          ? "/dashboard/farmer"
          : user.role === "buyer"
            ? "/dashboard/buyer"
            : user.role === "transporter"
              ? "/dashboard/transporter"
              : "/admin";
      router.navigate({ to: targetHome as never });
    } else {
      toast.error(res.error || "Invalid credentials.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setRegLoading(true);
    const res = await api.auth.register({
      email: regEmail,
      password: regPassword,
      role: regRole,
      fullName: regFullName,
      businessName: regBusinessName,
      phone: regPhone,
      locationName: regLocation,
    });
    setRegLoading(false);

    if (res.success && res.data?.user) {
      const user = res.data.user as { role: Role };
      setRole(user.role);
      await refreshLiveState();
      toast.success(`Account registered successfully as ${user.role}!`);
      const targetHome =
        regRole === "farmer"
          ? "/dashboard/farmer"
          : regRole === "buyer"
            ? "/dashboard/buyer"
            : "/dashboard/transporter";
      router.navigate({ to: targetHome as never });
    } else {
      toast.error(res.error || "Registration failed.");
    }
  };

  const handleDemoSwitch = async (role: Role) => {
    const res = await api.auth.switchDemoRole(role);
    setRole(role);
    toast.success(`Switched to demo role: ${role}`);
    const home =
      role === "farmer"
        ? "/dashboard/farmer"
        : role === "buyer"
          ? "/dashboard/buyer"
          : role === "transporter"
            ? "/dashboard/transporter"
            : "/admin";
    router.navigate({ to: home as never });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Leaf className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Agrolink Access & Identity
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
          Real enterprise authentication with custom cryptographic password hashing and role-based
          escrow access.
        </p>
      </motion.div>

      <div className="mt-8">
        <Tabs defaultValue={IS_DEMO_MODE ? "demo" : "login"} className="w-full">
          <div className="flex justify-center">
            <TabsList
              className={cn("grid w-full max-w-md", IS_DEMO_MODE ? "grid-cols-3" : "grid-cols-2")}
            >
              {IS_DEMO_MODE && <TabsTrigger value="demo">Demo Access</TabsTrigger>}
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: 1-Click Quick Demo Switcher (Only visible in Demo Mode) */}
          {IS_DEMO_MODE && (
            <TabsContent value="demo" className="mt-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid gap-5 sm:grid-cols-2"
              >
                {demoRoles.map((r) => (
                  <motion.div key={r.role} variants={fadeInUp}>
                    <LiquidCard
                      variant={r.variant}
                      className="flex h-full flex-col justify-between p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 border-b pb-3.5">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
                              <r.icon className="size-5" aria-hidden />
                            </span>
                            <div>
                              <h2 className="font-display text-lg font-bold capitalize">
                                {r.role}
                              </h2>
                              <p className="text-xs text-muted-foreground">{r.name}</p>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {r.blurb}
                        </p>
                      </div>

                      <Button
                        className="mt-6 w-full font-bold shadow-xs transition-transform hover:scale-[1.02]"
                        onClick={() => handleDemoSwitch(r.role)}
                      >
                        Instant Sign In as {r.role}
                        <ArrowRight className="ml-1.5 size-4" />
                      </Button>
                    </LiquidCard>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          )}

          {/* TAB 2: Sign In with Real Credentials */}
          <TabsContent value="login" className="mt-8">
            <Card className="mx-auto max-w-md p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display text-xl font-bold">Sign In with Credentials</h2>
              <p className="text-xs text-muted-foreground">
                Enter your registered email address and secure password
              </p>

              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="loginEmail">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="e.g. abdul@agrolink.ng"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="pl-9"
                    />
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="loginPw">Password</Label>
                  <div className="relative">
                    <Input
                      id="loginPw"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pl-9"
                    />
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full font-bold shadow-xs transition-transform hover:scale-[1.01]"
                >
                  {loginLoading ? "Authenticating..." : "Sign In to Account"}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground pt-2">
                  Demo account password: <span className="font-mono font-bold">Agrolink@2026</span>
                </p>
              </form>
            </Card>
          </TabsContent>

          {/* TAB 3: Real Client Registration */}
          <TabsContent value="register" className="mt-8">
            <Card className="mx-auto max-w-xl p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display text-xl font-bold">Register Client Account</h2>
              <p className="text-xs text-muted-foreground">
                Join the verified agricultural trade network
              </p>

              <form onSubmit={handleRegister} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="regName">Full Legal Name *</Label>
                    <Input
                      id="regName"
                      placeholder="e.g. Alhaji Abdul Ibrahim"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="regBiz">Business / Farm Name *</Label>
                    <Input
                      id="regBiz"
                      placeholder="e.g. Abdul Integrated Farms"
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="regEmail">Email Address *</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="name@company.ng"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="regPhone">Phone Number *</Label>
                    <Input
                      id="regPhone"
                      placeholder="+234 803 123 4567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Supply Chain Role *</Label>
                    <Select
                      value={regRole}
                      onValueChange={(v: "farmer" | "buyer" | "transporter") => setRegRole(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer / Producer</SelectItem>
                        <SelectItem value="buyer">Buyer / Retail Aggregator</SelectItem>
                        <SelectItem value="transporter">Haulage & Logistics Carrier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="regLoc">Location (State / City) *</Label>
                    <Input
                      id="regLoc"
                      placeholder="e.g. Kano State"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regPw">Password (Min 8 characters) *</Label>
                  <Input
                    id="regPw"
                    type="password"
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={regLoading}
                  className="w-full font-bold shadow-xs transition-transform hover:scale-[1.01]"
                >
                  {regLoading ? "Creating Account..." : "Complete Registration & Sign In"}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
