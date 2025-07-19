import React, { useEffect } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";

import { useTranslation } from "react-i18next";
import FetalSizeComparison from "../components/FetalSizeComparison";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemeToggle from "../components/ThemeToggle";
import ThemedView from "../components/ThemedView";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchFetalSizeByWeek } from "../redux/slices/fetalSizeSlice";
import {
  fetchCurrentWeekData,
  fetchWeekData,
} from "../redux/slices/timelineSlice";
import { AppDispatch } from "../redux/store";

const HomeScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const preferences = useSelector((state: RootState) => state.preferences);
  const fetalSize = useSelector(
    (state: RootState) => state.fetalSize.currentComparison
  );
  const {
    weekData,
    loading: timelineLoading,
    error: timelineError,
    currentWeek,
  } = useSelector((state: RootState) => state.timeline);

  // Get current pregnancy week from timeline slice (consistent with TimelineScreen)
  // Fallback to user.pregnancyWeek or 1 if currentWeek is not available
  const pregnancyWeek = currentWeek || user?.pregnancyWeek || 1;

  // Get user's name or fallback to friendly default
  const userName =
    user?.name || user?.email?.split("@")[0] || t("common.labels.mom");

  // Fetch fetal size data and pregnancy week data on component mount and when language changes
  useEffect(() => {
    if (pregnancyWeek) {
      dispatch(fetchFetalSizeByWeek({ week: pregnancyWeek, language }));
      dispatch(fetchWeekData({ weekNumber: pregnancyWeek, language }));
    }

    // Also fetch current week data to ensure currentWeek is set in timeline slice
    if (user?.dueDate) {
      dispatch(fetchCurrentWeekData({ dueDate: user.dueDate, language }));
    }
  }, [dispatch, pregnancyWeek, language, user?.dueDate]);

  // Calculate trimester
  let trimester = t("timeline.firstTrimester");
  if (pregnancyWeek > 13 && pregnancyWeek <= 26) {
    trimester = t("timeline.secondTrimester");
  } else if (pregnancyWeek > 26) {
    trimester = t("timeline.thirdTrimester");
  }

  // Calculate progress percentage (out of 40 weeks)
  const progressPercentage = Math.min((pregnancyWeek / 40) * 100, 100);

  // Helper function to split text into bullet points
  const splitIntoBulletPoints = (text: string): string[] => {
    if (!text) return [];
    // Split by common delimiters and filter out empty strings
    return text
      .split(/[.!?]\s+/)
      .filter((point) => point.trim().length > 0)
      .map((point) => point.trim())
      .slice(0, 3); // Limit to 3 points for better UI
  };

  return (
    <SafeAreaWrapper>
      <ThemedView backgroundColor="background" className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Section with Personalized Greeting */}
          <ThemedView backgroundColor="background" className="px-6 pt-8 pb-4">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <FontedText variant="heading-1" textType="primary" className="font-light text-3xl mb-2">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
                </FontedText>
                <FontedText variant="heading-2" textType="primary" className="font-semibold mb-3">
                  {userName}
                </FontedText>
                <FontedText
                  textType="secondary"
                  variant="body"
                  className="opacity-80"
                >
                  Week {pregnancyWeek} • {trimester}
                </FontedText>
              </View>
              <ThemeToggle />
            </View>
          </ThemedView>

          {/* Today's Journey Card */}
          <View className="px-6 mb-6">
            <ThemedView
              backgroundColor="surface"
              className="p-6 rounded-2xl shadow-lg border border-opacity-10"
            >
              <FontedText
                variant="heading-3"
                fontFamily="comfortaa"
                className="mb-4 text-center"
              >
                Today's Journey
              </FontedText>
              
              <View className="items-center mb-4">
                <FontedText
                  variant="heading-2"
                  fontFamily="comfortaa"
                  colorVariant="primary"
                  className="text-center mb-2"
                >
                  Week {pregnancyWeek}
                </FontedText>
                <FontedText
                  textType="secondary"
                  variant="body"
                  className="text-center opacity-70"
                >
                  {Math.round(progressPercentage)}% of your pregnancy journey
                </FontedText>
              </View>

              <ThemedView backgroundColor="surface-subtle" className="h-2 rounded-full overflow-hidden">
                <ThemedView
                  backgroundColor="primary"
                  className="h-full rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </ThemedView>
            </ThemedView>
          </View>

          {/* Baby's Development Card */}
          <View className="px-6 mb-6">
            <ThemedView
              backgroundColor="surface"
              className="p-6 rounded-2xl shadow-lg"
            >
              <FontedText
                variant="heading-4"
                fontFamily="comfortaa"
                className="mb-4 text-center"
              >
                Your Baby This Week
              </FontedText>

              {fetalSize && (
                <View className="items-center mb-6">
                  <FetalSizeComparison
                    weekNumber={pregnancyWeek}
                    itemName={fetalSize.name}
                    imageUrl={fetalSize.image_url}
                    sizeInCm={fetalSize.size_cm}
                    sizeInInches={fetalSize.size_inches}
                    weightInG={fetalSize.weight_g}
                    weightInOz={fetalSize.weight_oz}
                  />
                </View>
              )}

              {timelineLoading && (
                <View className="items-center py-4">
                  <FontedText variant="body" textType="secondary" className="opacity-70">
                    {t("timeline.loading")}
                  </FontedText>
                </View>
              )}

              {timelineError && (
                <View className="items-center py-4">
                  <FontedText
                    variant="body"
                    className="text-red-500 text-center"
                  >
                    {timelineError}
                  </FontedText>
                </View>
              )}

              {weekData && weekData.fetal_development && (
                <ThemedView backgroundColor="surface-elevated" className="p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <FontedText
                    variant="body"
                    textType="primary"
                    className="font-semibold mb-3 text-center"
                  >
                    Development Highlights
                  </FontedText>
                  {splitIntoBulletPoints(weekData.fetal_development).map(
                    (highlight, index) => (
                      <FontedText
                        key={index}
                        variant="body-small"
                        textType="secondary"
                        className="mb-2 leading-6"
                      >
                        • {highlight}
                      </FontedText>
                    )
                  )}
                </ThemedView>
              )}
            </ThemedView>
          </View>

          {/* Your Body This Week Card */}
          {weekData && weekData.maternal_changes && (
            <View className="px-6 mb-6">
              <ThemedView
                backgroundColor="surface"
                className="p-6 rounded-2xl shadow-lg"
              >
                <FontedText
                  variant="heading-4"
                  fontFamily="comfortaa"
                  className="mb-4 text-center"
                >
                  Your Body This Week
                </FontedText>

                <ThemedView backgroundColor="surface-elevated" className="p-4 rounded-xl border border-pink-200 dark:border-pink-800">
                  {splitIntoBulletPoints(weekData.maternal_changes).map(
                    (change, index) => (
                      <FontedText
                        key={index}
                        variant="body-small"
                        textType="secondary"
                        className="mb-2 leading-6"
                      >
                        • {change}
                      </FontedText>
                    )
                  )}
                </ThemedView>
              </ThemedView>
            </View>
          )}

          {/* Nutrition This Week Card */}
          {weekData && weekData.nutrition_advice && (
            <View className="px-6 mb-6">
              <ThemedView
                backgroundColor="surface"
                className="p-6 rounded-2xl shadow-lg"
              >
                <FontedText
                  variant="heading-4"
                  fontFamily="comfortaa"
                  className="mb-4 text-center"
                >
                  Nutrition This Week
                </FontedText>

                <ThemedView backgroundColor="surface-elevated" className="p-4 rounded-xl border border-green-200 dark:border-green-800">
                  {splitIntoBulletPoints(weekData.nutrition_advice).map(
                    (tip, index) => (
                      <FontedText
                        key={index}
                        variant="body-small"
                        textType="secondary"
                        className="mb-2 leading-6"
                      >
                        • {tip}
                      </FontedText>
                    )
                  )}
                </ThemedView>
              </ThemedView>
            </View>
          )}

          {/* Quick Actions */}
          <View className="px-6 mb-8">
            <FontedText
              variant="heading-4"
              fontFamily="comfortaa"
              textType="secondary"
              className="mb-4 text-center"
            >
              Quick Actions
            </FontedText>
            
            <View className="space-y-3">
              <TouchableOpacity>
                <ThemedView
                  backgroundColor="surface"
                  className="p-4 rounded-2xl shadow-md border border-purple-100 dark:border-purple-800"
                >
                  <FontedText textType="primary" className="text-center font-medium">
                    {t("home.trackSymptomsButton")}
                  </FontedText>
                </ThemedView>
              </TouchableOpacity>

              <TouchableOpacity>
                <ThemedView
                  backgroundColor="surface"
                  className="p-4 rounded-2xl shadow-md border border-green-100 dark:border-green-800"
                >
                  <FontedText textType="primary" className="text-center font-medium">
                    {t("home.foodGuideButton")}
                  </FontedText>
                </ThemedView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Reflection Card - Calm Style */}
          <View className="px-6 mb-8">
            <ThemedView
              backgroundColor="surface"
              className="p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-800"
            >
              <FontedText
                variant="heading-4"
                fontFamily="comfortaa"
                className="mb-3 text-center"
              >
                Today's Moment
              </FontedText>
              <FontedText
                variant="body"
                textType="secondary"
                className="text-center leading-6"
              >
                Take a moment to connect with your baby. Place your hand on your belly and breathe deeply. 
                You're creating life, and that's extraordinary.
              </FontedText>
            </ThemedView>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default HomeScreen;
