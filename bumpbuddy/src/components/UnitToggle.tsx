import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { usePreferences } from "../contexts/PreferencesContext";
import { useTheme } from "../contexts/ThemeContext";
import { UnitSystem } from "../redux/slices/preferencesSlice";
import FontedText from "./FontedText";

interface UnitToggleProps {
  compact?: boolean;
}

/**
 * Component for toggling between metric and imperial units
 * Used in both detailed views and as compact toggle
 */
const UnitToggle: React.FC<UnitToggleProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { units, updateUnits } = usePreferences();

  const handleToggleUnits = async () => {
    const newUnits: UnitSystem = units === "metric" ? "imperial" : "metric";
    await updateUnits(newUnits);
  };

  // Compact version for inline usage
  if (compact) {
    return (
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleToggleUnits}
          className="flex-row items-center py-1 px-2 rounded-full bg-gray-100 dark:bg-gray-700"
        >
          <FontedText
            variant="caption"
            className={`${
              units === "metric" ? "font-bold" : ""
            } text-gray-800 dark:text-gray-200`}
          >
            {t("units.metric")}
          </FontedText>
          <View className="mx-1 w-px h-3 bg-gray-300 dark:bg-gray-500" />
          <FontedText
            variant="caption"
            className={`${
              units === "imperial" ? "font-bold" : ""
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
    <View className="mb-4">
      <FontedText
        variant="body-small"
        className="mb-1 text-gray-600 dark:text-gray-400"
      >
        {t("preferences.unitSelection")}
      </FontedText>
      <View
        className="flex-row rounded-lg overflow-hidden"
        style={{
          backgroundColor: isDark ? "#333333" : "#e5e7eb",
        }}
      >
        <TouchableOpacity
          className={`flex-1 py-2 items-center justify-center`}
          style={{
            backgroundColor:
              units === "metric"
                ? isDark
                  ? "#5DBDA8"
                  : "#87D9C4"
                : "transparent",
          }}
          onPress={() => updateUnits("metric")}
        >
          <FontedText
            className={
              units === "metric"
                ? "text-white"
                : "text-gray-500 dark:text-gray-300"
            }
          >
            {t("units.metric")}
          </FontedText>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 items-center justify-center`}
          style={{
            backgroundColor:
              units === "imperial"
                ? isDark
                  ? "#5DBDA8"
                  : "#87D9C4"
                : "transparent",
          }}
          onPress={() => updateUnits("imperial")}
        >
          <FontedText
            className={
              units === "imperial"
                ? "text-white"
                : "text-gray-500 dark:text-gray-300"
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
