import React, { ReactNode } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import ThemedStatusBar from "./ThemedStatusBar";

interface SafeAreaWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that provides safe area insets and proper status bar spacing
 * Use this component at the root of screen components to ensure proper spacing
 */
const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  className = "",
}) => {
  const { isDark } = useTheme();

  return (
    <>
      <ThemedStatusBar />
      <SafeAreaView
        className={`flex-1 ${
          isDark ? "bg-background-dark" : "bg-background-light"
        } ${className}`}
        edges={["top", "right", "left", "bottom"]}
      >
        {children}
      </SafeAreaView>
    </>
  );
};

export default SafeAreaWrapper;
