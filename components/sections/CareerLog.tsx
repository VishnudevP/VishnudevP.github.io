"use client";

import { useTheme } from "@/context/ThemeContext";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import type { Experience } from "@/lib/types";

interface CareerLogProps {
  experiences: Experience[];
}

export function CareerLog({ experiences }: CareerLogProps) {
  const { theme } = useTheme();

  return (
    <section id="career" className={cn("relative py-24", theme.page)}>
      {/* Tactical left rail */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b",
          theme.line
        )}
      />

      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeader
          label="Match History"
          title="Career Log"
          subtitle="Each role is a mission. Here's the record."
        />

        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className={cn(
                "group relative rounded-[28px] border-l-4 p-6 transition-all duration-300 hover:translate-y-[-2px]",
                theme.shell,
                theme.borderAccent,
                "hover:" + theme.glow.split(" ")[0]
              )}
            >
              {/* Top accent line */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-px rounded-t-[28px] bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                  theme.line
                )}
              />

              {/* Entry number */}
              <div className={cn("absolute -left-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold", theme.accentSoft)}>
                {String(idx + 1).padStart(2, "0")}
              </div>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-display text-2xl font-black uppercase tracking-tight text-white">
                    {exp.company}
                  </div>
                  <div className={cn("mt-0.5 text-sm font-semibold", theme.accentText)}>
                    {exp.title}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/40">
                    {exp.start_date} — {exp.end_date}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {exp.result_tags?.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "clip-corner-sm rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em]",
                        theme.accentSoft
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={cn("my-4 h-px", "bg-white/[0.06]")} />

              <ul className="grid gap-2 sm:grid-cols-2">
                {exp.description?.map((bullet, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/65">
                    <span className={cn("mt-2 h-1 w-1 flex-none rounded-full", theme.accentText.replace("text-", "bg-"))} />
                    {bullet}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                {exp.skills?.map((skill) => (
                  <span
                    key={skill}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em]",
                      theme.soft
                    )}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
