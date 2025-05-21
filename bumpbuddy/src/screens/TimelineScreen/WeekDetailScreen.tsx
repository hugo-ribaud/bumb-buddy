import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";

import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchLocalizedWeek } from "../../redux/slices/timelineSlice";

// Define local types if the imports are not available
type TimelineStackParamList = {
  WeekDetail: { weekNumber: number };
};

type WeekDetailScreenRouteProp = RouteProp<
  TimelineStackParamList,
  "WeekDetail"
>;

interface Props {
  route: WeekDetailScreenRouteProp;
  navigation: any;
}

// Helper function to format image URL if import is not available
const formatImageUrl = (url: string): string => {
  // Simple implementation - in a real app, you would do more validation
  return url || "";
};

const WeekDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { weekNumber } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const { weekData, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );
  const availableLanguages = useSelector(
    (state: RootState) => state.timeline.availableLanguages
  );
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    // Fetch week data in the selected language
    dispatch(fetchLocalizedWeek({ weekNumber, language: selectedLanguage }));
  }, [dispatch, weekNumber, selectedLanguage]);

  // Change the selected language
  const changeLanguage = (language: string) => {
    setSelectedLanguage(language);
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-700 dark:text-gray-300">
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 p-4 bg-white dark:bg-gray-900">
        <Text className="mb-4 text-red-500">{error}</Text>
        <TouchableOpacity
          className="px-4 py-2 bg-blue-500 rounded-lg"
          onPress={() =>
            dispatch(
              fetchLocalizedWeek({ weekNumber, language: selectedLanguage })
            )
          }
        >
          <Text className="font-medium text-white">{t("common.tryAgain")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!weekData) {
    return (
      <View className="items-center justify-center flex-1 bg-white dark:bg-gray-900">
        <Text className="text-gray-700 dark:text-gray-300">
          {t("timeline.weekNotFound", { week: weekNumber })}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-4">
        <View className="items-center py-4">
          <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {t("timeline.week")} {weekData.week}
          </Text>

          {/* Language selector */}
          {availableLanguages.length > 1 && (
            <View className="flex-row p-1 mt-2 bg-gray-100 rounded-full dark:bg-gray-800">
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  className={`py-1 px-3 rounded-full ${
                    selectedLanguage === lang ? "bg-blue-500" : "bg-transparent"
                  }`}
                  onPress={() => changeLanguage(lang)}
                >
                  <Text
                    className={`font-medium ${
                      selectedLanguage === lang
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {weekData.image_url && (
            <View className="w-full h-48 my-4 overflow-hidden rounded-lg">
              <Image
                source={{ uri: formatImageUrl(weekData.image_url) }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        <Section
          title={t("timeline.fetalDevelopment")}
          content={weekData.fetal_development}
          iconName="body-outline"
        />
        <Section
          title={t("timeline.maternalChanges")}
          content={weekData.maternal_changes}
          iconName="woman-outline"
        />
        <Section
          title={t("timeline.tips")}
          content={weekData.tips}
          iconName="bulb-outline"
        />
        <Section
          title={t("timeline.nutritionAdvice")}
          content={weekData.nutrition_advice}
          iconName="nutrition-outline"
        />
        <Section
          title={t("timeline.commonSymptoms")}
          content={weekData.common_symptoms}
          iconName="fitness-outline"
        />
        <Section
          title={t("timeline.medicalCheckups")}
          content={weekData.medical_checkups}
          iconName="medkit-outline"
        />

        <View className="h-16" />
      </ScrollView>
    </SafeAreaView>
  );
};

interface SectionProps {
  title: string;
  content: string;
  iconName: any; // Using any to avoid icon name type issues
}

const Section: React.FC<SectionProps> = ({ title, content, iconName }) => {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-2">
        <Ionicons name={iconName} size={24} color="#0284c7" />
        <Text className="ml-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </Text>
      </View>
      <Text className="leading-6 text-gray-700 dark:text-gray-300">
        {content}
      </Text>
    </View>
  );
};

export default WeekDetailScreen;
