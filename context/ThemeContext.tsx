"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { type Theme, type ThemeKey, themes } from "@/lib/themes";

interface ThemeContextValue {
  theme: Theme;
  themeKey: ThemeKey;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.protocol,
  themeKey: "protocol",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>("protocol");

  useEffect(() => {
    const stored = localStorage.getItem("portfolio-theme") as ThemeKey | null;
    if (stored && themes[stored]) {
      setThemeKey(stored);
    }
  }, []);

  const setTheme = (key: ThemeKey) => {
    setThemeKey(key);
    localStorage.setItem("portfolio-theme", key);
  };

  return (
    <ThemeContext.Provider
      value={{ theme: themes[themeKey], themeKey, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
