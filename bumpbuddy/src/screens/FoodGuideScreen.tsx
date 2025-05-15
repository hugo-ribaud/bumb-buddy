import { Food, FoodCategory, SafetyRating } from "food-types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "react-i18next";
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

  // Determine color based on safety rating
  const safetyColor =
    item.safety_rating === "safe"
      ? "#28a745"
      : item.safety_rating === "caution"
      ? "#ffc107"
      : "#dc3545";

  return (
    <TouchableOpacity style={styles.foodItem} onPress={() => onPress(item)}>
      <View
        style={[styles.safetyIndicator, { backgroundColor: safetyColor }]}
      />
      <View style={styles.foodItemContent}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={[styles.safetyRating, { color: safetyColor }]}>
          {item.safety_rating === "safe"
            ? t("foodGuide.safeToEat")
            : item.safety_rating === "caution"
            ? t("foodGuide.cautionNeeded")
            : t("foodGuide.avoid")}
        </Text>
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
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>{item.name}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.safetySummary, { backgroundColor: safetyColor + "20" }]}
      >
        <Text style={[styles.safetyText, { color: safetyColor }]}>
          {item.safety_rating === "safe"
            ? t("foodGuide.safeToEat")
            : item.safety_rating === "caution"
            ? t("foodGuide.cautionNeeded")
            : t("foodGuide.avoid")}
        </Text>
      </View>

      <Text style={styles.detailsLabel}>{t("foodGuide.description")}</Text>
      <Text style={styles.detailsText}>{item.description || ""}</Text>

      <Text style={styles.detailsLabel}>
        {t("foodGuide.alternativesLabel")}
      </Text>
      <Text style={styles.detailsText}>{item.alternatives || ""}</Text>
    </View>
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
      style={[styles.categoryPill, isSelected && styles.selectedCategoryPill]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.categoryPillText,
          isSelected && styles.selectedCategoryPillText,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const FoodGuideScreen = () => {
  const { t } = useTranslation();
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
    <View style={styles.container}>
      <Text style={styles.title}>{t("foodGuide.title")}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder={t("foodGuide.searchPlaceholder")}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Categories horizontal scroll */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
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

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            safetyFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setSafetyFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              safetyFilter === "all" && styles.activeFilterText,
            ]}
          >
            {t("foodGuide.all")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            safetyFilter === "safe" && styles.activeFilterSafe,
          ]}
          onPress={() => setSafetyFilter("safe")}
        >
          <Text
            style={[
              styles.filterText,
              safetyFilter === "safe" && styles.activeFilterText,
            ]}
          >
            {t("foodGuide.safe")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            safetyFilter === "caution" && styles.activeFilterCaution,
          ]}
          onPress={() => setSafetyFilter("caution")}
        >
          <Text
            style={[
              styles.filterText,
              safetyFilter === "caution" && styles.activeFilterText,
            ]}
          >
            {t("foodGuide.caution")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            safetyFilter === "avoid" && styles.activeFilterAvoid,
          ]}
          onPress={() => setSafetyFilter("avoid")}
        >
          <Text
            style={[
              styles.filterText,
              safetyFilter === "avoid" && styles.activeFilterText,
            ]}
          >
            {t("foodGuide.avoid")}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedFood ? (
        <FoodDetails
          item={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      ) : loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setSafetyFilter(safetyFilter)} // Trigger reload
          >
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : foods.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsText}>{t("foodGuide.noResults")}</Text>
        </View>
      ) : (
        <FlatList
          data={foods}
          renderItem={({ item }) => (
            <FoodItem item={item} onPress={setSelectedFood} />
          )}
          keyExtractor={(item) => item.id}
          style={styles.foodList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#343a40",
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  selectedCategoryPill: {
    backgroundColor: "#007bff",
    borderColor: "#0069d9",
  },
  categoryPillText: {
    color: "#495057",
    fontWeight: "500",
  },
  selectedCategoryPillText: {
    color: "white",
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
    minWidth: 70,
    alignItems: "center",
  },
  filterText: {
    color: "#495057",
    fontWeight: "500",
  },
  activeFilter: {
    backgroundColor: "#007bff",
  },
  activeFilterSafe: {
    backgroundColor: "#28a745",
  },
  activeFilterCaution: {
    backgroundColor: "#ffc107",
  },
  activeFilterAvoid: {
    backgroundColor: "#dc3545",
  },
  activeFilterText: {
    color: "white",
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  safetyIndicator: {
    width: 10,
  },
  foodItemContent: {
    padding: 15,
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  foodCategory: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 5,
  },
  safetyRating: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#343a40",
  },
  closeButton: {
    fontSize: 20,
    color: "#6c757d",
    padding: 5,
  },
  safetySummary: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  safetyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343a40",
    marginBottom: 5,
    marginTop: 10,
  },
  detailsText: {
    fontSize: 14,
    color: "#343a40",
    lineHeight: 20,
    marginBottom: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  noResultsText: {
    color: "#6c757d",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default FoodGuideScreen;
