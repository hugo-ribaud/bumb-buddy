import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { ThemeMode } from "../redux/slices/preferencesSlice";
import { usePreferences } from "./PreferencesContext";

interface ThemeContextProps {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceTheme = useDeviceColorScheme();
  const { theme, updateTheme } = usePreferences();
  const [isDark, setIsDark] = useState<boolean>(
    theme === "dark" || (theme === "system" && deviceTheme === "dark")
  );

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

  const toggleTheme = async () => {
    let newTheme: ThemeMode;

    if (theme === "system") {
      newTheme = isDark ? "light" : "dark";
    } else if (theme === "light") {
      newTheme = "dark";
    } else {
      newTheme = "light";
    }

    await updateTheme(newTheme);
  };

  const contextValue: ThemeContextProps = {
    isDark,
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
