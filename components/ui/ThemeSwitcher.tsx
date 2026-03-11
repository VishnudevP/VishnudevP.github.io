"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { themes, THEME_ORDER, type ThemeKey } from "@/lib/themes";
import { cn } from "@/lib/cn";

export function ThemeSwitcher() {
  const { theme, themeKey, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-200",
          theme.accentSoft,
          "hover:opacity-90"
        )}
        aria-label="Switch theme"
      >
        <Palette className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{theme.name}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-52 rounded-[20px] p-3",
              theme.shell,
              theme.glow
            )}
          >
            <div className="mb-2 px-1 text-[10px] uppercase tracking-[0.3em] text-white/40">
              Skin Line
            </div>
            <div className="grid grid-cols-2 gap-2">
              {THEME_ORDER.map((key: ThemeKey) => {
                const t = themes[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-2xl px-3 py-2.5 text-left transition-all duration-200",
                      themeKey === key
                        ? t.accentSoft
                        : "border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                      {t.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
