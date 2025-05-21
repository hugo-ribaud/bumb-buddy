import { ActivityIndicator, Image, Text, View } from "react-native";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import supabase from "../config/supabaseConfig";
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
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Process the image URL when component mounts or when sizeData changes
  useEffect(() => {
    let isMounted = true;

    const processImageUrl = async () => {
      // Reset state
      if (isMounted) {
        setImageUrl(null);
        setImageError(false);
        setImageLoading(true);
      }

      if (!sizeData) {
        console.log("No sizeData provided");
        if (isMounted) setImageLoading(false);
        return;
      }

      // Ensure we have a fruitName before proceeding
      const fruitName = sizeData.fruitName || "default";

      try {
        // The bucket name for fetal size images
        const bucketName = "fetal_size";

        // Create standardized path based on week number and fruit name
        const formattedWeek = String(sizeData.week).padStart(2, "0");
        const standardPath = `week_${formattedWeek}_${fruitName
          .toLowerCase()
          .replace(/\s+/g, "_")}.png`;

        console.log("Attempting to load image:", standardPath);

        // Get public URL for the image
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(standardPath);

        // Check if we got a valid public URL
        if (urlData?.publicUrl && isMounted) {
          console.log("Public URL obtained:", urlData.publicUrl);
          setImageUrl(urlData.publicUrl);
        } else if (sizeData.imageUrl && isMounted) {
          // Fallback to direct imageUrl if provided in sizeData
          console.log("Using direct imageUrl:", sizeData.imageUrl);
          // Check if it's a full URL or needs to be constructed
          if (sizeData.imageUrl.startsWith("http")) {
            setImageUrl(sizeData.imageUrl);
          } else {
            // It's a path in Supabase storage
            const { data } = supabase.storage
              .from(bucketName)
              .getPublicUrl(sizeData.imageUrl);

            if (data?.publicUrl) {
              setImageUrl(data.publicUrl);
            }
          }
        } else {
          // No valid image URL could be found
          console.log("No valid image URL could be determined");
          if (isMounted) setImageError(true);
        }
      } catch (err) {
        console.error("Error processing image URL:", err);
        if (isMounted) {
          setImageError(true);
        }
      } finally {
        if (isMounted) {
          setImageLoading(false);
        }
      }
    };

    processImageUrl();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [sizeData]);

  if (loading) {
    return (
      <View className="flex items-center justify-center p-4">
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <Text className="text-red-500 dark:text-red-300">{error}</Text>
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

  // Ensure we have a valid fruit name to display
  const fruitNameToDisplay =
    sizeData.fruitName || t("fetalSize.defaultFruit", "fruit");

  const size = useMetric
    ? `${sizeData.sizeCm} ${t("units.cm")}`
    : `${sizeData.sizeInches} ${t("units.inches")}`;

  const weight =
    sizeData.weightG && sizeData.weightOz
      ? useMetric
        ? `${sizeData.weightG} ${t("units.grams")}`
        : `${sizeData.weightOz} ${t("units.oz")}`
      : null;

  // Render placeholder for missing or error images
  const renderImagePlaceholder = (size: string) => (
    <View
      className={`${size} bg-gray-200 dark:bg-gray-700 rounded-full justify-center items-center`}
    >
      <Text className="text-xs text-center text-gray-500 dark:text-gray-400 p-1 capitalize">
        {fruitNameToDisplay}
      </Text>
    </View>
  );

  if (compact) {
    // Compact version for timeline cards
    return (
      <View className="flex flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-2 mb-2">
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <View className="w-12 h-12 justify-center items-center">
                <ActivityIndicator size="small" color="#0891b2" />
              </View>
            )}
            <Image
              source={{ uri: imageUrl }}
              className={`w-12 h-12 mr-3 ${imageLoading ? "hidden" : "flex"}`}
              resizeMode="contain"
              accessibilityLabel={t("fetalSize.accessibilityImageLabel", {
                fruit: fruitNameToDisplay,
                size: size,
              })}
              onLoadStart={() => setImageLoading(true)}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <View className="mr-3">{renderImagePlaceholder("w-12 h-12")}</View>
        )}
        <View className="flex-1">
          <Text className="text-sm font-medium dark:text-white">
            {t("fetalSize.sizeAs", { fruit: fruitNameToDisplay })}
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
          {imageUrl && !imageError ? (
            <>
              {imageLoading && (
                <View className="w-32 h-32 justify-center items-center">
                  <ActivityIndicator size="large" color="#0891b2" />
                </View>
              )}
              <Image
                source={{ uri: imageUrl }}
                className={`w-32 h-32 ${imageLoading ? "hidden" : "flex"}`}
                resizeMode="contain"
                accessibilityLabel={t("fetalSize.accessibilityImageLabel", {
                  fruit: fruitNameToDisplay,
                  size: size,
                })}
                onLoadStart={() => setImageLoading(true)}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </>
          ) : (
            renderImagePlaceholder("w-32 h-32")
          )}
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-base font-medium mb-2 dark:text-white">
            {t("fetalSize.sizeAs", { fruit: fruitNameToDisplay })}
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
