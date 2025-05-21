import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import FontedText from "./FontedText";
import ThemedView from "./ThemedView";

interface HomeFetalSizeComparisonProps {
  week: number;
  fruitName: string;
  sizeCm: number;
  sizeInches: number;
  weightG?: number;
  weightOz?: number;
  description?: string;
}

/**
 * Simplified fetal size comparison component for HomeScreen
 * Uses static data instead of Supabase image loading for better performance
 */
export const HomeFetalSizeComparison: React.FC<
  HomeFetalSizeComparisonProps
> = ({
  week,
  fruitName,
  sizeCm,
  sizeInches,
  weightG,
  weightOz,
  description,
}) => {
  const { t } = useTranslation();
  // Get unit preferences from preferences slice
  const preferences = useSelector((state: RootState) => state.preferences);
  const useMetric = preferences.units === "metric";

  // Format display values based on user preferences
  const sizeDisplay = useMetric
    ? `${sizeCm.toFixed(1)} ${t("units.cm")}`
    : `${sizeInches.toFixed(1)} ${t("units.inches")}`;

  const weightDisplay =
    weightG && weightOz
      ? useMetric
        ? `${weightG.toFixed(0)} ${t("units.grams")}`
        : `${weightOz.toFixed(1)} ${t("units.oz")}`
      : null;

  return (
    <ThemedView
      backgroundColor="surface"
      className="mb-4 rounded-lg overflow-hidden"
    >
      <View className="flex flex-row p-4">
        {/* Fruit icon circle */}
        <View className="w-16 h-16 bg-primary/20 dark:bg-primary-dark/30 rounded-full items-center justify-center mr-4">
          <FontedText
            variant="heading-3"
            colorVariant="primary"
            fontFamily="comfortaa"
          >
            {fruitName.charAt(0).toUpperCase()}
          </FontedText>
        </View>

        <View className="flex-1 justify-center">
          <FontedText variant="body" className="font-medium mb-1">
            {t("fetalSize.sizeAs", { fruit: fruitName })}
          </FontedText>

          <View className="flex-row mb-1">
            <FontedText variant="caption" textType="secondary" className="mr-2">
              {t("fetalSize.length")}:
            </FontedText>
            <FontedText variant="body-small" className="font-medium">
              {sizeDisplay}
            </FontedText>
          </View>

          {weightDisplay && (
            <View className="flex-row">
              <FontedText
                variant="caption"
                textType="secondary"
                className="mr-2"
              >
                {t("fetalSize.weight")}:
              </FontedText>
              <FontedText variant="body-small" className="font-medium">
                {weightDisplay}
              </FontedText>
            </View>
          )}
        </View>
      </View>

      {description && (
        <View className="p-4 pt-0">
          <FontedText variant="body-small" textType="secondary">
            {description}
          </FontedText>
        </View>
      )}
    </ThemedView>
  );
};
