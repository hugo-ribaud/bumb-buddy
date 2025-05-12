import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
x";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { RootState } from "../redux/store";

const HomeScreen = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Get current pregnancy week from user data or default to week 1
  const pregnancyWeek = user?.pregnancyWeek || 1;

  // Mock data for weekly content - in a real app, this would come from a database
  const weeklyContent = {
    title: t("home.weekTitle", { week: pregnancyWeek }),
    babySize:
      pregnancyWeek < 8
        ? "Blueberry"
        : pregnancyWeek < 14
        ? "Lemon"
        : pregnancyWeek < 20
        ? "Banana"
        : pregnancyWeek < 28
        ? "Eggplant"
        : pregnancyWeek < 35
        ? "Pineapple"
        : "Watermelon",
    babyLength:
      pregnancyWeek < 8
        ? "0.5 inches"
        : pregnancyWeek < 14
        ? "3 inches"
        : pregnancyWeek < 20
        ? "6 inches"
        : pregnancyWeek < 28
        ? "14 inches"
        : pregnancyWeek < 35
        ? "18 inches"
        : "20 inches",
    babyWeight:
      pregnancyWeek < 8
        ? "0.04 oz"
        : pregnancyWeek < 14
        ? "1.5 oz"
        : pregnancyWeek < 20
        ? "9 oz"
        : pregnancyWeek < 28
        ? "2 lbs"
        : pregnancyWeek < 35
        ? "5 lbs"
        : "7 lbs",
    developmentHighlights: [
      "Baby's heart is beating",
      "Brain development is progressing",
      "Facial features are forming",
    ],
    maternalChanges: [
      "You may experience morning sickness",
      "Fatigue is common in this trimester",
      "Your body is producing more blood",
    ],
    nutritionTips: [
      "Focus on protein-rich foods",
      "Stay hydrated throughout the day",
      "Consider prenatal vitamins with folic acid",
    ],
  };

  // Calculate trimester
  let trimester = t("home.trimesterLabel", { trimester: t("First") });
  if (pregnancyWeek > 13 && pregnancyWeek <= 26) {
    trimester = t("home.trimesterLabel", { trimester: t("Second") });
  } else if (pregnancyWeek > 26) {
    trimester = t("home.trimesterLabel", { trimester: t("Third") });
  }

  // Calculate progress percentage (out of 40 weeks)
  const progressPercentage = Math.min((pregnancyWeek / 40) * 100, 100);

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {t("home.welcome", { name: user?.email?.split("@")[0] || "Mom" })}
          </Text>
          <Text style={styles.subtitle}>{t("home.journeyTitle")}</Text>

          {/* Add Language Switcher */}
          <LanguageSwitcher />
        </View>

        <View style={styles.progressCard}>
          <View style={styles.weekContainer}>
            <Text style={styles.currentWeek}>
              {t("home.weekTitle", { week: pregnancyWeek })}
            </Text>
            <Text style={styles.trimester}>{trimester}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {t("home.progressLabel", {
              percent: progressPercentage.toFixed(0),
            })}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>
            {t("home.developmentTitle", { week: pregnancyWeek })}
          </Text>

          <View style={styles.babyInfoContainer}>
            <View style={styles.babyMetrics}>
              <Text style={styles.infoLabel}>{t("home.sizeLabel")}</Text>
              <Text style={styles.infoValue}>{weeklyContent.babySize}</Text>

              <Text style={styles.infoLabel}>{t("home.lengthLabel")}</Text>
              <Text style={styles.infoValue}>{weeklyContent.babyLength}</Text>

              <Text style={styles.infoLabel}>{t("home.weightLabel")}</Text>
              <Text style={styles.infoValue}>{weeklyContent.babyWeight}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t("Development Highlights")}</Text>
          {weeklyContent.developmentHighlights.map((highlight, index) => (
            <Text key={index} style={styles.bulletPoint}>
              • {highlight}
            </Text>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t("home.bodyChangesTitle")}</Text>

          {weeklyContent.maternalChanges.map((change, index) => (
            <Text key={index} style={styles.bulletPoint}>
              • {change}
            </Text>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t("home.nutritionTipsTitle")}</Text>

          {weeklyContent.nutritionTips.map((tip, index) => (
            <Text key={index} style={styles.bulletPoint}>
              • {tip}
            </Text>
          ))}
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {t("home.trackSymptomsButton")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {t("home.foodGuideButton")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 5,
  },
  progressCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  currentWeek: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
  },
  trimester: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "right",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 15,
  },
  babyInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  babyMetrics: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#343a40",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343a40",
    marginTop: 5,
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#343a40",
    marginBottom: 8,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
