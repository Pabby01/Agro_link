import { useState, type ReactNode, type HTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type LiquidColorVariant = "primary" | "success" | "gold" | "accent" | "blue" | "emerald";

interface LiquidCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: LiquidColorVariant;
  className?: string;
  liquidClassName?: string;
  fillOpacity?: number;
  duration?: number;
  onClick?: () => void;
  disabled?: boolean;
}

const variantStyles: Record<
  LiquidColorVariant,
  {
    liquidBg: string;
    waveFill: string;
    glow: string;
    borderHover: string;
  }
> = {
  primary: {
    liquidBg:
      "linear-gradient(to top, oklch(0.32 0.05 165 / 0.22) 0%, oklch(0.32 0.05 165 / 0.12) 100%)",
    waveFill: "oklch(0.32 0.05 165 / 0.22)",
    glow: "rgba(46, 125, 96, 0.2)",
    borderHover: "border-primary/60 shadow-[0_8px_30px_rgba(46,125,96,0.15)]",
  },
  success: {
    liquidBg:
      "linear-gradient(to top, oklch(0.58 0.11 155 / 0.24) 0%, oklch(0.58 0.11 155 / 0.12) 100%)",
    waveFill: "oklch(0.58 0.11 155 / 0.24)",
    glow: "rgba(34, 197, 94, 0.25)",
    borderHover: "border-success/60 shadow-[0_8px_30px_rgba(34,197,94,0.18)]",
  },
  gold: {
    liquidBg:
      "linear-gradient(to top, oklch(0.79 0.108 92 / 0.28) 0%, oklch(0.79 0.108 92 / 0.14) 100%)",
    waveFill: "oklch(0.79 0.108 92 / 0.28)",
    glow: "rgba(214, 184, 90, 0.3)",
    borderHover: "border-gold/60 shadow-[0_8px_30px_rgba(214,184,90,0.2)]",
  },
  accent: {
    liquidBg:
      "linear-gradient(to top, oklch(0.72 0.068 150 / 0.25) 0%, oklch(0.72 0.068 150 / 0.12) 100%)",
    waveFill: "oklch(0.72 0.068 150 / 0.25)",
    glow: "rgba(127, 175, 138, 0.25)",
    borderHover: "border-accent/60 shadow-[0_8px_30px_rgba(127,175,138,0.2)]",
  },
  blue: {
    liquidBg: "linear-gradient(to top, rgba(37, 99, 235, 0.22) 0%, rgba(59, 130, 246, 0.10) 100%)",
    waveFill: "rgba(37, 99, 235, 0.22)",
    glow: "rgba(59, 130, 246, 0.25)",
    borderHover: "border-blue-500/50 shadow-[0_8px_30px_rgba(59,130,246,0.2)]",
  },
  emerald: {
    liquidBg: "linear-gradient(to top, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.12) 100%)",
    waveFill: "rgba(16, 185, 129, 0.25)",
    glow: "rgba(16, 185, 129, 0.25)",
    borderHover: "border-emerald-500/60 shadow-[0_8px_30px_rgba(16,185,129,0.2)]",
  },
};

/**
 * LiquidCard — A modern interactive card container that fills with dynamic rising liquid/water
 * from the bottom to the top on hover or touch/tap.
 */
export function LiquidCard({
  children,
  variant = "primary",
  className,
  liquidClassName,
  duration = 0.55,
  onClick,
  disabled = false,
  ...props
}: LiquidCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const active = (isHovered || isTouched) && !disabled;
  const config = variantStyles[variant] || variantStyles.primary;

  const handleTouch = () => {
    if (disabled) return;
    setIsTouched(true);
    // Auto-release touch after animation sequence
    setTimeout(() => setIsTouched(false), 1200);
  };

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground",
        "transition-all duration-300 select-none",
        active && config.borderHover,
        className,
      )}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onTouchStart={handleTouch}
      onClick={onClick}
      whileTap={{ scale: !disabled ? 0.985 : 1 }}
      {...(props as object)}
    >
      {/* Rising Liquid Container */}
      <AnimatePresence>
        {active && (
          <motion.div
            className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-0", liquidClassName)}
            initial={{ height: "0%" }}
            animate={{ height: "100%" }}
            exit={{ height: "0%", transition: { duration: 0.4, ease: "easeInOut" } }}
            transition={{
              duration,
              ease: [0.22, 1, 0.36, 1], // fluid cubic-bezier curve
            }}
            style={{
              background: config.liquidBg,
            }}
          >
            {/* Undulating water surface wave (SVG) */}
            <div className="absolute -top-3 left-0 w-[200%] h-4 overflow-hidden pointer-events-none">
              <motion.svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-full h-full"
                animate={{
                  x: ["0%", "-50%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "linear",
                }}
              >
                <path
                  d="M0,0 C150,90 350,-40 500,40 C650,120 900,-30 1200,30 L1200,120 L0,120 Z"
                  fill={config.waveFill}
                />
              </motion.svg>
            </div>

            {/* Second subtle trailing wave for depth */}
            <div className="absolute -top-2 left-0 w-[200%] h-3 overflow-hidden opacity-60 pointer-events-none">
              <motion.svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-full h-full"
                animate={{
                  x: ["-50%", "0%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  ease: "linear",
                }}
              >
                <path
                  d="M0,20 C200,-30 400,80 600,20 C800,-40 1000,70 1200,10 L1200,120 L0,120 Z"
                  fill={config.waveFill}
                />
              </motion.svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content Layer */}
      <div className="relative z-10 w-full transition-transform duration-300">{children}</div>
    </motion.div>
  );
}
