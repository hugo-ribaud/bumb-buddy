import { TouchableOpacity, View } from "react-native";

import React from "react";
import { useTranslation } from "react-i18next";
import { usePreferences } from "../contexts/PreferencesContext";
import { useTheme } from "../contexts/ThemeContext";
import FontedText from "./FontedText";

interface UnitToggleProps {
  className?: string;
  compact?: boolean;
}

/**
 * A component that allows toggling between metric and imperial units
 * Used in both detailed views and as compact toggle
 */
const UnitToggle: React.FC<UnitToggleProps> = ({
  className = "",
  compact = false,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { units, updateUnits } = usePreferences();

  const isMetric = units === "metric";

  const toggleUnitSystem = () => {
    const newSystem = isMetric ? "imperial" : "metric";
    updateUnits(newSystem);
  };

  // Compact version for inline usage
  if (compact) {
    return (
      <View className={`flex-row items-center ${className}`}>
        <TouchableOpacity
          onPress={toggleUnitSystem}
          className="flex-row items-center py-1 px-2 rounded-full bg-gray-100 dark:bg-gray-700"
        >
          <FontedText
            variant="caption"
            className={`${
              isMetric ? "font-bold" : ""
            } text-gray-800 dark:text-gray-200`}
          >
            {t("units.metric")}
          </FontedText>
          <FontedText
            variant="caption"
            className="mx-1 text-gray-800 dark:text-gray-200"
          >
            /
          </FontedText>
          <FontedText
            variant="caption"
            className={`${
              !isMetric ? "font-bold" : ""
            } text-gray-800 dark:text-gray-200`}
          >
            {t("units.imperial")}
          </FontedText>
        </TouchableOpacity>
      </View>
    );
  }

  // Full version with segmented control style
  return (
    <View className={`${className}`}>
      {!compact && (
        <FontedText
          variant="body-small"
          className="mb-1 text-gray-600 dark:text-gray-400"
        >
          {t("preferences.unitSelection")}
        </FontedText>
      )}
      <View className="flex-row rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          className={`flex-1 py-2 items-center justify-center ${
            isMetric ? "bg-primary dark:bg-primary-dark" : "bg-transparent"
          }`}
          onPress={() => updateUnits("metric")}
        >
          <FontedText
            className={
              isMetric ? "text-white" : "text-gray-500 dark:text-gray-300"
            }
          >
            {t("units.metric")}
          </FontedText>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 items-center justify-center ${
            !isMetric ? "bg-primary dark:bg-primary-dark" : "bg-transparent"
          }`}
          onPress={() => updateUnits("imperial")}
        >
          <FontedText
            className={
              !isMetric ? "text-white" : "text-gray-500 dark:text-gray-300"
            }
          >
            {t("units.imperial")}
          </FontedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UnitToggle;
