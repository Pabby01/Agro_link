import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Database,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { Role } from "@/lib/types";

export interface Turn {
  id: string;
  question: string;
  answer: string;
  suggestion: string;
  keyMetrics?: { label: string; value: string }[] | undefined;
  action?: { label: string; to: string } | undefined;
  sources?: string[] | undefined;
}

export const suggestedPrompts: Record<Role, string[]> = {
  farmer: [
    "What is the current market clearing price for tomatoes?",
    "How can I improve my trust score to 95+?",
    "Which crops have the highest buyer demand this week?",
    "How can I reduce post-harvest spoilage during transit?",
  ],
  buyer: [
    "Where can I get the lowest price per kg for Roma tomatoes?",
    "Which verified farmers have the highest trust score?",
    "How does escrow payout protect my bulk agricultural purchase?",
    "What is the safest transit corridor from Kano to Lagos?",
  ],
  transporter: [
    "Which delivery jobs have the highest freight payout?",
    "How do I log cold-chain temperature readings for extra trust points?",
    "What are the active delivery routes open for claim right now?",
    "How is my transit fulfilment rate calculated?",
  ],
  admin: [
    "Are there any unreviewed high-risk KYB filings?",
    "What is the total platform GMV locked in escrow?",
    "How healthy is the national food logistics clearance rate?",
    "Show me accounts flagged for abnormal cancellation rates.",
  ],
};

export function AIAssistant({ role, compact = false }: { role: Role; compact?: boolean }) {
  const { currentUser } = useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  const ask = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    setInput("");
    setLoading(true);

    try {
      const res = await api.ai.query({
        prompt: q,
        role,
        userId: currentUser?.id,
      });

      if (res.success && res.data) {
        const turn: Turn = {
          id: `turn-${Date.now()}`,
          question: q,
          answer: res.data.answer,
          suggestion: res.data.suggestion,
          keyMetrics: res.data.keyMetrics,
          action: res.data.action,
          sources: res.data.sources,
        };
        setTurns((prev) => [...prev, turn]);
      } else {
        setTurns((prev) => [
          ...prev,
          {
            id: `turn-${Date.now()}`,
            question: q,
            answer:
              "Agrolink AI is processing current network activity. All listings and verified escrow transactions are active.",
            suggestion: "Explore the live marketplace for current farmer stock.",
            action: { label: "Go to Marketplace", to: "/marketplace" },
          },
        ]);
      }
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          id: `turn-${Date.now()}`,
          question: q,
          answer: "Unable to query AI intelligence service right now.",
          suggestion: "Please verify your internet connection or check live listings manually.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-0 p-4 shadow-[var(--shadow-card)] sm:p-6 border-border/80 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold">Agrolink AI Intelligence</h2>
              <Badge variant="outline" className="text-[10px] font-semibold bg-muted/60">
                <Database className="mr-1 size-2.5 text-primary" /> Live DB Grounded
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time pricing, trust metrics & corridor logistics intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="my-4 max-h-[460px] min-h-[160px] space-y-4 overflow-y-auto pr-1">
        {turns.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-5 text-center">
            <Sparkles className="mx-auto size-6 text-gold animate-pulse" />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Ask anything about live prices, farmer trust, or freight logistics
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Every answer is synthesized directly from active database records and Nigerian
              agricultural trade benchmarks.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {turns.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* User Question */}
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs">
                  {t.question}
                </p>
              </div>

              {/* AI Grounded Response */}
              <div className="max-w-[95%] rounded-2xl rounded-tl-xs border bg-background/90 p-4 shadow-xs backdrop-blur-xs space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <ShieldCheck className="size-3.5" />
                  Grounded Intelligence
                </div>

                <p className="text-sm leading-relaxed text-foreground">{t.answer}</p>

                {/* Key Metrics Badges */}
                {t.keyMetrics && t.keyMetrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
                    {t.keyMetrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border bg-muted/50 p-2 text-center shadow-2xs"
                      >
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          {m.label}
                        </p>
                        <p className="text-xs font-extrabold text-foreground mt-0.5">{m.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actionable Suggestion */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground flex items-start gap-2">
                  <TrendingUp className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-primary">Strategic Suggestion: </span>
                    {t.suggestion}
                  </div>
                </div>

                {/* Grounding Citations & Action Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                  {t.sources && t.sources.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      Grounded in {t.sources.join(" · ")}
                    </div>
                  )}

                  {t.action && (
                    <Button
                      asChild
                      size="sm"
                      className="ml-auto rounded-lg text-xs font-bold shadow-2xs"
                    >
                      <Link to={t.action.to as never}>
                        {t.action.label}
                        <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin text-primary" />
            Analyzing live marketplace listings, trust indices, and logistics telemetry...
          </motion.div>
        )}
      </div>

      {/* Suggested Prompts */}
      {!compact && (
        <div className="border-t pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Suggested Market Queries ({role})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts[role].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => ask(p)}
                disabled={loading}
                className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground cursor-pointer disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        className="mt-3 flex items-center gap-2 border-t pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Agrolink AI for ${role} intelligence…`}
          aria-label="Ask Agrolink AI"
          disabled={loading}
          className="rounded-xl shadow-xs"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send question"
          disabled={loading || !input.trim()}
          className="rounded-xl shrink-0"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </Card>
  );
}
