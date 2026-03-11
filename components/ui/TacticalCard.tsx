"use client";

import { cn } from "@/lib/cn";
import { useTheme } from "@/context/ThemeContext";

interface TacticalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "soft" | "shell";
  clipped?: boolean;
  glow?: boolean;
}

export function TacticalCard({
  children,
  className,
  variant = "panel",
  clipped = false,
  glow = false,
}: TacticalCardProps) {
  const { theme } = useTheme();

  const variantClass =
    variant === "shell"
      ? theme.shell
      : variant === "soft"
        ? theme.soft
        : theme.panel;

  return (
    <div
      className={cn(
        "rounded-[24px] transition-all duration-300",
        variantClass,
        clipped && "clip-corner",
        glow && theme.glow,
        className
      )}
    >
      {children}
    </div>
  );
}
