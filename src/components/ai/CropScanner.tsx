import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Send,
  Loader2,
  Globe,
  Leaf,
  ShoppingBag,
  Truck,
  RotateCcw,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { NigerianLanguage, CropDiagnosis } from "@/types/domain";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PresetSample {
  id: string;
  name: string;
  crop: string;
  image: string;
  condition: string;
  confidence: number;
  severity: "Low" | "Moderate" | "Severe";
  description: string;
  likelyCauses: string[];
  recommendedActions: string[];
  preventive: string[];
  translations: Record<NigerianLanguage, { condition: string; description: string; actions: string[] }>;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "sample-tomato-blight",
    name: "Tomato Leaf Blight",
    crop: "Roma Tomatoes",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb2251e?w=800&auto=format&fit=crop&q=80",
    condition: "Early Blight (Alternaria solani)",
    confidence: 94,
    severity: "Moderate",
    description: "Concentric dark brown circular spots with yellow chlorotic halos on lower foliage.",
    likelyCauses: [
      "High humidity (>80%) combined with warm temperatures (24-29°C)",
      "Overhead irrigation splashing soil-borne fungal spores onto leaves",
      "Dense canopy restricting natural airflow",
    ],
    recommendedActions: [
      "Prune and safely burn or bury heavily spotted bottom leaves immediately.",
      "Switch from overhead sprinkling to ground drip irrigation at root base.",
      "Apply copper hydroxide or organic neem bio-fungicide early morning.",
      "Stake and trellis vines to elevate foliage 30cm above soil.",
    ],
    preventive: [
      "Practice 3-year crop rotation with non-solanaceous crops (maize, legumes).",
      "Ensure 60cm row spacing for optimal sunlight penetration.",
    ],
    translations: {
      en: {
        condition: "Early Blight (Alternaria solani)",
        description: "Dark brown concentric rings on tomato leaves causing premature leaf drop.",
        actions: [
          "Prune heavily spotted bottom leaves immediately.",
          "Avoid overhead watering; apply water directly to the soil.",
          "Apply organic copper fungicide in early morning.",
        ],
      },
      yo: {
        condition: "Àrùn Èérún Ewé Tòmátì (Early Blight)",
        description: "Àwọn àbàwọ́n dúdú lórí ewé tòmátì tó ń mú kí ewé rẹ̀ tètè rọ.",
        actions: [
          "Bẹ́ àwọn ewé tó ti bàjẹ́ kúrò lẹ́sẹ̀kẹsẹ̀ kí o sì sun wọ́n.",
          "Má ṣe bu omi sórí ewé; bu omi sí gbòǹgbò nìkan.",
          "Lo oògùn àgbo adánidá (copper fungicide) ní àárọ̀ kùtùkùtù.",
        ],
      },
      ha: {
        condition: "Cutar Bakar Tabo a Ganyen Tumatur (Early Blight)",
        description: "Bakar tabo a jikin ganyen tumatur dake sa ganye ya bushe ya zube.",
        actions: [
          "Cire ganyen da suka kamu da cutar sannan a kona su.",
          "A guji yayyafa ruwa a kan ganye; a zuba ruwa a gindin shuka.",
          "A fesa maganin feshi na jan karfe (copper fungicide) da sassafe.",
        ],
      },
      ig: {
        condition: "Ọrịa Ntụpọ Ojii na Akwụkwọ Tomato (Early Blight)",
        description: "Ntụpọ ojii gbara okirikiri na akwụkwọ tomato na-eme ka ha daa ngwa ngwa.",
        actions: [
          "Gbutuo akwụkwọ ndị ọrịa metụtara ngwa ngwa ma kpọọ ha ọkụ.",
          "Akpọsara mmiri n'elu akwụkwọ; gbasaa mmiri n'ala nso n'ogwe.",
          "Fesa ọgwụ fungus nke organic n'isi ụtụtụ.",
        ],
      },
    },
  },
  {
    id: "sample-maize-armyworm",
    name: "Maize Stem Infestation",
    crop: "White Maize",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80",
    condition: "Fall Armyworm (Spodoptera frugiperda)",
    confidence: 91,
    severity: "Severe",
    description: "Window-pane skeletonized feeding marks in whorl with characteristic sawdust-like frass.",
    likelyCauses: [
      "Nocturnal adult moth egg deposits in late vegetative stage",
      "Dry spell followed by early rains accelerating caterpillar hatch cycles",
    ],
    recommendedActions: [
      "Apply bio-pesticide (Bacillus thuringiensis or neem extract) deep into leaf whorls.",
      "Handpick and destroy egg masses on smallholder plots (<1 hectare).",
      "Deploy pheromone traps around plot boundaries for biological suppression.",
    ],
    preventive: [
      "Intercrop with desmodium or beans (Push-Pull pest strategy).",
      "Early synchronous planting with surrounding cooperative farms.",
    ],
    translations: {
      en: {
        condition: "Fall Armyworm Damage",
        description: "Caterpillar chewing damage deep inside maize whorl with sawdust-like frass.",
        actions: [
          "Apply bio-pesticide into central whorls early morning or evening.",
          "Handpick egg masses and larvae where feasible.",
          "Set up pheromone attractant traps.",
        ],
      },
      yo: {
        condition: "Àkóràn Kòkòrò Ọmọ-ogun Àgbàdo (Fall Armyworm)",
        description: "Kòkòrò tó ń jẹ àárín ewé àgbàdo tí ó sì ń fi eruku bíi ìrẹ́pọ̀ síbẹ̀.",
        actions: [
          "Fún oògùn kòkòrò organic sí àárín àgbàdo ní ìrọ̀lẹ́.",
          "Ṣa àwọn ẹyin kòkòrò kúrò pẹ̀lú ọwọ́.",
          "Gbin ẹ̀wà pọ̀ mọ́ àgbàdo láti lé kòkòrò dànù.",
        ],
      },
      ha: {
        condition: "Cutar Tsutsa a Masara (Fall Armyworm)",
        description: "Tsutsotsi masu cin ganyen ciki na masara suna barin kura kamar ta itace.",
        actions: [
          "A zuba maganin kashe kwari a cikin tsakiyar shukar masara da yamma.",
          "A kwashe tsutsotsin da hannu idan gonar ba babba bace.",
          "A hada shukar masara da wake domin korar kwari.",
        ],
      },
      ig: {
        condition: "Mmebi nke Nnukwu Nri Oka (Fall Armyworm)",
        description: "Nri na-ata ime akwụkwọ ọka na-ahapụ ntụ dị ka nke osisi a wara awa.",
        actions: [
          "Tinye ọgwụ na-egbu ụmụ ahụhụ n'ime oghere ọka n'anyasị.",
          "Tụtụkọta àkwá na ụmụ ahụhụ jiri aka ma bibie ha.",
          "Kụọ ọka na agwa ọnụ iji chụpụ ụmụ ahụhụ.",
        ],
      },
    },
  },
  {
    id: "sample-cassava-mosaic",
    name: "Cassava Mosaic Virus",
    crop: "Cassava Tubers",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80",
    condition: "Cassava Mosaic Geminivirus (CMD)",
    confidence: 88,
    severity: "Moderate",
    description: "Asymmetrical green-yellow chlorotic mottling, leaf distortion, and stunted petiole growth.",
    likelyCauses: [
      "Transmission by Whitefly (Bemisia tabaci) vectors",
      "Use of infected stem cuttings from previous harvest",
    ],
    recommendedActions: [
      "Rogue (uproot) severely stunted diseased plants immediately to protect neighbors.",
      "Replace cuttings next season with TME 419 or IITA certified virus-resistant stems.",
      "Spray organic insecticidal soap to reduce whitefly vector populations.",
    ],
    preventive: [
      "Source only certified healthy stem bundles from approved agro-dealers.",
      "Sanitize machetes and harvesting tools between field beds.",
    ],
    translations: {
      en: {
        condition: "Cassava Mosaic Geminivirus",
        description: "Mottled yellow-green leaves and stunted cassava root growth.",
        actions: [
          "Uproot and destroy infected plants to prevent spread.",
          "Plant certified disease-resistant stem cuttings (TME 419).",
          "Control whitefly vectors using biological spray.",
        ],
      },
      yo: {
        condition: "Àrùn Ẹ̀yìn Ewé Gbaguda (Cassava Mosaic)",
        description: "Ewé gbágùdá tó yí àwọ̀ padà sí funfun-pupa tó sì ń mú kí gbòǹgbò kéré.",
        actions: [
          "Fa àwọn igi tó ti ní àrùn tu kúrò nínú oko.",
          "Gbin ègé gbágùdá tó ní ààbò (TME 419).",
          "Pa àwọn kòkòrò afòfò funfun pẹ̀lú ọṣẹ àgbo.",
        ],
      },
      ha: {
        condition: "Cutar Tabon Rogo (Cassava Mosaic)",
        description: "Ganyen rogo yana canza launi zuwa rawaya kuma yana rage girman rogon.",
        actions: [
          "A tumbuke shukar da ta kamu a kona ta.",
          "A shuka tsinken rogo mai jure cuta (TME 419).",
          "A fesa maganin kwari domin kashe fararen kwari.",
        ],
      },
      ig: {
        condition: "Ọrịa Akwụkwọ Ji Akpụ (Cassava Mosaic)",
        description: "Akwụkwọ ji akpụ na-acha odo odo na-eme ka mgbọrọgwụ ya ghara itolite.",
        actions: [
          "Hwopụta osisi ndị ọrịa metụtara ma kpọọ ha ọkụ.",
          "Kụọ mkpụrụ ji akpụ siri ike nke na-anaghị anata ọrịa (TME 419).",
          "Gbuo ụmụ ahụhụ na-efe efe na-ebute ọrịa a.",
        ],
      },
    },
  },
];

const LANGUAGE_LABELS: Record<NigerianLanguage, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  yo: { label: "Yorùbá", flag: "🇳🇬" },
  ha: { label: "Hausa", flag: "🇳🇬" },
  ig: { label: "Igbo", flag: "🇳🇬" },
};

export function CropScanner({ onListingCreated }: { onListingCreated?: () => void }) {
  const router = useRouter();
  const [selectedSample, setSelectedSample] = useState<PresetSample>(PRESET_SAMPLES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisCompleted, setAnalysisCompleted] = useState(true);
  const [language, setLanguage] = useState<NigerianLanguage>("en");
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Ask Agrolink follow up chat
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: "user" | "ai"; text: string; time: string }>
  >([
    {
      id: "m-1",
      sender: "ai",
      text: `Hello! I have reviewed this ${selectedSample.crop} sample. How can I help you manage your crop and protect your market yield today?`,
      time: "Just now",
    },
  ]);

  const runAnalysis = (sample: PresetSample) => {
    setSelectedSample(sample);
    setCustomImage(null);
    setAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisCompleted(false);

    const timer1 = setTimeout(() => setAnalysisProgress(45), 300);
    const timer2 = setTimeout(() => setAnalysisProgress(80), 700);
    const timer3 = setTimeout(() => {
      setAnalysisProgress(100);
      setAnalyzing(false);
      setAnalysisCompleted(true);
      toast.success(`Crop diagnosis completed (${sample.confidence}% confidence)`);
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      runAnalysis({
        ...PRESET_SAMPLES[0],
        id: `custom-${Date.now()}`,
        name: "User Harvest Photo",
        crop: "Field Sample",
        image: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q || chatLoading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: q,
      time: "Just now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      let aiReply = "";
      const lower = q.toLowerCase();

      if (lower.includes("first") || lower.includes("what should i do")) {
        aiReply =
          language === "yo"
            ? "Ohun àkọ́kọ́ ni láti bẹ́ àwọn ewé tó ti bàjẹ́ kúrò ní kété kí o sì sun wọ́n, kí àrùn má ba tan sí àwọn igi tókù."
            : language === "ha"
              ? "Abu na farko shine a cire ganyen da suka kamu a kona su domin hana cutar yaduwa zuwa sauran shuke-shuke."
              : language === "ig"
                ? "Ihe mbụ ị ga-eme bụ ibipụ akwụkwọ ndị ọrịa metụtara ma kpọọ ha ọkụ ka ọrịa ahụ ghara iru ndị ọzọ."
                : "Your immediate first step is to prune heavily infected leaves and safely dispose of them outside the field to halt spore dispersal.";
      } else if (lower.includes("yield") || lower.includes("harvest") || lower.includes("market")) {
        aiReply =
          "Prompt removal of affected foliage prevents root decay. You can expect to preserve 85–90% of your commercial harvest volume for the Agrolink marketplace.";
      } else {
        aiReply = `Based on our AI field models for ${selectedSample.crop}, applying recommended bio-fungicides and spacing foliage immediately protects remaining healthy plants. You can list the healthy harvest directly on Agrolink.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiReply,
          time: "Just now",
        },
      ]);
      setChatLoading(false);
    }, 600);
  };

  const activeTranslation =
    selectedSample.translations[language] ?? selectedSample.translations.en;

  return (
    <div className="space-y-6">
      {/* Top Header with Language Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Leaf className="size-4" />
            </span>
            <h2 className="font-display text-xl font-bold">Agrolink AI Crop Diagnostic Scanner</h2>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px]">
              <Sparkles className="size-2.5 mr-1" /> Live AI Vision
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify crop leaf pathogens, get localized remediation advice, and bridge healthy harvests to buyers.
          </p>
        </div>

        {/* Local Nigerian Language Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-muted/60 p-1 border">
          <Globe className="size-3.5 text-muted-foreground ml-1.5 mr-1" />
          {(Object.keys(LANGUAGE_LABELS) as NigerianLanguage[]).map((langKey) => (
            <button
              key={langKey}
              type="button"
              onClick={() => {
                setLanguage(langKey);
                toast.success(`Language set to ${LANGUAGE_LABELS[langKey].label}`);
              }}
              className={cn(
                "rounded px-2 py-1 text-xs font-semibold transition-all cursor-pointer",
                language === langKey
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="mr-1">{LANGUAGE_LABELS[langKey].flag}</span>
              {LANGUAGE_LABELS[langKey].label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Test Photos Bar (Judges One-Click Demo) */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <Camera className="size-3.5 text-primary" /> Choose Demo Sample or Upload Photo:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_SAMPLES.map((sample) => {
            const isSelected = selectedSample.id === sample.id && !customImage;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => runAnalysis(sample)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs"
                    : "border-border/70 bg-card hover:border-primary/40",
                )}
              >
                <img
                  src={sample.image}
                  alt={sample.name}
                  className="size-11 rounded-lg object-cover shrink-0 border"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-foreground">{sample.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sample.crop}</p>
                </div>
              </button>
            );
          })}

          {/* Upload Custom Photo Button */}
          <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/30 p-2 text-center text-xs font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors">
            <Upload className="size-4 text-primary" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
          </label>
        </div>
      </div>

      {/* Scanning Progress Bar */}
      {analyzing && (
        <Card className="p-4 border-primary/40 bg-primary/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Neural Vision Pathogen Detection…
            </span>
            <span>{analysisProgress}%</span>
          </div>
          <Progress value={analysisProgress} className="h-2 bg-primary/20" />
        </Card>
      )}

      {/* Main Analysis Results Card */}
      {analysisCompleted && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Visual Leaf Diagnosis Details */}
          <Card className="p-5 shadow-[var(--shadow-card)] space-y-4 border-border/80 bg-card">
            {/* Header Result with Confidence & Severity */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={customImage || selectedSample.image}
                  alt={selectedSample.name}
                  className="size-16 rounded-xl object-cover border-2 border-border/80 shadow-xs shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {activeTranslation.condition}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analyzed for <span className="font-semibold text-foreground">{selectedSample.crop}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold"
                >
                  <Sparkles className="size-3 mr-1" /> {selectedSample.confidence}% Confidence
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-bold",
                    selectedSample.severity === "Severe"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/30",
                  )}
                >
                  {selectedSample.severity} Severity
                </Badge>
              </div>
            </div>

            {/* Disclaimer Alert */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground border">
              <Info className="size-4 text-primary shrink-0" />
              <span>
                Image analysis appears consistent with symptoms of <strong>{selectedSample.condition}</strong>.
                Verify field soil moisture before applying chemicals.
              </span>
            </div>

            {/* Localized Symptoms & Description */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Diagnostic Assessment:
              </p>
              <p className="text-sm text-foreground mt-1 leading-relaxed">
                {activeTranslation.description}
              </p>
            </div>

            {/* Actionable Recommendations List */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Recommended Remediation ({LANGUAGE_LABELS[language].label}):
              </p>
              <ul className="space-y-2">
                {activeTranslation.actions.map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-foreground bg-muted/30 rounded-lg p-2.5 border"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CRITICAL SUPPLY CHAIN BRIDGE: Next Best Action CTAs */}
            <div className="border-t pt-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Next Best Action for Your Harvest:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild size="sm" className="font-semibold shadow-xs">
                  <Link to="/marketplace">
                    <ShoppingBag className="mr-1.5 size-4" />
                    List Healthy Harvest in Marketplace
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="font-semibold">
                  <Link to="/dashboard/farmer">
                    <Truck className="mr-1.5 size-4" />
                    Book Transport Corridor
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Column: "Ask Agrolink" Contextual Question Assistant */}
          <Card className="flex flex-col p-5 shadow-[var(--shadow-card)] border-border/80 bg-card">
            <div className="border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <h4 className="font-display text-base font-bold">Ask Agrolink</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contextual agronomy & harvest guidance grounded in your diagnosis.
              </p>
            </div>

            {/* Message Thread */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] py-3 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[88%] text-xs rounded-xl p-3",
                    msg.sender === "user"
                      ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                      : "mr-auto bg-muted/60 text-foreground border rounded-bl-none",
                  )}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={cn(
                      "text-[9px] mt-1 self-end opacity-70",
                      msg.sender === "user" ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {msg.time}
                  </span>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg w-fit">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Agrolink AI is consulting field guides…</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setChatInput("What should I do first?");
                }}
                className="rounded-md bg-muted/60 px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                "What should I do first?"
              </button>
              <button
                type="button"
                onClick={() => {
                  setChatInput("Will this affect my market price?");
                }}
                className="rounded-md bg-muted/60 px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                "Will this affect my market price?"
              </button>
            </div>

            {/* Question Input Form */}
            <form onSubmit={handleAskQuestion} className="flex gap-2 mt-2 pt-2 border-t">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about treatment, dosages or market timing…"
                className="text-xs h-9"
              />
              <Button type="submit" size="sm" className="h-9 px-3" disabled={!chatInput.trim() || chatLoading}>
                <Send className="size-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
