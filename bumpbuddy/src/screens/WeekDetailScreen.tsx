import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import FetalSizeComparison from "../components/FetalSizeComparison";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import { useTheme } from "../contexts/ThemeContext";
import { fetchFetalSizeByWeek } from "../redux/slices/fetalSizeSlice";
import { fetchWeekData } from "../redux/slices/timelineSlice";

type Props = {};

const WeekDetailScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const { selectedWeek, weekData, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );
  const fetalSize = useSelector(
    (state: RootState) => state.fetalSize.currentComparison
  );

  // Fetch week data on component mount
  useEffect(() => {
    if (selectedWeek) {
      dispatch(fetchWeekData(selectedWeek));
      dispatch(fetchFetalSizeByWeek(selectedWeek));
    }
  }, [dispatch, selectedWeek]);

  // Determine the trimester
  const getTrimester = () => {
    if (!selectedWeek) return "";

    if (selectedWeek <= 13) {
      return t("timeline.firstTrimester");
    } else if (selectedWeek <= 26) {
      return t("timeline.secondTrimester");
    } else {
      return t("timeline.thirdTrimester");
    }
  };

  // Helper function to safely extract food name from image_url
  const getFoodNameFromImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return "food";

    try {
      const parts = imageUrl.split("_");
      if (parts.length > 1) {
        return parts[1].replace(".png", "").replace(/_/g, " ");
      }
      return "food";
    } catch (error) {
      console.error("Error parsing image URL:", error);
      return "food";
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaWrapper>
        <ThemedView className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#60a5fa" : "#007bff"}
          />
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  // Error state
  if (error || !weekData) {
    return (
      <SafeAreaWrapper>
        <ThemedView className="flex-1 justify-center items-center p-5">
          <FontedText
            variant="body"
            colorVariant="accent"
            className="text-center mb-5"
          >
            {error || t("timeline.weekNotFound")}
          </FontedText>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => navigation.goBack()}
          >
            <FontedText colorVariant="primary" variant="body" className="ml-1">
              {t("common.goBack")}
            </FontedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ThemedView className="flex-1">
        <ScrollView className="flex-1">
          {/* Header with back button */}
          <View className="p-4 flex-row items-center">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={isDark ? "#60a5fa" : "#007bff"}
              />
              <FontedText
                colorVariant="primary"
                variant="body"
                className="ml-1"
              >
                {t("common.back")}
              </FontedText>
            </TouchableOpacity>
          </View>

          {/* Week title and trimester */}
          <View className="px-4">
            <FontedText variant="heading-2">
              {t("timeline.weekLabel", { week: weekData.week })}
            </FontedText>
            <FontedText
              variant="body"
              colorVariant="secondary"
              className="mt-1"
            >
              {getTrimester()}
            </FontedText>
          </View>

          {/* Fetal Size Comparison */}
          {fetalSize && (
            <ThemedView
              backgroundColor="surface"
              className="mx-4 mb-4 rounded-xl p-4 shadow-sm"
            >
              <FontedText variant="heading-3" className="mb-3">
                {t("fetalSize.comparisonTitle")}
              </FontedText>
              <FetalSizeComparison
                weekNumber={selectedWeek || 0}
                itemName={fetalSize.name}
                imageUrl={fetalSize.image_url}
                sizeInCm={fetalSize.size_cm}
                sizeInInches={fetalSize.size_inches}
                weightInG={fetalSize.weight_g}
                weightInOz={fetalSize.weight_oz}
              />
              {fetalSize.description && (
                <FontedText variant="body" className="mt-3 leading-6">
                  {fetalSize.description}
                </FontedText>
              )}
            </ThemedView>
          )}

          {/* Development information */}
          <ThemedView
            backgroundColor="surface"
            className="mx-4 mb-4 rounded-xl p-4 shadow-sm"
          >
            <FontedText variant="heading-3" className="mb-3">
              {t("timeline.development")}
            </FontedText>
            <FontedText variant="body" className="leading-6">
              {weekData.fetal_development}
            </FontedText>
          </ThemedView>

          {/* Maternal changes */}
          <ThemedView
            backgroundColor="surface"
            className="mx-4 mb-4 rounded-xl p-4 shadow-sm"
          >
            <FontedText variant="heading-3" className="mb-3">
              {t("timeline.maternalChanges")}
            </FontedText>
            <FontedText variant="body" className="leading-6">
              {weekData.maternal_changes}
            </FontedText>
          </ThemedView>

          {/* Common symptoms */}
          <ThemedView
            backgroundColor="surface"
            className="mx-4 mb-4 rounded-xl p-4 shadow-sm"
          >
            <FontedText variant="heading-3" className="mb-3">
              {t("timeline.commonSymptoms")}
            </FontedText>
            <FontedText variant="body" className="leading-6">
              {weekData.common_symptoms}
            </FontedText>
          </ThemedView>

          {/* Tips */}
          <ThemedView
            backgroundColor="surface"
            className="mx-4 mb-4 rounded-xl p-4 shadow-sm"
          >
            <FontedText variant="heading-3" className="mb-3">
              {t("timeline.tips")}
            </FontedText>
            <FontedText variant="body" className="leading-6">
              {weekData.tips}
            </FontedText>
          </ThemedView>

          {/* Nutrition advice */}
          <ThemedView
            backgroundColor="surface"
            className="mx-4 mb-4 rounded-xl p-4 shadow-sm"
          >
            <FontedText variant="heading-3" className="mb-3">
              {t("timeline.nutritionAdvice")}
            </FontedText>
            <FontedText variant="body" className="leading-6">
              {weekData.nutrition_advice}
            </FontedText>
          </ThemedView>

          {/* Medical checkups */}
          <ThemedView
            backgroundColor="surface"
            className="mx-4 mb-4 rounded-xl p-4 shadow-sm"
          >
            <FontedText variant="heading-3" className="mb-3">
              {t("timeline.medicalCheckups")}
            </FontedText>
            <FontedText variant="body" className="leading-6">
              {weekData.medical_checkups}
            </FontedText>
          </ThemedView>

          {/* Bottom padding */}
          <View className="h-10" />
        </ScrollView>
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default WeekDetailScreen;
