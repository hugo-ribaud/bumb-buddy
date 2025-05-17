import { Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

// A simple button that toggles between light and dark mode
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
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
