import { createContext, useContext, useState, useEffect } from "react";
import { palettes } from "../../constants/themes";

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("dark"); // 'light' | 'dark'
  const [currentPalette, setCurrentPalette] = useState("default");

  // Load saved theme and palette
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("budgetly-theme-config");
      if (savedTheme) {
        const { mode, palette } = JSON.parse(savedTheme);
        if (mode) setThemeMode(mode);
        // Validate palette exists
        if (palette && palettes.some((p) => p.id === palette)) {
          setCurrentPalette(palette);
        }
      } else {
        // Fallback for migration from old system
        const oldTheme = localStorage.getItem("budgetly-theme");
        if (oldTheme === "dark") setThemeMode("dark");
      }
    } catch (e) {
      console.error("Error parsing theme config", e);
    }
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem(
      "budgetly-theme-config",
      JSON.stringify({ mode: themeMode, palette: currentPalette })
    );

    // Apply classes
    const root = document.documentElement;

    // 1. Handle Light/Dark Mode
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // 2. Handle Palettes (Only active in dark mode usually, but class logic separates them)
    // Remove all known palette classes first
    palettes.forEach((p) => {
      if (p.class) root.classList.remove(p.class);
    });

    // Add current palette class if in dark mode (and if it has a class)
    if (themeMode === "dark") {
      const paletteConfig = palettes.find((p) => p.id === currentPalette);
      if (paletteConfig && paletteConfig.class) {
        root.classList.add(paletteConfig.class);
      }
    }

    // Clean up inline styles from previous version if they exist
    // This ensures CSS classes take priority
    [
      "dark",
      "primary",
      "secondary",
      "light",
      "bg",
      "surface",
      "success",
      "error",
      "warning",
      "info",
      "border",
      "hover",
      "gradient-bg",
      "zigzag-color",
      "primary-bg",
      "primary-border",
    ].forEach((key) => {
      root.style.removeProperty(`--color-${key}`);
    });
    root.style.removeProperty("--gradient-bg");
    root.style.removeProperty("--zigzag-color");
    document.body.style.background = "";
  }, [themeMode, currentPalette]);

  const changeThemeMode = (mode) => {
    if (mode === "light" || mode === "dark") {
      setThemeMode(mode);
    }
  };

  const changePalette = (paletteId) => {
    if (palettes.some((p) => p.id === paletteId)) {
      setCurrentPalette(paletteId);
    }
  };

  const value = {
    themeMode,
    currentPalette,
    changeThemeMode,
    changePalette,
    palettes,
    // Backward compatibility aliases if needed, but updating usage is better
    currentTheme: themeMode,
    changeTheme: changeThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
