import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define type for food item
interface FoodItem {
  id: string;
  name: string;
  category: string;
  safety: "safe" | "caution" | "avoid";
  description: string;
  alternatives: string;
}

// Mock data for food safety items
const FOOD_DATA: FoodItem[] = [
  {
    id: "1",
    name: "Cheese (Soft)",
    category: "Dairy",
    safety: "caution",
    description:
      "Avoid unpasteurized soft cheeses like brie, camembert, and blue cheese as they may contain harmful bacteria. Pasteurized versions are safe.",
    alternatives:
      "Hard cheeses like cheddar, swiss, and parmesan are safe options.",
  },
  {
    id: "2",
    name: "Eggs",
    category: "Protein",
    safety: "caution",
    description:
      "Ensure eggs are fully cooked until both whites and yolks are firm. Raw or undercooked eggs may contain salmonella.",
    alternatives:
      "Hard-boiled eggs, thoroughly cooked scrambled eggs, or omelets.",
  },
  {
    id: "3",
    name: "Salmon",
    category: "Seafood",
    safety: "safe",
    description:
      "Salmon is low in mercury and high in omega-3 fatty acids, which are beneficial for baby's brain development. Ensure it's fully cooked.",
    alternatives:
      "No alternatives needed as this is a safe option when properly cooked.",
  },
  {
    id: "4",
    name: "Deli Meats",
    category: "Meat",
    safety: "avoid",
    description:
      "Deli meats can harbor listeria, a bacteria that can be harmful during pregnancy. Avoid unless heated until steaming hot.",
    alternatives:
      "Freshly cooked meats or heat deli meats until steaming hot before consumption.",
  },
  {
    id: "5",
    name: "Spinach",
    category: "Vegetables",
    safety: "safe",
    description:
      "Spinach is rich in folate, iron, and other nutrients beneficial during pregnancy. Wash thoroughly before consumption.",
    alternatives: "No alternatives needed as this is a safe option.",
  },
  {
    id: "6",
    name: "Sushi (Raw)",
    category: "Seafood",
    safety: "avoid",
    description:
      "Raw fish may contain parasites or bacteria that could be harmful during pregnancy.",
    alternatives:
      "Cooked sushi rolls like California rolls, tempura rolls, or vegetable rolls.",
  },
  {
    id: "7",
    name: "Coffee",
    category: "Beverages",
    safety: "caution",
    description:
      "Limit caffeine intake to 200mg per day (about one 12oz cup of coffee).",
    alternatives:
      "Decaffeinated coffee, herbal teas (check which ones are safe), or fruit-infused water.",
  },
  {
    id: "8",
    name: "Avocado",
    category: "Fruit",
    safety: "safe",
    description:
      "Avocados are rich in folate, potassium, vitamin C, and vitamin B6, all beneficial during pregnancy.",
    alternatives: "No alternatives needed as this is a safe option.",
  },
];

// Component to render each food item
const FoodItem = ({
  item,
  onPress,
}: {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
}) => {
  // Determine color based on safety rating
  const safetyColor =
    item.safety === "safe"
      ? "#28a745"
      : item.safety === "caution"
      ? "#ffc107"
      : "#dc3545";

  return (
    <TouchableOpacity style={styles.foodItem} onPress={() => onPress(item)}>
      <View
        style={[styles.safetyIndicator, { backgroundColor: safetyColor }]}
      />
      <View style={styles.foodItemContent}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
        <Text style={[styles.safetyRating, { color: safetyColor }]}>
          {item.safety === "safe"
            ? "Safe to eat"
            : item.safety === "caution"
            ? "Eat with caution"
            : "Avoid during pregnancy"}
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
  item: FoodItem;
  onClose: () => void;
}) => {
  // Determine color based on safety rating
  const safetyColor =
    item.safety === "safe"
      ? "#28a745"
      : item.safety === "caution"
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
          {item.safety === "safe"
            ? "Safe to eat"
            : item.safety === "caution"
            ? "Eat with caution"
            : "Avoid during pregnancy"}
        </Text>
      </View>

      <Text style={styles.detailsLabel}>Description</Text>
      <Text style={styles.detailsText}>{item.description}</Text>

      <Text style={styles.detailsLabel}>Alternatives</Text>
      <Text style={styles.detailsText}>{item.alternatives}</Text>
    </View>
  );
};

const FoodGuideScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "safe" | "caution" | "avoid"
  >("all");

  // Filter food data based on search query and active filter
  const filteredData = FOOD_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && item.safety === activeFilter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Safety Guide</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search foods..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "all" && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "safe" && styles.activeFilterSafe,
          ]}
          onPress={() => setActiveFilter("safe")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "safe" && styles.activeFilterText,
            ]}
          >
            Safe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "caution" && styles.activeFilterCaution,
          ]}
          onPress={() => setActiveFilter("caution")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "caution" && styles.activeFilterText,
            ]}
          >
            Caution
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "avoid" && styles.activeFilterAvoid,
          ]}
          onPress={() => setActiveFilter("avoid")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "avoid" && styles.activeFilterText,
            ]}
          >
            Avoid
          </Text>
        </TouchableOpacity>
      </View>

      {selectedFood ? (
        <FoodDetails
          item={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      ) : (
        <FlatList
          data={filteredData}
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
});

export default FoodGuideScreen;
