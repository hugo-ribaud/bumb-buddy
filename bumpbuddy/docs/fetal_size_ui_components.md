# Fetal Size Comparison - UI Components

## FetalSizeComparison Component

First, let's create a reusable component that displays the fetal size comparison:

```typescript
// src/components/FetalSizeComparison.tsx
import React from "react";
import { View, Image, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { selectUserProfile } from "../redux/slices/authSlice";
import { FetalSizeComparison as FetalSizeType } from "../types/fetalSize";
import { useTranslation } from "react-i18next";

interface FetalSizeComparisonProps {
  sizeData: FetalSizeType | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean; // For timeline view vs detailed view
}

export const FetalSizeComparison: React.FC<FetalSizeComparisonProps> = ({
  sizeData,
  loading = false,
  error = null,
  compact = false,
}) => {
  const { t } = useTranslation();
  const userProfile = useSelector(selectUserProfile);
  const useMetric = userProfile?.app_settings?.units === "metric";

  if (loading) {
    return (
      <View className="flex items-center justify-center p-4">
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-50 p-4 rounded-lg">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!sizeData) {
    return (
      <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <Text className="text-gray-500 dark:text-gray-400">
          {t("fetalSize.noDataAvailable")}
        </Text>
      </View>
    );
  }

  const size = useMetric
    ? `${sizeData.sizeCm} ${t("units.cm")}`
    : `${sizeData.sizeInches} ${t("units.inches")}`;

  const weight =
    sizeData.weightG && sizeData.weightOz
      ? useMetric
        ? `${sizeData.weightG} ${t("units.grams")}`
        : `${sizeData.weightOz} ${t("units.oz")}`
      : null;

  if (compact) {
    // Compact version for timeline cards
    return (
      <View className="flex flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-2 mb-2">
        {sizeData.imageUrl ? (
          <Image
            source={{ uri: sizeData.imageUrl }}
            className="w-12 h-12 mr-3"
            resizeMode="contain"
          />
        ) : (
          <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-3" />
        )}
        <View className="flex-1">
          <Text className="text-sm font-medium dark:text-white">
            {t("fetalSize.sizeAs", { fruit: sizeData.fruitName })}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {size}
          </Text>
        </View>
      </View>
    );
  }

  // Detailed version for week detail screen
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold mb-3 dark:text-white">
        {t("fetalSize.title")}
      </Text>

      <View className="flex flex-row mb-4">
        <View className="flex-1 items-center justify-center">
          {sizeData.imageUrl ? (
            <Image
              source={{ uri: sizeData.imageUrl }}
              className="w-32 h-32"
              resizeMode="contain"
            />
          ) : (
            <View className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
          )}
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-base font-medium mb-2 dark:text-white">
            {t("fetalSize.sizeAs", { fruit: sizeData.fruitName })}
          </Text>

          <View className="mb-2">
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {t("fetalSize.length")}
            </Text>
            <Text className="text-base font-medium dark:text-white">
              {size}
            </Text>
          </View>

          {weight && (
            <View>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {t("fetalSize.weight")}
              </Text>
              <Text className="text-base font-medium dark:text-white">
                {weight}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text className="text-gray-700 dark:text-gray-300">
        {sizeData.description}
      </Text>
    </View>
  );
};
```

## Translation Keys

Add the following translation keys to your i18n files:

```json
// src/i18n/languages/en.json (partial)
{
  "fetalSize": {
    "title": "Baby Size Comparison",
    "sizeAs": "Size: As big as a {{fruit}}",
    "length": "Length:",
    "weight": "Weight:",
    "noDataAvailable": "Size comparison data not available"
  },
  "units": {
    "cm": "cm",
    "inches": "in",
    "grams": "g",
    "oz": "oz"
  }
}

// src/i18n/languages/fr.json (partial)
{
  "fetalSize": {
    "title": "Comparaison de taille du bébé",
    "sizeAs": "Taille: Aussi grand qu'un(e) {{fruit}}",
    "length": "Longueur:",
    "weight": "Poids:",
    "noDataAvailable": "Données de comparaison de taille non disponibles"
  },
  "units": {
    "cm": "cm",
    "inches": "po",
    "grams": "g",
    "oz": "oz"
  }
}

// src/i18n/languages/es.json (partial)
{
  "fetalSize": {
    "title": "Comparación de tamaño del bebé",
    "sizeAs": "Tamaño: Tan grande como un(a) {{fruit}}",
    "length": "Longitud:",
    "weight": "Peso:",
    "noDataAvailable": "Datos de comparación de tamaño no disponibles"
  },
  "units": {
    "cm": "cm",
    "inches": "pulg",
    "grams": "g",
    "oz": "oz"
  }
}
```

## Integration with TimelineScreen

Update the timeline screen to display the fruit comparison in the week item:

```typescript
// src/screens/TimelineScreen.tsx (partial)
import { FetalSizeComparison } from "../components/FetalSizeComparison";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllSizeComparisons,
  selectFetalSizeLoading,
  fetchAllSizeComparisons,
} from "../redux/slices/fetalSizeSlice";

// Inside component
const TimelineScreen = () => {
  // Existing code...
  const dispatch = useDispatch();
  const sizeComparisons = useSelector(selectAllSizeComparisons);
  const sizesLoading = useSelector(selectFetalSizeLoading);

  useEffect(() => {
    if (sizeComparisons.length === 0) {
      dispatch(fetchAllSizeComparisons());
    }
  }, [dispatch, sizeComparisons.length]);

  // Render week item
  const renderWeekItem = ({ item }) => {
    const sizeData = sizeComparisons.find((size) => size.week === item.week);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("WeekDetail", { week: item.week })}
        className="bg-white dark:bg-gray-800 rounded-lg mb-4 p-4 shadow-sm"
      >
        <View className="flex flex-row justify-between mb-2">
          <Text className="text-lg font-bold dark:text-white">
            {t("timeline.week")} {item.week}
          </Text>
          {currentWeek === item.week && <Badge>{t("timeline.current")}</Badge>}
        </View>

        {/* Add size comparison component */}
        {sizeData && (
          <FetalSizeComparison
            sizeData={sizeData}
            loading={sizesLoading}
            compact
          />
        )}

        <Text className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
          {item.fetal_development}
        </Text>

        {/* Existing content */}
      </TouchableOpacity>
    );
  };

  // Rest of the component...
};
```

## Integration with WeekDetailScreen

Update the week detail screen to display the detailed fruit comparison:

```typescript
// src/screens/WeekDetailScreen.tsx (partial)
import { FetalSizeComparison } from "../components/FetalSizeComparison";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllSizeComparisons,
  selectFetalSizeLoading,
  fetchAllSizeComparisons,
  fetchSizeComparisonByWeek,
} from "../redux/slices/fetalSizeSlice";

// Inside component
const WeekDetailScreen = () => {
  // Existing code...
  const dispatch = useDispatch();
  const weekNumber = route.params.week;
  const sizeComparisons = useSelector(selectAllSizeComparisons);
  const sizesLoading = useSelector(selectFetalSizeLoading);

  useEffect(() => {
    if (sizeComparisons.length === 0) {
      dispatch(fetchAllSizeComparisons());
    } else {
      // If we already have data, make sure we have this week's comparison
      const hasWeek = sizeComparisons.some((size) => size.week === weekNumber);
      if (!hasWeek) {
        dispatch(fetchSizeComparisonByWeek(weekNumber));
      }
    }
  }, [dispatch, sizeComparisons.length, weekNumber]);

  const sizeData = sizeComparisons.find((size) => size.week === weekNumber);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <View className="mb-4">
          <Text className="text-2xl font-bold dark:text-white">
            {t("timeline.week")} {weekData.week}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {/* Date display logic */}
          </Text>
        </View>

        {/* Add size comparison component at the top */}
        <FetalSizeComparison sizeData={sizeData} loading={sizesLoading} />

        {/* Existing sections */}
        <Section
          title={t("timeline.fetalDevelopment")}
          content={weekData.fetal_development}
        />
        <Section
          title={t("timeline.maternalChanges")}
          content={weekData.maternal_changes}
        />
        {/* Other sections */}
      </View>
    </ScrollView>
  );
};
```

## Unit Toggle Component (Optional)

Add a unit toggle component to allow the user to switch between metric and imperial measurements:

```typescript
// src/components/UnitToggle.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  selectUserProfile,
  updateUserSettings,
} from "../redux/slices/authSlice";
import { useTranslation } from "react-i18next";

export const UnitToggle: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);
  const currentUnit = userProfile?.app_settings?.units || "metric";

  const toggleUnit = () => {
    const newUnit = currentUnit === "metric" ? "imperial" : "metric";
    dispatch(updateUserSettings({ units: newUnit }));
  };

  return (
    <View className="flex flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1 my-2">
      <TouchableOpacity
        onPress={() => currentUnit !== "metric" && toggleUnit()}
        className={`flex-1 rounded-full py-1 px-3 ${
          currentUnit === "metric" ? "bg-white dark:bg-gray-700" : ""
        }`}
      >
        <Text
          className={`text-center text-sm ${
            currentUnit === "metric"
              ? "text-blue-500 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {t("settings.metric")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => currentUnit !== "imperial" && toggleUnit()}
        className={`flex-1 rounded-full py-1 px-3 ${
          currentUnit === "imperial" ? "bg-white dark:bg-gray-700" : ""
        }`}
      >
        <Text
          className={`text-center text-sm ${
            currentUnit === "imperial"
              ? "text-blue-500 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {t("settings.imperial")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

This can be added to both the WeekDetailScreen and timeline settings to allow users to easily switch between measurement systems.

## Responsive Design Considerations

- Ensure the component looks good on different screen sizes
- Use relative sizing for the fruit images
- Consider landscape orientation by adjusting the layout
- Optimize for both light and dark themes with proper contrast

## Accessibility Improvements

- Add appropriate accessibility labels to images
- Ensure sufficient color contrast for text
- Make touch targets adequately sized for all elements
- Support screen readers with descriptive text

```typescript
// Example of accessibility enhancements
<Image
  source={{ uri: sizeData.imageUrl }}
  className="w-32 h-32"
  resizeMode="contain"
  accessibilityLabel={t("fetalSize.accessibilityImageLabel", {
    fruit: sizeData.fruitName,
    size: size,
  })}
/>
```

These UI components provide a comprehensive implementation of the fetal size comparison feature with proper styling, responsiveness, and accessibility considerations.
