import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
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
import timelineService from "../services/timelineService";

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
        style={[styles.weekItem, isCurrentWeek && styles.currentWeekItem]}
        onPress={() => handleWeekSelect(item.week)}
      >
        <View style={styles.weekHeader}>
          <Text
            style={[styles.weekNumber, isCurrentWeek && styles.currentWeekText]}
          >
            {t("timeline.weekLabel", { week: item.week })}
          </Text>
          {isCurrentWeek && (
            <Text style={styles.currentLabel}>{t("timeline.currentWeek")}</Text>
          )}
        </View>
        <Text style={styles.weekTitle}>
          {getFoodNameFromImageUrl(item.image_url)}
        </Text>
        <Text numberOfLines={2} style={styles.weekDescription}>
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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t("timeline.title")}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleClearCache}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug info */}
      <Text style={styles.debugInfo}>
        Weeks loaded: {allWeeks.length} | Filtered: {filteredWeeks.length}
      </Text>

      {/* Trimester tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => handleTabChange(1)}
        >
          <Text
            style={[styles.tabText, activeTab === 1 && styles.activeTabText]}
          >
            {t("timeline.firstTrimester")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 2 && styles.activeTab]}
          onPress={() => handleTabChange(2)}
        >
          <Text
            style={[styles.tabText, activeTab === 2 && styles.activeTabText]}
          >
            {t("timeline.secondTrimester")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 3 && styles.activeTab]}
          onPress={() => handleTabChange(3)}
        >
          <Text
            style={[styles.tabText, activeTab === 3 && styles.activeTabText]}
          >
            {t("timeline.thirdTrimester")}
          </Text>
        </Pressable>
      </View>

      {loading || refreshing ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredWeeks}
          renderItem={renderWeekItem}
          keyExtractor={(item) => item.week.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
  },
  refreshButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "500",
  },
  debugInfo: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e9ecef",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007bff",
  },
  tabText: {
    fontWeight: "500",
    color: "#6c757d",
  },
  activeTabText: {
    color: "white",
  },
  listContent: {
    paddingBottom: 16,
  },
  weekItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentWeekItem: {
    borderWidth: 2,
    borderColor: "#007bff",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weekNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
  },
  currentWeekText: {
    color: "#007bff",
  },
  currentLabel: {
    fontSize: 12,
    color: "white",
    backgroundColor: "#007bff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#495057",
    textTransform: "capitalize",
  },
  weekDescription: {
    fontSize: 14,
    color: "#6c757d",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#dc3545",
    textAlign: "center",
    marginTop: 16,
  },
});

export default TimelineScreen;
