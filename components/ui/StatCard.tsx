"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/cn";

interface StatCardProps {
  value: string;
  numericValue: number;
  label: string;
  suffix?: string;
}

export function StatCard({ value, numericValue, label, suffix = "" }: StatCardProps) {
  const { theme } = useTheme();
  const [displayed, setDisplayed] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1800;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(eased * numericValue));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericValue, hasAnimated]);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[24px] p-6 transition-all duration-300",
        theme.soft
      )}
    >
      <div
        className={cn(
          "mb-1 font-display text-4xl font-black tracking-tight md:text-5xl",
          theme.accentText
        )}
      >
        {displayed}
        {suffix}
      </div>
      <div className="text-[11px] uppercase tracking-[0.25em] text-white/50">
        {label}
      </div>
      <div
        className={cn("mt-3 h-px w-8 bg-gradient-to-r", theme.line)}
      />
    </div>
  );
}
