import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchWeekData } from "../redux/slices/timelineSlice";
import { AppDispatch, RootState } from "../redux/store";

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Error state
  if (error || !weekData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || t("timeline.weekNotFound")}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t("common.goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#007bff" />
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>
      </View>

      {/* Week title and trimester */}
      <View style={styles.titleContainer}>
        <Text style={styles.weekTitle}>
          {t("timeline.weekLabel", { week: weekData.week })}
        </Text>
        <Text style={styles.trimester}>{getTrimester()}</Text>
      </View>

      {/* Baby size comparison */}
      <View style={styles.sizeComparisonContainer}>
        <Text style={styles.sectionTitle}>{t("timeline.sizeComparison")}</Text>
        <View style={styles.sizeInfo}>
          <View style={styles.imageContainer}>
            {/* Placeholder for image - would be loaded dynamically */}
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                {getFoodNameFromImageUrl(weekData.image_url)}
              </Text>
            </View>
          </View>
          <View style={styles.sizeText}>
            <Text style={styles.sizeDescription}>
              {t("timeline.babyIsSize", {
                size: getFoodNameFromImageUrl(weekData.image_url),
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Development information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t("timeline.development")}</Text>
        <Text style={styles.infoText}>{weekData.fetal_development}</Text>
      </View>

      {/* Maternal changes */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t("timeline.maternalChanges")}</Text>
        <Text style={styles.infoText}>{weekData.maternal_changes}</Text>
      </View>

      {/* Common symptoms */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t("timeline.commonSymptoms")}</Text>
        <Text style={styles.infoText}>{weekData.common_symptoms}</Text>
      </View>

      {/* Tips */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t("timeline.tips")}</Text>
        <Text style={styles.infoText}>{weekData.tips}</Text>
      </View>

      {/* Nutrition advice */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t("timeline.nutritionAdvice")}</Text>
        <Text style={styles.infoText}>{weekData.nutrition_advice}</Text>
      </View>

      {/* Medical checkups */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t("timeline.medicalCheckups")}</Text>
        <Text style={styles.infoText}>{weekData.medical_checkups}</Text>
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#007bff",
    fontSize: 16,
    marginLeft: 4,
  },
  titleContainer: {
    padding: 16,
    paddingTop: 0,
  },
  weekTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#343a40",
  },
  trimester: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  sizeComparisonContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#343a40",
  },
  sizeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
    padding: 4,
    textTransform: "capitalize",
  },
  sizeText: {
    flex: 1,
    marginLeft: 16,
  },
  sizeDescription: {
    fontSize: 16,
    color: "#495057",
  },
  infoSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: "#495057",
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});

export default WeekDetailScreen;
