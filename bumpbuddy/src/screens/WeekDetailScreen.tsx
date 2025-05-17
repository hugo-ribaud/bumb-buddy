import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppDispatch, RootState } from "../redux/store";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Ionicons } from "@expo/vector-icons";
import { fetchWeekData } from "../redux/slices/timelineSlice";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

type Props = {};

const WeekDetailScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const { selectedWeek, weekData, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );

  // Fetch week data on component mount
  useEffect(() => {
    if (selectedWeek) {
      dispatch(fetchWeekData(selectedWeek));
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
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Error state
  if (error || !weekData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-5">
        <Text className="text-red-500 text-center mb-5 text-base">
          {error || t("timeline.weekNotFound")}
        </Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-blue-500 text-base ml-1">
            {t("common.goBack")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="p-4 flex-row items-center">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#007bff" />
          <Text className="text-blue-500 text-base ml-1">
            {t("common.back")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Week title and trimester */}
      <View className="px-4">
        <Text className="text-2xl font-bold text-gray-800">
          {t("timeline.weekLabel", { week: weekData.week })}
        </Text>
        <Text className="text-base text-gray-500 mt-1">{getTrimester()}</Text>
      </View>

      {/* Baby size comparison */}
      <View className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold mb-3 text-gray-800">
          {t("timeline.sizeComparison")}
        </Text>
        <View className="flex-row items-center">
          <View className="w-[100px] h-[100px] justify-center items-center">
            {/* Placeholder for image - would be loaded dynamically */}
            <View className="w-20 h-20 rounded-full bg-gray-200 justify-center items-center">
              <Text className="text-center text-sm font-medium text-gray-500 p-1 capitalize">
                {getFoodNameFromImageUrl(weekData.image_url)}
              </Text>
            </View>
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base text-gray-700">
              {t("timeline.babyIsSize", {
                size: getFoodNameFromImageUrl(weekData.image_url),
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Development information */}
      <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold mb-3 text-gray-800">
          {t("timeline.development")}
        </Text>
        <Text className="text-base text-gray-700 leading-6">
          {weekData.fetal_development}
        </Text>
      </View>

      {/* Maternal changes */}
      <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold mb-3 text-gray-800">
          {t("timeline.maternalChanges")}
        </Text>
        <Text className="text-base text-gray-700 leading-6">
          {weekData.maternal_changes}
        </Text>
      </View>

      {/* Common symptoms */}
      <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold mb-3 text-gray-800">
          {t("timeline.commonSymptoms")}
        </Text>
        <Text className="text-base text-gray-700 leading-6">
          {weekData.common_symptoms}
        </Text>
      </View>

      {/* Tips */}
      <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold mb-3 text-gray-800">
          {t("timeline.tips")}
        </Text>
        <Text className="text-base text-gray-700 leading-6">
          {weekData.tips}
        </Text>
      </View>

      {/* Nutrition advice */}
      <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold mb-3 text-gray-800">
          {t("timeline.nutritionAdvice")}
        </Text>
        <Text className="text-base text-gray-700 leading-6">
          {weekData.nutrition_advice}
        </Text>
      </View>

      {/* Medical checkups */}
      <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold mb-3 text-gray-800">
          {t("timeline.medicalCheckups")}
        </Text>
        <Text className="text-base text-gray-700 leading-6">
          {weekData.medical_checkups}
        </Text>
      </View>

      {/* Bottom padding */}
      <View className="h-10" />
    </ScrollView>
  );
};

export default WeekDetailScreen;
