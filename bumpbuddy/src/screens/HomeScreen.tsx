import { ScrollView, TouchableOpacity, View } from "react-native";

import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import ThemeToggle from "../components/ThemeToggle";
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
    <SafeAreaWrapper>
      <ThemedView backgroundColor="background" className="flex-1">
        <ScrollView className="flex-1">
          <ThemedView backgroundColor="background" className="flex-1 p-5">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <FontedText variant="heading-2" className="font-bold">
                  {t("home.welcome", {
                    name: user?.email?.split("@")[0] || "Mom",
                  })}
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

              <View className="flex-row justify-between mb-4">
                <View className="flex-1">
                  <FontedText
                    textType="secondary"
                    variant="caption"
                    className="mb-0.5"
                  >
                    {t("home.sizeLabel")}
                  </FontedText>
                  <FontedText variant="body" className="font-medium mb-2.5">
                    {weeklyContent.babySize}
                  </FontedText>

                  <FontedText
                    textType="secondary"
                    variant="caption"
                    className="mb-0.5"
                  >
                    {t("home.lengthLabel")}
                  </FontedText>
                  <FontedText variant="body" className="font-medium mb-2.5">
                    {weeklyContent.babyLength}
                  </FontedText>

                  <FontedText
                    textType="secondary"
                    variant="caption"
                    className="mb-0.5"
                  >
                    {t("home.weightLabel")}
                  </FontedText>
                  <FontedText variant="body" className="font-medium mb-2.5">
                    {weeklyContent.babyWeight}
                  </FontedText>
                </View>
              </View>

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
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default HomeScreen;
