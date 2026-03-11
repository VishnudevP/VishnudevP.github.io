"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { cn } from "@/lib/cn";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Career", href: "#career" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? cn("border-b py-3", theme.shell)
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <a href="#" className="font-display text-xl font-black uppercase tracking-widest text-white">
          VP<span className={cn("ml-0.5", theme.accentText)}>//</span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[12px] font-semibold uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <button
            className="flex items-center md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={cn("border-t px-6 py-4 md:hidden", theme.shell)}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-[12px] font-semibold uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
