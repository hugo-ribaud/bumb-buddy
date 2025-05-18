import { Food, FoodCategory, SafetyRating } from "food-types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "react-i18next";
import FontedText from "../components/FontedText";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import ThemedView from "../components/ThemedView";
import { useTheme } from "../contexts/ThemeContext";
import foodService from "../services/foodService";

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
      className="flex-row p-3 mb-2 rounded-xl"
      style={{
        backgroundColor: isDark ? "#171717" : "#FFFFFF",
        elevation: 1,
      }}
      onPress={() => onPress(item)}
    >
      <View
        className="w-3 h-full mr-3 rounded-full"
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
  const { isDark } = useTheme();

  // Determine color based on safety rating
  const safetyColor =
    item.safety_rating === "safe"
      ? "#28a745"
      : item.safety_rating === "caution"
      ? "#ffc107"
      : "#dc3545";

  return (
    <ThemedView backgroundColor="surface" className="p-4 shadow-sm rounded-xl">
      <View className="flex-row items-center justify-between mb-3">
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
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      className="px-3 py-1.5 mr-2 rounded-full"
      style={{
        backgroundColor: isSelected
          ? isDark
            ? "#5DBDA8"
            : "#87D9C4"
          : isDark
          ? "#4B5563"
          : "#E5E7EB",
      }}
      onPress={onPress}
    >
      <FontedText
        variant="caption"
        className={isSelected ? "text-white" : "text-black dark:text-white"}
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
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      className="px-3 py-1.5 mr-2 rounded-lg"
      style={{
        backgroundColor: isSelected
          ? isDark
            ? "#5DBDA8"
            : "#87D9C4"
          : isDark
          ? "#4B5563"
          : "#E5E7EB",
      }}
      onPress={() => onPress(value)}
    >
      <FontedText
        variant="caption"
        className={isSelected ? "text-white" : "text-black dark:text-white"}
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
    <SafeAreaWrapper>
      <ThemedView backgroundColor="background" className="flex-1 p-4">
        <FontedText variant="heading-2" fontFamily="comfortaa" className="mb-4">
          {t("foodGuide.title")}
        </FontedText>

        <TextInput
          className="p-3 mb-4 rounded-xl"
          style={{ backgroundColor: isDark ? "#171717" : "#F3F4F6" }}
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
          <View className="items-center justify-center flex-1">
            <ActivityIndicator
              size="large"
              color={isDark ? "#60a5fa" : "#87D9C4"}
            />
          </View>
        ) : error ? (
          <View className="items-center justify-center flex-1">
            <FontedText colorVariant="accent">{error}</FontedText>
            <TouchableOpacity
              className="px-4 py-2 mt-4 rounded-lg"
              style={{ backgroundColor: isDark ? "#5DBDA8" : "#87D9C4" }}
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
              <View className="items-center justify-center flex-1 py-10">
                <FontedText colorVariant="secondary">
                  {t("foodGuide.noResults")}
                </FontedText>
              </View>
            }
          />
        )}

        {/* Food details modal */}
        {selectedFood && (
          <View className="absolute inset-0 justify-center p-4 bg-black bg-opacity-50">
            <FoodDetails
              item={selectedFood}
              onClose={() => setSelectedFood(null)}
            />
          </View>
        )}
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default FoodGuideScreen;
