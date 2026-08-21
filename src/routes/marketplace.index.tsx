import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { ProduceCard } from "@/components/marketplace/ProduceCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { fadeInUp, staggerFast } from "@/lib/animations";
import type { ProduceCategory } from "@/lib/types";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Marketplace — Buy Verified Nigerian Produce | Agrolink" },
      {
        name: "description",
        content:
          "Browse tomatoes, maize, cassava, yam and more from trust-scored Nigerian farmers, with transparent pricing per kilogram.",
      },
      { property: "og:title", content: "Agrolink Marketplace" },
      {
        property: "og:description",
        content: "Verified produce from trust-scored Nigerian farmers.",
      },
    ],
  }),
  component: MarketplacePage,
});

const categories: (ProduceCategory | "All")[] = [
  "All",
  "Vegetables",
  "Grains",
  "Tubers",
  "Fruits",
  "Legumes",
];

function MarketplacePage() {
  const { state, getTrust } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState("trust");
  const [availability, setAvailability] = useState("available");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.produce
      .filter((p) => (availability === "available" ? p.available : true))
      .filter((p) => (category === "All" ? true : p.category === category))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (sort === "price-asc") return a.pricePerKg - b.pricePerKg;
        if (sort === "price-desc") return b.pricePerKg - a.pricePerKg;
        if (sort === "newest") return +new Date(b.listedAt) - +new Date(a.listedAt);
        return (getTrust(b.farmerId)?.score ?? 0) - (getTrust(a.farmerId)?.score ?? 0);
      });
  }, [state.produce, query, category, sort, availability, getTrust]);

  return (
    <Page>
      <PageHeader
        title="Marketplace"
        subtitle="Every listing shows the farmer's trust score so you know exactly who you are buying from."
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-9 shadow-xs"
            placeholder="Search produce or location"
            aria-label="Search produce"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Filter by category" className="shadow-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "All categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Sort listings" className="shadow-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trust">Highest trust first</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="newest">Newest listings</SelectItem>
          </SelectContent>
        </Select>
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger aria-label="Filter by availability" className="shadow-xs">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available now</SelectItem>
            <SelectItem value="all">Include unavailable</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="text-foreground font-bold">{items.length}</span> verified listing
          {items.length === 1 ? "" : "s"}
        </p>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-10 rounded-2xl border border-dashed p-12 text-center bg-card/40"
        >
          <p className="font-display text-lg font-bold">No produce matches your filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing the search or choosing a different category.
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          initial="hidden"
          animate="visible"
          variants={staggerFast}
          className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
              >
                <ProduceCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </Page>
  );
}
