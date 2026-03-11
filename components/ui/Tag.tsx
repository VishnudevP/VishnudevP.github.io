"use client";

import { cn } from "@/lib/cn";
import { useTheme } from "@/context/ThemeContext";

interface TagProps {
  children: React.ReactNode;
  variant?: "accent" | "soft" | "muted";
  className?: string;
}

export function Tag({ children, variant = "muted", className }: TagProps) {
  const { theme } = useTheme();

  const variantClass =
    variant === "accent"
      ? theme.accent
      : variant === "soft"
        ? theme.accentSoft
        : "border border-white/10 bg-white/[0.04] text-white/60";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        variantClass,
        className
      )}
    >
      {children}
    </span>
  );
}
