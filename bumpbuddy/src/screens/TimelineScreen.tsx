import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppDispatch, RootState } from "../redux/store";
import React, { useEffect, useState } from "react";
import {
  fetchAllWeeks,
  fetchCurrentWeekData,
  selectWeek,
} from "../redux/slices/timelineSlice";
import { useDispatch, useSelector } from "react-redux";

import timelineService from "../services/timelineService";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

type Props = {};

const TimelineScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [refreshing, setRefreshing] = useState(false);

  const { currentWeek, allWeeks, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch weeks data on component mount
  useEffect(() => {
    dispatch(fetchAllWeeks());
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

  // Render each week item
  const renderWeekItem = ({ item }: { item: any }) => {
    const isCurrentWeek = item.week === currentWeek;

    return (
      <Pressable
        className={`bg-white rounded-xl p-4 mb-3 shadow-sm ${
          isCurrentWeek ? "border-2 border-blue-500" : ""
        }`}
        onPress={() => handleWeekSelect(item.week)}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className={`text-lg font-bold ${
              isCurrentWeek ? "text-blue-500" : "text-gray-800"
            }`}
          >
            {t("timeline.weekLabel", { week: item.week })}
          </Text>
          {isCurrentWeek && (
            <Text className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
              {t("timeline.currentWeek")}
            </Text>
          )}
        </View>
        <Text className="text-base font-medium mb-2 text-gray-700 capitalize">
          {getFoodNameFromImageUrl(item.image_url)}
        </Text>
        <Text numberOfLines={2} className="text-sm text-gray-500">
          {item.fetal_development}
        </Text>
      </Pressable>
    );
  };

  // Handle tab change
  const handleTabChange = (tab: 1 | 2 | 3) => {
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-2xl font-bold text-gray-800">
          {t("timeline.title")}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-3 py-1.5 rounded"
          onPress={handleClearCache}
          disabled={refreshing}
        >
          <Text className="text-white font-medium">
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug info */}
      <Text className="text-xs text-gray-500 mb-2">
        Weeks loaded: {allWeeks.length} | Filtered: {filteredWeeks.length}
      </Text>

      {/* Trimester tabs */}
      <View className="flex-row mb-4 rounded-lg overflow-hidden bg-gray-200">
        <Pressable
          className={`flex-1 py-3 items-center ${
            activeTab === 1 ? "bg-blue-500" : ""
          }`}
          onPress={() => handleTabChange(1)}
        >
          <Text
            className={`font-medium ${
              activeTab === 1 ? "text-white" : "text-gray-500"
            }`}
          >
            {t("timeline.firstTrimester")}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 items-center ${
            activeTab === 2 ? "bg-blue-500" : ""
          }`}
          onPress={() => handleTabChange(2)}
        >
          <Text
            className={`font-medium ${
              activeTab === 2 ? "text-white" : "text-gray-500"
            }`}
          >
            {t("timeline.secondTrimester")}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 items-center ${
            activeTab === 3 ? "bg-blue-500" : ""
          }`}
          onPress={() => handleTabChange(3)}
        >
          <Text
            className={`font-medium ${
              activeTab === 3 ? "text-white" : "text-gray-500"
            }`}
          >
            {t("timeline.thirdTrimester")}
          </Text>
        </Pressable>
      </View>

      {loading || refreshing ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          className="flex-1 justify-center items-center"
        />
      ) : error ? (
        <Text className="text-red-500 text-center mt-4">{error}</Text>
      ) : (
        <FlatList
          data={filteredWeeks}
          renderItem={renderWeekItem}
          keyExtractor={(item) => item.week.toString()}
          className="pb-4"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default TimelineScreen;
