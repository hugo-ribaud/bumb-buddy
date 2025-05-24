import { Food, FoodCategory, SafetyRating } from "food-types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "react-i18next";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import foodService from "../services/foodService";

// Enhanced Food Item Component with modern card design
const FoodItem = ({
  item,
  onPress,
}: {
  item: Food;
  onPress: (item: Food) => void;
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // Enhanced safety colors with better contrast
  const getSafetyConfig = () => {
    switch (item.safety_rating) {
      case "safe":
        return {
          color: isDark ? "#10b981" : "#059669",
          bgColor: isDark ? "#064e3b" : "#d1fae5",
          iconColor: isDark ? "#34d399" : "#10b981",
          text: t("foodGuide.safeToEat"),
        };
      case "caution":
        return {
          color: isDark ? "#f59e0b" : "#d97706",
          bgColor: isDark ? "#451a03" : "#fef3c7",
          iconColor: isDark ? "#fbbf24" : "#f59e0b",
          text: t("foodGuide.cautionNeeded"),
        };
      case "avoid":
        return {
          color: isDark ? "#ef4444" : "#dc2626",
          bgColor: isDark ? "#450a0a" : "#fee2e2",
          iconColor: isDark ? "#f87171" : "#ef4444",
          text: t("foodGuide.avoid"),
        };
      default:
        return {
          color: isDark ? "#6b7280" : "#4b5563",
          bgColor: isDark ? "#374151" : "#f3f4f6",
          iconColor: isDark ? "#9ca3af" : "#6b7280",
          text: "",
        };
    }
  };

  const safetyConfig = getSafetyConfig();

  return (
    <Pressable
      className="mx-4 mb-4 overflow-hidden shadow-sm rounded-2xl"
      style={{
        backgroundColor: isDark ? "#1f2937" : "#FFFFFF",
        elevation: 2,
        borderWidth: 1,
        borderColor: isDark ? "#374151" : "#E5E7EB",
      }}
      onPress={() => onPress(item)}
    >
      <View className="p-5">
        {/* Food name and safety indicator */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 mr-3">
            <FontedText variant="heading-4" textType="primary" className="mb-1">
              {item.name}
            </FontedText>
            <FontedText
              variant="body-small"
              style={{ color: safetyConfig.color }}
            >
              {safetyConfig.text}
            </FontedText>
          </View>

          {/* Safety indicator circle */}
          <View
            className="items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: safetyConfig.bgColor }}
          >
            <View
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: safetyConfig.iconColor }}
            />
          </View>
        </View>

        {/* Description preview */}
        {item.description && (
          <ThemedView
            backgroundColor="surface-subtle"
            className="p-3 rounded-xl"
          >
            <FontedText
              variant="body-small"
              textType="secondary"
              numberOfLines={2}
              className="leading-5"
            >
              {item.description}
            </FontedText>
          </ThemedView>
        )}

        {/* View details indicator */}
        <View
          className="pt-3 mt-4"
          style={{
            borderTopWidth: 1,
            borderTopColor: isDark ? "#374151" : "#E5E7EB",
          }}
        >
          <FontedText
            variant="body-small"
            className={`text-center font-medium ${
              isDark ? "text-purple-300" : "text-purple-600"
            }`}
          >
            {t("foodGuide.viewDetails")} →
          </FontedText>
        </View>
      </View>
    </Pressable>
  );
};

// Enhanced Food Details Modal with improved design
const FoodDetailsModal = ({
  item,
  visible,
  onClose,
}: {
  item: Food | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  if (!item) return null;

  const getSafetyConfig = () => {
    switch (item.safety_rating) {
      case "safe":
        return {
          color: isDark ? "#10b981" : "#059669",
          bgColor: isDark ? "#064e3b" : "#d1fae5",
          text: t("foodGuide.safeToEat"),
        };
      case "caution":
        return {
          color: isDark ? "#f59e0b" : "#d97706",
          bgColor: isDark ? "#451a03" : "#fef3c7",
          text: t("foodGuide.cautionNeeded"),
        };
      case "avoid":
        return {
          color: isDark ? "#ef4444" : "#dc2626",
          bgColor: isDark ? "#450a0a" : "#fee2e2",
          text: t("foodGuide.avoid"),
        };
      default:
        return {
          color: isDark ? "#6b7280" : "#4b5563",
          bgColor: isDark ? "#374151" : "#f3f4f6",
          text: "",
        };
    }
  };

  const safetyConfig = getSafetyConfig();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="justify-end flex-1 bg-black/50">
        <ThemedView
          backgroundColor="surface-elevated"
          className="rounded-t-3xl shadow-lg max-h-[85%]"
          style={{
            borderWidth: 1,
            borderColor: isDark ? "#374151" : "#E5E7EB",
          }}
        >
          {/* Modal header */}
          <View className="flex-row items-center justify-between p-6 pb-4">
            <FontedText
              variant="heading-2"
              fontFamily="comfortaa"
              textType="primary"
            >
              {item.name}
            </FontedText>
            <TouchableOpacity
              onPress={onClose}
              className="items-center justify-center w-10 h-10 rounded-full"
              style={{
                backgroundColor: isDark ? "#374151" : "#f3f4f6",
              }}
            >
              <FontedText className="text-xl" textType="primary">
                ✕
              </FontedText>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pb-6">
              {/* Safety status banner */}
              <View
                className="p-4 mb-6 rounded-2xl"
                style={{ backgroundColor: safetyConfig.bgColor }}
              >
                <FontedText
                  variant="heading-4"
                  style={{ color: safetyConfig.color }}
                  className="font-semibold text-center"
                >
                  {safetyConfig.text}
                </FontedText>
              </View>

              {/* Description section */}
              {item.description && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-1 h-6 mr-3 rounded-full"
                      style={{
                        backgroundColor: isDark ? "#C2AADF" : "#9B85C4",
                      }}
                    />
                    <FontedText variant="heading-4" textType="primary">
                      {t("foodGuide.description")}
                    </FontedText>
                  </View>
                  <FontedText
                    variant="body"
                    textType="secondary"
                    className="leading-6"
                  >
                    {item.description}
                  </FontedText>
                </View>
              )}

              {/* Alternatives section */}
              {item.alternatives && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-1 h-6 mr-3 rounded-full"
                      style={{
                        backgroundColor: isDark ? "#10b981" : "#10b981",
                      }}
                    />
                    <FontedText variant="heading-4" textType="primary">
                      {t("foodGuide.alternativesLabel")}
                    </FontedText>
                  </View>
                  <FontedText
                    variant="body"
                    textType="secondary"
                    className="leading-6"
                  >
                    {item.alternatives}
                  </FontedText>
                </View>
              )}
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

// Enhanced Category Pill Component
const CategoryPill = ({
  category,
  isSelected,
  onPress,
}: {
  category: FoodCategory;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      className="px-4 py-2 mr-3 rounded-full shadow-sm"
      style={{
        backgroundColor: isSelected
          ? isDark
            ? "#9B85C4"
            : "#C2AADF"
          : isDark
          ? "#374151"
          : "#f8fafc",
        elevation: isSelected ? 2 : 1,
        borderWidth: 1,
        borderColor: isSelected
          ? isDark
            ? "#C2AADF"
            : "#9B85C4"
          : isDark
          ? "#4b5563"
          : "#e2e8f0",
      }}
      onPress={onPress}
    >
      <FontedText
        variant="body-small"
        className={`font-medium ${
          isSelected ? "text-white" : isDark ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {category.name}
      </FontedText>
    </TouchableOpacity>
  );
};

// Enhanced Safety Filter Button Component
const SafetyFilterButton = ({
  label,
  value,
  currentValue,
  onPress,
  safetyColor,
}: {
  label: string;
  value: "all" | SafetyRating;
  currentValue: "all" | SafetyRating;
  onPress: (value: "all" | SafetyRating) => void;
  safetyColor?: string;
}) => {
  const isSelected = value === currentValue;
  const { isDark } = useTheme();

  const getButtonStyle = () => {
    if (isSelected) {
      if (safetyColor) {
        return { backgroundColor: safetyColor };
      }
      return { backgroundColor: isDark ? "#9B85C4" : "#C2AADF" };
    }
    return {
      backgroundColor: isDark ? "#374151" : "#f8fafc",
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#e2e8f0",
    };
  };

  return (
    <TouchableOpacity
      className="px-4 py-2 mr-3 shadow-sm rounded-xl"
      style={getButtonStyle()}
      onPress={() => onPress(value)}
    >
      <FontedText
        variant="body-small"
        className={`font-medium text-center ${
          isSelected ? "text-white" : isDark ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
      </FontedText>
    </TouchableOpacity>
  );
};

const FoodGuideScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [safetyFilter, setSafetyFilter] = useState<"all" | SafetyRating>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await foodService.getCategories(language);
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    loadCategories();
  }, [language]);

  // Load foods with filtering
  useEffect(() => {
    const loadFoods = async () => {
      setLoading(true);
      setError(null);
      try {
        const filter = {
          searchTerm: searchQuery,
          category_id: selectedCategoryId || undefined,
          safety_rating: safetyFilter !== "all" ? safetyFilter : undefined,
        };

        const data = await foodService.filterFoods(filter, language);
        setFoods(data);
      } catch (err) {
        console.error("Error loading foods:", err);
        setError(t("foodGuide.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, [searchQuery, safetyFilter, selectedCategoryId, language, t]);

  // Set up realtime subscription
  useEffect(() => {
    const subscription = foodService.subscribeToFoods(() => {
      // Reload foods when there's a change
      const filter = {
        searchTerm: searchQuery,
        category_id: selectedCategoryId || undefined,
        safety_rating: safetyFilter !== "all" ? safetyFilter : undefined,
      };

      foodService.filterFoods(filter, language).then((data) => {
        setFoods(data);
      });
    });

    return () => {
      foodService.unsubscribe(subscription);
    };
  }, [safetyFilter, selectedCategoryId, searchQuery, language]);

  // Handle category selection
  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
      setSafetyFilter("all");
    }
  };

  // Handle food selection
  const handleFoodPress = (food: Food) => {
    setSelectedFood(food);
    setModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedFood(null);
  };

  // Get filter statistics
  const getFilterStats = () => {
    const total = foods.length;
    const safe = foods.filter((f) => f.safety_rating === "safe").length;
    const caution = foods.filter((f) => f.safety_rating === "caution").length;
    const avoid = foods.filter((f) => f.safety_rating === "avoid").length;

    return { total, safe, caution, avoid };
  };

  const stats = getFilterStats();

  return (
    <SafeAreaWrapper>
      <ThemedView backgroundColor="background" className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <FontedText
            variant="heading-1"
            fontFamily="comfortaa"
            textType="primary"
            className="mb-2"
          >
            {t("foodGuide.title")}
          </FontedText>

          {/* Statistics */}
          <View className="flex-row items-center space-x-2">
            <FontedText variant="body-small" textType="muted">
              {t("foodGuide.totalFoods", { count: stats.total })}
            </FontedText>
            <FontedText variant="body-small" textType="muted">
              •
            </FontedText>
            <FontedText variant="body-small" textType="muted">
              {stats.safe} {t("foodGuide.safe")} • {stats.caution}{" "}
              {t("foodGuide.caution")} • {stats.avoid} {t("foodGuide.avoid")}
            </FontedText>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-4">
          <View
            className="flex-row items-center px-4 py-3 shadow-sm rounded-2xl"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#FFFFFF",
              borderWidth: 1,
              borderColor: isDark ? "#374151" : "#E5E7EB",
            }}
          >
            <FontedText textType="muted" className="mr-3">
              🔍
            </FontedText>
            <TextInput
              className="flex-1"
              style={{
                color: isDark ? "#f9fafb" : "#1f2937",
                fontSize: 16,
              }}
              placeholder={t("foodGuide.searchPlaceholder")}
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Safety Filters */}
        <View className="px-6 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SafetyFilterButton
              label={t("foodGuide.filterAll")}
              value="all"
              currentValue={safetyFilter}
              onPress={setSafetyFilter}
            />
            <SafetyFilterButton
              label={t("foodGuide.filterSafe")}
              value="safe"
              currentValue={safetyFilter}
              onPress={setSafetyFilter}
              safetyColor={isDark ? "#10b981" : "#059669"}
            />
            <SafetyFilterButton
              label={t("foodGuide.filterCaution")}
              value="caution"
              currentValue={safetyFilter}
              onPress={setSafetyFilter}
              safetyColor={isDark ? "#f59e0b" : "#d97706"}
            />
            <SafetyFilterButton
              label={t("foodGuide.filterAvoid")}
              value="avoid"
              currentValue={safetyFilter}
              onPress={setSafetyFilter}
              safetyColor={isDark ? "#ef4444" : "#dc2626"}
            />
          </ScrollView>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View className="mb-4">
            <View className="px-6 mb-3">
              <FontedText variant="heading-4" textType="primary">
                {t("foodGuide.categories")}
              </FontedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {categories.map((category) => (
                <CategoryPill
                  key={category.id}
                  category={category}
                  isSelected={selectedCategoryId === category.id}
                  onPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Food List */}
        {loading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator
              size="large"
              color={isDark ? "#C2AADF" : "#9B85C4"}
            />
            <FontedText variant="body" textType="secondary" className="mt-4">
              {t("foodGuide.loading")}
            </FontedText>
          </View>
        ) : error ? (
          <View className="items-center justify-center flex-1 px-6">
            <ThemedView
              backgroundColor="surface-elevated"
              className="w-full max-w-sm p-6 shadow-sm rounded-2xl"
              style={{
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#E5E7EB",
              }}
            >
              <FontedText
                variant="heading-3"
                colorVariant="accent"
                className="mb-4 text-center"
              >
                {t("common.errors.generic")}
              </FontedText>
              <FontedText
                variant="body"
                textType="secondary"
                className="mb-6 text-center"
              >
                {error}
              </FontedText>
              <TouchableOpacity
                className="items-center px-6 py-3 rounded-xl"
                style={{
                  backgroundColor: isDark ? "#9B85C4" : "#C2AADF",
                }}
                onPress={() => {
                  setError(null);
                  setLoading(true);
                  // Reload data
                  const filter = {
                    searchTerm: searchQuery,
                    category_id: selectedCategoryId || undefined,
                    safety_rating:
                      safetyFilter !== "all" ? safetyFilter : undefined,
                  };
                  foodService
                    .filterFoods(filter, language)
                    .then((data) => {
                      setFoods(data);
                      setLoading(false);
                    })
                    .catch((err) => {
                      console.error("Error reloading foods:", err);
                      setError(t("foodGuide.errorLoading"));
                      setLoading(false);
                    });
                }}
              >
                <FontedText className="font-semibold text-white">
                  {t("foodGuide.tryAgain")}
                </FontedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        ) : (
          <FlatList
            data={foods}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <FoodItem item={item} onPress={handleFoodPress} />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center flex-1 px-6 py-16">
                <ThemedView
                  backgroundColor="surface-elevated"
                  className="items-center w-full max-w-sm p-8 shadow-sm rounded-2xl"
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? "#374151" : "#E5E7EB",
                  }}
                >
                  <FontedText className="mb-4 text-6xl">🔍</FontedText>
                  <FontedText
                    variant="heading-4"
                    textType="primary"
                    className="mb-2 text-center"
                  >
                    {t("foodGuide.noResults")}
                  </FontedText>
                  <FontedText
                    variant="body"
                    textType="secondary"
                    className="text-center"
                  >
                    {t("foodGuide.noResultsDescription")}
                  </FontedText>
                </ThemedView>
              </View>
            }
          />
        )}

        {/* Food Details Modal */}
        <FoodDetailsModal
          item={selectedFood}
          visible={modalVisible}
          onClose={handleModalClose}
        />
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default FoodGuideScreen;
