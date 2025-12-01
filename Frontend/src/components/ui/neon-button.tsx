import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface NeonButtonProps extends ButtonProps {
  glow?: boolean;
  neonColor?: "blue" | "cyan";
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, glow = true, neonColor = "blue", variant = "default", ...props }, ref) => {
    const glowClass = neonColor === "blue" 
      ? "shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] border-primary/50 text-primary-foreground"
      : "shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] border-accent/50 text-accent-foreground";

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          "transition-all duration-300 font-display tracking-wide uppercase",
          glow && variant !== "ghost" && variant !== "link" && glowClass,
          variant === "ghost" && "hover:bg-primary/10 hover:text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
NeonButton.displayName = "NeonButton";

export { NeonButton };
