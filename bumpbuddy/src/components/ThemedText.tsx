import { Text, TextProps } from "react-native";

import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export interface ThemedTextProps extends TextProps {
  variant?: "primary" | "secondary" | "accent";
  textType?: "primary" | "secondary";
  className?: string;
}

// Component that renders a Text with theme-appropriate colors
const ThemedText: React.FC<ThemedTextProps> = ({
  variant,
  textType = "primary",
  className = "",
  children,
  ...rest
}) => {
  const { isDark } = useTheme();

  // Get the text color based on variant and textType
  const getTextColorClass = () => {
    // Text variant color (for colored text like primary, secondary, etc.)
    if (variant) {
      switch (variant) {
        case "primary":
          return isDark ? "text-primary-dark" : "text-primary";
        case "secondary":
          return isDark ? "text-secondary-dark" : "text-secondary";
        case "accent":
          return isDark ? "text-accent-dark" : "text-accent";
      }
    }

    // Regular text color (dark on light theme, light on dark theme)
    return textType === "primary"
      ? isDark
        ? "text-gray-50"
        : "text-gray-800"
      : isDark
      ? "text-gray-300"
      : "text-gray-600";
  };

  return (
    <Text className={`${getTextColorClass()} ${className}`} {...rest}>
      {children}
    </Text>
  );
};

export default ThemedText;
