"use client";

import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/cn";
import type { About } from "@/lib/types";

interface HeroProps {
  about: About | null;
}

export function Hero({ about }: HeroProps) {
  const { theme } = useTheme();

  return (
    <section
      id="hero"
      className={cn(
        "relative flex min-h-screen items-center overflow-hidden bg-tactical-grid",
        theme.page
      )}
    >
      {/* Diagonal grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-tactical-grid opacity-60" />

      {/* Gradient vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

      {/* Top accent line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
          theme.line
        )}
      />

      {/* Corner HUD decorations */}
      <div className={cn("absolute left-6 top-24 text-[10px] uppercase tracking-[0.3em]", theme.accentText, "opacity-30")}>
        37.7749° N // 122.4194° W
      </div>
      <div className={cn("absolute right-6 top-24 text-[10px] uppercase tracking-[0.3em] text-right", theme.accentText, "opacity-30")}>
        SYS // ONLINE
      </div>
      <div className={cn("absolute bottom-8 left-6 text-[10px] uppercase tracking-[0.3em]", theme.accentText, "opacity-30")}>
        BUILD v2.0 // 2026
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 md:px-10 md:py-0">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div>
            <div
              className={cn(
                "mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.35em]",
                theme.accentSoft
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
              Agent Selected // Locked In
            </div>

            <h1 className="font-display text-6xl font-black uppercase leading-[0.92] tracking-tight text-white md:text-7xl lg:text-8xl">
              {about?.name?.split(" ")[0] ?? "Vishnu"}
              <br />
              <span className={cn(theme.accentText, "opacity-90")}>
                {about?.name?.split(" ").slice(1).join(" ") ?? "Poil"}
              </span>
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <div className={cn("h-px w-8 bg-gradient-to-r", theme.line)} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                {about?.tagline ?? "Full-Stack Engineer"}
              </p>
            </div>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/65">
              {about?.bio ??
                "Building products, systems, and experiences at scale. Self-taught developer based in Ontario, Canada."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projects"
                className={cn(
                  "clip-corner-sm rounded-none px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-200",
                  theme.button
                )}
              >
                View Projects
              </a>
              <a
                href={about?.resume_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "clip-corner-sm rounded-none px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-200",
                  theme.buttonOutline
                )}
              >
                Open Resume
              </a>
              <a
                href="#contact"
                className={cn(
                  "clip-corner-sm rounded-none px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-200",
                  theme.buttonOutline
                )}
              >
                Contact
              </a>
            </div>
          </div>

          {/* Profile image card */}
          <div className="flex justify-center lg:justify-end">
            <div
              className={cn(
                "relative rounded-[32px] p-1 transition-all duration-500",
                theme.panel,
                theme.glow
              )}
            >
              {/* Accent line top */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-px rounded-t-[32px] bg-gradient-to-r",
                  theme.line
                )}
              />
              <div className="clip-corner overflow-hidden rounded-[30px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/profile-pic.png"
                  alt={about?.name ?? "Vishnudev Poil"}
                  className="h-72 w-64 object-cover object-top md:h-96 md:w-80"
                />
              </div>
              {/* HUD label */}
              <div
                className={cn(
                  "absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.3em]",
                  theme.accentSoft
                )}
              >
                {about?.location ?? "Ontario, Canada"}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white">Scroll</span>
          <div className="h-6 w-px bg-white/30" />
        </div>
      </div>
    </section>
  );
}
