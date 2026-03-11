"use client";

import { useState } from "react";
import { ExternalLink, Github, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";

interface ProjectLoadoutProps {
  projects: Project[];
}

type FilterCategory = "all" | string;

export function ProjectLoadout({ projects }: ProjectLoadoutProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [screenshotIdx, setScreenshotIdx] = useState(0);

  const categories = ["all", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const openProject = (p: Project) => {
    setSelected(p);
    setScreenshotIdx(0);
  };

  return (
    <section id="projects" className={cn("relative py-24", theme.page)}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeader
          label="Arsenal"
          title="Project Loadout"
          subtitle="Missions completed. Tools deployed. Results delivered."
        />

        {/* Filter tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "clip-corner-sm rounded-none px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-200",
                filter === cat ? theme.accentSoft : theme.soft + " text-white/50 hover:text-white/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
          {filtered.map((project) => (
            <div
              key={project.id}
              className={cn(
                "group relative overflow-hidden rounded-[28px] transition-all duration-300 hover:translate-y-[-3px] cursor-pointer",
                theme.shell,
                "hover:" + theme.glow
              )}
              onClick={() => openProject(project)}
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                {project.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={cn("flex h-full w-full items-center justify-center", theme.panel)}>
                    <span className="font-display text-4xl font-black text-white/10">
                      {project.title[0]}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
                    theme.accentSoft
                  )}
                >
                  {project.category}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-xl font-black uppercase tracking-tight text-white">
                      {project.title}
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-white/40">
                      {project.date}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {project.website_url && (
                      <a
                        href={project.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 transition-colors hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {project.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 transition-colors hover:text-white"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-7 text-white/60">{project.brief}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tools?.map((tool) => (
                    <span key={tool} className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]", theme.soft)}>
                      {tool}
                    </span>
                  ))}
                </div>

                <div
                  className={cn(
                    "mt-4 text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-200",
                    theme.accentText,
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  Mission Brief →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className={cn(
              "relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px]",
              theme.shell,
              theme.glow
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className={cn("absolute inset-x-0 top-0 h-px rounded-t-[32px] bg-gradient-to-r", theme.line)} />

            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/[0.05] p-2 text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-7">
              <div className={cn("mb-1 text-[11px] uppercase tracking-[0.3em]", theme.accentText)}>
                {selected.category} // {selected.date}
              </div>
              <h3 className="font-display text-3xl font-black uppercase text-white">{selected.title}</h3>

              {/* Screenshots */}
              {selected.screenshot_urls?.length > 0 && (
                <div className="relative mt-5 overflow-hidden rounded-[20px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.screenshot_urls[screenshotIdx]}
                    alt={`${selected.title} screenshot ${screenshotIdx + 1}`}
                    className="w-full rounded-[20px] object-cover"
                  />
                  {selected.screenshot_urls.length > 1 && (
                    <>
                      <button
                        onClick={() => setScreenshotIdx((i) => Math.max(0, i - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setScreenshotIdx((i) => Math.min(selected.screenshot_urls.length - 1, i + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {selected.screenshot_urls.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setScreenshotIdx(i)}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-200",
                              i === screenshotIdx ? cn("w-4", theme.accent.split(" ")[0]) : "w-1.5 bg-white/30"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <p className="mt-5 text-sm leading-7 text-white/70">{selected.brief}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {selected.tools?.map((tool) => (
                  <span key={tool} className={cn("rounded-full px-3 py-1 text-xs uppercase tracking-[0.15em]", theme.accentSoft)}>
                    {tool}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {selected.website_url && (
                  <a
                    href={selected.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200", theme.button)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Visit Site
                  </a>
                )}
                {selected.repo_url && (
                  <a
                    href={selected.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200", theme.buttonOutline)}
                  >
                    <Github className="h-3.5 w-3.5" /> View Repo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
