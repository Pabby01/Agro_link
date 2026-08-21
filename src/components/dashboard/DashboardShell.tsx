import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronRight,
  ShieldCheck,
  Package,
  ShoppingBag,
  Truck,
  Sparkles,
  Layers,
  CheckCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Page, PageHeader } from "@/components/layout/AppShell";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DashboardSection {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number | undefined;
  badge?: string | undefined;
  highlight?: boolean | undefined;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  role: Role;
  roleBadgeText?: string;
  sections: DashboardSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  role,
  roleBadgeText,
  sections,
  activeSection,
  onSectionChange,
  headerActions,
  children,
}: DashboardShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeSectionObj = sections.find((s) => s.id === activeSection) || sections[0];

  const handleSelectSection = (id: string) => {
    onSectionChange(id);
    setMobileDrawerOpen(false);
  };

  return (
    <Page>
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {roleBadgeText && (
              <Badge variant="secondary" className="capitalize text-xs font-bold shadow-2xs">
                {roleBadgeText}
              </Badge>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
        </div>

        {/* Header Action Buttons (e.g. New Listing, KYB Modal) */}
        {headerActions && (
          <div className="flex flex-wrap items-center gap-2">{headerActions}</div>
        )}
      </div>

      {/* Mobile Feature Navigator Bar with Collapsible Sidebar Trigger */}
      <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card p-2 shadow-2xs md:hidden">
        <div className="flex items-center gap-2 pl-2">
          {activeSectionObj && (
            <>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <activeSectionObj.icon className="size-4" />
              </span>
              <span className="text-xs font-bold text-foreground">
                {activeSectionObj.label}
              </span>
            </>
          )}
        </div>

        {/* Collapsible Mobile Drawer Trigger Button */}
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-bold cursor-pointer">
              <Menu className="size-3.5" />
              <span>Features</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {sections.length}
              </Badge>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-5 space-y-4">
            <SheetHeader className="text-left border-b pb-3">
              <SheetTitle className="font-display text-lg font-bold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Dashboard Features
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Tap to jump directly to any feature section
              </p>
            </SheetHeader>

            <nav className="space-y-1.5">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSelectSection(sec.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      sec.highlight && !isActive && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0" />
                      <span>{sec.label}</span>
                    </div>
                    {sec.count !== undefined && (
                      <Badge
                        variant={isActive ? "secondary" : "outline"}
                        className="text-[10px] px-1.5 py-0 font-bold"
                      >
                        {sec.count}
                      </Badge>
                    )}
                    {sec.badge && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary"
                      >
                        {sec.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop / Tablet Feature Tabs Navigation Bar */}
      <div className="mt-5 hidden md:block border-b border-border/70 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSectionChange(sec.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold scale-[1.02]"
                    : "bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground",
                  sec.highlight && !isActive && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold",
                )}
              >
                <Icon className="size-3.5" />
                <span>{sec.label}</span>
                {sec.count !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-extrabold",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {sec.count}
                  </span>
                )}
                {sec.badge && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    {sec.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dynamic Feature Content Area */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
}
