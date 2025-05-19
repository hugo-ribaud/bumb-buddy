import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { getLanguageFlag } from "../i18n/languages";

interface LanguageFlagProps {
  languageCode: string;
  size?: "small" | "medium" | "large";
}

// Flag component using emoji flags from the language context
const LanguageFlag: React.FC<LanguageFlagProps> = ({
  languageCode,
  size = "medium",
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Size mapping
  const sizeMap = {
    small: 18,
    medium: 28,
    large: 42,
  };

  const fontSize = sizeMap[size];

  // Get the flag from language settings
  const flag = getLanguageFlag(languageCode);

  return (
    <View
      style={[
        styles.flagContainer,
        { height: fontSize * 1.2, width: fontSize * 1.2 },
        isDark ? styles.flagDark : styles.flagLight,
      ]}
    >
      <Text style={[styles.flag, { fontSize }]}>{flag}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  flagContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  flagLight: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  flagDark: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#444",
  },
  flag: {
    textAlign: "center",
  },
});

export default LanguageFlag;
