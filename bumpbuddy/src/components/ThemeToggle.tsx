import { Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../contexts/ThemeContext";
import { RootState } from "../redux/store";
import authService from "../services/authService";

interface ThemeToggleProps {
  className?: string;
}

// A simple button that toggles between light and dark mode
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { isDark, toggleTheme, theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleToggleTheme = useCallback(async () => {
    // First toggle theme in context & local storage
    toggleTheme();

    // Calculate what the new theme will be
    let newTheme: string;
    if (theme === "system") {
      newTheme = isDark ? "light" : "dark";
    } else if (theme === "light") {
      newTheme = "dark";
    } else {
      newTheme = "light";
    }

    // Then save to user profile in database if user is logged in
    if (user) {
      try {
        await authService.updateProfile({
          id: user.id,
          appSettings: {
            theme: newTheme,
          },
        });
        console.log("Theme preference saved to user profile");
      } catch (error) {
        console.error("Failed to save theme preference to profile:", error);
      }
    }
  }, [theme, isDark, toggleTheme, user]);

  return (
    <TouchableOpacity
      onPress={handleToggleTheme}
      className={`flex-row items-center ${className}`}
    >
      <View
        className={`p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
      >
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={20}
          color={isDark ? "#FFFFFF" : "#000000"}
        />
      </View>
      <Text className={`ml-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {theme === "system" ? "System" : isDark ? "Dark" : "Light"}
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeToggle;
