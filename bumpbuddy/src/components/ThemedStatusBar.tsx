import React from "react";
import { StatusBar } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Component that renders a status bar with theme-appropriate colors
const ThemedStatusBar: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <StatusBar
      backgroundColor="transparent"
      barStyle={isDark ? "light-content" : "dark-content"}
      translucent
    />
  );
};

export default ThemedStatusBar;
