import React, { createContext, useContext, useEffect, useState } from "react";

import { useColorScheme as useDeviceColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextProps {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceTheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState<boolean>(deviceTheme === "dark");

  // Effect to listen for device theme changes when in system mode
  useEffect(() => {
    if (theme === "system") {
      setIsDark(deviceTheme === "dark");
    }
  }, [deviceTheme, theme]);

  // Effect to update isDark based on the selected theme
  useEffect(() => {
    if (theme === "dark") {
      setIsDark(true);
    } else if (theme === "light") {
      setIsDark(false);
    } else {
      // system
      setIsDark(deviceTheme === "dark");
    }
  }, [theme, deviceTheme]);

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const contextValue: ThemeContextProps = {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
