import { ActivityIndicator, Image, Text, View } from "react-native";

import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { FetalSizeComparison as FetalSizeType } from "../types/fetalSize";

interface FetalSizeComparisonProps {
  sizeData: FetalSizeType | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean; // For timeline view vs detailed view
}

/**
 * Component to display fetal size comparison with fruits
 * Used in both timeline list view (compact) and week detail view
 */
export const FetalSizeComparison: React.FC<FetalSizeComparisonProps> = ({
  sizeData,
  loading = false,
  error = null,
  compact = false,
}) => {
  const { t } = useTranslation();
  // Get unit preferences from preferences slice
  const preferences = useSelector((state: RootState) => state.preferences);
  const useMetric = preferences.units === "metric";

  if (loading) {
    return (
      <View className="flex items-center justify-center p-4">
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-50 p-4 rounded-lg">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!sizeData) {
    return (
      <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <Text className="text-gray-500 dark:text-gray-400">
          {t("fetalSize.noDataAvailable")}
        </Text>
      </View>
    );
  }

  const size = useMetric
    ? `${sizeData.sizeCm} ${t("units.cm")}`
    : `${sizeData.sizeInches} ${t("units.inches")}`;

  const weight =
    sizeData.weightG && sizeData.weightOz
      ? useMetric
        ? `${sizeData.weightG} ${t("units.grams")}`
        : `${sizeData.weightOz} ${t("units.oz")}`
      : null;

  if (compact) {
    // Compact version for timeline cards
    return (
      <View className="flex flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-2 mb-2">
        {sizeData.imageUrl ? (
          <Image
            source={{ uri: sizeData.imageUrl }}
            className="w-12 h-12 mr-3"
            resizeMode="contain"
            accessibilityLabel={t("fetalSize.accessibilityImageLabel", {
              fruit: sizeData.fruitName,
              size: size,
            })}
          />
        ) : (
          <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-3" />
        )}
        <View className="flex-1">
          <Text className="text-sm font-medium dark:text-white">
            {t("fetalSize.sizeAs", { fruit: sizeData.fruitName })}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {size}
          </Text>
        </View>
      </View>
    );
  }

  // Detailed version for week detail screen
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold mb-3 dark:text-white">
        {t("fetalSize.title")}
      </Text>

      <View className="flex flex-row mb-4">
        <View className="flex-1 items-center justify-center">
          {sizeData.imageUrl ? (
            <Image
              source={{ uri: sizeData.imageUrl }}
              className="w-32 h-32"
              resizeMode="contain"
              accessibilityLabel={t("fetalSize.accessibilityImageLabel", {
                fruit: sizeData.fruitName,
                size: size,
              })}
            />
          ) : (
            <View className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
          )}
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-base font-medium mb-2 dark:text-white">
            {t("fetalSize.sizeAs", { fruit: sizeData.fruitName })}
          </Text>

          <View className="mb-2">
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {t("fetalSize.length")}
            </Text>
            <Text className="text-base font-medium dark:text-white">
              {size}
            </Text>
          </View>

          {weight && (
            <View>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {t("fetalSize.weight")}
              </Text>
              <Text className="text-base font-medium dark:text-white">
                {weight}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text className="text-gray-700 dark:text-gray-300">
        {sizeData.description}
      </Text>
    </View>
  );
};
