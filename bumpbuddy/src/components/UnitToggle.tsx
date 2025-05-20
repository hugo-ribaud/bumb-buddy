import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { UnitSystem, setUnits } from "../redux/slices/preferencesSlice";

import React from "react";
import { useTranslation } from "react-i18next";
import { RootState } from "../redux/store";

/**
 * Component that allows users to toggle between metric and imperial measurement units
 */
export const UnitToggle: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUnit = useSelector(
    (state: RootState) => state.preferences.units
  );

  const toggleUnit = (unit: UnitSystem) => {
    if (currentUnit !== unit) {
      dispatch(setUnits(unit));
    }
  };

  return (
    <View className="flex flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1 my-2">
      <TouchableOpacity
        onPress={() => toggleUnit("metric")}
        className={`flex-1 rounded-full py-1 px-3 ${
          currentUnit === "metric" ? "bg-white dark:bg-gray-700" : ""
        }`}
        accessibilityLabel={t("settings.metricSystem")}
        accessibilityState={{ selected: currentUnit === "metric" }}
        accessibilityHint={t("settings.metricSystemHint")}
      >
        <Text
          className={`text-center text-sm ${
            currentUnit === "metric"
              ? "text-blue-500 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {t("settings.metric")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toggleUnit("imperial")}
        className={`flex-1 rounded-full py-1 px-3 ${
          currentUnit === "imperial" ? "bg-white dark:bg-gray-700" : ""
        }`}
        accessibilityLabel={t("settings.imperialSystem")}
        accessibilityState={{ selected: currentUnit === "imperial" }}
        accessibilityHint={t("settings.imperialSystemHint")}
      >
        <Text
          className={`text-center text-sm ${
            currentUnit === "imperial"
              ? "text-blue-500 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {t("settings.imperial")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
