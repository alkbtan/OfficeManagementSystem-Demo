import React, { createContext, useState, useContext, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "../theme/theme";

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.primaryColor || "#1976d2";
      } catch {
        return "#1976d2";
      }
    }
    return "#1976d2";
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.darkMode || false;
      } catch {
        return false;
      }
    }
    return false;
  });

  const theme = createAppTheme(primaryColor);

  // Save to localStorage whenever they change
  useEffect(() => {
    const saved = localStorage.getItem("app_settings");
    let settings = saved ? JSON.parse(saved) : {};
    settings.darkMode = darkMode;
    settings.primaryColor = primaryColor;
    localStorage.setItem("app_settings", JSON.stringify(settings));

    // Apply dark mode class to HTML
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [primaryColor, darkMode]);

  // Listen to external changes (e.g. from Settings page)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app_settings" && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          if (typeof settings.darkMode === "boolean" && settings.darkMode !== darkMode) {
            setDarkMode(settings.darkMode);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, darkMode, setDarkMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};