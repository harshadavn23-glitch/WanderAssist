import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";

const STORAGE_KEY = "wander-theme";

export function useDarkMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  // Sync to secondary localStorage key "wander-theme" for external access
  useEffect(() => {
    if (resolvedTheme) {
      localStorage.setItem(STORAGE_KEY, resolvedTheme);
    }
  }, [resolvedTheme]);

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, [isDark, setTheme]);

  const enable = useCallback(() => {
    setTheme("dark");
    localStorage.setItem(STORAGE_KEY, "dark");
  }, [setTheme]);

  const disable = useCallback(() => {
    setTheme("light");
    localStorage.setItem(STORAGE_KEY, "light");
  }, [setTheme]);

  return {
    isDark,
    theme,
    toggle,
    enable,
    disable,
    setTheme,
  };
}
