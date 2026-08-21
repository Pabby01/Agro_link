import { useState, useRef } from "react";
import { Camera, UploadCloud, X, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: "produce" | "kyb" | "disputes" | "shipments" | "diagnostics";
  aspectRatio?: "square" | "video" | "banner";
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  folder = "produce",
  aspectRatio = "video",
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size should be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadImage(file, folder);
      if (res.success && res.url) {
        onChange(res.url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(res.error || "Failed to upload image");
      }
    } catch {
      toast.error("An error occurred while uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "banner"
        ? "aspect-[21/9]"
        : "aspect-video";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-xs font-bold text-foreground">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {value ? (
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-border/80 bg-muted/30 shadow-2xs",
            aspectClass,
          )}
        >
          <img
            src={value}
            alt="Uploaded preview"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-background/60 backdrop-blur-2xs opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 text-xs font-bold shadow-xs cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-1.5 size-3.5" />
              Change Photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="size-8 p-0 cursor-pointer shadow-xs"
              onClick={handleRemove}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200",
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30",
            aspectClass,
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs font-bold text-foreground">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <UploadCloud className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Tap to take photo or browse files
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WebP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
