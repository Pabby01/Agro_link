import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProduceCategory } from "@/lib/types";

const tone: Record<ProduceCategory, string> = {
  Vegetables: "from-success/35 to-accent/25",
  Grains: "from-gold/45 to-warning/25",
  Tubers: "from-warning/35 to-gold/20",
  Fruits: "from-gold/40 to-success/20",
  Legumes: "from-accent/35 to-primary/20",
};

export function ProduceImage({
  name,
  category,
  src,
  className,
}: {
  name: string;
  category: ProduceCategory;
  src?: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  // Auto-resolve known image filenames if not explicitly provided
  const imageSource =
    src ||
    (name.toLowerCase().includes("tomato")
      ? "/images/tomatoes.jpg"
      : name.toLowerCase().includes("maize")
        ? "/images/maize.jpg"
        : name.toLowerCase().includes("cassava")
          ? "/images/cassava.jpg"
          : name.toLowerCase().includes("pepper")
            ? "/images/peppers.jpg"
            : name.toLowerCase().includes("potato")
              ? "/images/potatoes.jpg"
              : name.toLowerCase().includes("bean") || name.toLowerCase().includes("cowpea")
                ? "/images/beans.jpg"
                : name.toLowerCase().includes("plantain")
                  ? "/images/plantain.jpg"
                  : name.toLowerCase().includes("yam")
                    ? "/images/yam.jpg"
                    : undefined);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        tone[category] ?? "from-primary/20 to-accent/20",
        className,
      )}
    >
      {imageSource && !imgError ? (
        <img
          src={imageSource}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div
          role="img"
          aria-label={`${name} — ${category}`}
          className="grid h-full w-full place-items-center"
        >
          <span className="font-display text-4xl font-bold text-primary/70">{initials}</span>
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-xs">
        {category}
      </span>
    </div>
  );
}
