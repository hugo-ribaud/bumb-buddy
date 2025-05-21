import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, View } from "react-native";
import { useSelector } from "react-redux";
import supabase from "../config/supabaseConfig";
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
 * Uses a direct image loading approach with a letter fallback
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  // Try to fetch the image in the background
  useEffect(() => {
    // Reset state for new image
    setImageLoading(true);
    setImageError(false);
    setImageUrl(null);

    // Create a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (imageLoading) {
        console.log("Image loading timed out");
        setImageLoading(false);
        setImageError(true);
      }
    }, 5000); // 5-second timeout

    const loadImage = async () => {
      try {
        // Use the correct bucket name "fetal_size_images"
        const bucketName = "fetal_size_images";
        const formattedWeek = String(week).padStart(2, "0");
        const formattedFruitName = fruitName.toLowerCase().replace(/\s+/g, "_");
        const imagePath = `week_${formattedWeek}_${formattedFruitName}.png`;

        console.log(
          `Attempting to load image: ${imagePath} from bucket: ${bucketName}`
        );

        // Get public URL from Supabase
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(imagePath);

        if (data?.publicUrl) {
          console.log(`Image URL found: ${data.publicUrl}`);
          setImageUrl(data.publicUrl);
        } else {
          console.log("No image URL found, trying fallback formats");

          // Sometimes the image might be a jpg instead of png
          const jpgPath = `week_${formattedWeek}_${formattedFruitName}.jpg`;
          const { data: jpgData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(jpgPath);

          if (jpgData?.publicUrl) {
            console.log(`JPG image URL found: ${jpgData.publicUrl}`);
            setImageUrl(jpgData.publicUrl);
          } else {
            console.log("No fallback images found");
            setImageError(true);
            setImageLoading(false);
          }
        }
      } catch (error) {
        console.log("Error loading image:", error);
        setImageError(true);
        setImageLoading(false);
      }
    };

    if (fruitName) {
      loadImage();
    } else {
      setImageLoading(false);
      setImageError(true);
    }

    // Clear timeout on cleanup
    return () => clearTimeout(timeoutId);
  }, [week, fruitName]);

  return (
    <ThemedView
      backgroundColor="surface"
      className="mb-4 rounded-lg overflow-hidden"
    >
      <View className="flex flex-row p-4">
        {/* Image or fallback letter */}
        {imageUrl && !imageError ? (
          <View className="w-16 h-16 mr-4 justify-center items-center">
            {imageLoading && <ActivityIndicator size="small" color="#0891b2" />}
            <Image
              source={{ uri: imageUrl }}
              className={`w-16 h-16 rounded-md ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              resizeMode="contain"
              accessibilityLabel={fruitName}
              onLoadStart={() => {
                console.log("Image load started for:", imageUrl);
                setImageLoading(true);
              }}
              onLoad={() => {
                console.log("Image loaded successfully");
                setImageLoading(false);
              }}
              onError={(e) => {
                console.log("Image load error:", e.nativeEvent.error);
                console.log("Failed image URL:", imageUrl);
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </View>
        ) : (
          // Letter fallback
          <View className="w-16 h-16 bg-primary/20 dark:bg-primary-dark/30 rounded-full items-center justify-center mr-4">
            <FontedText
              variant="heading-3"
              colorVariant="primary"
              fontFamily="comfortaa"
            >
              {fruitName.charAt(0).toUpperCase()}
            </FontedText>
          </View>
        )}

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
