import { useState } from "react";
import { Plus, Sprout, Image, Package, MapPin, Sparkles } from "lucide-react";
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
import { api } from "@/lib/api-client";
import { toast } from "sonner";

interface ProduceUploadModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ProduceUploadModal({ onSuccess, trigger }: ProduceUploadModalProps) {
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
      toast.error("Please provide valid produce details.");
      return;
    }

    setLoading(true);
    const res = await api.produce.create({
      name,
      category,
      qualityGrade,
      quantityKg: qty,
      pricePerKg: price,
      minOrderKg: Number(minOrderKg) || 50,
      packagingType,
      locationName: locationName || "Kano State Agricultural Cluster",
      description:
        description || "Harvest-ready batch inspected under Agrolink quality grading standards.",
      images: imageUrl ? [imageUrl] : undefined,
    });

    setLoading(false);
    if (res.success) {
      toast.success(`Published ${qty.toLocaleString()}kg of ${name} to the Marketplace!`);
      setOpen(false);
      setName("");
      setQuantityKg("");
      setPricePerKg("");
      setDescription("");
      setImageUrl("");
      onSuccess?.();
    } else {
      toast.error(res.error || "Failed to publish listing.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="font-bold shadow-xs">
            <Plus className="mr-1.5 size-4" />
            List Harvest Stock
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
                Publish Produce to Verified Marketplace
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Direct farm gate inventory available for immediate buyer orders and haulage
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pName">Produce Name *</Label>
            <Input
              id="pName"
              placeholder="e.g. Fresh Roma Tomatoes, Yellow Feed Maize"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category *</Label>
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
              <Label>Quality Grade *</Label>
              <Select
                value={qualityGrade}
                onValueChange={(v: "Grade A" | "Grade B" | "Grade C" | "Organic Certified") =>
                  setQualityGrade(v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade A">Grade A (Premium Export)</SelectItem>
                  <SelectItem value="Grade B">Grade B (Standard Market)</SelectItem>
                  <SelectItem value="Grade C">Grade C (Processing)</SelectItem>
                  <SelectItem value="Organic Certified">Organic Certified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Harvest Qty (kg) *</Label>
              <Input
                id="qty"
                type="number"
                placeholder="e.g. 5000"
                min="10"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price / kg (₦) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 850"
                min="1"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="moq">Min Order (kg)</Label>
              <Input
                id="moq"
                type="number"
                placeholder="e.g. 100"
                value={minOrderKg}
                onChange={(e) => setMinOrderKg(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pack">Packaging Format</Label>
              <Input
                id="pack"
                placeholder="e.g. 50kg Jute Bag, Crates"
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc">Farm Cluster Location</Label>
              <Input
                id="loc"
                placeholder="e.g. Kano (Bunkure Cluster)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="img">Produce Image URL</Label>
            <Input
              id="img"
              placeholder="https://... (or upload to Supabase Storage)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Batch Notes & Harvest Details</Label>
            <Textarea
              id="desc"
              placeholder="Provide details on moisture levels, harvest date, and farm gate inspection..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-bold shadow-xs">
              {loading ? "Publishing..." : "Publish Live Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
