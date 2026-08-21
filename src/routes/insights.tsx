import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { CropScanner } from "@/components/ai/CropScanner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApp } from "@/lib/store";
import { Leaf, MessageSquareCode } from "lucide-react";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Intelligence — Agrolink" },
      {
        name: "description",
        content: "Instant AI crop disease diagnosis and live agricultural market intelligence.",
      },
      { property: "og:title", content: "Agrolink AI" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { role } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>(role || "farmer");
  const [activeTab, setActiveTab] = useState<"scanner" | "chat">("scanner");

  return (
    <Page>
      <PageHeader
        title="Agrolink AI"
        subtitle="Instant crop disease diagnostics and live agricultural market guidance."
      />

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "scanner" | "chat")}>
          <TabsList className="grid w-full max-w-sm grid-cols-2 h-10 p-1 bg-muted/80 rounded-xl mb-6">
            <TabsTrigger
              value="scanner"
              className="flex items-center gap-1.5 rounded-lg text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Leaf className="size-3.5" />
              Crop Doctor
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-1.5 rounded-lg text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquareCode className="size-3.5" />
              Market Advisor
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CROP SCANNER */}
          <TabsContent value="scanner" className="focus-visible:outline-none">
            <CropScanner />
          </TabsContent>

          {/* TAB 2: MARKET INTELLIGENCE CHAT */}
          <TabsContent value="chat" className="focus-visible:outline-none max-w-3xl mx-auto">
            <AIAssistant role={selectedRole} />
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}
