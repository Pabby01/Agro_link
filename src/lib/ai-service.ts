import type { AIInsight, Role } from "./types";
import type { AppState } from "./store";
import { insights as seededInsights } from "./mock-data";

/**
 * Mock AI service. Answers are derived from live marketplace state so the
 * assistant feels grounded. Replace `askAgrolinkAI` with a real model call
 * (OpenAI / Gemini / Anthropic / any LLM) later — the signature stays the same.
 */

export interface AIReply {
  answer: string;
  suggestion: string;
  action?: { label: string; to: string } | undefined;
}

export const suggestedPrompts: Record<Role, string[]> = {
  farmer: [
    "What should I do with my tomatoes that have been listed for 5 days?",
    "How is my trust score trending?",
    "Which of my listings is most likely to sell this week?",
  ],
  buyer: [
    "Which farmer should I consider?",
    "Where can I get the cheapest tomatoes?",
    "Is it safe to order from a low trust farmer?",
  ],
  transporter: [
    "Which delivery should I prioritize?",
    "How much can I earn from open jobs?",
    "How do I improve my trust score?",
  ],
  admin: [
    "Any risky activity I should review?",
    "What is the average trust score right now?",
    "How healthy is the marketplace?",
  ],
};

const naira = (v: number) => `₦${Math.round(v).toLocaleString("en-NG")}`;

export function askAgrolinkAI(question: string, role: Role, state: AppState): AIReply {
  const q = question.toLowerCase();

  if (role === "farmer") {
    const mine = state.produce.filter((p) => p.farmerId === "u-farmer-1");
    const stale = mine
      .filter((p) => Date.now() - +new Date(p.listedAt) > 4 * 86_400_000)
      .sort((a, b) => +new Date(a.listedAt) - +new Date(b.listedAt))[0];
    if (q.includes("tomato") || q.includes("listed") || q.includes("price") || q.includes("sell")) {
      if (stale) {
        const days = Math.floor((Date.now() - +new Date(stale.listedAt)) / 86_400_000);
        return {
          answer: `Your ${stale.name} has been listed for ${days} days — longer than comparable listings in ${stale.location.split(",")[0]}, which typically clear in 3 days.`,
          suggestion: `Reduce the price by 5–8% (about ${naira(stale.pricePerKg * 0.94)}/kg) or bundle delivery to attract bulk buyers.`,
          action: { label: "Open my listings", to: "/dashboard/farmer" },
        };
      }
      return {
        answer:
          "All your listings are fresh — none has been on the marketplace longer than 4 days.",
        suggestion: "Hold your current pricing and add a new listing to capture more demand.",
        action: { label: "Create a listing", to: "/dashboard/farmer" },
      };
    }
    if (q.includes("trust")) {
      const t = state.trust.find((x) => x.userId === "u-farmer-1")!;
      return {
        answer: `Your trust score is ${t.score} (${t.level}) with ${t.completedTransactions} completed transactions and a ${t.fulfilmentRate}% fulfilment rate.`,
        suggestion:
          "Fulfil the next 3 orders on time to push into the 95+ band and rank higher in buyer search.",
        action: { label: "View pending orders", to: "/dashboard/farmer" },
      };
    }
  }

  if (role === "buyer") {
    const suppliers = state.produce
      .filter((p) => p.available)
      .map((p) => ({ p, trust: state.trust.find((t) => t.userId === p.farmerId)! }))
      .filter((x) => x.trust);
    const tomatoes = suppliers.filter((x) => x.p.name.toLowerCase().includes("tomato"));
    const pool = (q.includes("tomato") ? tomatoes : suppliers).sort(
      (a, b) => b.trust.score - a.trust.score,
    );
    if (q.includes("cheap") || q.includes("price")) {
      const cheapest = [...(q.includes("tomato") ? tomatoes : suppliers)].sort(
        (a, b) => a.p.pricePerKg - b.p.pricePerKg,
      )[0];
      if (cheapest) {
        const farmer = state.users.find((u) => u.id === cheapest.p.farmerId);
        return {
          answer: `${cheapest.p.name} from ${farmer?.name} in ${cheapest.p.location} is the lowest priced option at ${naira(cheapest.p.pricePerKg)}/kg (trust ${cheapest.trust.score}).`,
          suggestion:
            cheapest.trust.score < 75
              ? "Lower price comes with lower trust — consider a smaller trial order first."
              : "Good value and solid trust — worth a full order.",
          action: { label: "See it in marketplace", to: "/marketplace" },
        };
      }
    }
    const best = pool[0];
    if (best) {
      const farmer = state.users.find((u) => u.id === best.p.farmerId);
      return {
        answer: `${farmer?.name} has the highest trust score among available suppliers (${best.trust.score}) and has completed ${best.trust.completedTransactions} transactions with a ${best.trust.fulfilmentRate}% fulfilment rate.`,
        suggestion: `Order ${best.p.name} from ${farmer?.name} at ${naira(best.p.pricePerKg)}/kg and request urgent delivery.`,
        action: { label: "Open marketplace", to: "/marketplace" },
      };
    }
  }

  if (role === "transporter") {
    const open = state.deliveries.filter((d) => d.status === "Pending");
    if (q.includes("earn") || q.includes("money") || q.includes("pay")) {
      const total = open.reduce((sum, d) => sum + d.fee, 0);
      return {
        answer: `There are ${open.length} open jobs worth ${naira(total)} in total payout.`,
        suggestion:
          "Accept the two urgent jobs first — urgent loads carry a higher fee per kilometre.",
        action: { label: "See delivery jobs", to: "/dashboard/transporter" },
      };
    }
    const priority = [...open].sort(
      (a, b) =>
        (b.urgency === "Urgent" ? 1 : 0) - (a.urgency === "Urgent" ? 1 : 0) || b.fee - a.fee,
    )[0];
    if (priority) {
      return {
        answer: `Prioritise ${priority.pickup.label} → ${priority.destination.label}: ${priority.urgency.toLowerCase()}, ${priority.distanceKm}km, ${naira(priority.fee)} payout.`,
        suggestion:
          "Accept it now and mark pickup within 12 hours to protect your 99% on-time record.",
        action: { label: "Accept delivery", to: "/dashboard/transporter" },
      };
    }
    return {
      answer: "There are no open delivery jobs right now.",
      suggestion: "Keep your status available — new jobs appear as soon as buyers place orders.",
      action: { label: "Back to dashboard", to: "/dashboard/transporter" },
    };
  }

  if (role === "admin") {
    const avg = Math.round(state.trust.reduce((s, t) => s + t.score, 0) / state.trust.length);
    const flagged = state.users.filter((u) => u.flagged);
    return {
      answer: `Average marketplace trust is ${avg}. ${flagged.length} account${flagged.length === 1 ? "" : "s"} currently flagged: ${flagged.map((f) => f.name).join(", ") || "none"}.`,
      suggestion: "Review flagged transporters before assigning them to urgent perishable loads.",
      action: { label: "Open admin dashboard", to: "/admin" },
    };
  }

  const fallback = seededInsights.find((i: AIInsight) => i.role === role);
  return {
    answer:
      fallback?.answer ??
      "I can help with pricing, trust evaluation, order decisions and delivery prioritisation.",
    suggestion:
      fallback?.suggestion ?? "Try one of the suggested prompts to see Agrolink AI in action.",
    action: fallback?.action,
  };
}
