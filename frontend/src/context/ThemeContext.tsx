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
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.appearance?.primaryColor || "#1976d2";
      } catch {
        return "#1976d2";
      }
    }
    return "#1976d2";
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.appearance?.darkMode || false;
      } catch {
        return false;
      }
    }
    return false;
  });

  const theme = createAppTheme(primaryColor);

  // ✅ Save to localStorage when changed
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    let settings = saved ? JSON.parse(saved) : { general: {}, appearance: {}, security: {}, notifications: {} };
    settings.appearance = {
      ...settings.appearance,
      primaryColor,
      darkMode,
    };
    localStorage.setItem("appSettings", JSON.stringify(settings));

    // Apply dark mode to HTML
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [primaryColor, darkMode]);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, darkMode, setDarkMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};