import { useState } from "react";
import { Plus, Sprout, Image, Package, MapPin, Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/common/ImageUploader";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api-client";
import { IS_DEMO_MODE } from "@/lib/config";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProduceUploadModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const PRESET_PRODUCE_IMAGES = [
  { name: "Roma Tomatoes", url: "/images/tomatoes.jpg", category: "Vegetables" },
  { name: "White Maize", url: "/images/maize.jpg", category: "Grains" },
  { name: "Cassava Tubers", url: "/images/cassava.jpg", category: "Tubers" },
  { name: "Soybeans", url: "/images/soybeans.jpg", category: "Legumes" },
];

export function ProduceUploadModal({ onSuccess, trigger }: ProduceUploadModalProps) {
  const { createListing, refreshLiveState } = useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<
    "Vegetables" | "Grains" | "Tubers" | "Fruits" | "Legumes"
  >("Vegetables");
  const [qualityGrade, setQualityGrade] = useState<
    "Grade A" | "Grade B" | "Grade C" | "Organic Certified"
  >("Grade A");
  const [quantityKg, setQuantityKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [minOrderKg, setMinOrderKg] = useState("100");
  const [packagingType, setPackagingType] = useState("50kg Jute Bag");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantityKg);
    const price = Number(pricePerKg);

    if (!name || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      toast.error("Please provide a valid produce name, quantity, and price.");
      return;
    }

    setLoading(true);

    const finalImage = imageUrl || "/images/tomatoes.jpg";
    const finalLocation = locationName || "Kano State Agricultural Hub";
    const finalDescription =
      description || "Harvest-ready batch inspected under Agrolink quality grading standards.";

    // 1. Immediately store in local state & localStorage for instantaneous UI response
    createListing({
      name,
      category,
      pricePerKg: price,
      quantityKg: qty,
      location: finalLocation,
      image: finalImage,
      description: finalDescription,
    });

    // 2. Sync with Supabase backend
    try {
      await api.produce.create({
        name,
        category,
        qualityGrade,
        quantityKg: qty,
        pricePerKg: price,
        minOrderKg: Number(minOrderKg) || 50,
        packagingType,
        locationName: finalLocation,
        description: finalDescription,
        images: [finalImage],
      });
      await refreshLiveState();
    } catch {
      // localStorage state already updated
    }

    setLoading(false);
    toast.success(`Published ${qty.toLocaleString()}kg of ${name} to the Marketplace!`);
    setOpen(false);
    setName("");
    setQuantityKg("");
    setPricePerKg("");
    setDescription("");
    setImageUrl("");
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="font-bold shadow-xs">
            <Plus className="mr-1.5 size-4" />
            Add Produce
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-success/15 text-success">
              <Sprout className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl font-bold">
                Publish Produce to Marketplace
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Direct farm gate inventory available for immediate buyer orders and haulage.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pName" className="text-xs font-bold">Produce Name *</Label>
            <Input
              id="pName"
              placeholder="e.g. Fresh Roma Tomatoes (Grade A)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Category *</Label>
              <Select
                value={category}
                onValueChange={(v: "Vegetables" | "Grains" | "Tubers" | "Fruits" | "Legumes") =>
                  setCategory(v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Tubers">Tubers</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Legumes">Legumes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Quality Grade *</Label>
              <Select
                value={qualityGrade}
                onValueChange={(
                  v: "Grade A" | "Grade B" | "Grade C" | "Organic Certified",
                ) => setQualityGrade(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade A">Grade A (Premium Export)</SelectItem>
                  <SelectItem value="Grade B">Grade B (Standard Commercial)</SelectItem>
                  <SelectItem value="Grade C">Grade C (Processing Grade)</SelectItem>
                  <SelectItem value="Organic Certified">Organic Certified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pQty" className="text-xs font-bold">Available Quantity (kg) *</Label>
              <Input
                id="pQty"
                type="number"
                min="10"
                placeholder="5000"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pPrice" className="text-xs font-bold">Price per kg (₦) *</Label>
              <Input
                id="pPrice"
                type="number"
                min="50"
                placeholder="850"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pMin" className="text-xs font-bold">Min Order (kg)</Label>
              <Input
                id="pMin"
                type="number"
                placeholder="100"
                value={minOrderKg}
                onChange={(e) => setMinOrderKg(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pLoc" className="text-xs font-bold">Farm Gate Location *</Label>
              <Input
                id="pLoc"
                placeholder="Kano (Dawanau Agrarian Belt)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Direct Image Upload and Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-bold">Produce Photo</Label>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_PRODUCE_IMAGES.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      if (!name) setName(preset.name);
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-1 p-1.5 rounded-lg border text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border/70 hover:border-primary/40 bg-muted/20"
                    )}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="size-10 rounded-md object-cover"
                    />
                    <span className="text-[10px] font-semibold truncate w-full text-center">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full size-3.5 grid place-items-center text-[9px]">
                        <Check className="size-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Photo Upload via ImageUploader */}
            <ImageUploader
              label="Or upload custom harvest photo from your device:"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pDesc" className="text-xs font-bold">Description & Harvest Notes</Label>
            <Textarea
              id="pDesc"
              rows={2}
              placeholder="Freshly harvested, sorted, and packed in 50kg standard bags."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-bold shadow-xs">
              {loading ? "Publishing..." : "Publish to Marketplace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
