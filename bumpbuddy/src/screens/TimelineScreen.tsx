import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFetalSizes,
  fetchAllFetalSizesWithTranslations,
  setCurrentLanguage,
} from "../redux/slices/fetalSizeSlice";
import {
  fetchAllWeeks,
  fetchCurrentWeek,
  fetchWeekData,
} from "../redux/slices/timelineSlice";
import { AppDispatch, RootState } from "../redux/store";

import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import FetalSizeComparison from "../components/FetalSizeComparison";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import { useTheme } from "../contexts/ThemeContext";
import timelineService from "../services/timelineService";

type Props = {};

const TimelineScreen: React.FC<Props> = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const { currentWeek, allWeeks, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );
  const fetalSizeData = useSelector(
    (state: RootState) => state.fetalSize.allComparisons
  );
  const translatedFetalSizes = useSelector(
    (state: RootState) => state.fetalSize.translatedComparisons
  );
  const currentLanguage = useSelector(
    (state: RootState) => state.fetalSize.currentLanguage
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch weeks data on component mount
  useEffect(() => {
    dispatch(fetchAllWeeks());
    dispatch(fetchAllFetalSizes());
    // Fetch translations for all supported languages
    dispatch(fetchAllFetalSizesWithTranslations(["en", "fr", "es"]));
    if (user?.dueDate) {
      dispatch(fetchCurrentWeek(user.dueDate));
    }
  }, [dispatch, user?.dueDate]);

  // Set current language based on i18n settings
  useEffect(() => {
    dispatch(setCurrentLanguage(i18n.language));
  }, [dispatch, i18n.language]);

  // Debug fetal size data
  useEffect(() => {
    if (fetalSizeData.length > 0) {
      console.log(
        "TimelineScreen: Fetal size data loaded:",
        fetalSizeData.length,
        "items"
      );
      console.log("Sample fetal size item:", fetalSizeData[0]);
    }
  }, [fetalSizeData]);

  // Handle cache clearing and data refresh
  const handleClearCache = async () => {
    try {
      setRefreshing(true);
      await timelineService.clearCache();
      // Refresh data after clearing cache
      await dispatch(fetchAllWeeks()).unwrap();
      await dispatch(fetchAllFetalSizes()).unwrap();
      await dispatch(
        fetchAllFetalSizesWithTranslations(["en", "fr", "es"])
      ).unwrap();
      if (user?.dueDate) {
        await dispatch(fetchCurrentWeek(user.dueDate)).unwrap();
      }
      Alert.alert("Success", "Timeline data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh timeline data");
    } finally {
      setRefreshing(false);
    }
  };

  // Filter weeks by trimester
  const filteredWeeks = allWeeks.filter((week) => {
    if (activeTab === 1) return week.week >= 1 && week.week <= 13;
    if (activeTab === 2) return week.week >= 14 && week.week <= 26;
    return week.week >= 27 && week.week <= 40;
  });

  // Handle week selection
  const handleWeekSelect = (weekNumber: number) => {
    dispatch(fetchWeekData(weekNumber));
    navigation.navigate("WeekDetail" as never);
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

  // Get translated data for a specific week
  const getTranslatedFetalSize = (weekNumber: number) => {
    if (!translatedFetalSizes || translatedFetalSizes.length === 0) {
      return undefined;
    }
    return translatedFetalSizes.find((item) => item.week === weekNumber);
  };

  // Render each week item
  const renderWeekItem = ({ item }: { item: any }) => {
    if (!item) return null;

    const isCurrentWeek = item.week === currentWeek;
    const weekFetalSize = fetalSizeData?.find(
      (size) => size?.week === item.week
    );
    const translatedFetalSize = getTranslatedFetalSize(item.week);

    // Get the translated name if available
    const getItemName = () => {
      try {
        if (
          translatedFetalSize &&
          translatedFetalSize.translatedContent &&
          translatedFetalSize.translatedContent[currentLanguage] &&
          translatedFetalSize.translatedContent[currentLanguage].name
        ) {
          return translatedFetalSize.translatedContent[currentLanguage].name;
        }
      } catch (error) {
        console.error("Error getting item name:", error);
      }
      return weekFetalSize?.name || "";
    };

    return (
      <Pressable
        className={`p-4 mb-3 rounded-xl shadow-sm ${
          isCurrentWeek ? "border-2 border-blue-500" : ""
        }`}
        style={{
          backgroundColor: isDark ? "#171717" : "#FFFFFF",
          elevation: 1,
        }}
        onPress={() => handleWeekSelect(item.week)}
      >
        <View className="flex-row items-center justify-between mb-2">
          <FontedText
            variant={isCurrentWeek ? "heading-4" : "body"}
            className={isCurrentWeek ? "text-blue-500" : ""}
          >
            {t("timeline.weekLabel", { week: item.week })}
          </FontedText>
          {isCurrentWeek && (
            <FontedText className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">
              {t("timeline.currentWeek")}
            </FontedText>
          )}
        </View>

        {weekFetalSize ? (
          <FetalSizeComparison
            weekNumber={item.week}
            itemName={getItemName()}
            imageUrl={weekFetalSize.image_url || ""}
            translatedContent={translatedFetalSize?.translatedContent || {}}
            currentLanguage={currentLanguage || "en"}
            compact={true}
          />
        ) : (
          <FontedText variant="body" className="mb-2 capitalize">
            {getFoodNameFromImageUrl(item.image_url)}
          </FontedText>
        )}

        <FontedText
          variant="body-small"
          colorVariant="secondary"
          numberOfLines={2}
          className="mt-2"
        >
          {item.fetal_development}
        </FontedText>
      </Pressable>
    );
  };

  // Handle tab change
  const handleTabChange = (tab: 1 | 2 | 3) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaWrapper>
      <ThemedView className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-2">
          <FontedText variant="heading-2">{t("timeline.title")}</FontedText>

          {/* Language selector */}
          <View className="flex-row items-center mr-2">
            {["en", "fr", "es"].map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => dispatch(setCurrentLanguage(lang))}
                className={`px-2 py-1 mx-1 rounded-md ${
                  currentLanguage === lang ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <FontedText
                  variant="caption"
                  colorVariant={
                    currentLanguage === lang ? "primary" : "secondary"
                  }
                >
                  {lang.toUpperCase()}
                </FontedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="px-3 py-1.5 rounded bg-primary dark:bg-primary-dark"
            style={{
              backgroundColor: isDark ? "#5DBDA8" : "#87D9C4",
            }}
            onPress={handleClearCache}
            disabled={refreshing}
          >
            <FontedText className="font-medium text-white">
              {refreshing ? "Refreshing..." : "Refresh"}
            </FontedText>
          </TouchableOpacity>
        </View>

        {/* Debug info */}
        <FontedText variant="caption" colorVariant="secondary" className="mb-2">
          Weeks loaded: {allWeeks.length} | Filtered: {filteredWeeks.length} |
          Language: {currentLanguage}
        </FontedText>

        {/* Trimester tabs */}
        <View
          className="flex-row mb-4 overflow-hidden rounded-lg"
          style={{
            backgroundColor: isDark ? "#333333" : "#e5e7eb",
          }}
        >
          <Pressable
            className="items-center flex-1 py-3"
            style={{
              backgroundColor:
                activeTab === 1
                  ? isDark
                    ? "#5DBDA8"
                    : "#87D9C4"
                  : "transparent",
            }}
            onPress={() => handleTabChange(1)}
          >
            <FontedText
              className={
                activeTab === 1
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-300"
              }
            >
              {t("timeline.firstTrimester")}
            </FontedText>
          </Pressable>
          <Pressable
            className="items-center flex-1 py-3"
            style={{
              backgroundColor:
                activeTab === 2
                  ? isDark
                    ? "#5DBDA8"
                    : "#87D9C4"
                  : "transparent",
            }}
            onPress={() => handleTabChange(2)}
          >
            <FontedText
              className={
                activeTab === 2
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-300"
              }
            >
              {t("timeline.secondTrimester")}
            </FontedText>
          </Pressable>
          <Pressable
            className="items-center flex-1 py-3"
            style={{
              backgroundColor:
                activeTab === 3
                  ? isDark
                    ? "#5DBDA8"
                    : "#87D9C4"
                  : "transparent",
            }}
            onPress={() => handleTabChange(3)}
          >
            <FontedText
              className={
                activeTab === 3
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-300"
              }
            >
              {t("timeline.thirdTrimester")}
            </FontedText>
          </Pressable>
        </View>

        {loading || refreshing ? (
          <ActivityIndicator
            size="large"
            color={isDark ? "#60a5fa" : "#007bff"}
            className="items-center justify-center flex-1"
          />
        ) : error ? (
          <FontedText className="mt-4 text-center text-red-500">
            {error}
          </FontedText>
        ) : (
          <FlatList
            data={filteredWeeks}
            renderItem={renderWeekItem}
            keyExtractor={(item) => item.week.toString()}
            className="pb-4"
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default TimelineScreen;
