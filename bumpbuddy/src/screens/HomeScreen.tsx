import { ScrollView, TouchableOpacity, View } from "react-native";
import { RootState, persistor } from "../redux/store";

import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemeToggle from "../components/ThemeToggle";
import ThemedView from "../components/ThemedView";

const HomeScreen = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const preferences = useSelector((state: RootState) => state.preferences);

  // Get current pregnancy week from user data or default to week 1
  const pregnancyWeek = user?.pregnancyWeek || 1;

  // Get user's name or fallback to friendly default
  const userName =
    user?.name || user?.email?.split("@")[0] || t("common.labels.mom");

  // Function to purge redux-persist store for debugging
  const handlePurgeStore = async () => {
    await persistor.purge();
    alert("Redux store purged. Restart the app.");
  };

  // Mock data for weekly content - in a real app, this would come from a database
  const weeklyContent = {
    title: t("home.weekTitle", { week: pregnancyWeek }),
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
    <SafeAreaWrapper>
      <ThemedView backgroundColor="background" className="flex-1">
        <ScrollView className="flex-1">
          <ThemedView backgroundColor="background" className="flex-1 p-5">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <FontedText variant="heading-2" className="font-bold">
                  {t("home.welcome", { name: userName })}
                </FontedText>
                <FontedText
                  textType="secondary"
                  variant="body-small"
                  className="mt-1.5"
                >
                  {t("home.journeyTitle")}
                </FontedText>
              </View>
              <ThemeToggle />
            </View>

            <ThemedView
              backgroundColor="surface"
              className="p-5 mb-4 shadow-sm rounded-xl"
            >
              <View className="flex-row justify-between items-center mb-2.5">
                <FontedText
                  variant="heading-3"
                  fontFamily="comfortaa"
                  colorVariant="primary"
                >
                  {t("home.weekTitle", { week: pregnancyWeek })}
                </FontedText>
                <FontedText
                  textType="secondary"
                  variant="caption"
                  className="font-medium"
                >
                  {trimester}
                </FontedText>
              </View>

              <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md my-2.5 overflow-hidden">
                <View
                  className="h-full rounded-md bg-primary dark:bg-primary-dark"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
              <FontedText
                textType="secondary"
                variant="caption"
                className="text-right"
              >
                {t("home.progressLabel", {
                  percent: progressPercentage.toFixed(0),
                })}
              </FontedText>
            </ThemedView>

            <ThemedView
              backgroundColor="surface"
              className="p-5 mb-4 shadow-sm rounded-xl"
            >
              <FontedText
                variant="heading-4"
                fontFamily="comfortaa"
                colorVariant="primary"
                className="mb-4"
              >
                {t("home.developmentTitle", { week: pregnancyWeek })}
              </FontedText>

              <FontedText
                variant="body"
                className="font-semibold mt-1.5 mb-2.5"
              >
                {t("Development Highlights")}
              </FontedText>
              {weeklyContent.developmentHighlights.map((highlight, index) => (
                <FontedText
                  key={index}
                  variant="body-small"
                  className="mb-2 leading-5"
                >
                  • {highlight}
                </FontedText>
              ))}
            </ThemedView>

            <ThemedView
              backgroundColor="surface"
              className="p-5 mb-4 shadow-sm rounded-xl"
            >
              <FontedText
                variant="heading-4"
                fontFamily="comfortaa"
                colorVariant="secondary"
                className="mb-4"
              >
                {t("home.bodyChangesTitle")}
              </FontedText>

              {weeklyContent.maternalChanges.map((change, index) => (
                <FontedText
                  key={index}
                  variant="body-small"
                  className="mb-2 leading-5"
                >
                  • {change}
                </FontedText>
              ))}
            </ThemedView>

            <ThemedView
              backgroundColor="surface"
              className="p-5 mb-4 shadow-sm rounded-xl"
            >
              <FontedText
                variant="heading-4"
                fontFamily="comfortaa"
                colorVariant="secondary"
                className="mb-4"
              >
                {t("home.nutritionTipsTitle")}
              </FontedText>

              {weeklyContent.nutritionTips.map((tip, index) => (
                <FontedText
                  key={index}
                  variant="body-small"
                  className="mb-2 leading-5"
                >
                  • {tip}
                </FontedText>
              ))}
            </ThemedView>

            <TouchableOpacity className="items-center p-4 mb-4 bg-accent dark:bg-accent-dark rounded-xl">
              <FontedText className="text-base font-bold text-white">
                {t("home.trackSymptomsButton")}
              </FontedText>
            </TouchableOpacity>

            <TouchableOpacity className="items-center p-4 mb-4 bg-accent dark:bg-accent-dark rounded-xl">
              <FontedText className="text-base font-bold text-white">
                {t("home.foodGuideButton")}
              </FontedText>
            </TouchableOpacity>

            {/* Debug button to purge redux-persist store */}
            <TouchableOpacity
              className="items-center p-2 mb-4 bg-red-500 rounded-xl"
              onPress={handlePurgeStore}
            >
              <FontedText className="text-sm font-bold text-white">
                Debug: Purge Redux Store
              </FontedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default HomeScreen;
