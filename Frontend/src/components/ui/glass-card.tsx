import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive";
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card rounded-xl p-6 border border-white/10 bg-slate-900/40",
          variant === "interactive" && "hover:bg-slate-800/60 cursor-pointer hover:scale-[1.01] transition-transform",
          glow && "shadow-[0_0_20px_rgba(37,99,235,0.15)] border-primary/30",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
