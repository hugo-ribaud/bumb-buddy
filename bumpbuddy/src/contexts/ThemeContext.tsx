import React, { createContext, useContext, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useDeviceColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextProps {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Storage key for theme preference
const THEME_STORAGE_KEY = "bumpbuddy_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceTheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState<boolean>(deviceTheme === "dark");

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedTheme &&
          (savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system")
        ) {
          setTheme(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };

    loadTheme();
  }, []);

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

  const changeTheme = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const toggleTheme = () => {
    if (theme === "system") {
      changeTheme(isDark ? "light" : "dark");
    } else if (theme === "light") {
      changeTheme("dark");
    } else {
      changeTheme("light");
    }
  };

  const contextValue: ThemeContextProps = {
    theme,
    isDark,
    setTheme: changeTheme,
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
