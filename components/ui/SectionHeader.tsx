"use client";

import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("mb-12", className)}>
      <div
        className={cn(
          "mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.3em]",
          theme.accentSoft
        )}
      >
        <span className="h-1 w-1 rounded-full bg-current opacity-70" />
        {label}
      </div>
      <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-4 h-px w-24 bg-gradient-to-r",
          theme.line
        )}
      />
    </div>
  );
}
