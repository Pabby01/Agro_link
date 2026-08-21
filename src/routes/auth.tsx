import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sprout,
  ShoppingBasket,
  Truck,
  Leaf,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
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

// Demo roles for hackathon evaluation (Farmer, Buyer, Transporter only — Admin excluded from public switch)
const demoRoles: {
  role: Role;
  name: string;
  icon: typeof Sprout;
  blurb: string;
  home: string;
  variant: "success" | "primary" | "gold";
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
];

type RegErrorKey =
  | "fullName"
  | "businessName"
  | "email"
  | "phone"
  | "location"
  | "password"
  | "confirmPassword";

function AuthPage() {
  const { setRole, refreshLiveState } = useApp();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"login" | "register" | "demo">(
    IS_DEMO_MODE ? "demo" : "login",
  );

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regFullName, setRegFullName] = useState("");
  const [regBusinessName, setRegBusinessName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<"farmer" | "buyer" | "transporter">("farmer");
  const [regPhone, setRegPhone] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regErrors, setRegErrors] = useState<Partial<Record<RegErrorKey, string>>>({});
  const [regLoading, setRegLoading] = useState(false);

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone regex (Nigerian & International formats)
  const phoneRegex = /^(?:\+?234|0)[789][01]\d{8}$|^(\+?\d{10,14})$/;

  const clearLoginError = (field: "email" | "password") => {
    setLoginErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clearRegError = (field: RegErrorKey) => {
    setRegErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Validate Login Form
  const validateLoginForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!loginEmail.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(loginEmail.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@company.ng)";
    }

    if (!loginPassword) {
      errors.password = "Password is required";
    } else if (loginPassword.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Register Form
  const validateRegisterForm = (): boolean => {
    const errors: Partial<Record<RegErrorKey, string>> = {};

    if (!regFullName.trim()) {
      errors.fullName = "Full Legal Name is required";
    } else if (regFullName.trim().length < 3) {
      errors.fullName = "Name must be at least 3 characters";
    }

    if (!regBusinessName.trim()) {
      errors.businessName = "Business / Farm Name is required";
    } else if (regBusinessName.trim().length < 2) {
      errors.businessName = "Business name must be at least 2 characters";
    }

    if (!regEmail.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(regEmail.trim())) {
      errors.email = "Please enter a valid email address";
    }

    const cleanPhone = regPhone.replace(/\s+/g, "");
    if (!cleanPhone) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = "Enter a valid Nigerian phone number (e.g. +234 803 123 4567 or 08031234567)";
    }

    if (!regLocation.trim()) {
      errors.location = "Location (State / City) is required";
    } else if (regLocation.trim().length < 2) {
      errors.location = "Please provide your state or city";
    }

    if (!regPassword) {
      errors.password = "Password is required";
    } else if (regPassword.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/[0-9]/.test(regPassword) && !/[^a-zA-Z0-9]/.test(regPassword)) {
      errors.password = "Password must include at least one number or symbol";
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) {
      toast.error("Please correct the errors in the login form.");
      return;
    }

    setLoginLoading(true);
    const res = await api.auth.login({
      email: loginEmail.trim(),
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
      setLoginErrors((prev) => ({ ...prev, password: res.error || "Invalid credentials." }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) {
      toast.error("Please fill in all required registration fields properly.");
      return;
    }

    setRegLoading(true);
    const res = await api.auth.register({
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      fullName: regFullName.trim(),
      businessName: regBusinessName.trim(),
      phone: regPhone.trim(),
      locationName: regLocation.trim(),
    });
    setRegLoading(false);

    if (res.success && res.data?.user) {
      const user = res.data.user as { role: Role };
      setRole(user.role);
      await refreshLiveState();
      toast.success(`Account registered successfully as verified ${user.role}!`);
      const targetHome =
        regRole === "farmer"
          ? "/dashboard/farmer"
          : regRole === "buyer"
            ? "/dashboard/buyer"
            : "/dashboard/transporter";
      router.navigate({ to: targetHome as never });
    } else {
      const errMsg = res.error || "Registration failed.";
      toast.error(errMsg);
      if (errMsg.toLowerCase().includes("email")) {
        setRegErrors((prev) => ({ ...prev, email: errMsg }));
      }
    }
  };

  const handleDemoSwitch = async (role: Role) => {
    await api.auth.switchDemoRole(role);
    setRole(role);
    await refreshLiveState();
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
          Verified agricultural trade network with direct Supabase PostgreSQL persistence and role-based escrow access.
        </p>
      </motion.div>

      <div className="mt-8">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "login" | "register" | "demo")}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList
              className={cn("grid w-full max-w-md", IS_DEMO_MODE ? "grid-cols-3" : "grid-cols-2")}
            >
              {IS_DEMO_MODE && <TabsTrigger value="demo">Demo Access</TabsTrigger>}
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: 1-Click Quick Demo Switcher (Only visible in Demo Mode, No Admin) */}
          {IS_DEMO_MODE && (
            <TabsContent value="demo" className="mt-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid gap-5 sm:grid-cols-3"
              >
                {demoRoles.map((r) => (
                  <motion.div key={r.role} variants={fadeInUp}>
                    <LiquidCard
                      variant={r.variant}
                      className="flex h-full flex-col justify-between p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 border-b pb-3.5">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {r.role}
                            </p>
                            <h2 className="mt-0.5 font-display text-base font-bold text-foreground">
                              {r.name}
                            </h2>
                          </div>
                          <span className="grid size-9 place-items-center rounded-xl bg-background/80 text-foreground shadow-xs">
                            <r.icon className="size-4" aria-hidden />
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                          {r.blurb}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleDemoSwitch(r.role)}
                        className="mt-5 w-full font-bold shadow-xs cursor-pointer"
                        size="sm"
                      >
                        Enter as {r.role}
                        <ArrowRight className="ml-1.5 size-3.5" aria-hidden />
                      </Button>
                    </LiquidCard>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          )}

          {/* TAB 2: Live Sign In Form */}
          <TabsContent value="login" className="mt-8">
            <Card className="mx-auto max-w-md p-6 sm:p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Sign In to Agrolink</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Access your verified produce listings, escrow settlements, and live deliveries.
              </p>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loginEmail" className="text-xs font-bold">
                      Email Address *
                    </Label>
                    {loginErrors.email && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-destructive">
                        <AlertCircle className="size-3" />
                        {loginErrors.email}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="name@company.ng"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginErrors.email) clearLoginError("email");
                      }}
                      className={cn(
                        "pl-9 transition-colors",
                        loginErrors.email && "border-destructive focus-visible:ring-destructive",
                      )}
                      required
                    />
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loginPw" className="text-xs font-bold">
                      Password *
                    </Label>
                    {loginErrors.password && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-destructive">
                        <AlertCircle className="size-3" />
                        {loginErrors.password}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="loginPw"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginErrors.password) clearLoginError("password");
                      }}
                      className={cn(
                        "pl-9 pr-10 transition-colors",
                        loginErrors.password && "border-destructive focus-visible:ring-destructive",
                      )}
                      required
                    />
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full font-bold shadow-xs cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In to Account
                      <ArrowRight className="ml-1.5 size-4" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* TAB 3: Real Client Registration Form */}
          <TabsContent value="register" className="mt-8">
            <Card className="mx-auto max-w-xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Register Client Account</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Join the verified agricultural trade network with real database profile persistence.
              </p>

              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                {/* Row 1: Full Name & Business Name */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="regName" className="text-xs font-bold">
                        Full Legal Name *
                      </Label>
                      {regErrors.fullName && (
                        <span className="text-[10px] text-destructive font-medium">
                          {regErrors.fullName}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="regName"
                        placeholder="e.g. Alhaji Abdul Ibrahim"
                        value={regFullName}
                        onChange={(e) => {
                          setRegFullName(e.target.value);
                          if (regErrors.fullName) clearRegError("fullName");
                        }}
                        className={cn("pl-9", regErrors.fullName && "border-destructive")}
                        required
                      />
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="regBiz" className="text-xs font-bold">
                        Business / Farm Name *
                      </Label>
                      {regErrors.businessName && (
                        <span className="text-[10px] text-destructive font-medium">
                          {regErrors.businessName}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="regBiz"
                        placeholder="e.g. Abdul Integrated Farms"
                        value={regBusinessName}
                        onChange={(e) => {
                          setRegBusinessName(e.target.value);
                          if (regErrors.businessName) clearRegError("businessName");
                        }}
                        className={cn("pl-9", regErrors.businessName && "border-destructive")}
                        required
                      />
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email & Phone Number */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="regEmail" className="text-xs font-bold">
                        Email Address *
                      </Label>
                      {regErrors.email && (
                        <span className="text-[10px] text-destructive font-medium">
                          {regErrors.email}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="regEmail"
                        type="email"
                        placeholder="name@company.ng"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          if (regErrors.email) clearRegError("email");
                        }}
                        className={cn("pl-9", regErrors.email && "border-destructive")}
                        required
                      />
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="regPhone" className="text-xs font-bold">
                        Phone Number *
                      </Label>
                      {regErrors.phone && (
                        <span className="text-[10px] text-destructive font-medium">
                          {regErrors.phone}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="regPhone"
                        placeholder="+234 803 123 4567"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          if (regErrors.phone) clearRegError("phone");
                        }}
                        className={cn("pl-9", regErrors.phone && "border-destructive")}
                        required
                      />
                      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Supply Chain Role & Location */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Supply Chain Role *</Label>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="regLoc" className="text-xs font-bold">
                        Location (State / City) *
                      </Label>
                      {regErrors.location && (
                        <span className="text-[10px] text-destructive font-medium">
                          {regErrors.location}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="regLoc"
                        placeholder="e.g. Kano (Dawanau Agrarian Belt)"
                        value={regLocation}
                        onChange={(e) => {
                          setRegLocation(e.target.value);
                          if (regErrors.location) clearRegError("location");
                        }}
                        className={cn("pl-9", regErrors.location && "border-destructive")}
                        required
                      />
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Password & Confirm Password */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="regPw" className="text-xs font-bold">
                        Password (Min 8 chars) *
                      </Label>
                      {regErrors.password && (
                        <span className="text-[10px] text-destructive font-medium">
                          {regErrors.password}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="regPw"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create strong password"
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (regErrors.password) clearRegError("password");
                        }}
                        className={cn("pl-9 pr-10", regErrors.password && "border-destructive")}
                        required
                      />
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="regConfirmPw" className="text-xs font-bold">
                        Confirm Password *
                      </Label>
                      {regErrors.confirmPassword && (
                        <span className="text-[10px] text-destructive font-medium">
                          {regErrors.confirmPassword}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="regConfirmPw"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          if (regErrors.confirmPassword) clearRegError("confirmPassword");
                        }}
                        className={cn("pl-9 pr-10", regErrors.confirmPassword && "border-destructive")}
                        required
                      />
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1 border">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    Automatic Trust Profile Provisioning
                  </div>
                  <p>
                    Your profile will be saved to Supabase with an initial Tier-1 KYB status and an 80-point trust score.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={regLoading}
                  className="w-full font-bold shadow-xs cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating Account & Syncing Database...
                    </>
                  ) : (
                    <>
                      Complete Registration & Sign In
                      <ArrowRight className="ml-1.5 size-4" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
