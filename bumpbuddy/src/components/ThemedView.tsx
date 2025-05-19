import { TouchableOpacity, View, ViewProps } from "react-native";

import React from "react";
import { useTheme } from "../contexts/ThemeContext";

interface ThemedViewProps extends ViewProps {
  backgroundColor?:
    | "primary"
    | "secondary"
    | "accent"
    | "background"
    | "surface";
  className?: string;
  pressable?: boolean;
  onPress?: () => void;
}

// Component that renders a View with theme-appropriate background colors
const ThemedView: React.FC<ThemedViewProps> = ({
  backgroundColor = "background",
  className = "",
  children,
  pressable = false,
  onPress,
  ...rest
}) => {
  const { isDark } = useTheme();

  // Map the backgroundColor prop to the appropriate Tailwind class
  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case "primary":
        return isDark ? "bg-primary-dark" : "bg-primary";
      case "secondary":
        return isDark ? "bg-secondary-dark" : "bg-secondary";
      case "accent":
        return isDark ? "bg-accent-dark" : "bg-accent";
      case "surface":
        return isDark ? "bg-surface-dark" : "bg-surface-light";
      case "background":
      default:
        return isDark ? "bg-background-dark" : "bg-background-light";
    }
  };

  // Render as TouchableOpacity if pressable is true
  if (pressable && onPress) {
    return (
      <TouchableOpacity
        className={`${getBackgroundClass()} ${className}`}
        onPress={onPress}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise render as a normal View
  return (
    <View className={`${getBackgroundClass()} ${className}`} {...rest}>
      {children}
    </View>
  );
};

export default ThemedView;
