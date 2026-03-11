"use client";

import { useTheme } from "@/context/ThemeContext";
import { StatCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/cn";

export function StatsPanel() {
  const { theme } = useTheme();

  const stats = [
    { value: "4", numericValue: 4, label: "Internships Completed", suffix: "" },
    { value: "50K+", numericValue: 50, label: "Users Impacted (K+)", suffix: "K+" },
    { value: "5+", numericValue: 5, label: "Hackathon Awards", suffix: "+" },
    { value: "10+", numericValue: 10, label: "Projects Shipped", suffix: "+" },
  ];

  return (
    <section className={cn("relative py-16", theme.page)}>
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
          theme.line
        )}
      />
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              numericValue={stat.numericValue}
              label={stat.label}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r",
          theme.line
        )}
      />
    </section>
  );
}
