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
  fetchAllWeeks,
  fetchCurrentWeekData,
  selectWeek,
} from "../redux/slices/timelineSlice";
import { AppDispatch, RootState } from "../redux/store";

import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { FetalSizeComparison } from "../components/FetalSizeComparison";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import { useTheme } from "../contexts/ThemeContext";
import { fetchAllSizeComparisons } from "../redux/slices/fetalSizeSlice";
import timelineService from "../services/timelineService";

type Props = {};

const TimelineScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const { currentWeek, allWeeks, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );
  const { sizeComparisons, loading: fetalSizeLoading } = useSelector(
    (state: RootState) => state.fetalSize
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch weeks data on component mount
  useEffect(() => {
    dispatch(fetchAllWeeks());
    dispatch(fetchAllSizeComparisons());
    if (user?.dueDate) {
      dispatch(fetchCurrentWeekData(user.dueDate));
    }
  }, [dispatch, user?.dueDate]);

  // Handle cache clearing and data refresh
  const handleClearCache = async () => {
    try {
      setRefreshing(true);
      await timelineService.clearCache();
      // Refresh data after clearing cache
      await dispatch(fetchAllWeeks()).unwrap();
      await dispatch(fetchAllSizeComparisons()).unwrap();
      if (user?.dueDate) {
        await dispatch(fetchCurrentWeekData(user.dueDate)).unwrap();
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
    dispatch(selectWeek(weekNumber));
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

  // Find matching fetal size data for a week
  const getFetalSizeForWeek = (week: number) => {
    return sizeComparisons.find((size) => size.week === week) || null;
  };

  // Render each week item
  const renderWeekItem = ({ item }: { item: any }) => {
    const isCurrentWeek = item.week === currentWeek;
    const fetalSizeData = getFetalSizeForWeek(item.week);

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

        {/* Fetal Size Component */}
        {fetalSizeData ? (
          <FetalSizeComparison
            sizeData={fetalSizeData}
            loading={fetalSizeLoading}
            compact
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
          Weeks loaded: {allWeeks.length} | Filtered: {filteredWeeks.length}
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

        {loading || refreshing || fetalSizeLoading ? (
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
