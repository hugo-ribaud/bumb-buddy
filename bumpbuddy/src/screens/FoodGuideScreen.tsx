import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Food, FoodCategory, SafetyRating } from "food-types";
import React, { useEffect, useState } from "react";

import FontedText from "../components/FontedText";
import ThemedView from "../components/ThemedView";
import foodService from "../services/foodService";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

// Component to render each food item
const FoodItem = ({
  item,
  onPress,
}: {
  item: Food;
  onPress: (item: Food) => void;
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // Determine color based on safety rating
  const safetyColor =
    item.safety_rating === "safe"
      ? "#28a745"
      : item.safety_rating === "caution"
      ? "#ffc107"
      : "#dc3545";

  return (
    <TouchableOpacity
      className="flex-row rounded-xl p-3 mb-2 bg-white dark:bg-gray-800"
      style={{ elevation: 1 }}
      onPress={() => onPress(item)}
    >
      <View
        className="w-3 h-full rounded-full mr-3"
        style={{ backgroundColor: safetyColor }}
      />
      <View className="flex-1">
        <FontedText variant="body" className="font-medium">
          {item.name}
        </FontedText>
        <FontedText variant="caption" style={{ color: safetyColor }}>
          {item.safety_rating === "safe"
            ? t("foodGuide.safeToEat")
            : item.safety_rating === "caution"
            ? t("foodGuide.cautionNeeded")
            : t("foodGuide.avoid")}
        </FontedText>
      </View>
    </TouchableOpacity>
  );
};

// Food details component
const FoodDetails = ({
  item,
  onClose,
}: {
  item: Food;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  // Determine color based on safety rating
  const safetyColor =
    item.safety_rating === "safe"
      ? "#28a745"
      : item.safety_rating === "caution"
      ? "#ffc107"
      : "#dc3545";

  return (
    <ThemedView backgroundColor="surface" className="rounded-xl p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <FontedText variant="heading-3" fontFamily="comfortaa">
          {item.name}
        </FontedText>
        <TouchableOpacity onPress={onClose} className="p-1">
          <FontedText className="text-xl">✕</FontedText>
        </TouchableOpacity>
      </View>

      <View
        className="p-3 mb-4 rounded-lg"
        style={{ backgroundColor: safetyColor + "20" }}
      >
        <FontedText variant="body" style={{ color: safetyColor }}>
          {item.safety_rating === "safe"
            ? t("foodGuide.safeToEat")
            : item.safety_rating === "caution"
            ? t("foodGuide.cautionNeeded")
            : t("foodGuide.avoid")}
        </FontedText>
      </View>

      <FontedText
        variant="body-small"
        colorVariant="secondary"
        className="mb-1"
      >
        {t("foodGuide.description")}
      </FontedText>
      <FontedText variant="body" className="mb-4">
        {item.description || ""}
      </FontedText>

      <FontedText
        variant="body-small"
        colorVariant="secondary"
        className="mb-1"
      >
        {t("foodGuide.alternativesLabel")}
      </FontedText>
      <FontedText variant="body">{item.alternatives || ""}</FontedText>
    </ThemedView>
  );
};

// Category pill component
const CategoryPill = ({
  category,
  isSelected,
  onPress,
}: {
  category: FoodCategory;
  isSelected: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      className={`px-3 py-1.5 mr-2 rounded-full ${
        isSelected
          ? "bg-primary dark:bg-primary-dark"
          : "bg-gray-200 dark:bg-gray-700"
      }`}
      onPress={onPress}
    >
      <FontedText
        variant="caption"
        className={`${isSelected ? "text-white" : ""}`}
      >
        {category.name}
      </FontedText>
    </TouchableOpacity>
  );
};

// Safety filter button component
const SafetyFilterButton = ({
  label,
  value,
  currentValue,
  onPress,
}: {
  label: string;
  value: "all" | SafetyRating;
  currentValue: "all" | SafetyRating;
  onPress: (value: "all" | SafetyRating) => void;
}) => {
  const isSelected = value === currentValue;
  return (
    <TouchableOpacity
      className={`px-3 py-1.5 mr-2 rounded-lg ${
        isSelected
          ? "bg-primary dark:bg-primary-dark"
          : "bg-gray-200 dark:bg-gray-700"
      }`}
      onPress={() => onPress(value)}
    >
      <FontedText
        variant="caption"
        className={`${isSelected ? "text-white" : ""}`}
      >
        {label}
      </FontedText>
    </TouchableOpacity>
  );
};

const FoodGuideScreen = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
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
        const data = await foodService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    loadCategories();
  }, []);

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

        const data = await foodService.filterFoods(filter);
        setFoods(data);
      } catch (err) {
        console.error("Error loading foods:", err);
        setError(t("foodGuide.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, [searchQuery, safetyFilter, selectedCategoryId, t]);

  // Set up realtime subscription
  useEffect(() => {
    const subscription = foodService.subscribeToFoods(() => {
      // Reload foods when there's a change
      const filter = {
        searchTerm: searchQuery,
        category_id: selectedCategoryId || undefined,
        safety_rating: safetyFilter !== "all" ? safetyFilter : undefined,
      };

      foodService.filterFoods(filter).then((data) => {
        setFoods(data);
      });
    });

    return () => {
      foodService.unsubscribe(subscription);
    };
  }, [safetyFilter, selectedCategoryId, searchQuery]);

  // Reset category when safety filter changes
  useEffect(() => {
    if (safetyFilter !== "all") {
      setSelectedCategoryId(null);
    }
  }, [safetyFilter]);

  // Handle category selection
  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
      // Reset safety filter when selecting a category
      setSafetyFilter("all");
    }
  };

  return (
    <ThemedView backgroundColor="background" className="flex-1 p-4">
      <FontedText variant="heading-2" fontFamily="comfortaa" className="mb-4">
        {t("foodGuide.title")}
      </FontedText>

      <TextInput
        className="p-3 mb-4 rounded-xl bg-gray-100 dark:bg-gray-800"
        placeholder={t("foodGuide.searchPlaceholder")}
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Safety Filters */}
      <View className="flex-row mb-4">
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
        />
        <SafetyFilterButton
          label={t("foodGuide.filterCaution")}
          value="caution"
          currentValue={safetyFilter}
          onPress={setSafetyFilter}
        />
        <SafetyFilterButton
          label={t("foodGuide.filterAvoid")}
          value="avoid"
          currentValue={safetyFilter}
          onPress={setSafetyFilter}
        />
      </View>

      {/* Categories horizontal scroll */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
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
      )}

      {/* Food list */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#87D9C4" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <FontedText colorVariant="accent">{error}</FontedText>
          <TouchableOpacity
            className="mt-4 px-4 py-2 bg-primary dark:bg-primary-dark rounded-lg"
            onPress={() => {
              setLoading(true);
              setError(null);
              // Reload foods
              const filter = {
                searchTerm: searchQuery,
                category_id: selectedCategoryId || undefined,
                safety_rating:
                  safetyFilter !== "all" ? safetyFilter : undefined,
              };
              foodService
                .filterFoods(filter)
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
            <FontedText className="text-white">
              {t("foodGuide.tryAgain")}
            </FontedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FoodItem item={item} onPress={setSelectedFood} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <FontedText colorVariant="secondary">
                {t("foodGuide.noResults")}
              </FontedText>
            </View>
          }
        />
      )}

      {/* Food details modal */}
      {selectedFood && (
        <View className="absolute inset-0 bg-black bg-opacity-50 p-4 justify-center">
          <FoodDetails
            item={selectedFood}
            onClose={() => setSelectedFood(null)}
          />
        </View>
      )}
    </ThemedView>
  );
};

export default FoodGuideScreen;
