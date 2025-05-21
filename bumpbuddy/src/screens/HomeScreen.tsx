import { ScrollView, TouchableOpacity, View } from "react-native";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { FetalSizeComparison } from "../components/FetalSizeComparison";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import ThemeToggle from "../components/ThemeToggle";
import { RootState } from "../redux/store";
import { FetalSizeComparison as FetalSizeType } from "../types/fetalSize";

const HomeScreen = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const preferences = useSelector((state: RootState) => state.preferences);
  const [fetalSizeData, setFetalSizeData] = useState<FetalSizeType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Get current pregnancy week from user data or default to week 1
  const pregnancyWeek = user?.pregnancyWeek || 1;

  // Get user's name or fallback to friendly default
  const userName =
    user?.name || user?.email?.split("@")[0] || t("common.labels.mom");

  // Load fetal size data based on current week
  useEffect(() => {
    const generateFetalSizeData = () => {
      setLoading(true);

      // This would ideally come from an API or database
      // Creating mock data based on pregnancy week
      let fruitName = "";
      let sizeCm = 0;
      let sizeInches = 0;
      let weightG = 0;
      let weightOz = 0;
      let description = "";

      // Determine size based on week (simplified for example)
      if (pregnancyWeek < 8) {
        fruitName =
          pregnancyWeek === 5
            ? "Sesame seed"
            : pregnancyWeek === 6
            ? "Lentil"
            : pregnancyWeek === 7
            ? "Blueberry"
            : "Poppy seed";
        sizeCm =
          pregnancyWeek === 5
            ? 0.1
            : pregnancyWeek === 6
            ? 0.3
            : pregnancyWeek === 7
            ? 1
            : 0.05;
        sizeInches = sizeCm / 2.54;
        description =
          pregnancyWeek === 5
            ? "The embryo is now about the size of a sesame seed (0.2 inches). The heart begins to beat and pumps blood."
            : pregnancyWeek === 6
            ? "The embryo is now about the size of a lentil (0.25 inches). Facial features and limb buds are forming."
            : pregnancyWeek === 7
            ? "The embryo is now about the size of a blueberry (0.5 inches). All essential organs are forming."
            : "The embryo is just beginning to form.";
      } else if (pregnancyWeek < 14) {
        fruitName =
          pregnancyWeek === 8
            ? "Raspberry"
            : pregnancyWeek === 9
            ? "Cherry"
            : pregnancyWeek === 10
            ? "Strawberry"
            : pregnancyWeek === 11
            ? "Lime"
            : pregnancyWeek === 12
            ? "Plum"
            : "Lemon";
        sizeCm = 3 + (pregnancyWeek - 8) * 0.7;
        sizeInches = sizeCm / 2.54;
        weightG = (pregnancyWeek - 7) * 5;
        weightOz = weightG / 28.35;
        description =
          "Your baby is growing rapidly and developing more defined features.";
      } else if (pregnancyWeek < 20) {
        fruitName =
          pregnancyWeek === 14
            ? "Peach"
            : pregnancyWeek === 15
            ? "Apple"
            : pregnancyWeek === 16
            ? "Avocado"
            : pregnancyWeek === 17
            ? "Pear"
            : pregnancyWeek === 18
            ? "Bell Pepper"
            : "Banana";
        sizeCm = 7 + (pregnancyWeek - 14) * 1;
        sizeInches = sizeCm / 2.54;
        weightG = 50 + (pregnancyWeek - 14) * 20;
        weightOz = weightG / 28.35;
        description =
          "Your baby's movements are becoming more coordinated and may soon be felt.";
      } else if (pregnancyWeek < 28) {
        fruitName =
          pregnancyWeek === 20
            ? "Banana"
            : pregnancyWeek === 22
            ? "Papaya"
            : pregnancyWeek === 24
            ? "Corn"
            : "Eggplant";
        sizeCm = 15 + (pregnancyWeek - 20) * 1.2;
        sizeInches = sizeCm / 2.54;
        weightG = 300 + (pregnancyWeek - 20) * 100;
        weightOz = weightG / 28.35;
        description =
          "Your baby is developing more distinct sleeping and waking cycles.";
      } else if (pregnancyWeek < 35) {
        fruitName =
          pregnancyWeek === 28
            ? "Eggplant"
            : pregnancyWeek === 30
            ? "Cabbage"
            : pregnancyWeek === 32
            ? "Squash"
            : "Pineapple";
        sizeCm = 25 + (pregnancyWeek - 28) * 1;
        sizeInches = sizeCm / 2.54;
        weightG = 1000 + (pregnancyWeek - 28) * 200;
        weightOz = weightG / 28.35;
        description =
          "Your baby is gaining weight rapidly and developing layers of fat.";
      } else {
        fruitName =
          pregnancyWeek === 35
            ? "Honeydew melon"
            : pregnancyWeek === 37
            ? "Winter melon"
            : pregnancyWeek === 39
            ? "Pumpkin"
            : "Watermelon";
        sizeCm = 35 + (pregnancyWeek - 35) * 0.5;
        sizeInches = sizeCm / 2.54;
        weightG = 2500 + (pregnancyWeek - 35) * 200;
        weightOz = weightG / 28.35;
        description =
          "Your baby is fully developed and ready to meet you soon!";
      }

      // Build the fetal size data object
      const sizeData: FetalSizeType = {
        week: pregnancyWeek,
        fruitName,
        sizeCm,
        sizeInches,
        weightG,
        weightOz,
        description,
        // This would be the path to the image in Supabase Storage
        imageUrl: `week_${String(pregnancyWeek).padStart(2, "0")}_${fruitName
          .toLowerCase()
          .replace(/\s+/g, "_")}.png`,
      };

      setFetalSizeData(sizeData);
      setLoading(false);
    };

    generateFetalSizeData();
  }, [pregnancyWeek, t]);

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

              {/* Fetal Size Comparison Component */}
              <FetalSizeComparison
                sizeData={fetalSizeData}
                loading={loading}
                error={null}
                compact={false}
              />

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
