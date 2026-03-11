export type ThemeKey = "protocol" | "reaver" | "prime" | "glitchpop";

export interface Theme {
  key: ThemeKey;
  name: string;
  label: string;
  page: string;
  shell: string;
  panel: string;
  soft: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  line: string;
  glow: string;
  button: string;
  buttonOutline: string;
  borderAccent: string;
}

export const themes: Record<ThemeKey, Theme> = {
  protocol: {
    key: "protocol",
    name: "Protocol",
    label: "Default",
    page: "bg-[#0d1016]",
    shell: "bg-[#121722] border border-white/10",
    panel: "bg-white/[0.04] border border-white/10",
    soft: "bg-white/[0.03] border border-white/10",
    accent: "bg-[#e7dfc6] text-black",
    accentSoft: "bg-[#e7dfc6]/15 text-[#f0e8d0] border border-[#e7dfc6]/30",
    accentText: "text-[#f0e8d0]",
    line: "from-[#e7dfc6]/40 via-sky-300/20 to-transparent",
    glow: "shadow-[0_0_80px_rgba(231,223,198,0.14)]",
    button: "border border-[#e7dfc6]/40 bg-[#e7dfc6]/10 text-[#f0e8d0] hover:bg-[#e7dfc6]/20",
    buttonOutline: "border border-white/15 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]",
    borderAccent: "border-l-[#e7dfc6]/60",
  },
  reaver: {
    key: "reaver",
    name: "Reaver",
    label: "Dark",
    page: "bg-[#08070d]",
    shell: "bg-[#100d18] border border-violet-400/15",
    panel: "bg-violet-400/[0.06] border border-violet-300/15",
    soft: "bg-white/[0.03] border border-violet-300/15",
    accent: "bg-violet-400 text-white",
    accentSoft: "bg-violet-400/15 text-violet-200 border border-violet-300/30",
    accentText: "text-violet-200",
    line: "from-violet-400/50 via-fuchsia-400/20 to-transparent",
    glow: "shadow-[0_0_90px_rgba(168,85,247,0.18)]",
    button: "border border-violet-300/35 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20",
    buttonOutline: "border border-white/15 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]",
    borderAccent: "border-l-violet-400/60",
  },
  prime: {
    key: "prime",
    name: "Prime",
    label: "Luxury",
    page: "bg-[#0b0b0c]",
    shell: "bg-[#141414] border border-amber-200/15",
    panel: "bg-amber-200/[0.06] border border-amber-100/15",
    soft: "bg-white/[0.03] border border-amber-100/15",
    accent: "bg-amber-300 text-black",
    accentSoft: "bg-amber-300/15 text-amber-100 border border-amber-200/30",
    accentText: "text-amber-100",
    line: "from-amber-300/50 via-yellow-200/20 to-transparent",
    glow: "shadow-[0_0_90px_rgba(252,211,77,0.12)]",
    button: "border border-amber-200/35 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20",
    buttonOutline: "border border-white/15 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]",
    borderAccent: "border-l-amber-300/60",
  },
  glitchpop: {
    key: "glitchpop",
    name: "Glitchpop",
    label: "Neon",
    page: "bg-[#0b0812]",
    shell: "bg-[#151022] border border-cyan-300/20",
    panel: "bg-cyan-300/[0.08] border border-pink-400/20",
    soft: "bg-white/[0.04] border border-cyan-300/20",
    accent: "bg-pink-400 text-black",
    accentSoft: "bg-pink-400/15 text-pink-200 border border-pink-300/30",
    accentText: "text-pink-200",
    line: "from-pink-400/60 via-cyan-300/25 to-transparent",
    glow: "shadow-[0_0_100px_rgba(34,211,238,0.16)]",
    button: "border border-pink-300/35 bg-pink-400/10 text-pink-200 hover:bg-pink-400/20",
    buttonOutline: "border border-white/15 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]",
    borderAccent: "border-l-pink-400/60",
  },
};

export const THEME_ORDER: ThemeKey[] = ["protocol", "reaver", "prime", "glitchpop"];
